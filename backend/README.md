# PlantGuardian IoT Backend

FastAPI backend for PlantGuardian IoT.

## Current Modules

Implemented so far:

- `SensorReadingCreate` validates MQTT payloads from `iot/riego/datos`.
- `PlantHealthService` calculates system status, score, alerts, and recommendations.
- MQTT topics and command names are centralized in `app/mqtt/topics.py`.
- `InMemoryReadingRepository` stores readings during local development.
- `SqlReadingRepository` persists readings with SQLAlchemy.
- SQLAlchemy models exist for plants, sensor readings, alerts, and irrigation events.
- `CommandService` can use an in-memory publisher or a real MQTT publisher.
- `MqttCommandPublisher` publishes commands to `iot/riego/comandos` with `paho-mqtt`.
- `MqttReadingSubscriber` subscribes to `iot/riego/datos` and ingests sensor payloads.
- `ReadingService` validates, stores, scores, and broadcasts readings.
- `RealtimeConnectionManager` powers `/ws/realtime`.
- `app/main.py` exposes the FastAPI app and selects adapters from settings.

## Endpoints Available

- `GET /health`
- `POST /api/readings/manual`
- `GET /api/readings/latest`
- `GET /api/readings/history`
- `GET /api/dashboard`
- `POST /api/control/auto-on`
- `POST /api/control/auto-off`
- `POST /api/control/water-p1`
- `POST /api/control/water-p2`
- `POST /api/control/stop`
- `WS /ws/realtime`

## Configuration

By default the API uses in-memory storage and an in-memory command publisher.

Enable SQL persistence:

```bash
PLANTGUARDIAN_USE_DATABASE=true
DATABASE_URL=sqlite:///./plantguardian.db
```

PostgreSQL example:

```bash
DATABASE_URL=postgresql+psycopg://plantguardian:plantguardian@localhost:5432/plantguardian
```

Enable real MQTT command publishing:

```bash
PLANTGUARDIAN_MQTT_ENABLED=true
MQTT_HOST=127.0.0.1
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=plantguardian-backend
```

Enable MQTT reading ingestion:

```bash
PLANTGUARDIAN_MQTT_INGEST_ENABLED=true
```

See `.env.example` at the repository root.

## Install Dependencies

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
```

## Run Tests

```bash
python -m unittest discover backend/tests
```

## Run API Locally

In-memory mode:

```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

SQLite persistence mode:

```bash
PLANTGUARDIAN_USE_DATABASE=true DATABASE_URL=sqlite:///./plantguardian.db uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Next Backend Step

Add production packaging and persistence operations:

- Docker Compose for PostgreSQL, Mosquitto, and backend.
- Plant endpoints and repository.
- Alert persistence.
- Irrigation event persistence.
- Database migrations with Alembic.
