from typing import Optional, Union
"""
FCM's old "legacy" server-key API is retired — this uses the current HTTP v1
API, which needs a service account (Firebase console → Project Settings →
Service accounts → Generate new private key) rather than a simple string key.

Everything here is best-effort: a push failing (bad token, FCM not
configured, network hiccup) should never break the API call that triggered
it — the in-app Notification row (see app/models/notification.py) is the
source of truth either way.
"""
import httpx

from app.core.config import settings

_SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"]


class FCMNotConfigured(RuntimeError):
    pass


def _get_access_token() -> str:
    if not settings.fcm_service_account_file:
        raise FCMNotConfigured("FCM_SERVICE_ACCOUNT_FILE is not set in .env")

    from google.auth.transport.requests import Request
    from google.oauth2 import service_account

    credentials = service_account.Credentials.from_service_account_file(
        settings.fcm_service_account_file, scopes=_SCOPES
    )
    credentials.refresh(Request())
    return credentials.token


def send_push(device_token: str, title: str, body: str, data:Optional[ dict] = None) -> None:
    """Raises on failure — callers should catch and log, never let a push failure bubble up to the user."""
    if not settings.fcm_project_id:
        raise FCMNotConfigured("FCM_PROJECT_ID is not set in .env")

    access_token = _get_access_token()
    url = f"https://fcm.googleapis.com/v1/projects/{settings.fcm_project_id}/messages:send"

    message = {
        "message": {
            "token": device_token,
            "notification": {"title": title, "body": body},
            "data": {k: str(v) for k, v in (data or {}).items()},  # FCM data payload values must be strings
        }
    }

    response = httpx.post(
        url,
        json=message,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    response.raise_for_status()
