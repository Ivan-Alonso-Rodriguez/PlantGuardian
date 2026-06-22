import asyncio
import json
import unittest

from backend.app.core.config import Settings
from backend.app.mqtt.subscriber import MqttReadingSubscriber
from backend.app.repositories.reading_repository import InMemoryReadingRepository
from backend.app.services.plant_health_service import PlantHealthService
from backend.app.services.reading_service import ReadingService


VALID_PAYLOAD = {
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


class MqttReadingSubscriberTest(unittest.TestCase):
    def test_process_payload_ingests_json_bytes(self) -> None:
        repository = InMemoryReadingRepository()
        reading_service = ReadingService(repository, PlantHealthService())
        subscriber = MqttReadingSubscriber(Settings(), reading_service)

        event = asyncio.run(
            subscriber.process_payload(json.dumps(VALID_PAYLOAD).encode("utf-8"))
        )

        self.assertEqual(event["type"], "reading.created")
        self.assertEqual(event["status"], "EXCELENTE")
        self.assertEqual(repository.latest().reading.hum_p1, 60)


if __name__ == "__main__":
    unittest.main()
