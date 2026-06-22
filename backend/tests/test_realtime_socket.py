import unittest

from fastapi.testclient import TestClient

from backend.app.main import create_app


class RealtimeSocketTest(unittest.TestCase):
    def test_realtime_websocket_accepts_connection(self) -> None:
        client = TestClient(create_app())

        with client.websocket_connect("/ws/realtime"):
            self.assertEqual(client.app.state.realtime_manager.connection_count, 1)

        self.assertEqual(client.app.state.realtime_manager.connection_count, 0)


if __name__ == "__main__":
    unittest.main()
