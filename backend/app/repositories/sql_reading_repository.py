from collections.abc import Callable
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from backend.app.models.sensor_reading import SensorReading
from backend.app.repositories.reading_repository import StoredReading
from backend.app.schemas.sensor_reading import SensorReadingCreate


class SqlReadingRepository:
    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory

    def add(self, reading: SensorReadingCreate) -> StoredReading:
        with self._session_factory() as session:
            model = SensorReading(**reading.to_storage_dict())
            session.add(model)
            session.commit()
            session.refresh(model)
            return self._to_stored(model)

    def latest(self) -> StoredReading | None:
        with self._session_factory() as session:
            statement = select(SensorReading).order_by(desc(SensorReading.created_at)).limit(1)
            model = session.scalar(statement)
            if model is None:
                return None
            return self._to_stored(model)

    def history(self, limit: int = 100) -> list[StoredReading]:
        with self._session_factory() as session:
            statement = (
                select(SensorReading)
                .order_by(desc(SensorReading.created_at))
                .limit(limit)
            )
            return [self._to_stored(model) for model in session.scalars(statement).all()]

    def _to_stored(self, model: SensorReading) -> StoredReading:
        payload: dict[str, Any] = {
            "hum_p1": model.hum_p1,
            "hum_p2": model.hum_p2,
            "temp_dht11": model.temp_dht11,
            "hum_dht11": model.hum_dht11,
            "luz": model.luz,
            "estado_luz": model.estado_luz,
            "agua": model.agua,
            "planta1_seca": model.planta1_seca,
            "planta2_seca": model.planta2_seca,
            "tanque_bajo": model.tanque_bajo,
            "bomba_p1": model.bomba_p1,
            "bomba_p2": model.bomba_p2,
            "regando": model.regando,
            "planta_regando": model.planta_regando,
            "dht_ok": model.dht_ok,
            "modo": model.modo,
        }
        return StoredReading(
            id=model.id,
            reading=SensorReadingCreate.model_validate(payload),
            created_at=model.created_at,
        )
