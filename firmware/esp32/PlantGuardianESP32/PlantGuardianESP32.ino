#include <WiFi.h>
#include <WiFiMulti.h>
#include <PubSubClient.h>
#include <Preferences.h>

#if __has_include("config.h")
  #include "config.h"
#else
  #include "config.example.h"
#endif

// =====================================================
// MQTT TOPICS
// =====================================================

const char* TOPIC_DATOS = "iot/riego/datos";
const char* TOPIC_ESTADO = "iot/riego/estado";
const char* TOPIC_COMANDOS = "iot/riego/comandos";

// =====================================================
// ARDUINO MEGA SERIAL LINK
// =====================================================

const int ESP32_RX2 = 16;
const int ESP32_TX2 = 17;

// =====================================================
// WIFI / MQTT STATUS LED
// =====================================================

const int LED_WIFI = 4;

// =====================================================
// MQTT CLIENT
// =====================================================

WiFiClient espClient;
WiFiMulti wifiMulti;
PubSubClient client(espClient);
Preferences preferences;

String latestData = "";
IPAddress mqttBrokerIp;
bool wifiNetworksConfigured = false;
int mqttConnectionFailures = 0;

// =====================================================
// HELPERS
// =====================================================

String makeClientId() {
  String clientId = MQTT_CLIENT_ID_PREFIX;
  clientId += String(random(0xffff), HEX);
  return clientId;
}

bool probeMqttBroker(const IPAddress& address) {
  WiFiClient probe;
  bool reachable = probe.connect(address, MQTT_PORT, MQTT_SCAN_TIMEOUT_MS);
  probe.stop();
  return reachable;
}

bool useMqttBroker(const IPAddress& address) {
  if (!probeMqttBroker(address)) {
    return false;
  }

  mqttBrokerIp = address;
  client.setServer(mqttBrokerIp, MQTT_PORT);
  preferences.putString("mqtt_host", mqttBrokerIp.toString());

  Serial.print("MQTT broker found at ");
  Serial.println(mqttBrokerIp);
  return true;
}

bool discoverMqttBroker() {
  IPAddress candidate;
  String savedBroker = preferences.getString("mqtt_host", "");

  if (savedBroker.length() > 0 &&
      candidate.fromString(savedBroker) &&
      useMqttBroker(candidate)) {
    return true;
  }

  if (candidate.fromString(MQTT_SERVER) && useMqttBroker(candidate)) {
    return true;
  }

  IPAddress localIp = WiFi.localIP();
  Serial.print("Scanning local network for MQTT broker from ");
  Serial.println(localIp);

  for (int host = 1; host <= 254; host++) {
    candidate = IPAddress(localIp[0], localIp[1], localIp[2], host);

    if (candidate == localIp) {
      continue;
    }

    if (useMqttBroker(candidate)) {
      return true;
    }
  }

  Serial.println("MQTT broker was not found on the local network.");
  return false;
}

void configureMqttServer() {
  if (discoverMqttBroker()) {
    return;
  }

  client.setServer(MQTT_SERVER, MQTT_PORT);
  Serial.print("Using fallback MQTT broker: ");
  Serial.println(MQTT_SERVER);
}

void publishStatus(const String& status, bool retained = false) {
  if (!client.connected()) {
    return;
  }

  client.publish(TOPIC_ESTADO, status.c_str(), retained);
}

bool isValidCommand(const String& command) {
  return command == "AUTO_ON" ||
         command == "AUTO_OFF" ||
         command == "WATER_P1" ||
         command == "WATER_P2" ||
         command == "STOP";
}

String extractJsonStringValue(const String& payload, const String& key) {
  String quotedKey = "\"" + key + "\"";
  int keyIndex = payload.indexOf(quotedKey);

  if (keyIndex < 0) {
    return "";
  }

  int colonIndex = payload.indexOf(':', keyIndex + quotedKey.length());
  if (colonIndex < 0) {
    return "";
  }

  int firstQuote = payload.indexOf('"', colonIndex + 1);
  if (firstQuote < 0) {
    return "";
  }

  int secondQuote = payload.indexOf('"', firstQuote + 1);
  if (secondQuote < 0) {
    return "";
  }

  return payload.substring(firstQuote + 1, secondQuote);
}

String normalizeCommandPayload(String payload) {
  payload.trim();

  if (payload.startsWith("{")) {
    payload = extractJsonStringValue(payload, "command");
  }

  payload.trim();
  payload.toUpperCase();
  return payload;
}

void forwardCommandToArduino(const String& command) {
  Serial2.print(command);
  Serial2.print('\n');

  String status = "{\"device\":\"esp32\",\"event\":\"command_forwarded\",\"command\":\"";
  status += command;
  status += "\"}";
  publishStatus(status);
}

bool isArduinoAck(const String& line) {
  return line.indexOf("\"type\":\"command_ack\"") >= 0;
}

// =====================================================
// WIFI CONNECTION
// =====================================================

