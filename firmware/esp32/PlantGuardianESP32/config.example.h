#pragma once

// Copy this file as config.h and replace these values before uploading.
// Do not commit config.h with real credentials.

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Optional second network, useful when switching between router and hotspot.
#define WIFI_FALLBACK_SSID ""
#define WIFI_FALLBACK_PASSWORD ""

// Used only as a fallback. The ESP32 also remembers and discovers the broker.
#define MQTT_SERVER "192.168.1.100"
#define MQTT_PORT 1883
#define MQTT_SCAN_TIMEOUT_MS 35

// Leave empty when the broker does not require authentication.
#define MQTT_USERNAME ""
#define MQTT_PASSWORD ""

#define MQTT_CLIENT_ID_PREFIX "ESP32_Riego_"
