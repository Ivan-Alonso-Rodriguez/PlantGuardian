from dataclasses import dataclass
from datetime import UTC, datetime
from threading import Lock
from typing import Any, Protocol

from backend.app.schemas.sensor_reading import SensorReadingCreate


@dataclass(frozen=True)
class StoredReading:
    id: int
    reading: SensorReadingCreate
    created_at: datetime

    def to_dict(self) -> dict[str, Any]:
        data = self.reading.to_storage_dict()
        data["id"] = self.id
        data["created_at"] = self.created_at.isoformat()
        return data


class ReadingRepository(Protocol):
    def add(self, reading: SensorReadingCreate) -> StoredReading:
        ...

    def latest(self) -> StoredReading | None:
        ...

    def history(self, limit: int = 100) -> list[StoredReading]:
        ...


class InMemoryReadingRepository:
    """Development repository used before PostgreSQL is introduced."""

    def __init__(self) -> None:
        self._items: list[StoredReading] = []
        self._next_id = 1
        self._lock = Lock()

    def add(self, reading: SensorReadingCreate) -> StoredReading:
        with self._lock:
            stored = StoredReading(
                id=self._next_id,
                reading=reading,
                created_at=datetime.now(UTC),
            )
            self._next_id += 1
            self._items.append(stored)
            return stored

    def latest(self) -> StoredReading | None:
        with self._lock:
            if not self._items:
                return None
            return self._items[-1]

    def history(self, limit: int = 100) -> list[StoredReading]:
        with self._lock:
            return list(reversed(self._items[-limit:]))

    def clear(self) -> None:
        with self._lock:
            self._items.clear()
            self._next_id = 1