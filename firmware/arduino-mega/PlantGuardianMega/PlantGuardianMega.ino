#include <DHT.h>

// =====================================================
// DHT11 CONFIGURATION
// =====================================================

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// =====================================================
// SENSOR PINS
// =====================================================

const int PIN_HUM_P1 = A0;
const int PIN_HUM_P2 = A1;
const int PIN_LDR = A2;
const int PIN_AGUA = A3;

// =====================================================
// ACTUATOR PINS
// =====================================================

const int PIN_RELAY_BOMBA_P1 = 8;
const int PIN_RELAY_BOMBA_P2 = 9;

const int PIN_LED_TANQUE_BAJO = 10;
const int PIN_LED_RIEGO = 11;
const int PIN_LED_P1_SECA = 12;
const int PIN_LED_P2_SECA = 13;

// Most relay modules are active-low. Change to false if needed.
const bool RELAY_ACTIVE_LOW = true;

// =====================================================
// SENSOR CALIBRATION
// =====================================================

const int HUM_P1_SECO = 800;
const int HUM_P1_MOJADO = 350;

const int HUM_P2_SECO = 800;
const int HUM_P2_MOJADO = 350;

const int AGUA_VACIO = 0;
const int AGUA_LLENO = 650;

const int LDR_RAW_MIN = 0;
const int LDR_RAW_MAX = 850;
const bool LDR_INVERTIDO = false;

// =====================================================
// THRESHOLDS
// =====================================================

const int HUM_MIN_P1 = 35;
const int HUM_MIN_P2 = 35;
const int AGUA_MIN = 20;

const int LUZ_OSCURO_MAX = 45;
const int LUZ_MEDIA_MAX = 75;

// =====================================================
// TIMING
// =====================================================

const unsigned long TIEMPO_RIEGO_MS = 5000;
const unsigned long COOLDOWN_MS = 20000;
const unsigned long READ_INTERVAL_MS = 2000;
const unsigned long SEND_INTERVAL_MS = 2000;

const int COMMAND_MAX_LENGTH = 32;

// =====================================================
// SENSOR STATE
// =====================================================

int rawHumP1 = 0;
int rawHumP2 = 0;
int rawLuz = 0;
int rawAgua = 0;

int humP1 = 0;
int humP2 = 0;
int luzPct = 0;
int aguaPct = 0;

float tempAmb = 0.0;
float humAmb = 0.0;
bool dhtOk = false;

String estadoLuz = "";

// =====================================================
// CONTROL STATE
// =====================================================

bool autoMode = true;

bool planta1Seca = false;
bool planta2Seca = false;
bool tanqueBajo = false;

int plantaRegando = 0;
// 0 = none, 1 = plant 1, 2 = plant 2.

unsigned long irrigationStart = 0;
unsigned long lastWaterP1 = 0;
unsigned long lastWaterP2 = 0;
unsigned long lastRead = 0;
unsigned long lastSend = 0;

String commandBuffer = "";

// =====================================================
// HELPERS
// =====================================================

void setRelay(int pin, bool on) {
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(pin, on ? LOW : HIGH);
  } else {
    digitalWrite(pin, on ? HIGH : LOW);
  }
}

int convertSoilToPercent(int rawValue, int dryValue, int wetValue) {
  int percent = map(rawValue, dryValue, wetValue, 0, 100);
  return constrain(percent, 0, 100);
}

int convertWaterToPercent(int rawValue) {
  int percent = map(rawValue, AGUA_VACIO, AGUA_LLENO, 0, 100);
  return constrain(percent, 0, 100);
}

int convertLdrToPercent(int rawValue) {
  int percent;

  if (LDR_INVERTIDO) {
    percent = map(rawValue, LDR_RAW_MIN, LDR_RAW_MAX, 100, 0);
  } else {
    percent = map(rawValue, LDR_RAW_MIN, LDR_RAW_MAX, 0, 100);
  }

  return constrain(percent, 0, 100);
}

void sendCommandAck(const String& command, bool ok, const char* message) {
  Serial1.print("{\"type\":\"command_ack\",\"command\":\"");
  Serial1.print(command);
  Serial1.print("\",\"ok\":");
  Serial1.print(ok ? 1 : 0);
  Serial1.print(",\"message\":\"");
  Serial1.print(message);
  Serial1.println("\"}");

  Serial.print("Command ack: ");
  Serial.print(command);
  Serial.print(" | ok=");
  Serial.print(ok ? "true" : "false");
  Serial.print(" | ");
  Serial.println(message);
}

// =====================================================
// PUMP CONTROL
// =====================================================

