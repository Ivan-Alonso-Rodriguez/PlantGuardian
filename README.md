# PlantGuardian IoT

PlantGuardian IoT is a smart irrigation and environmental monitoring system for plants. It connects Arduino Mega, ESP32, MQTT, FastAPI, SQL persistence, and an Expo React Native app into a portfolio-ready IoT product.

The MVP is based on real sensor data. It does not implement camera upload, Computer Vision, Grad-CAM, CNN models, or image-based diagnosis.

## What It Solves

Small irrigation projects often stop at isolated Arduino sketches. PlantGuardian turns the physical prototype into a complete product architecture:

- Sensor readings from Arduino Mega.
- ESP32 WiFi and MQTT bridge.
- Backend validation, persistence, scoring, alerts, recommendations, and control commands.
- Realtime WebSocket stream for a mobile dashboard, sensor history, and control UI.
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
- Expo React Native app with dashboard, sensors, history, settings, and controls.
- Docker Compose for backend, PostgreSQL, and Mosquitto.
- Backend unit tests.

Planned next:

- Plant CRUD endpoints.
- Alert persistence.
- Irrigation event persistence.
- Alembic migrations.

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

On Windows, double-click:

```text
INICIAR_PLANTGUARDIAN.cmd
```

The launcher detects the current LAN IP, starts or reuses Mosquitto, FastAPI,
and Expo Go, enables SQLite history, prewarms the Android bundle, and prints
the Expo Go URL and QR code. Run it again after changing WiFi networks.

Manual start:

```bash
cd mobile
pnpm install
pnpm web
```

Expo Web runs at `http://localhost:8081` by default. In Expo Go, the app derives
the backend address from the Metro host, so it does not depend on a hardcoded
LAN IP.

## Firmware

Firmware lives in:

- `firmware/arduino-mega/PlantGuardianMega`
- `firmware/esp32/PlantGuardianESP32`

Copy `firmware/esp32/PlantGuardianESP32/config.example.h` as `config.h` and
set your WiFi values there before uploading the ESP32 firmware. `config.h` is
ignored by Git. The ESP32 can use either configured network, remembers the last
MQTT broker, and scans the local subnet when the broker IP changes.

## Documentation

- `docs/architecture.md`
- `docs/firmware-analysis.md`
- `firmware/README.md`
- `backend/README.md`
