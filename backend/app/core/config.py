from functools import lru_cache
from os import getenv

from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = "PlantGuardian IoT API"
    app_version: str = "0.2.0"

    use_database: bool = Field(default=False)
    database_url: str = "sqlite:///./plantguardian.db"

    mqtt_enabled: bool = Field(default=False)
    mqtt_ingest_enabled: bool = Field(default=False)
    mqtt_host: str = "127.0.0.1"
    mqtt_port: int = 1883
    mqtt_username: str = ""
    mqtt_password: str = ""
    mqtt_client_id: str = "plantguardian-backend"


def _bool_env(name: str, default: bool) -> bool:
    raw = getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@lru_cache
def get_settings() -> Settings:
    return Settings(
        use_database=_bool_env("PLANTGUARDIAN_USE_DATABASE", False),
        database_url=getenv("DATABASE_URL", "sqlite:///./plantguardian.db"),
        mqtt_enabled=_bool_env("PLANTGUARDIAN_MQTT_ENABLED", False),
        mqtt_ingest_enabled=_bool_env("PLANTGUARDIAN_MQTT_INGEST_ENABLED", False),
        mqtt_host=getenv("MQTT_HOST", "127.0.0.1"),
        mqtt_port=int(getenv("MQTT_PORT", "1883")),
        mqtt_username=getenv("MQTT_USERNAME", ""),
        mqtt_password=getenv("MQTT_PASSWORD", ""),
        mqtt_client_id=getenv("MQTT_CLIENT_ID", "plantguardian-backend"),
    )