const express = require('express');
const axios = require('axios');

const app = express();
const ESP_IP = '10.42.0.77'; // IP ESP32
const PORT = 3000;

app.use(express.static('public'));
// app.get('/', (req, res) => {
//   res.sendFile('../public/index.html');
// });

console.log(__dirname)

app.get('/control/:pin/:state', async (req, res) => {
  const { pin, state } = req.params;

  try {
    const url = `http://${ESP_IP}/led/${pin}/${state}`;
    const response = await axios.get(url);
    res.send(response.data);
  } catch (err) {
    res.status(500).send("ESP32 non accessible");
  }
});

app.listen(PORT, () => {
  console.log(`Serveur sur http://localhost:${PORT}`);
});
