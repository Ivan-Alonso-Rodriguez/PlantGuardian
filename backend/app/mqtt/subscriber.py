import asyncio
import json
from collections.abc import Awaitable
from typing import Any

import paho.mqtt.client as mqtt

from backend.app.core.config import Settings
from backend.app.mqtt.topics import MqttTopic
from backend.app.services.reading_service import ReadingService


class MqttReadingSubscriber:
    def __init__(
        self,
        settings: Settings,
        reading_service: ReadingService,
        client: mqtt.Client | None = None,
    ) -> None:
        self.settings = settings
        self.reading_service = reading_service
        self.client = client or mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
            client_id=f"{settings.mqtt_client_id}-subscriber",
        )
        self._loop: asyncio.AbstractEventLoop | None = None

        if settings.mqtt_username:
            self.client.username_pw_set(settings.mqtt_username, settings.mqtt_password)

    async def process_payload(self, payload: bytes | str) -> dict[str, Any]:
        text = payload.decode("utf-8") if isinstance(payload, bytes) else payload
        data = json.loads(text)
        return await self.reading_service.ingest(data)

    def start(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.connect(self.settings.mqtt_host, self.settings.mqtt_port, keepalive=30)
        self.client.loop_start()

    def stop(self) -> None:
        self.client.loop_stop()
        self.client.disconnect()

    def _on_connect(self, client, userdata, flags, reason_code, properties=None) -> None:
        client.subscribe(MqttTopic.DATA.value, qos=1)

    def _on_message(self, client, userdata, message) -> None:
        if self._loop is None:
            return

        task: Awaitable[dict[str, Any]] = self.process_payload(message.payload)
        asyncio.run_coroutine_threadsafe(task, self._loop)
