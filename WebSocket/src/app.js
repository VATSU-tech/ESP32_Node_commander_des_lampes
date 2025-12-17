    const ws = new WebSocket(`ws://${location.host}`);
    const wsstate = document.getElementById('wsstate');
    const espstatus = document.getElementById('espstatus');
    const btn = document.getElementById('toggleBtn');

    let ledOn = false;

    ws.addEventListener('open', () => {
      wsstate.textContent = 'connecté';
      // S'identifier comme navigateur
      ws.send(JSON.stringify({ type: 'identify', client: 'browser' }));
    });

    ws.addEventListener('close', () => {
      wsstate.textContent = 'déconnecté';
    });

    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'info' && msg.text) {
          console.log('info:', msg.text);
        }
        if (msg.type === 'status' && typeof msg.led !== 'undefined') {
          ledOn = !!msg.led;
          espstatus.textContent = ledOn ? 'ON' : 'OFF';
          btn.textContent = ledOn ? 'Éteindre' : 'Allumer';
        }
        if (msg.type === 'error') {
          alert('Erreur du serveur: ' + msg.text);
        }
      } catch (e) { console.error(e); }
    });

    btn.addEventListener('click', () => {
      // envoyer commande toggle au serveur (qui la forwardera à l'ESP)
      const newVal = ledOn ? 0 : 1;
      ws.send(JSON.stringify({ cmd: 'led', value: newVal }));
      // on peut aussi attendre le retour de l'ESP pour changer l'état
    });