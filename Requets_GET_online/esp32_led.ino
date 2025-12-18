
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";

String serverUrl = "https://esp32-node-commander-des-lampes-1.onrender.com/";

int ledPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl + "/led/led1");
    int code = http.GET();

    if (code == 200) {
      String state = http.getString();
      state.trim();
      if (state == "ON") digitalWrite(ledPin, HIGH);
      else digitalWrite(ledPin, LOW);
    }
    http.end();
  }
  delay(2000);
}
