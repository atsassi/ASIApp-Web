import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let MODE = process.env.MODE || "SIMULATION";
const PORT = process.env.PORT || 8080;

app.post("/setmode", (req, res) => {
  MODE = req.body.mode || "SIMULATION";
  console.log(`⚙️ Modalità impostata su ${MODE}`);
  res.json({ mode: MODE });
});

app.post("/trade", async (req, res) => {
  const { apiKey, apiSecret, symbol, qty, side } = req.body;
  const API_URL =
    MODE === "LIVE"
      ? "https://api.alpaca.markets/v2"
      : "https://paper-api.alpaca.markets/v2";

  if (MODE === "SIMULATION") {
    return res.json({ simulated: true, symbol, side, qty });
  }

  const r = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "APCA-API-KEY-ID": apiKey,
      "APCA-API-SECRET-KEY": apiSecret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symbol,
      qty,
      side,
      type: "market",
      time_in_force: "day",
    }),
  });

  const data = await r.json();
  res.json(data);
});

app.listen(PORT, () =>
  console.log(`🚀 ASI Server attivo in modalità ${MODE} su porta ${PORT}`)
);
