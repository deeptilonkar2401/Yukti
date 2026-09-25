from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    env: str = "development"

    database_url: str

    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    google_client_id: str = ""
    google_client_secret: str = ""

    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_storage_bucket: str = "yukti-uploads"

    gemini_api_key: str = ""

    # Firebase Cloud Messaging (HTTP v1 API — needs a service account, not the
    # old legacy server key which Google has since retired)
    fcm_project_id: str = ""
    fcm_service_account_file: str = ""  # path to the downloaded service account JSON

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
