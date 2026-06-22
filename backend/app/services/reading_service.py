from dataclasses import asdict
from typing import Any

from backend.app.repositories.reading_repository import ReadingRepository
from backend.app.schemas.sensor_reading import SensorReadingCreate
from backend.app.services.plant_health_service import PlantHealthService
from backend.app.websocket.manager import RealtimeConnectionManager


class ReadingService:
    def __init__(
        self,
        repository: ReadingRepository,
        health_service: PlantHealthService,
        realtime_manager: RealtimeConnectionManager | None = None,
    ) -> None:
        self.repository = repository
        self.health_service = health_service
        self.realtime_manager = realtime_manager

    def build_dashboard_event(self, reading: SensorReadingCreate, stored_id: int) -> dict[str, Any]:
        assessment = self.health_service.evaluate(reading)
        return {
            "type": "reading.created",
            "reading_id": stored_id,
            "status": assessment.status.value,
            "score": assessment.score,
            "reading": reading.to_storage_dict(),
            "alerts": [asdict(alert) for alert in assessment.alerts],
            "recommendations": assessment.recommendations,
        }

    async def ingest(self, payload: SensorReadingCreate | dict[str, Any]) -> dict[str, Any]:
        reading = (
            payload
            if isinstance(payload, SensorReadingCreate)
            else SensorReadingCreate.model_validate(payload)
        )
        stored = self.repository.add(reading)
        event = self.build_dashboard_event(reading, stored.id)

        if self.realtime_manager is not None:
            await self.realtime_manager.broadcast(event)

        return event
