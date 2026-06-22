from dataclasses import asdict
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request, status

from backend.app.mqtt.topics import IrrigationCommand
from backend.app.repositories.reading_repository import InMemoryReadingRepository
from backend.app.schemas.sensor_reading import SensorReadingCreate
from backend.app.services.command_service import CommandService
from backend.app.services.plant_health_service import PlantHealthService


router = APIRouter()


def get_reading_repository(request: Request) -> InMemoryReadingRepository:
    return request.app.state.reading_repository


def get_health_service(request: Request) -> PlantHealthService:
    return request.app.state.health_service


def get_command_service(request: Request) -> CommandService:
    return request.app.state.command_service


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "plantguardian-backend"}


@router.post(
    "/api/readings/manual",
    status_code=status.HTTP_201_CREATED,
)
def create_manual_reading(
    payload: SensorReadingCreate,
    request: Request,
) -> dict:
    repository = get_reading_repository(request)
    stored = repository.add(payload)
    return stored.to_dict()


@router.get("/api/readings/latest")
def get_latest_reading(request: Request) -> dict:
    repository = get_reading_repository(request)
    latest = repository.latest()

    if latest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No sensor readings have been registered yet.",
        )

    return latest.to_dict()


@router.get("/api/readings/history")
def get_readings_history(
    request: Request,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
) -> dict:
    repository = get_reading_repository(request)
    readings = [item.to_dict() for item in repository.history(limit=limit)]
    return {"items": readings, "count": len(readings)}


@router.get("/api/dashboard")
def get_dashboard(request: Request) -> dict:
    repository = get_reading_repository(request)
    health_service = get_health_service(request)
    latest = repository.latest()

    if latest is None:
        return {
            "status": "SIN_DATOS",
            "score": 0,
            "latest_reading": None,
            "alerts": [],
            "recommendations": ["Esperando la primera lectura del sistema."],
        }

    assessment = health_service.evaluate(latest.reading)

    return {
        "status": assessment.status.value,
        "score": assessment.score,
        "latest_reading": latest.to_dict(),
        "alerts": [asdict(alert) for alert in assessment.alerts],
        "recommendations": assessment.recommendations,
    }


def _send_command(request: Request, command: IrrigationCommand) -> dict:
    command_service = get_command_service(request)
    return command_service.send(command).to_dict()


@router.post("/api/control/auto-on")
def auto_on(request: Request) -> dict:
    return _send_command(request, IrrigationCommand.AUTO_ON)


@router.post("/api/control/auto-off")
def auto_off(request: Request) -> dict:
    return _send_command(request, IrrigationCommand.AUTO_OFF)


@router.post("/api/control/water-p1")
def water_p1(request: Request) -> dict:
    return _send_command(request, IrrigationCommand.WATER_P1)


@router.post("/api/control/water-p2")
def water_p2(request: Request) -> dict:
    return _send_command(request, IrrigationCommand.WATER_P2)


@router.post("/api/control/stop")
def stop_irrigation(request: Request) -> dict:
    return _send_command(request, IrrigationCommand.STOP)