void setupWifi() {
  delay(10);

  Serial.println();
  Serial.println("Connecting to a configured WiFi network...");

  WiFi.mode(WIFI_STA);

  if (!wifiNetworksConfigured) {
    wifiMulti.addAP(WIFI_SSID, WIFI_PASSWORD);

    if (strlen(WIFI_FALLBACK_SSID) > 0) {
      wifiMulti.addAP(WIFI_FALLBACK_SSID, WIFI_FALLBACK_PASSWORD);
    }

    wifiNetworksConfigured = true;
  }

  while (wifiMulti.run() != WL_CONNECTED) {
    digitalWrite(LED_WIFI, LOW);
    delay(300);
    digitalWrite(LED_WIFI, HIGH);
    delay(300);
    Serial.print(".");
  }

  digitalWrite(LED_WIFI, HIGH);

  Serial.println();
  Serial.println("WiFi connected.");
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

// =====================================================
// MQTT CALLBACK AND RECONNECTION
// =====================================================

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicName = String(topic);
  String body = "";

  for (unsigned int i = 0; i < length; i++) {
    body += (char)payload[i];
  }

  body.trim();

  if (topicName != TOPIC_COMANDOS) {
    return;
  }

  String command = normalizeCommandPayload(body);

  if (!isValidCommand(command)) {
    String status = "{\"device\":\"esp32\",\"event\":\"command_rejected\",\"reason\":\"invalid_command\",\"payload\":\"";
    status += body;
    status += "\"}";
    publishStatus(status);
    Serial.print("Invalid MQTT command rejected: ");
    Serial.println(body);
    return;
  }

  Serial.print("MQTT command received: ");
  Serial.println(command);
  forwardCommandToArduino(command);
}

void reconnectMqtt() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker... ");

    String clientId = makeClientId();
    const char* willPayload = "{\"device\":\"esp32\",\"status\":\"offline\"}";

    bool connected;
    if (strlen(MQTT_USERNAME) > 0) {
      connected = client.connect(
        clientId.c_str(),
        MQTT_USERNAME,
        MQTT_PASSWORD,
        TOPIC_ESTADO,
        1,
        true,
        willPayload
      );
    } else {
      connected = client.connect(
        clientId.c_str(),
        TOPIC_ESTADO,
        1,
        true,
        willPayload
      );
    }

    if (connected) {
      Serial.println("connected.");
      digitalWrite(LED_WIFI, HIGH);
      mqttConnectionFailures = 0;

      client.subscribe(TOPIC_COMANDOS, 1);
      publishStatus("{\"device\":\"esp32\",\"status\":\"online\"}", true);
      publishStatus("{\"device\":\"esp32\",\"event\":\"subscribed\",\"topic\":\"iot/riego/comandos\"}");
    } else {
      mqttConnectionFailures++;
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" | retrying");

      digitalWrite(LED_WIFI, LOW);

      if (mqttConnectionFailures >= 2) {
        mqttConnectionFailures = 0;
        discoverMqttBroker();
      }

      delay(2000);
    }
  }
}

// =====================================================
// MQTT PUBLISHING
// =====================================================

void publishSensorData(const String& jsonData) {
  if (!client.connected()) {
    reconnectMqtt();
  }

  client.loop();

  bool sent = client.publish(TOPIC_DATOS, jsonData.c_str());

  if (sent) {
    Serial.println("MQTT data published:");
    Serial.println(jsonData);
  } else {
    Serial.println("MQTT publish failed.");
  }
}

void handleArduinoLine(String line) {
  line.trim();

  if (line.length() <= 5 || !line.startsWith("{") || !line.endsWith("}")) {
    return;
  }

  if (isArduinoAck(line)) {
    publishStatus(line);
    Serial.println("Arduino command acknowledgement published to status topic:");
    Serial.println(line);
    return;
  }

  latestData = line;

  Serial.println("===== DATA RECEIVED FROM ARDUINO MEGA =====");
  Serial.println(latestData);
  Serial.println("===========================================");

  publishSensorData(latestData);
}

// =====================================================
// SETUP
// =====================================================

void setup() {
  Serial.begin(115200);

  pinMode(LED_WIFI, OUTPUT);
  digitalWrite(LED_WIFI, LOW);

  Serial2.begin(9600, SERIAL_8N1, ESP32_RX2, ESP32_TX2);
  Serial2.setTimeout(30);

  setupWifi();

  preferences.begin("plantguardian", false);
  configureMqttServer();
  client.setCallback(mqttCallback);
  client.setBufferSize(512);

  Serial.println("PlantGuardian ESP32 bridge ready.");
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_WIFI, LOW);
    setupWifi();
    configureMqttServer();
  }

  if (!client.connected()) {
    reconnectMqtt();
  }

  client.loop();

  while (Serial2.available()) {
    String line = Serial2.readStringUntil('\n');
    handleArduinoLine(line);
  }
}
