
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let leds = { led1: "OFF" };

app.get("/led/:id", (req, res) => {
  res.send(leds[req.params.id] || "OFF");
});

app.post("/led/:id", (req, res) => {
  const { state } = req.body;
  if (state === "ON" || state === "OFF") {
    leds[req.params.id] = state;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid state" });
  }
});
 
app.listen(PORT, () => console.log("Server running"));
