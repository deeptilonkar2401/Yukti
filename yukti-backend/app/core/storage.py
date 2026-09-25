import uuid

import httpx

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "image",
    "image/png": "image",
    "image/webp": "image",
    "video/mp4": "video",
    "audio/mpeg": "audio",
    "audio/wav": "audio",
    "application/pdf": "document",
}

MAX_FILE_SIZE_MB = 25


def guess_media_type(content_type: str) -> str:
    return ALLOWED_CONTENT_TYPES.get(content_type, "document")


def upload_to_supabase(file_bytes: bytes, original_filename: str, content_type: str, problem_id: str) -> dict:
    """
    Uploads a file to the configured Supabase Storage bucket and returns
    {"file_url": public_url, "storage_path": path}.

    Requires SUPABASE_URL and SUPABASE_SERVICE_KEY to be set in .env.
    """
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError("Supabase Storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY missing)")

    ext = original_filename.rsplit(".", 1)[-1] if "." in original_filename else "bin"
    storage_path = f"problems/{problem_id}/{uuid.uuid4()}.{ext}"

    upload_url = f"{settings.supabase_url}/storage/v1/object/{settings.supabase_storage_bucket}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "Content-Type": content_type,
    }

    response = httpx.post(upload_url, headers=headers, content=file_bytes, timeout=30)
    response.raise_for_status()

    public_url = (
        f"{settings.supabase_url}/storage/v1/object/public/"
        f"{settings.supabase_storage_bucket}/{storage_path}"
    )
    return {"file_url": public_url, "storage_path": storage_path}
