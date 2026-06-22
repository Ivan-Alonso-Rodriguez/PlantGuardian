import json
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

import paho.mqtt.client as mqtt

from backend.app.core.config import Settings
from backend.app.mqtt.topics import IrrigationCommand, MqttTopic


class MqttCommandPublisher:
    def __init__(self, settings: Settings, client: mqtt.Client | None = None) -> None:
        self.settings = settings
        self.client = client or mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
            client_id=settings.mqtt_client_id,
        )

        if settings.mqtt_username:
            self.client.username_pw_set(settings.mqtt_username, settings.mqtt_password)

    def publish(self, command: IrrigationCommand) -> dict[str, Any]:
        payload = {
            "command": command.value,
            "source": "backend",
            "requestId": str(uuid4()),
            "createdAt": datetime.now(UTC).isoformat(),
        }

        self.client.connect(self.settings.mqtt_host, self.settings.mqtt_port, keepalive=30)
        result = self.client.publish(
            MqttTopic.COMMANDS.value,
            json.dumps(payload),
            qos=1,
        )
        result.wait_for_publish(timeout=5)
        self.client.disconnect()

        return {
            "command": command.value,
            "topic": MqttTopic.COMMANDS.value,
            "payload": payload,
            "published": result.rc == mqtt.MQTT_ERR_SUCCESS,
        }
