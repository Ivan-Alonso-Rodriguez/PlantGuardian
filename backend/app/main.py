import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.info import router as info_router
from backend.app.api.realtime import router as realtime_router
from backend.app.api.routes import router
from backend.app.core.config import Settings, get_settings
from backend.app.db.base import Base
from backend.app.db.session import create_db_engine, create_session_factory
from backend.app.models import Alert, IrrigationEvent, Plant, SensorReading
from backend.app.mqtt.publisher import MqttCommandPublisher
from backend.app.mqtt.subscriber import MqttReadingSubscriber
from backend.app.repositories.reading_repository import (
    InMemoryReadingRepository,
    ReadingRepository,
)
from backend.app.repositories.sql_reading_repository import SqlReadingRepository
from backend.app.services.command_service import CommandService
from backend.app.services.plant_health_service import PlantHealthService
from backend.app.services.reading_service import ReadingService
from backend.app.websocket.manager import RealtimeConnectionManager


# Imported for SQLAlchemy metadata registration.
_SQL_MODELS = (Alert, IrrigationEvent, Plant, SensorReading)


def build_reading_repository(settings: Settings) -> ReadingRepository:
    if not settings.use_database:
        return InMemoryReadingRepository()

    engine = create_db_engine(settings)
    Base.metadata.create_all(bind=engine)
    session_factory = create_session_factory(engine)
    return SqlReadingRepository(session_factory)


def build_command_service(settings: Settings) -> CommandService:
    if not settings.mqtt_enabled:
        return CommandService()

    return CommandService(MqttCommandPublisher(settings))


def create_app(
    reading_repository: ReadingRepository | None = None,
    health_service: PlantHealthService | None = None,
    command_service: CommandService | None = None,
    realtime_manager: RealtimeConnectionManager | None = None,
    settings: Settings | None = None,
) -> FastAPI:
    selected_settings = settings or get_settings()

    app = FastAPI(
        title=selected_settings.app_name,
        version=selected_settings.app_version,
        description="Backend API for smart irrigation monitoring and control.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.settings = selected_settings
    app.state.reading_repository = reading_repository or build_reading_repository(
        selected_settings
    )
    app.state.health_service = health_service or PlantHealthService()
    app.state.command_service = command_service or build_command_service(selected_settings)
    app.state.realtime_manager = realtime_manager or RealtimeConnectionManager()
    app.state.reading_service = ReadingService(
        app.state.reading_repository,
        app.state.health_service,
        app.state.realtime_manager,
    )
    app.state.mqtt_reading_subscriber = None

    if selected_settings.mqtt_ingest_enabled:
        subscriber = MqttReadingSubscriber(selected_settings, app.state.reading_service)
        app.state.mqtt_reading_subscriber = subscriber

        @app.on_event("startup")
        async def start_mqtt_subscriber() -> None:
            subscriber.start(asyncio.get_running_loop())

        @app.on_event("shutdown")
        async def stop_mqtt_subscriber() -> None:
            subscriber.stop()

    app.include_router(info_router)
    app.include_router(router)
    app.include_router(realtime_router)
    return app


app = create_app()
