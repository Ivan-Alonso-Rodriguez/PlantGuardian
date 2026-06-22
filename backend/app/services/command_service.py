from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Protocol

from backend.app.mqtt.topics import IrrigationCommand, MqttTopic


@dataclass(frozen=True)
class PublishedCommand:
    command: IrrigationCommand
    topic: MqttTopic
    created_at: datetime
    published: bool = True

    def to_dict(self) -> dict[str, str | bool]:
        return {
            "command": self.command.value,
            "topic": self.topic.value,
            "created_at": self.created_at.isoformat(),
            "published": self.published,
        }


@dataclass(frozen=True)
class CommandPublishResult:
    data: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return self.data


class InMemoryCommandPublisher:
    """Records commands during local development and tests."""

    def __init__(self) -> None:
        self.published_commands: list[PublishedCommand] = []

    def publish(self, command: IrrigationCommand) -> PublishedCommand:
        record = PublishedCommand(
            command=command,
            topic=MqttTopic.COMMANDS,
            created_at=datetime.now(UTC),
        )
        self.published_commands.append(record)
        return record


class CommandPublisher(Protocol):
    def publish(self, command: IrrigationCommand) -> PublishedCommand | dict[str, Any]:
        ...


class CommandService:
    def __init__(self, publisher: CommandPublisher | None = None) -> None:
        self.publisher = publisher or InMemoryCommandPublisher()

    def send(self, command: IrrigationCommand) -> PublishedCommand | CommandPublishResult:
        result = self.publisher.publish(command)
        if isinstance(result, PublishedCommand):
            return result
        return CommandPublishResult(result)