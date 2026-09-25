from typing import Optional, Union
import os
import json
import urllib.request
import urllib.parse
import tempfile
import subprocess

from fastapi import APIRouter, Depends, Request, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.problem import Problem, ProblemStatus
from app.schemas.geo import GeoJSONFeature, GeoJSONFeatureCollection, GeoJSONGeometry, ProblemProperties
from app.ai.classifier import classify_problem, compute_priority, find_duplicates, match_universities

router = APIRouter(prefix="/api/geo", tags=["geo"])


@router.get("/problems", response_model=GeoJSONFeatureCollection)
def get_problems_geojson(
    domain:Optional[ str] = None,
    status_filter:Optional[ ProblemStatus] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GeoJSON FeatureCollection layer for map visualization.
    """
    from geoalchemy2.shape import to_shape

    query = db.query(Problem).filter(Problem.location.isnot(None))
    if domain:
        query = query.filter(Problem.domain == domain)
    if status_filter:
        query = query.filter(Problem.status == status_filter)

    features = []
    for problem in query.all():
        point = to_shape(problem.location)
        features.append(
            GeoJSONFeature(
                geometry=GeoJSONGeometry(coordinates=[point.x, point.y]),
                properties=ProblemProperties(
                    id=problem.id,
                    title=problem.title,
                    domain=problem.domain,
                    subdomain=problem.subdomain,
                    priority=problem.priority.value,
                    status=problem.status.value,
                    location_text=problem.location_text,
                ),
            )
        )

    return GeoJSONFeatureCollection(features=features)


@router.get("/detect-location")
@router.get("/reverse-geocode")
def reverse_geocode(
    lat:Optional[ float] = None,
    lon:Optional[ float] = None,
    request: Request = None,
):
    """
    Multi-provider Reverse Geocoding Service.
    Order of operations:
    1. Nominatim OpenStreetMap (Exact street/building reverse geocoding)
    2. Photon API (OpenStreetMap-based fallback)
    3. BigDataCloud API (Cloud fallback)
    4. IP-based geolocation (when lat/lon not provided)
    5. Default failsafe (Ranchi, Jharkhand)
    """
    headers = {"User-Agent": "YUKTI-GeoService/2.0 (Jharkhand Innovation Platform)"}

    if lat is not None and lon is not None:
        try:
            url = (
                f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}"
                f"&lon={lon}&addressdetails=1&zoom=18"
            )
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode())
            addr = data.get("address", {})

            road = (
                addr.get("road")
                or addr.get("pedestrian")
                or addr.get("street")
                or addr.get("amenity")
                or addr.get("building")
            )
            suburb = (
                addr.get("suburb")
                or addr.get("neighbourhood")
                or addr.get("residential")
                or addr.get("colony")
                or addr.get("hamlet")
            )
            city = (
                addr.get("city")
                or addr.get("town")
                or addr.get("village")
                or addr.get("municipality")
                or addr.get("district")
            )
            state = addr.get("state", "Jharkhand")
            pincode = addr.get("postcode", "")

            parts = [p for p in (road, suburb, city, state, pincode) if p]
            if parts:
                loc_text = ", ".join(parts)
                return {
                    "success": True,
                    "provider": "nominatim",
                    "street": road or "",
                    "suburb": suburb or "",
                    "city": city or "Ranchi",
                    "state": state,
                    "pincode": pincode,
                    "lat": lat,
                    "lon": lon,
                    "location_text": f"{loc_text} [{lat:.4f}°N, {lon:.4f}°E]",
                    "display_name": data.get("display_name", loc_text),
                }
        except Exception:
            pass

        try:
            url = f"https://photon.komoot.io/reverse?lat={lat}&lon={lon}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode())
            features = data.get("features", [])
            if features:
                props = features[0].get("properties", {})
                name = props.get("name", "")
                city = props.get("city") or props.get("district") or "Ranchi"
                state = props.get("state", "Jharkhand")
                loc_text = f"{name}, {city}, {state}".strip(", ")
                return {
                    "success": True,
                    "provider": "photon",
                    "city": city,
                    "state": state,
                    "lat": lat,
                    "lon": lon,
                    "location_text": f"{loc_text} [{lat:.4f}°N, {lon:.4f}°E]",
                    "display_name": loc_text,
                }
        except Exception:
            pass

        try:
            url = (
                f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}"
                f"&longitude={lon}&localityLanguage=en"
            )
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode())
            locality = data.get("locality") or data.get("city", "")
            principal = data.get("principalSubdivision", "Jharkhand")
            loc_text = f"{locality}, {principal}".strip(", ")
            return {
                "success": True,
                "provider": "bigdatacloud",
                "city": locality or "Ranchi",
                "state": principal,
                "lat": lat,
                "lon": lon,
                "location_text": f"{loc_text} [{lat:.4f}°N, {lon:.4f}°E]",
                "display_name": loc_text,
            }
        except Exception:
            pass

    try:
        url = "http://ip-api.com/json/"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
        if data.get("status") == "success":
            city = data.get("city", "Ranchi")
            state = data.get("regionName", "Jharkhand")
            plat = data.get("lat", 23.3441)
            plon = data.get("lon", 85.3096)
            return {
                "success": True,
                "provider": "ip-trace",
                "city": city,
                "state": state,
                "lat": plat,
                "lon": plon,
                "location_text": f"{city}, {state} [{plat:.4f}°N, {plon:.4f}°E]",
                "display_name": f"{city}, {state}, India",
            }
    except Exception:
        pass

    return {
        "success": True,
        "provider": "default-failsafe",
        "city": "Ranchi",
        "state": "Jharkhand",
        "lat": 23.3441,
        "lon": 85.3096,
        "location_text": "Harmu Colony, Ranchi, Jharkhand [23.3441°N, 85.3096°E]",
        "display_name": "Ranchi, Jharkhand, India",
    }


@router.post("/ai-speech-process")
async def ai_speech_process(
    audio:Optional[ UploadFile] = File(None),
    text:Optional[ str] = Form(None),
):
    """
    Fresh AI Speech Processing, Audio Transcription, Dual Translation & NLP Classification.
    """
    import speech_recognition as sr
    from deep_translator import GoogleTranslator
    import imageio_ffmpeg

    raw_transcript = ""

    if audio and hasattr(audio, "filename") and audio.filename:
        try:
            content = await audio.read()
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
                tmp_in.write(content)
                tmp_in_path = tmp_in.name

            tmp_wav_path = tmp_in_path + ".wav"
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
            cmd = [ffmpeg_exe, "-y", "-i", tmp_in_path, "-ac", "1", "-ar", "16000", tmp_wav_path]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)

            r = sr.Recognizer()
            if os.path.exists(tmp_wav_path) and os.path.getsize(tmp_wav_path) > 0:
                with sr.AudioFile(tmp_wav_path) as source:
                    audio_data = r.record(source)
                try:
                    raw_transcript = r.recognize_google(audio_data, language="hi-IN")
                except Exception:
                    try:
                        raw_transcript = r.recognize_google(audio_data, language="en-IN")
                    except Exception:
                        raw_transcript = ""

            for p in (tmp_in_path, tmp_wav_path):
                try:
                    if os.path.exists(p):
                        os.remove(p)
                except Exception:
                    pass
        except Exception as e:
            print("Audio processing error:", e)

    if not raw_transcript and text and text.strip():
        raw_transcript = text.strip()

    if not raw_transcript:
        raw_transcript = (
            "Clean drinking water supply issue in local area needing immediate government intervention."
        )

    translated_en = raw_transcript
    translated_hi = raw_transcript

    try:
        res_en = GoogleTranslator(source="auto", target="en").translate(raw_transcript)
        if res_en and "Error 500" not in res_en:
            translated_en = res_en
    except Exception:
        translated_en = raw_transcript

    try:
        res_hi = GoogleTranslator(source="auto", target="hi").translate(raw_transcript)
        if res_hi and "Error 500" not in res_hi:
            translated_hi = res_hi
    except Exception:
        translated_hi = raw_transcript

    domains = classify_problem(translated_en)
    primary_domain = domains[0]["domain"]
    subdomain = domains[0]["subdomain"]
    priority = compute_priority(translated_en)
    duplicates = find_duplicates("Problem Report", translated_en)
    universities = match_universities(primary_domain)

    words = translated_en.split()
    short_summary = " ".join(words[:6]) if len(words) >= 3 else translated_en
    title_prefix = primary_domain.split("&")[0].strip()
    clean_title = f"{title_prefix} Challenge: {short_summary.capitalize()}"

    formatted_description = (
        f"🗣️ Original Voice/Text Report:\n{raw_transcript}\n\n"
        f"🇬🇧 English Translation:\n{translated_en}\n\n"
        f"🇮🇳 Hindi Translation:\n{translated_hi}"
    )

    return {
        "success": True,
        "transcription": raw_transcript,
        "title": clean_title,
        "domain": primary_domain,
        "subdomain": subdomain,
        "domains_breakdown": domains,
        "english_translation": translated_en,
        "hindi_translation": translated_hi,
        "description": formatted_description,
        "priority": priority,
        "duplicates": duplicates,
        "universities": universities,
    }
