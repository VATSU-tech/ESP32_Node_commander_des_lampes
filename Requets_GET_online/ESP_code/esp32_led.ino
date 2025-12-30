// VATSU-tech
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

const char* ssid = "VATSU_04";
const char* password = "123456789000";

String serverUrl = "https://esp32-node-commander-des-lampes-1.onrender.com/led/led1";

int ledPin = 2; // GPIO2 = D4 sur NodeMCU (LED intégrée)
 
bool stateL = true;

void setup() {
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, HIGH); // LED OFF (active LOW)

  Serial.begin(115200);
  Serial.println();
  Serial.println("Connexion WiFi...");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(ledPin, stateL ? LOW : HIGH);
    Serial.print(".");
    stateL = !stateL;
    delay(500);
  }

  Serial.println();
  Serial.print("Connecté, IP : ");
  Serial.println(WiFi.localIP());

  digitalWrite(ledPin, HIGH); 
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {

    WiFiClientSecure client;
    client.setInsecure(); // autorise HTTPS sans certificat

    HTTPClient http;
    http.begin(client, serverUrl);

    int code = http.GET();
    Serial.print("HTTP code : ");
    Serial.println(code);

    if (code == HTTP_CODE_OK) {
      String state = http.getString();
      state.trim();

      Serial.print("Etat recu : ");
      Serial.println(state);

      if (state == "ON")
        digitalWrite(ledPin, LOW);   // LED ON
      else
        digitalWrite(ledPin, HIGH);  // LED OFF
    }

    http.end();
  }

  delay(2000);
}
