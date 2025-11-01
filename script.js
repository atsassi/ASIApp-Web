// ASIApp – Script principale (motore + connessione + gestione fondi)

// Inizializza variabili locali
let engineMode = localStorage.getItem("asi_mode") || "SIMULATION";
let apiKey = localStorage.getItem("alpacaKey");
let apiSecret = localStorage.getItem("alpacaSecret");

// Funzione di inizializzazione DOM
document.addEventListener("DOMContentLoaded", () => {
  updateConnectionStatus();
  updateModeDisplay();
  updateBalance();

  const sim = document.getElementById("modeSim");
  const test = document.getElementById("modeTest");
  const live = document.getElementById("modeLive");
  const add = document.getElementById("addFunds");
  const withdraw = document.getElementById("withdrawFunds");
  const refresh = document.getElementById("refreshAI");

  if (sim) sim.onclick = () => setMode("SIMULATION");
  if (test) test.onclick = () => setMode("PAPER");
  if (live) live.onclick = () => setMode("LIVE");
  if (add) add.onclick = () => openFunding("add");
  if (withdraw) withdraw.onclick = () => openFunding("withdraw");
  if (refresh) refresh.onclick = () => refreshAI();
});

function setMode(mode) {
  engineMode = mode;
  localStorage.setItem("asi_mode", mode);
  updateModeDisplay();

  if (mode === "LIVE") checkFundsBeforeLive();
}

function updateModeDisplay() {
  const modeEl = document.getElementById("engineMode");
  const stateEl = document.getElementById("engineState");

  if (!modeEl || !stateEl) return;

  if (engineMode === "SIMULATION") {
    modeEl.textContent = "Simulazione locale";
    stateEl.textContent = "🟡 In pausa";
  } else if (engineMode === "PAPER") {
    modeEl.textContent = "Test Alpaca (Paper Trading)";
    stateEl.textContent = "🔵 Attivo";
  } else if (engineMode === "LIVE") {
    modeEl.textContent = "Attivo Alpaca (Live Trading)";
    stateEl.textContent = "🟢 Attivo";
  }

  updateConnectionStatus();
}

function updateConnectionStatus() {
  const badge = document.getElementById("connectionStatus");
  if (!badge) return;

  if (engineMode === "SIMULATION") {
    badge.textContent = "Connessione: ⚙️ Locale (simulazione)";
  } else if (engineMode === "PAPER") {
    badge.textContent = "Connessione: ✅ Alpaca Paper Trading";
  } else {
    badge.textContent = "Connessione: 🟢 Alpaca Live";
  }
}

function openFunding(type) {
  const url = "https://app.alpaca.markets/account/funding";
  const msg =
    type === "add"
      ? "💵 Aprendo pagina deposito Alpaca..."
      : "🏦 Aprendo pagina prelievo Alpaca...";
  alert(msg);
  window.open(url, "_blank");
}

// 🔍 Aggiorna saldo Alpaca
async function updateBalance() {
  if (!apiKey || !apiSecret) return;

  const endpoint =
    engineMode === "LIVE"
      ? "https://api.alpaca.markets/v2/account"
      : "https://paper-api.alpaca.markets/v2/account";

  try {
    const res = await fetch(endpoint, {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const balance = parseFloat(data.cash || 0).toFixed(2);
    document.getElementById("alpacaBalance").textContent = `$${balance}`;
  } catch (err) {
    console.warn("Errore aggiornamento saldo:", err);
    document.getElementById("alpacaBalance").textContent = "$0.00";
  }
}

// ⚠️ Controlla fondi minimi prima del LIVE
async function checkFundsBeforeLive() {
  try {
    const res = await fetch("https://paper-api.alpaca.markets/v2/account", {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    });

    const data = await res.json();
    const funds = parseFloat(data.cash || 0);

    if (funds < 100) {
      document.getElementById("engineWarning").style.display = "block";
      alert("⚠️ Fondi insufficienti per modalità LIVE (minimo $100 richiesti)");
      setMode("SIMULATION");
    } else {
      document.getElementById("engineWarning").style.display = "none";
      alert("✅ Motore LIVE Alpaca avviato con successo");
    }
  } catch (e) {
    console.error("Errore verifica fondi:", e);
  }
}

// 🔁 Ricalcola soglie AI (mock)
function refreshAI() {
  const now = new Date().toLocaleString("it-IT");
  document.getElementById("lastCheck").textContent = now;
  alert("🔄 Soglie AI ricalcolate automaticamente al " + now);
}
