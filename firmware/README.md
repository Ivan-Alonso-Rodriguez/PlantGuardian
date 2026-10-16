# PlantGuardian IoT Firmware

This folder contains the firmware for the physical irrigation system.

## Boards

- `arduino-mega/PlantGuardianMega`: reads sensors, controls pumps and LEDs, and sends JSON to ESP32 through `Serial1`.
- `esp32/PlantGuardianESP32`: connects to WiFi/MQTT, publishes sensor readings, subscribes to commands, and forwards commands to Arduino Mega through `Serial2`.

## Serial Wiring

Recommended serial link:

| Arduino Mega | ESP32 |
| --- | --- |
| TX1 pin 18 | RX2 GPIO16 |
| RX1 pin 19 | TX2 GPIO17 |
| GND | GND |

Use level shifting if your wiring or board combination requires it.

## MQTT Topics

- Data: `iot/riego/datos`
- ESP32 status and Arduino command acknowledgements: `iot/riego/estado`
- Commands: `iot/riego/comandos`

## Commands

Valid commands:

- `AUTO_ON`
- `AUTO_OFF`
- `WATER_P1`
- `WATER_P2`
- `STOP`

The ESP32 accepts plain commands:

```text
WATER_P1
```

It also accepts structured JSON:

```json
{
  "command": "WATER_P1",
  "source": "backend",
  "requestId": "uuid"
}
```

## ESP32 Configuration

Copy the example firmware configuration:

```text
firmware/esp32/PlantGuardianESP32/config.example.h
```

as:

```text
firmware/esp32/PlantGuardianESP32/config.h
```

Then set your WiFi and fallback MQTT values in `config.h`. This file is ignored
by Git and should not be committed with real credentials.

The ESP32 tries either configured WiFi network. After connecting, it tests the
last broker that worked, then the fallback address, and finally scans the local
`/24` subnet for an MQTT listener on port `1883`. Upload this firmware once
after changing the network list; ordinary DHCP address changes do not require
another upload.

## Smoke Test

1. Upload `PlantGuardianMega.ino` to Arduino Mega.
2. Upload `PlantGuardianESP32.ino` to ESP32 after configuring `config.h`.
3. Start Mosquitto.
4. Subscribe to data:

```bash
mosquitto_sub -h <broker-ip> -t iot/riego/datos
```

5. Subscribe to status:

```bash
mosquitto_sub -h <broker-ip> -t iot/riego/estado
```

6. Send a command:

```bash
mosquitto_pub -h <broker-ip> -t iot/riego/comandos -m '{"command":"WATER_P1"}'
```

The ESP32 should forward the command to the Mega, and the Mega should return a command acknowledgement on `iot/riego/estado`.