void stopIrrigation() {
  setRelay(PIN_RELAY_BOMBA_P1, false);
  setRelay(PIN_RELAY_BOMBA_P2, false);

  digitalWrite(PIN_LED_RIEGO, LOW);

  if (plantaRegando == 1) {
    lastWaterP1 = millis();
  }

  if (plantaRegando == 2) {
    lastWaterP2 = millis();
  }

  plantaRegando = 0;
}

bool startIrrigation(int planta) {
  if (planta != 1 && planta != 2) {
    return false;
  }

  if (tanqueBajo) {
    stopIrrigation();
    return false;
  }

  if (plantaRegando != 0) {
    return false;
  }

  plantaRegando = planta;
  irrigationStart = millis();

  if (planta == 1) {
    setRelay(PIN_RELAY_BOMBA_P1, true);
    setRelay(PIN_RELAY_BOMBA_P2, false);
  }

  if (planta == 2) {
    setRelay(PIN_RELAY_BOMBA_P1, false);
    setRelay(PIN_RELAY_BOMBA_P2, true);
  }

  digitalWrite(PIN_LED_RIEGO, HIGH);
  return true;
}

// =====================================================
// SENSOR READING
// =====================================================

void readSensors() {
  rawHumP1 = analogRead(PIN_HUM_P1);
  rawHumP2 = analogRead(PIN_HUM_P2);
  rawLuz = analogRead(PIN_LDR);
  rawAgua = analogRead(PIN_AGUA);

  humP1 = convertSoilToPercent(rawHumP1, HUM_P1_SECO, HUM_P1_MOJADO);
  humP2 = convertSoilToPercent(rawHumP2, HUM_P2_SECO, HUM_P2_MOJADO);
  luzPct = convertLdrToPercent(rawLuz);
  aguaPct = convertWaterToPercent(rawAgua);

  if (luzPct < LUZ_OSCURO_MAX) {
    estadoLuz = "OSCURO";
  } else if (luzPct < LUZ_MEDIA_MAX) {
    estadoLuz = "LUZ_MEDIA";
  } else {
    estadoLuz = "MUCHA_LUZ";
  }

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    dhtOk = false;
    Serial.println("DHT11 read failed. Keeping previous temperature and humidity.");
  } else {
    dhtOk = true;
    tempAmb = t;
    humAmb = h;
  }

  planta1Seca = humP1 < HUM_MIN_P1;
  planta2Seca = humP2 < HUM_MIN_P2;
  tanqueBajo = aguaPct < AGUA_MIN;

  digitalWrite(PIN_LED_P1_SECA, planta1Seca ? HIGH : LOW);
  digitalWrite(PIN_LED_P2_SECA, planta2Seca ? HIGH : LOW);
  digitalWrite(PIN_LED_TANQUE_BAJO, tanqueBajo ? HIGH : LOW);
}

// =====================================================
// AUTOMATIC IRRIGATION
// =====================================================

void controlIrrigation() {
  if (tanqueBajo) {
    stopIrrigation();
    return;
  }

  if (plantaRegando != 0) {
    if (millis() - irrigationStart >= TIEMPO_RIEGO_MS) {
      stopIrrigation();
    }
    return;
  }

  if (!autoMode) {
    return;
  }

  bool puedeRegarP1 = (lastWaterP1 == 0) || (millis() - lastWaterP1 > COOLDOWN_MS);
  bool puedeRegarP2 = (lastWaterP2 == 0) || (millis() - lastWaterP2 > COOLDOWN_MS);

  if (humP1 < HUM_MIN_P1 && puedeRegarP1) {
    startIrrigation(1);
    return;
  }

  if (humP2 < HUM_MIN_P2 && puedeRegarP2) {
    startIrrigation(2);
    return;
  }
}

// =====================================================
// COMMANDS FROM ESP32
// =====================================================

void processCommand(String cmd) {
  cmd.trim();
  cmd.toUpperCase();

  if (cmd.length() == 0) {
    return;
  }

  bool ok = false;
  const char* message = "unknown_command";

  if (cmd == "AUTO_ON") {
    autoMode = true;
    ok = true;
    message = "auto_mode_enabled";
  } else if (cmd == "AUTO_OFF") {
    autoMode = false;
    stopIrrigation();
    ok = true;
    message = "auto_mode_disabled";
  } else if (cmd == "WATER_P1") {
    autoMode = false;
    ok = startIrrigation(1);
    message = ok ? "water_p1_started" : "water_p1_rejected";
  } else if (cmd == "WATER_P2") {
    autoMode = false;
    ok = startIrrigation(2);
    message = ok ? "water_p2_started" : "water_p2_rejected";
  } else if (cmd == "STOP") {
    autoMode = false;
    stopIrrigation();
    ok = true;
    message = "irrigation_stopped";
  }

  sendCommandAck(cmd, ok, message);
}

