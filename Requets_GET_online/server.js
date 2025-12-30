const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔴 ÉTAT DE PLUSIEURS LAMPES
let leds = {
  led1: "OFF",
  led2: "OFF",
  led3: "OFF"
};

// ESP → lire l’état d’une lampe
app.get("/led/:id", (req, res) => {
  const id = req.params.id;
  res.send(leds[id] || "OFF");
});

// SITE → changer l’état d’une lampe
app.post("/led/:id", (req, res) => {
  const id = req.params.id;
  const { state } = req.body;

  if (state === "ON" || state === "OFF") {
    leds[id] = state;
    res.json({ success: true, led: id, state });
  } else {
    res.status(400).json({ error: "Invalid state" });
  }
});

// Debug (voir tout l’état)
app.get("/status", (req, res) => {
  res.json(leds);
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
