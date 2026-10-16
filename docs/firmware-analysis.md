# Firmware Analysis

## Source Reviewed

The current Arduino Mega and ESP32 sketches were provided as pasted text. They have now been organized into:

- `firmware/arduino-mega/PlantGuardianMega/PlantGuardianMega.ino`
- `firmware/esp32/PlantGuardianESP32/PlantGuardianESP32.ino`

## Arduino Mega

### Sensors Read

- DHT11 temperature on digital pin `2`.
- DHT11 ambient humidity on digital pin `2`.
- Soil moisture plant 1 on `A0`.
- Soil moisture plant 2 on `A1`.
- LDR light sensor on `A2`.
- Water tank level sensor on `A3`.

### Actuators Controlled

- Plant 1 pump relay on pin `8`.
- Plant 2 pump relay on pin `9`.
- Low tank LED on pin `10`.
- Active irrigation LED on pin `11`.
- Dry plant 1 LED on pin `12`.
- Dry plant 2 LED on pin `13`.

### Current Strengths

- Sensor readings are converted to percentages before being sent to ESP32.
- Raw analog values are kept local, which gives the backend a cleaner payload.
- Pump control is non-blocking and uses `millis()`.
- Automatic irrigation has a cooldown per plant.
- The Arduino already accepts command strings from ESP32.
- Relay active-low behavior is configurable.

### Improvements Applied

- Added command acknowledgements from Arduino to ESP32.
- Added command buffer length protection.
- Added `dhtOk` to the payload.
- Made `regando` a boolean value.
- Added `plantaRegando` to identify which plant is currently being watered.
- Converted serial monitor text to ASCII-safe logs.

## ESP32

### Data Published

The ESP32 publishes Arduino JSON readings to:

`iot/riego/datos`

### Status Published

The ESP32 publishes connection, subscription, rejected command, forwarded command, and Arduino acknowledgement events to:

`iot/riego/estado`

### Original Limitations

- WiFi credentials were hardcoded.
- MQTT broker IP was hardcoded.
- The ESP32 only published readings; it did not subscribe to commands.
- There was no forwarding from MQTT commands to Arduino Mega.
- There was no MQTT Last Will status.
- Arduino acknowledgements were not distinguished from sensor readings.

### Improvements Applied

- Added `config.example.h` and ignored local `config.h` for WiFi and MQTT credentials.
- Added MQTT command subscription on `iot/riego/comandos`.
- Added validation for allowed commands.
- Added support for plain text commands and JSON command payloads.
- Added forwarding to Arduino Mega through `Serial2`.
- Added MQTT Last Will on `iot/riego/estado`.
- Added retained online/offline availability status.
- Routed Arduino command acknowledgements to `iot/riego/estado`.

## Current Sensor Payload

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

## Minimum Integration Contract For Backend

The backend should:

- Subscribe to `iot/riego/datos`.
- Validate the sensor payload with Pydantic.
- Accept `0` and `1` as booleans for legacy device compatibility.
- Allow optional fields such as `plantaRegando` and `dhtOk`.
- Subscribe to `iot/riego/estado` for availability and command acknowledgements.
- Publish commands to `iot/riego/comandos`.

## Next Recommended Module

Build the backend domain core:

- Pydantic schemas for MQTT readings.
- `PlantHealthService`.
- Unit tests for validation, alerts, recommendations, and command names.
