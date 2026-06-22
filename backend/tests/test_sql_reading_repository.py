import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.base import Base
from backend.app.models import Alert, IrrigationEvent, Plant, SensorReading
from backend.app.repositories.sql_reading_repository import SqlReadingRepository
from backend.app.schemas.sensor_reading import SensorReadingCreate


_MODELS = (Alert, IrrigationEvent, Plant, SensorReading)


def make_reading(**overrides):
    payload = {
        "humP1": 60,
        "humP2": 66,
        "tempDHT11": 24.3,
        "humDHT11": 55.0,
        "luz": 61,
        "estadoLuz": "LUZ_MEDIA",
        "agua": 80,
        "planta1Seca": 0,
        "planta2Seca": 0,
        "tanqueBajo": 0,
        "bombaP1": 0,
        "bombaP2": 0,
        "regando": 0,
        "plantaRegando": 0,
        "dhtOk": 1,
        "modo": "AUTO",
    }
    payload.update(overrides)
    return SensorReadingCreate.model_validate(payload)


class SqlReadingRepositoryTest(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        self.session_factory = sessionmaker(bind=self.engine)
        self.repository = SqlReadingRepository(self.session_factory)

    def tearDown(self) -> None:
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()

    def test_add_latest_and_history(self) -> None:
        first = self.repository.add(make_reading(humP1=50))
        second = self.repository.add(make_reading(humP1=70, modo="MANUAL"))

        latest = self.repository.latest()
        history = self.repository.history(limit=10)

        self.assertEqual(first.id, 1)
        self.assertEqual(second.id, 2)
        self.assertIsNotNone(latest)
        self.assertEqual(latest.id, 2)
        self.assertEqual(latest.reading.hum_p1, 70)
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0].id, 2)


if __name__ == "__main__":
    unittest.main()
