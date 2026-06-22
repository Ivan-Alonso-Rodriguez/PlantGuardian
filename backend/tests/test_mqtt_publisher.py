import json
import unittest

from backend.app.core.config import Settings
from backend.app.mqtt.publisher import MqttCommandPublisher
from backend.app.mqtt.topics import IrrigationCommand


class FakePublishResult:
    rc = 0

    def wait_for_publish(self, timeout=None):
        self.timeout = timeout


class FakeMqttClient:
    def __init__(self):
        self.connected = None
        self.published = None
        self.disconnected = False
        self.credentials = None

    def username_pw_set(self, username, password):
        self.credentials = (username, password)

    def connect(self, host, port, keepalive):
        self.connected = (host, port, keepalive)

    def publish(self, topic, payload, qos):
        self.published = (topic, payload, qos)
        return FakePublishResult()

    def disconnect(self):
        self.disconnected = True


class MqttCommandPublisherTest(unittest.TestCase):
    def test_publish_builds_command_payload(self) -> None:
        settings = Settings(
            mqtt_host="broker.local",
            mqtt_port=1883,
            mqtt_username="user",
            mqtt_password="secret",
        )
        client = FakeMqttClient()
        publisher = MqttCommandPublisher(settings, client=client)

        result = publisher.publish(IrrigationCommand.WATER_P1)

        topic, payload, qos = client.published
        decoded = json.loads(payload)

        self.assertEqual(client.connected, ("broker.local", 1883, 30))
        self.assertEqual(client.credentials, ("user", "secret"))
        self.assertEqual(topic, "iot/riego/comandos")
        self.assertEqual(qos, 1)
        self.assertEqual(decoded["command"], "WATER_P1")
        self.assertEqual(decoded["source"], "backend")
        self.assertTrue(client.disconnected)
        self.assertTrue(result["published"])


if __name__ == "__main__":
    unittest.main()
