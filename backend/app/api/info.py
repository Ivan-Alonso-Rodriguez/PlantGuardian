from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def root() -> dict:
    return {
        "service": "PlantGuardian IoT API",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "dashboard": "/api/dashboard",
        "realtime": "/ws/realtime",
    }
