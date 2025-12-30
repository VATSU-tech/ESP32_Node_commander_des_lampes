// VATSU-tech
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

const char* ssid = "VATSU_04";
const char* password = "123456789000";

// 🔴 CHOISIR LA LAMPE ICI
String lampId = "led1";

String serverBase = "https://esp32-node-commander-des-lampes-1.onrender.com/led/";

int ledPin = 2; // D4

void setup() {
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, HIGH);

  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connecté");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {

    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    http.begin(client, serverBase + lampId);

    int code = http.GET();
    if (code == HTTP_CODE_OK) {
      String state = http.getString();
      state.trim();

      if (state == "ON")
        digitalWrite(ledPin, LOW);
      else
        digitalWrite(ledPin, HIGH);

      Serial.println(lampId + " = " + state);
    }

    http.end();
  }

  delay(2000);
}
