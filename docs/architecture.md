# PlantGuardian IoT Architecture

## Current Status

The project now has the first professional firmware and backend domain modules:

- `firmware/arduino-mega/PlantGuardianMega/PlantGuardianMega.ino`
- `firmware/esp32/PlantGuardianESP32/PlantGuardianESP32.ino`
- `firmware/esp32/PlantGuardianESP32/config.example.h`
- `firmware/README.md`
- `docs/firmware-analysis.md`
- `backend/app/schemas/sensor_reading.py`
- `backend/app/services/plant_health_service.py`
- `backend/app/mqtt/topics.py`
- `backend/app/main.py`
- `backend/app/api/routes.py`
- `backend/app/repositories/reading_repository.py`
- `backend/app/services/command_service.py`
- `backend/app/services/reading_service.py`
- `backend/app/websocket/manager.py`
- `backend/app/mqtt/publisher.py`
- `backend/app/mqtt/subscriber.py`
- `docker-compose.yml`
- `mobile/App.tsx`
- `mobile/src/app/MainTabs.tsx`
- `mobile/src/screens/DashboardScreen.tsx`
- `mobile/src/services/apiClient.ts`
- `mobile/src/services/realtimeClient.ts`

The current implementation is still intentionally modular. It now includes a FastAPI app with in-memory and SQLAlchemy adapters, MQTT command publishing, MQTT reading ingestion, a WebSocket realtime endpoint, Docker Compose infrastructure, and an Expo React Native mobile foundation. It does not yet include Alembic migrations, plant CRUD endpoints, persisted alerts, persisted irrigation events, or mobile component tests.

## MVP Scope

PlantGuardian IoT is a sensor-based smart irrigation system. The MVP does not include camera features, image uploads, Computer Vision, CNN models, Grad-CAM, or visual disease detection. Those features belong only to the future roadmap.

The MVP is based on:

- Arduino Mega for sensor reading, local irrigation control, LEDs, and serial communication.
- ESP32 for WiFi, MQTT publishing, MQTT command subscription, and Serial2 forwarding.
- Mosquitto MQTT broker.
- FastAPI backend.
- PostgreSQL database.
- React Native with Expo mobile app.
- Sensor-based health scoring and recommendations.

## Firmware Architecture

### Arduino Mega

Responsibilities:

- Read DHT11 temperature and humidity.
- Read soil moisture for plant 1 and plant 2.
- Read LDR light level.
- Read tank water level.
- Control pump relay for plant 1.
- Control pump relay for plant 2.
- Control LEDs for dry plant 1, dry plant 2, low tank, and active irrigation.
- Send one JSON payload per line to ESP32 through `Serial1`.
- Receive commands from ESP32 through `Serial1`.
- Return command acknowledgements to ESP32.

### ESP32

Responsibilities:

- Connect to WiFi using local `config.h` generated from `config.example.h`.
- Connect to MQTT broker.
- Publish readings to `iot/riego/datos`.
- Publish status and command acknowledgements to `iot/riego/estado`.
- Subscribe to `iot/riego/comandos`.
- Validate commands.
- Forward accepted commands to Arduino Mega through `Serial2`.
- Publish retained online/offline availability status.

## MQTT Topics

| Topic | Direction | Producer | Consumer | Purpose |
| --- | --- | --- | --- | --- |
| `iot/riego/datos` | device to platform | ESP32 | Backend | Sensor readings and actuator states. |
| `iot/riego/estado` | device to platform | ESP32 / Arduino via ESP32 | Backend | Availability, status events, command acknowledgements. |
| `iot/riego/comandos` | platform to device | Backend | ESP32 | Remote irrigation and mode commands. |

## Commands

Valid command values:

- `AUTO_ON`
- `AUTO_OFF`
- `WATER_P1`
- `WATER_P2`
- `STOP`

The ESP32 accepts either a plain command:

```text
WATER_P1
```

or a structured JSON command:

```json
{
  "command": "WATER_P1",
  "source": "backend",
  "requestId": "uuid",
  "createdAt": "2026-06-21T00:00:00Z"
}
```

## Sensor Payload

Current reading payload published to `iot/riego/datos`:

```json
{
  "humP1": 0,
  "humP2": 0,
  "tempDHT11": 0.0,
  "humDHT11": 0.0,
  "luz": 0,
  "estadoLuz": "OSCURO",
  "agua": 0,
  "planta1Seca": 0,
  "planta2Seca": 0,
  "tanqueBajo": 0,
  "bombaP1": 0,
  "bombaP2": 0,
  "regando": 0,
  "plantaRegando": 0,
  "dhtOk": 1,
  "modo": "AUTO"
}
```

