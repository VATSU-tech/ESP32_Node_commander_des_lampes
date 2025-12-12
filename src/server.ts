// server.ts
import express, { Request, Response } from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;

// Types pour les messages WebSocket
interface BaseMessage {
  type: string;
  [key: string]: any;
}

type ClientType = 'esp' | 'browser' | undefined;

interface ExtendedWebSocket extends WebSocket {
  clientType?: ClientType;
}

// Servir la page statique
app.use(express.static(path.join(__dirname, 'public')));

// Garder la connexion de l’ESP32
let espSocket: ExtendedWebSocket | null = null;

// Gestion des connexions WebSocket
wss.on('connection', (ws: ExtendedWebSocket, req) => {
  console.log('Nouvelle connexion WebSocket');

  ws.on('message', (data: WebSocket.RawData) => {
    try {
      const msg: BaseMessage = JSON.parse(data.toString());

      // Identification initiale
      if (msg.type === 'identify') {
        ws.clientType = msg.client as ClientType;
        console.log('Client identifié :', ws.clientType);

        if (ws.clientType === 'esp') {
          espSocket = ws;
          ws.send(JSON.stringify({ type: 'info', text: 'ESP connecté' }));
        }
        return;
      }

      // Si message navigateur → transmettre à l’ESP
      if (ws.clientType === 'browser') {
        if (!espSocket || espSocket.readyState !== WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'error', text: 'ESP non connecté' }));
          return;
        }
        espSocket.send(JSON.stringify(msg));
      }

      // Si message ESP → broadcast aux navigateurs
      if (ws.clientType === 'esp') {
        wss.clients.forEach(client => {
          const c = client as ExtendedWebSocket;
          if (c !== ws && c.readyState === WebSocket.OPEN && c.clientType === 'browser') {
            c.send(JSON.stringify(msg));
          }
        });
      }

    } catch (err) {
      console.error('Erreur parsing message :', err);
    }
  });

  ws.on('close', () => {
    console.log('Connexion fermée');
    if (ws === espSocket) espSocket = null;
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
