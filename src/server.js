// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Servir la page statique (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Garder la connexion de l'ESP32 (une seule pour ce tutoriel)
let espSocket = null;

// Quand un client WebSocket se connecte
wss.on('connection', (ws, req) => {
  console.log('Nouvelle connexion WebSocket');

  // On peut utiliser un simple handshake: premier message envoyé par le client indique son type
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      // Si le client s'identifie
      if (msg.type === 'identify') {
        ws.clientType = msg.client; // 'esp' ou 'browser'
        console.log('Client identifié:', ws.clientType);
        if (ws.clientType === 'esp') {
          espSocket = ws;
          ws.send(JSON.stringify({ type: 'info', text: 'ESP connecté' }));
        }
        return;
      }

      // Si message d'un navigateur -> le forwarder vers l'ESP
      if (ws.clientType === 'browser') {
        if (!espSocket || espSocket.readyState !== WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'error', text: 'ESP non connecté' }));
          return;
        }
        // forwarder la commande au microcontrôleur
        espSocket.send(JSON.stringify(msg));
      }

      // Si message de l'ESP (status par ex), on broadcast aux navigateurs
      if (ws.clientType === 'esp') {
        // broadcast aux navigateurs
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN && client.clientType === 'browser') {
            client.send(JSON.stringify(msg));
          }
        });
      }
    } catch (e) {
      console.error('Erreur parsing message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Connexion fermée');
    if (ws === espSocket) espSocket = null;
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
