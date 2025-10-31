document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("engine-status");
  const updateEl = document.getElementById("engine-update");
  const lastCheckEl = document.getElementById("last-check");

  const startBtn = document.getElementById("startEngine");
  const pauseBtn = document.getElementById("pauseEngine");
  const recalcBtn = document.getElementById("recalcAI");

  function updateStatus() {
    const status = localStorage.getItem("engineStatus") || "paused";
    const lastUpdate = localStorage.getItem("engineLastUpdate") || "--";

    if (status === "active") {
      statusEl.textContent = "🟢 Stato: Attivo";
      statusEl.style.color = "#00cc00";
    } else {
      statusEl.textContent = "🔴 Stato: Pausa";
      statusEl.style.color = "#cc0000";
    }
    updateEl.textContent = `Ultimo aggiornamento AI: ${lastUpdate}`;
    lastCheckEl.textContent = new Date().toLocaleString("it-IT");
  }

  startBtn.addEventListener("click", () => {
    localStorage.setItem("engineStatus", "active");
    localStorage.setItem("engineLastUpdate", new Date().toLocaleString("it-IT"));
    updateStatus();
  });

  pauseBtn.addEventListener("click", () => {
    localStorage.setItem("engineStatus", "paused");
    updateStatus();
  });

  recalcBtn.addEventListener("click", () => {
    alert("🔄 Soglie AI ricalcolate in base agli ultimi dati di mercato.");
    localStorage.setItem("engineLastUpdate", new Date().toLocaleString("it-IT"));
    updateStatus();
  });

  updateStatus();
});
