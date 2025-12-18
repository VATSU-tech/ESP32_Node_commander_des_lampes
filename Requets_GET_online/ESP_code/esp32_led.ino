//VATSU-tech
#include <WiFi.h> // Use #include <ESP8266WiFi.h> for ESP8266 models
#include <HTTPClient.h>

const char* ssid = "Heritiervita";
const char* password = "0987654321"; 

String serverUrl = "https://esp32-node-commander-des-lampes-1.onrender.com/";

int ledPin = 2;

bool stateL = true;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(ledPin, stateL);
    Serial.print(".");
    stateL =! stateL;
    delay(500);
  }
  Serial.print("Connexion : "+WiFi.localIP());
  digitalWrite(ledPin, false);
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