Backend normalization:

| MQTT field | Backend field | Type |
| --- | --- | --- |
| `humP1` | `hum_p1` | integer 0-100 |
| `humP2` | `hum_p2` | integer 0-100 |
| `tempDHT11` | `temp_dht11` | float |
| `humDHT11` | `hum_dht11` | float 0-100 |
| `luz` | `luz` | integer 0-100 |
| `estadoLuz` | `estado_luz` | enum: `OSCURO`, `LUZ_MEDIA`, `MUCHA_LUZ` |
| `agua` | `agua` | integer 0-100 |
| `planta1Seca` | `planta1_seca` | boolean |
| `planta2Seca` | `planta2_seca` | boolean |
| `tanqueBajo` | `tanque_bajo` | boolean |
| `bombaP1` | `bomba_p1` | boolean |
| `bombaP2` | `bomba_p2` | boolean |
| `regando` | `regando` | boolean |
| `plantaRegando` | `planta_regando` | integer: `0`, `1`, `2` |
| `dhtOk` | `dht_ok` | boolean |
| `modo` | `modo` | enum: `AUTO`, `MANUAL` |

## Backend Architecture

Recommended structure:

```text
backend/
  app/
    api/
    core/
    db/
    models/
    mqtt/
    schemas/
    services/
    websocket/
    main.py
  tests/
```

Current backend module includes:

- `SensorReadingCreate` for MQTT payload validation.
- `PlantHealthService` for status, score, alerts, and recommendations.
- MQTT topic and command constants.
- `unittest` tests for schema validation, health rules, API endpoints, SQL repository behavior, MQTT publishing, MQTT ingestion, and WebSocket connection handling.

Required backend endpoints:

- `GET /api/readings/latest`
- `GET /api/readings/history`
- `POST /api/readings/manual`
- `GET /api/dashboard`
- `GET /api/plants`
- `POST /api/plants`
- `GET /api/plants/{plant_id}`
- `POST /api/control/auto-on`
- `POST /api/control/auto-off`
- `POST /api/control/water-p1`
- `POST /api/control/water-p2`
- `POST /api/control/stop`
- `WS /ws/realtime`

## PlantHealthService Rules

System states:

- `EXCELENTE`
- `ESTABLE`
- `ATENCION`
- `CRITICO`

Implemented rules:

- Low tank produces `CRITICO`.
- Both plants dry produces `CRITICO`.
- One dry plant or soil moisture below 35 produces `ATENCION`.
- Low light produces a recommendation to move the plant to more light.
- High light produces an exposure warning.
- High temperature produces an alert.
- Low ambient humidity produces a recommendation.
- Failed DHT11 reading produces a sensor warning.
- Stable auto mode can produce `EXCELENTE`.

## Database Model

Initial tables:

- `plants`
- `sensor_readings`
- `alerts`
- `irrigation_events`

## Mobile Architecture

Recommended structure:

```text
mobile/
  src/
    app/
    screens/
    components/
    features/
    hooks/
    services/
    store/
    theme/
    types/
    utils/
```

Required screens:

- Splash
- Login
- Dashboard
- Sensor details
- Control
- History
- Profile / Settings

## Final Repository Layout

```text
plantguardian-iot/
  mobile/
  backend/
  firmware/
    arduino-mega/
    esp32/
  ml/
    notebooks/
    models/
    training/
  docs/
  docker-compose.yml
  .env.example
  README.md
```

## Implementation Order

1. Firmware sketches organized under `firmware/arduino-mega/` and `firmware/esp32/`.
2. ESP32 MQTT command subscription and Serial2 forwarding implemented.
3. Backend domain core created with Pydantic schemas and `PlantHealthService`.
4. Create FastAPI app shell and REST endpoints.
5. Add in-memory repositories for local development.
6. Add PostgreSQL models and migrations.
7. Add MQTT subscriber and command publisher.
8. Add WebSocket stream.
9. Build Expo mobile dashboard and control screens.
10. Add charts, history, settings, Docker Compose, and full README.

## Next Recommended Module

The next best module is the FastAPI application shell:

- `backend/app/main.py`
- manual reading endpoint
- latest reading endpoint
- dashboard endpoint
- control endpoints backed by a command service abstraction
- in-memory repository for local development before PostgreSQL