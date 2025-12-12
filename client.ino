#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

const char* ssid = "Zorin-os";
const char* password = "00000000";

const char* serverHost = "10.42.0.1"; // remplace par l'IP du PC qui tourne Node.js
const uint16_t serverPort = 3000;

const int LED_PIN = 2; // ou la pin que tu as câblée

WebSocketsClient webSocket;
bool ledState = false;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Déconnecté");
      break;
    case WStype_CONNECTED:
      Serial.println("[WS] Connecté au serveur");
      // s'identifier comme 'esp'
      {
        StaticJsonDocument<200> doc;
        doc["type"] = "identify";
        doc["client"] = "esp";
        String s;
        serializeJson(doc, s);
        webSocket.sendTXT(s);
      }
      break;
    case WStype_TEXT:
      {
        String msg = (char*)payload;
        Serial.println("[WS] message: " + msg);
        // parser JSON
        StaticJsonDocument<200> doc;
        DeserializationError err = deserializeJson(doc, msg);
        if (!err) {
          if (doc["cmd"] && String((const char*)doc["cmd"]) == "led") {
            int v = doc["value"];
            ledState = (v != 0);
            digitalWrite(LED_PIN, ledState ? HIGH : LOW);
            // envoyer status au serveur
            StaticJsonDocument<200> out;
            out["type"] = "status";
            out["led"] = ledState ? 1 : 0;
            String s; serializeJson(out, s);
            webSocket.sendTXT(s);
          }
        } else {
          Serial.println("Erreur parsing JSON");
        }
      }
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connexion WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP ESP32: ");
  Serial.println(WiFi.localIP());

  // config WebSocket
  webSocket.begin(serverHost, serverPort, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000); // reconnect tous les 5s si perdu
}

void loop() {
  webSocket.loop();
}
