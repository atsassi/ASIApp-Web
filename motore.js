// === ASIApp Motore di investimento ===
// Versione: novembre 2025
// Collega il frontend al backend su Render per modalità demo e reali

const API_BASE = "https://asiapp-web-service.onrender.com";

let motoreAttivo = false;
let modalita = "SIMULATION"; // valori possibili: SIMULATION | TEST | LIVE

// Funzione per aggiornare lo stato UI
function aggiornaStatoMotore() {
  const statoEl = document.getElementById("statoMotore");
  const btnAttiva = document.getElementById("btnAttiva");
  const btnPausa = document.getElementById("btnPausa");

  if (motoreAttivo) {
    statoEl.innerHTML = "🟢 Attivo";
    btnAttiva.disabled = true;
    btnPausa.disabled = false;
  } else {
    statoEl.innerHTML = "🔴 In pausa";
    btnAttiva.disabled = false;
    btnPausa.disabled = true;
  }
}

// Imposta la modalità (Simulazione, Test Alpaca o Live)
async function setMode(mode) {
  modalita = mode;
  try {
    const res = await fetch(`${API_BASE}/setmode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    });
    const data = await res.json();
    document.getElementById("logMotore").innerHTML =
      `✅ Modalità impostata su: ${data.mode}`;
  } catch (err) {
    document.getElementById("logMotore").innerHTML =
      "❌ Errore nel cambio modalità";
    console.error(err);
  }
}

// Attiva il motore AI (inizia simulazione o trading)
async function attivaMotore() {
  motoreAttivo = true;
  aggiornaStatoMotore();

  try {
    const res = await fetch(`${API_BASE}/trade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: localStorage.getItem("alpacaKey") || "",
        apisecret: localStorage.getItem("alpacaSecret") || "",
        symbol: "AAPL",
        qty: 1,
        side: "buy"
      })
    });
    const data = await res.json();
    document.getElementById("logMotore").innerHTML =
      `🚀 Motore avviato — Risposta: ${JSON.stringify(data)}`;
  } catch (err) {
    document.getElementById("logMotore").innerHTML =
      "❌ Errore durante l’attivazione del motore";
    console.error(err);
  }
}

// Metti in pausa il motore
function pausaMotore() {
  motoreAttivo = false;
  aggiornaStatoMotore();
  document.getElementById("logMotore").innerHTML =
    "⏸️ Motore messo in pausa.";
}

// Ricalcola le soglie AI (simulato)
function ricalcolaSoglie() {
  document.getElementById("logMotore").innerHTML =
    "🤖 Soglie AI ricalcolate (ETF +3.3%, Stocks +2.0%)";
}

// Inizializzazione pagina
window.addEventListener("DOMContentLoaded", () => {
  aggiornaStatoMotore();

  // Event listeners
  document.getElementById("btnAttiva").addEventListener("click", attivaMotore);
  document.getElementById("btnPausa").addEventListener("click", pausaMotore);
  document.getElementById("btnRicalcola").addEventListener("click", ricalcolaSoglie);

  document.getElementById("btnSimula").addEventListener("click", () => setMode("SIMULATION"));
  document.getElementById("btnTest").addEventListener("click", () => setMode("TEST"));
  document.getElementById("btnLive").addEventListener("click", () => setMode("LIVE"));
});
