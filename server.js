import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let MODE = process.env.MODE || "SIMULATION";
const PORT = process.env.PORT || 8080;

// ✅ Rotta di test base
app.get("/", (req, res) => {
  res.send(`✅ ASIApp backend attivo. Modalità corrente: ${MODE}`);
});

// ✅ Imposta modalità (Simulation / Live)
app.post("/setmode", (req, res) => {
  MODE = req.body.mode || "SIMULATION";
  console.log(`🔁 Modalità impostata su ${MODE}`);
  res.json({ mode: MODE });
});

// ✅ Esegui trade
app.post("/trade", async (req, res) => {
  const { apiKey, apiSecret, symbol, qty, side } = req.body;

  const API_URL =
    MODE === "LIVE"
      ? "https://api.alpaca.markets/v2"
      : "https://paper-api.alpaca.markets/v2";

  // Simulazione locale
  if (MODE === "SIMULATION") {
    console.log(`🧩 Simulazione trade: ${symbol} ${side} x${qty}`);
    return res.json({ simulated: true, symbol, side, qty });
  }

  try {
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
    console.log(`✅ Ordine ${side} ${qty}x${symbol} inviato`);
    res.json(data);
  } catch (err) {
    console.error("❌ Errore trade:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Stato account Alpaca
app.get("/account", async (req, res) => {
  const base =
    MODE === "LIVE"
      ? "https://api.alpaca.markets/v2"
      : "https://paper-api.alpaca.markets/v2";

  const apiKey = process.env.ALPACA_API_KEY_ID;
  const apiSecret = process.env.ALPACA_SECRET_KEY;

  try {
    const r = await fetch(`${base}/account`, {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 ASIApp server in esecuzione sulla porta ${PORT}`)
);
