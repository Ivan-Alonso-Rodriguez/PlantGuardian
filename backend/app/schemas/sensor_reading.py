from enum import StrEnum
from typing import Any

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator


class LightState(StrEnum):
    OSCURO = "OSCURO"
    LUZ_MEDIA = "LUZ_MEDIA"
    MUCHA_LUZ = "MUCHA_LUZ"


class IrrigationMode(StrEnum):
    AUTO = "AUTO"
    MANUAL = "MANUAL"


def _bool_from_device(value: Any) -> bool:
    if isinstance(value, bool):
      return value

    if isinstance(value, int) and value in (0, 1):
      return bool(value)

    if isinstance(value, str):
      normalized = value.strip().lower()
      if normalized in {"1", "true", "si", "yes", "on"}:
        return True
      if normalized in {"0", "false", "no", "off"}:
        return False

    raise ValueError("Expected boolean-compatible value from device")


class SensorReadingCreate(BaseModel):
    """Validated MQTT payload from the ESP32 bridge."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    hum_p1: int = Field(
        ge=0,
        le=100,
        validation_alias=AliasChoices("humP1", "hum_p1"),
    )
    hum_p2: int = Field(
        ge=0,
        le=100,
        validation_alias=AliasChoices("humP2", "hum_p2"),
    )
    temp_dht11: float = Field(
        ge=-10,
        le=60,
        validation_alias=AliasChoices("tempDHT11", "temp_dht11"),
    )
    hum_dht11: float = Field(
        ge=0,
        le=100,
        validation_alias=AliasChoices("humDHT11", "hum_dht11"),
    )
    luz: int = Field(ge=0, le=100)
    estado_luz: LightState = Field(
        validation_alias=AliasChoices("estadoLuz", "estado_luz")
    )
    agua: int = Field(ge=0, le=100)
    planta1_seca: bool = Field(
        validation_alias=AliasChoices("planta1Seca", "planta1_seca")
    )
    planta2_seca: bool = Field(
        validation_alias=AliasChoices("planta2Seca", "planta2_seca")
    )
    tanque_bajo: bool = Field(
        validation_alias=AliasChoices("tanqueBajo", "tanque_bajo")
    )
    bomba_p1: bool = Field(validation_alias=AliasChoices("bombaP1", "bomba_p1"))
    bomba_p2: bool = Field(validation_alias=AliasChoices("bombaP2", "bomba_p2"))
    regando: bool
    modo: IrrigationMode
    planta_regando: int = Field(
        default=0,
        ge=0,
        le=2,
        validation_alias=AliasChoices("plantaRegando", "planta_regando"),
    )
    dht_ok: bool = Field(
        default=True,
        validation_alias=AliasChoices("dhtOk", "dht_ok"),
    )

    @field_validator(
        "planta1_seca",
        "planta2_seca",
        "tanque_bajo",
        "bomba_p1",
        "bomba_p2",
        "regando",
        "dht_ok",
        mode="before",
    )
    @classmethod
    def parse_device_bool(cls, value: Any) -> bool:
        return _bool_from_device(value)

    @field_validator("estado_luz", "modo", mode="before")
    @classmethod
    def normalize_enums(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip().upper()
        return value

    @property
    def active_pump(self) -> int:
        if self.bomba_p1:
            return 1
        if self.bomba_p2:
            return 2
        return 0

    def to_storage_dict(self) -> dict[str, Any]:
        return self.model_dump(mode="json")
