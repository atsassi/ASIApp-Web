// Impostazioni ASI App – gestione connessione Alpaca
const backendURL = "https://asiapp-web-service.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("alpacaForm");
  const apiKeyInput = document.getElementById("apiKey");
  const apiSecretInput = document.getElementById("apiSecret");
  const apiModeSelect = document.getElementById("apiMode");
  const disconnectBtn = document.getElementById("disconnect");
  const statusMsg = document.getElementById("connStatus");

  // Carica eventuali chiavi salvate
  const savedKey = localStorage.getItem("alpacaKey");
  const savedSecret = localStorage.getItem("alpacaSecret");
  const savedMode = localStorage.getItem("alpacaMode");

  if (savedKey && savedSecret) {
    apiKeyInput.value = savedKey;
    apiSecretInput.value = savedSecret;
    apiModeSelect.value = savedMode || "PAPER";
    statusMsg.textContent = `Connesso (${savedMode || "demo"})`;
  }

  // Connetti ad Alpaca
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const apiKey = apiKeyInput.value.trim();
    const apiSecret = apiSecretInput.value.trim();
    const mode = apiModeSelect.value;

    statusMsg.textContent = "Connessione in corso...";

    try {
      const res = await fetch(`${backendURL}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, apiSecret, mode }),
      });

      const data = await res.json();

      if (res.ok && data.connected) {
        localStorage.setItem("alpacaKey", apiKey);
        localStorage.setItem("alpacaSecret", apiSecret);
        localStorage.setItem("alpacaMode", mode);
        statusMsg.textContent = `✅ Connesso (${mode})`;
        alert("Connessione riuscita ad Alpaca!");
      } else {
        throw new Error(data.error || "Credenziali non valide");
      }
    } catch (err) {
      console.error(err);
      statusMsg.textContent = "❌ Connessione fallita";
      alert("Errore di connessione ad Alpaca.");
    }
  });

  // Disconnetti
  disconnectBtn.addEventListener("click", () => {
    localStorage.removeItem("alpacaKey");
    localStorage.removeItem("alpacaSecret");
    localStorage.removeItem("alpacaMode");
    statusMsg.textContent = "Non connesso";
    alert("Disconnesso da Alpaca");
  });

  // Tema scuro
  document.getElementById("savePrefs").onclick = () => {
    alert("✅ Preferenze salvate");
  };
});
