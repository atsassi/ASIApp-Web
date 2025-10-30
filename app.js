// === ASI APP v2 ===
// Dashboard interattiva collegata ad Alpaca API

const BASE_URL = "https://paper-api.alpaca.markets/v2"; // per ora demo
let API_KEY = localStorage.getItem("alpacaKey");
let API_SECRET = localStorage.getItem("alpacaSecret");

// Funzione base per chiamate API
async function alpacaFetch(endpoint, method = "GET", body = null) {
  const headers = {
    "APCA-API-KEY-ID": API_KEY,
    "APCA-API-SECRET-KEY": API_SECRET,
    "Content-Type": "application/json"
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  return await res.json();
}

// === Sezione Dashboard ===
async function loadDashboard() {
  const account = await alpacaFetch("/account");
  document.getElementById("balance").textContent =
    "$" + parseFloat(account.cash || 0).toFixed(2);
  document.getElementById("dailyChange").textContent =
    (account.portfolio_value ? "$" + account.portfolio_value : "--");
  document.getElementById("roiTotal").textContent =
    (account.equity && account.last_equity)
      ? ((account.equity - account.last_equity) / account.last_equity * 100).toFixed(2) + "%"
      : "--";

  const orders = await alpacaFetch("/orders?status=all&limit=50");
  document.getElementById("orderCount").textContent = orders.length;
}

// === Sezione Portafoglio ===
async function loadPortfolio() {
  const positions = await alpacaFetch("/positions");
  const tbody = document.querySelector("#positionsTable tbody");
  tbody.innerHTML = "";
  positions.forEach(p => {
    const row = `<tr>
      <td>${p.symbol}</td>
      <td>${p.qty}</td>
      <td>$${parseFloat(p.avg_entry_price).toFixed(2)}</td>
      <td>$${parseFloat(p.market_value).toFixed(2)}</td>
      <td>${parseFloat(p.unrealized_plpc * 100).toFixed(2)}%</td>
    </tr>`;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

// === Sezione Andamento ===
async function loadChart() {
  const history = await alpacaFetch("/account/portfolio/history");
  const ctx = document.getElementById("portfolioChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: history.timestamp.map(t => new Date(t * 1000).toLocaleDateString()),
      datasets: [{
        label: "Valore Portafoglio ($)",
        data: history.equity,
        borderColor: "#c9a227",
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// === Gestione menu ===
const sections = {
  dashboard: document.getElementById("dashboard-section"),
  performance: document.getElementById("performance-section"),
  portfolio: document.getElementById("portfolio-section"),
  settings: document.getElementById("settings-section")
};

function showSection(id) {
  Object.values(sections).forEach(sec => sec.classList.add("hidden"));
  sections[id].classList.remove("hidden");
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
  document.getElementById("nav-" + id).classList.add("active");

  if (id === "dashboard") loadDashboard();
  if (id === "portfolio") loadPortfolio();
  if (id === "performance") loadChart();
}

document.getElementById("nav-dashboard").addEventListener("click", () => showSection("dashboard"));
document.getElementById("nav-performance").addEventListener("click", () => showSection("performance"));
document.getElementById("nav-portfolio").addEventListener("click", () => showSection("portfolio"));
document.getElementById("nav-settings").addEventListener("click", () => showSection("settings"));

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("alpacaKey");
  localStorage.removeItem("alpacaSecret");
  window.location.href = "index.html";
});

window.onload = loadDashboard;