void handleESP32Commands() {
  while (Serial1.available()) {
    char c = Serial1.read();

    if (c == '\n') {
      processCommand(commandBuffer);
      commandBuffer = "";
    } else if (c != '\r') {
      if (commandBuffer.length() < COMMAND_MAX_LENGTH) {
        commandBuffer += c;
      } else {
        commandBuffer = "";
      }
    }
  }
}

// =====================================================
// DATA TO ESP32
// =====================================================

void sendDataToESP32() {
  Serial1.print("{");

  Serial1.print("\"humP1\":");
  Serial1.print(humP1);
  Serial1.print(",");

  Serial1.print("\"humP2\":");
  Serial1.print(humP2);
  Serial1.print(",");

  Serial1.print("\"tempDHT11\":");
  Serial1.print(tempAmb, 1);
  Serial1.print(",");

  Serial1.print("\"humDHT11\":");
  Serial1.print(humAmb, 1);
  Serial1.print(",");

  Serial1.print("\"luz\":");
  Serial1.print(luzPct);
  Serial1.print(",");

  Serial1.print("\"estadoLuz\":\"");
  Serial1.print(estadoLuz);
  Serial1.print("\",");

  Serial1.print("\"agua\":");
  Serial1.print(aguaPct);
  Serial1.print(",");

  Serial1.print("\"planta1Seca\":");
  Serial1.print(planta1Seca ? 1 : 0);
  Serial1.print(",");

  Serial1.print("\"planta2Seca\":");
  Serial1.print(planta2Seca ? 1 : 0);
  Serial1.print(",");

  Serial1.print("\"tanqueBajo\":");
  Serial1.print(tanqueBajo ? 1 : 0);
  Serial1.print(",");

  Serial1.print("\"bombaP1\":");
  Serial1.print(plantaRegando == 1 ? 1 : 0);
  Serial1.print(",");

  Serial1.print("\"bombaP2\":");
  Serial1.print(plantaRegando == 2 ? 1 : 0);
  Serial1.print(",");

  Serial1.print("\"regando\":");
  Serial1.print(plantaRegando != 0 ? 1 : 0);
  Serial1.print(",");

  Serial1.print("\"plantaRegando\":");
  Serial1.print(plantaRegando);
  Serial1.print(",");

  Serial1.print("\"dhtOk\":");
  Serial1.print(dhtOk ? 1 : 0);
  Serial1.print(",");

  Serial1.print("\"modo\":\"");
  Serial1.print(autoMode ? "AUTO" : "MANUAL");
  Serial1.print("\"");

  Serial1.println("}");

  Serial.println("===== DATA SENT TO ESP32 =====");
  Serial.print("humP1: ");
  Serial.print(humP1);
  Serial.println(" %");
  Serial.print("humP2: ");
  Serial.print(humP2);
  Serial.println(" %");
  Serial.print("tempDHT11: ");
  Serial.print(tempAmb);
  Serial.println(" C");
  Serial.print("humDHT11: ");
  Serial.print(humAmb);
  Serial.println(" %");
  Serial.print("luz: ");
  Serial.print(luzPct);
  Serial.print(" % | ");
  Serial.println(estadoLuz);
  Serial.print("agua: ");
  Serial.print(aguaPct);
  Serial.println(" %");
  Serial.print("modo: ");
  Serial.println(autoMode ? "AUTO" : "MANUAL");
  Serial.print("plantaRegando: ");
  Serial.println(plantaRegando);
  Serial.println("==============================");
}

// =====================================================
// SETUP
// =====================================================

void setup() {
  Serial.begin(115200);
  Serial1.begin(9600);

  dht.begin();

  pinMode(PIN_RELAY_BOMBA_P1, OUTPUT);
  pinMode(PIN_RELAY_BOMBA_P2, OUTPUT);

  pinMode(PIN_LED_TANQUE_BAJO, OUTPUT);
  pinMode(PIN_LED_RIEGO, OUTPUT);
  pinMode(PIN_LED_P1_SECA, OUTPUT);
  pinMode(PIN_LED_P2_SECA, OUTPUT);

  stopIrrigation();

  digitalWrite(PIN_LED_TANQUE_BAJO, LOW);
  digitalWrite(PIN_LED_RIEGO, LOW);
  digitalWrite(PIN_LED_P1_SECA, LOW);
  digitalWrite(PIN_LED_P2_SECA, LOW);

  Serial.println("PlantGuardian Arduino Mega started.");
  Serial.println("Serial1 is ready for ESP32 communication.");
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {
  handleESP32Commands();

  if (millis() - lastRead >= READ_INTERVAL_MS) {
    lastRead = millis();
    readSensors();
  }

  controlIrrigation();

  if (millis() - lastSend >= SEND_INTERVAL_MS) {
    lastSend = millis();
    sendDataToESP32();
  }
}
