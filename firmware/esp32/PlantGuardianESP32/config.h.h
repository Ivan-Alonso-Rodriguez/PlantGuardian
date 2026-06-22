#pragma once

// Copy this file as config.h and replace the placeholder values.
// Do not commit config.h with real credentials.

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

#define MQTT_SERVER "192.168.1.100"
#define MQTT_PORT 1883

// Leave empty when the broker does not require authentication.
#define MQTT_USERNAME ""
#define MQTT_PASSWORD ""

#define MQTT_CLIENT_ID_PREFIX "ESP32_Riego_"
