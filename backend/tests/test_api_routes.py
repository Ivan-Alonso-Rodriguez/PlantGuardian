import unittest

from fastapi.testclient import TestClient

from backend.app.main import create_app
from backend.app.services.command_service import CommandService, InMemoryCommandPublisher


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


class ApiRoutesTest(unittest.TestCase):
    def setUp(self) -> None:
        self.publisher = InMemoryCommandPublisher()
        self.client = TestClient(
            create_app(command_service=CommandService(self.publisher))
        )

    def test_health_check(self) -> None:
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_latest_reading_returns_404_before_first_reading(self) -> None:
        response = self.client.get("/api/readings/latest")

        self.assertEqual(response.status_code, 404)

    def test_manual_reading_latest_history_and_dashboard(self) -> None:
        created = self.client.post("/api/readings/manual", json=VALID_PAYLOAD)
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.json()["id"], 1)

        latest = self.client.get("/api/readings/latest")
        self.assertEqual(latest.status_code, 200)
        self.assertEqual(latest.json()["hum_p1"], 60)

        history = self.client.get("/api/readings/history")
        self.assertEqual(history.status_code, 200)
        self.assertEqual(history.json()["count"], 1)

        dashboard = self.client.get("/api/dashboard")
        self.assertEqual(dashboard.status_code, 200)
        self.assertEqual(dashboard.json()["status"], "EXCELENTE")
        self.assertEqual(dashboard.json()["score"], 100)

    def test_control_endpoint_records_command(self) -> None:
        response = self.client.post("/api/control/water-p1")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["command"], "WATER_P1")
        self.assertEqual(response.json()["topic"], "iot/riego/comandos")
        self.assertEqual(len(self.publisher.published_commands), 1)


if __name__ == "__main__":
    unittest.main()
