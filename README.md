# PlantGuardian IoT

PlantGuardian IoT is a smart irrigation and environmental monitoring system for plants. It connects Arduino Mega, ESP32, MQTT, FastAPI, PostgreSQL, and a future React Native mobile app into a portfolio-ready IoT product.

The MVP is based on real sensor data. It does not implement camera upload, Computer Vision, Grad-CAM, CNN models, or image-based diagnosis.

## What It Solves

Small irrigation projects often stop at isolated Arduino sketches. PlantGuardian turns the physical prototype into a complete product architecture:

- Sensor readings from Arduino Mega.
- ESP32 WiFi and MQTT bridge.
- Backend validation, persistence, scoring, alerts, recommendations, and control commands.
- Realtime WebSocket stream for a mobile dashboard.
- Docker-ready PostgreSQL and Mosquitto infrastructure.

## Current Status

Implemented:

- Arduino Mega firmware.
- ESP32 MQTT bridge firmware.
- MQTT command topic support from ESP32 to Arduino.
- FastAPI backend shell.
- Pydantic validation for sensor readings.
- Plant health scoring service.
- SQLAlchemy models for readings, plants, alerts, and irrigation events.
- In-memory and SQL reading repositories.
- MQTT command publisher.
- MQTT sensor reading subscriber.
- WebSocket endpoint at `/ws/realtime`.
- Docker Compose for backend, PostgreSQL, and Mosquitto.
- Backend unit tests.

Planned next:

- Plant CRUD endpoints.
- Alert persistence.
- Irrigation event persistence.
- Alembic migrations.
- React Native Expo mobile app foundation.
- Charts, history, settings, and controls UI.

## Architecture

```text
Arduino Mega -> Serial1 -> ESP32 -> MQTT -> FastAPI -> PostgreSQL
                                             |
                                             -> WebSocket -> Mobile App
```

## MQTT Topics

- `iot/riego/datos`: ESP32 publishes sensor readings.
- `iot/riego/estado`: ESP32 publishes status and command acknowledgements.
- `iot/riego/comandos`: backend publishes control commands.

## Backend Quick Start

Install dependencies:

```bash
python -m pip install -r backend/requirements.txt
```

Run API:

```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Run tests:

```bash
python -m unittest discover backend/tests
```

## Docker Quick Start

```bash
docker compose up --build
```

Services:

- Backend: `http://127.0.0.1:8000`
- PostgreSQL: `localhost:5432`
- Mosquitto: `localhost:1883`


## Mobile Quick Start

```bash
cd mobile
pnpm install
pnpm web
```

Expo Web runs at `http://localhost:8081` by default. The app points to `http://127.0.0.1:8000` for the backend.
## Firmware

Firmware lives in:

- `firmware/arduino-mega/PlantGuardianMega`
- `firmware/esp32/PlantGuardianESP32`

Copy `firmware/esp32/PlantGuardianESP32/config.example.h` to `config.h` and replace WiFi/MQTT values before uploading to the ESP32.

## Documentation

- `docs/architecture.md`
- `docs/firmware-analysis.md`
- `firmware/README.md`
- `backend/README.md`
