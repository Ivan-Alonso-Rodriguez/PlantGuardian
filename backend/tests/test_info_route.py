import unittest

from fastapi.testclient import TestClient

from backend.app.main import create_app


class InfoRouteTest(unittest.TestCase):
    def test_root_returns_service_links(self) -> None:
        client = TestClient(create_app())

        response = client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["service"], "PlantGuardian IoT API")
        self.assertEqual(response.json()["docs"], "/docs")


if __name__ == "__main__":
    unittest.main()
