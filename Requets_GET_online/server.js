const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// État des LEDs (mémoire serveur)
let leds = {
  led1: "OFF",
  led2: "OFF"
};

// ESP → lire l’état d’une LED
app.get("/led/:id", (req, res) => {
  const id = req.params.id;
  res.send(leds[id] || "OFF");
});

// Site web → changer l’état
app.post("/led/:id", (req, res) => {
  const id = req.params.id;
  const { state } = req.body;

  if (state === "ON" || state === "OFF") {
    leds[id] = state;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "État invalide" });
  }
});

// Test serveur
app.get("/", (req, res) => {
  res.send("Serveur IoT en ligne");
});

app.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});
