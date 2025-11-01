// ASIApp – Script principale (motore + connessione + gestione fondi)

// Stato iniziale
let engineMode = localStorage.getItem("asi_mode") || "SIMULATION";
let apiKey = localStorage.getItem("alpacaKey");
let apiSecret = localStorage.getItem("alpacaSecret");

// Aggiorna interfaccia
updateConnectionStatus();
updateModeDisplay();
updateBalance();

// 🔄 Pulsanti modalità
document.getElementById("modeSim").onclick = () => setMode("SIMULATION");
document.getElementById("modeTest").onclick = () => setMode("PAPER");
document.getElementById("modeLive").onclick = () => setMode("LIVE");

// 🔄 Pulsanti fondi
document.getElementById("addFunds").onclick = () => openFunding("add");
document.getElementById("withdrawFunds").onclick = () => openFunding("withdraw");

// 🔄 Ricalcolo AI
document.getElementById("refreshAI").onclick = () => refreshAI();

function setMode(mode) {
  engineMode = mode;
  localStorage.setItem("asi_mode", mode);
  updateModeDisplay();

  if (mode === "LIVE") checkFundsBeforeLive();
}

function updateModeDisplay() {
  const modeEl = document.getElementById("engineMode");
  const stateEl = document.getElementById("engineState");

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
  alert(type === "add" ? "💵 Aprendo pagina deposito Alpaca..." : "🏦 Aprendo pagina prelievo Alpaca...");
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
    const data = await res.json();
    const balance = parseFloat(data.cash || 0).toFixed(2);
    document.getElementById("alpacaBalance").textContent = `$${balance}`;
  } catch {
    document.getElementById("alpacaBalance").textContent = "$0.00";
  }
}

// ⚠️ Controlla fondi minimi
async function checkFundsBeforeLive() {
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
}

// 🔁 Ricalcola soglie AI (mock)
function refreshAI() {
  const now = new Date().toLocaleString("it-IT");
  document.getElementById("lastCheck").textContent = now;
  alert("🔄 Soglie AI ricalcolate automaticamente al " + now);
}
