document.addEventListener("DOMContentLoaded", async () => {
  const saldoEl = document.getElementById("saldo");
  const profitEl = document.getElementById("profitto");
  const roiEl = document.getElementById("roi");
  const ordiniEl = document.getElementById("ordini");
  const motoreEl = document.getElementById("motore");
  const portfolioEl = document.getElementById("portfolio");

  // ✅ Stato motore AI locale
  const motoreStatus = localStorage.getItem("engineStatus") || "paused";
  motoreEl.textContent = motoreStatus === "active" ? "🟢 Attivo" : "🔴 In pausa";

  // ✅ Dati demo per simulazione
  const saldo = 100000;
  const dailyProfit = (Math.random() * 200 - 100).toFixed(2);
  const roi = ((dailyProfit / saldo) * 100).toFixed(3);
  const orders = Math.floor(Math.random() * 20 + 1);

  saldoEl.textContent = `$${saldo.toFixed(2)}`;
  profitEl.textContent = `${dailyProfit >= 0 ? "+" : ""}$${dailyProfit}`;
  roiEl.textContent = `${roi}%`;
  ordiniEl.textContent = orders;

  // ✅ Dati portafoglio demo
  const portfolio = [
    { symbol: "AAPL", qty: 10, avg: 190.5, current: 192.3 },
    { symbol: "MSFT", qty: 5, avg: 330.2, current: 334.7 },
    { symbol: "VOO", qty: 8, avg: 475.0, current: 479.1 }
  ];

  portfolio.forEach(p => {
    const varPerc = ((p.current - p.avg) / p.avg * 100).toFixed(2);
    const row = `<tr>
      <td>${p.symbol}</td>
      <td>${p.qty}</td>
      <td>$${p.avg.toFixed(2)}</td>
      <td>$${p.current.toFixed(2)}</td>
      <td style="color:${varPerc >= 0 ? '#0f0' : '#f00'};">${varPerc}%</td>
    </tr>`;
    portfolioEl.innerHTML += row;
  });

  // ✅ Grafico ROI giornaliero (demo)
  const ctx = document.getElementById("chartROI");
  const labels = Array.from({ length: 7 }, (_, i) => `Giorno ${i + 1}`);
  const values = Array.from({ length: 7 }, () => (Math.random() * 2 - 1).toFixed(2));

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "ROI Giornaliero (%)",
        data: values,
        borderColor: "#ffd700",
        backgroundColor: "rgba(255,215,0,0.2)",
        tension: 0.2,
        fill: true
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
});
