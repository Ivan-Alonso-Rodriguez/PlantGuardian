import asyncio
import unittest

from backend.app.repositories.reading_repository import InMemoryReadingRepository
from backend.app.services.plant_health_service import PlantHealthService
from backend.app.services.reading_service import ReadingService


VALID_PAYLOAD = {
    "humP1": 22,
    "humP2": 66,
    "tempDHT11": 24.3,
    "humDHT11": 55.0,
    "luz": 61,
    "estadoLuz": "LUZ_MEDIA",
    "agua": 80,
    "planta1Seca": 1,
    "planta2Seca": 0,
    "tanqueBajo": 0,
    "bombaP1": 0,
    "bombaP2": 0,
    "regando": 0,
    "plantaRegando": 0,
    "dhtOk": 1,
    "modo": "AUTO",
}


class ReadingServiceTest(unittest.TestCase):
    def test_ingest_validates_stores_and_scores_reading(self) -> None:
        repository = InMemoryReadingRepository()
        service = ReadingService(repository, PlantHealthService())

        event = asyncio.run(service.ingest(VALID_PAYLOAD))

        self.assertEqual(event["type"], "reading.created")
        self.assertEqual(event["reading_id"], 1)
        self.assertEqual(event["status"], "ATENCION")
        self.assertEqual(repository.latest().reading.hum_p1, 22)


if __name__ == "__main__":
    unittest.main()
