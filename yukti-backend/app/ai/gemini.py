"""
Gemini is used ONLY for natural-language output (summaries/explanations) —
never for status changes, matching decisions, or anything that affects the
database directly. That logic stays deterministic, in Python, elsewhere.
"""
import httpx

from app.core.config import settings

GEMINI_URL_TEMPLATE = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
)
MODEL = "gemini-1.5-flash"  # fast + cheap, good enough for short summaries


class GeminiNotConfigured(RuntimeError):
    pass


def generate_problem_summary(title: str, description: str, domain: str) -> str:
    if not settings.gemini_api_key:
        raise GeminiNotConfigured("GEMINI_API_KEY is not set in .env")

    prompt = (
        "Summarize this civic problem report in 2-3 plain sentences for a university "
        "or industry partner deciding whether to take it on. Be factual, no exaggeration.\n\n"
        f"Domain: {domain}\nTitle: {title}\nDescription: {description}"
    )

    url = GEMINI_URL_TEMPLATE.format(model=MODEL, key=settings.gemini_api_key)
    body = {"contents": [{"parts": [{"text": prompt}]}]}

    response = httpx.post(url, json=body, timeout=20)
    response.raise_for_status()
    data = response.json()

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError):
        raise RuntimeError(f"Unexpected Gemini response shape: {data}")
