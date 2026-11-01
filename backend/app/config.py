import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = "JanAwaaz"
    app_env: str = os.getenv("APP_ENV", "development")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    playwright_headless: str = os.getenv("PLAYWRIGHT_HEADLESS", "true")


settings = Settings()
