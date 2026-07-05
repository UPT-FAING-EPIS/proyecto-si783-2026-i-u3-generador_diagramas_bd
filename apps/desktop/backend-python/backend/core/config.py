"""
core/config.py
Configuración centralizada usando Pydantic Settings.
Lee variables de entorno desde .env automáticamente.
"""
from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    # ── Base de datos interna (SQLite) ─────────────────────────
    DATABASE_PATH: str = "./cdcart_data.db"

    # ── Clave de encriptación para contraseñas de conexiones ───
    ENCRYPTION_KEY: str = "cdcart_local_secret_key_change_me"

    # ── Frontend / CORS ────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:1420,http://localhost:3000,tauri://localhost"
    FLUXSQL_WEB_URL: str = "https://fluxsql-bd-frontend-app.vercel.app"

    # ── Faker ──────────────────────────────────────────────────
    FAKER_LOCALE: str = "es_ES"

    # ── Archivos temporales ────────────────────────────────────
    TEMP_DIR: str = "./tmp_exports"
    APP_CONFIG_DIR: str = "./local_config"
    SECRETS_KEY_PATH: str = "./local_config/secrets.key"
    SUPABASE_URL: str = "https://qnkrdqxuhkkixksxghpv.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFua3JkcXh1aGtraXhrc3hnaHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzExNTIsImV4cCI6MjA5MzI0NzE1Mn0.GyELYi-51D9Tan1lMd6Ql3wA5fRJikIYTJGr6BXGTQ4"

    @property
    def DATABASE_URL(self) -> str:
        return f"sqlite:///{Path(self.DATABASE_PATH).resolve().as_posix()}"

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Instancia global
settings = Settings()

# Crear directorio temporal si no existe
os.makedirs(settings.TEMP_DIR, exist_ok=True)
