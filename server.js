import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let MODE = process.env.MODE || "SIMULATION";
let PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("✅ ASIApp backend attivo. Modalità corrente: " + MODE);
});

// 🔗 Connessione Alpaca API
app.post("/connect", async (req, res) => {
  const { apiKey, apiSecret, mode } = req.body;

  const endpoint =
    mode === "LIVE"
      ? "https://api.alpaca.markets/v2/account"
      : "https://paper-api.alpaca.markets/v2/account";

  try {
    const r = await fetch(endpoint, {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    });

    if (!r.ok) throw new Error("API error");

    const data = await r.json();

    if (data && data.id) {
      res.json({ connected: true, account: data });
    } else {
      res.status(400).json({ connected: false, error: "Credenziali non valide" });
    }
  } catch (err) {
    console.error("Errore connessione Alpaca:", err);
    res.status(500).json({ connected: false, error: "Errore di rete" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server ASIApp attivo su porta ${PORT}`)
);
