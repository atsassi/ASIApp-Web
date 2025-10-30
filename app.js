// Configurazione API Alpaca (endpoint Paper Trading)
const BASE_URL = 'https://paper-api.alpaca.markets/v2';

document.addEventListener("DOMContentLoaded", async () => {
  const apiKey = localStorage.getItem("alpacaKey");
  const apiSecret = localStorage.getItem("alpacaSecret");

  if (!apiKey || !apiSecret) {
    alert("Chiavi API non trovate. Torna alla schermata di collegamento.");
    window.location.href = "login.html";
    return;
  }

  // Mostra saldo
  const balanceEl = document.getElementById("balance");
  const ordersList = document.getElementById("ordersList");
  const buyBtn = document.getElementById("buyBtn");

  async function getAccount() {
    try {
      const res = await fetch(`${BASE_URL}/account`, {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": apiSecret
        }
      });
      const data = await res.json();
      balanceEl.textContent = `$${parseFloat(data.cash).toFixed(2)}`;
    } catch (err) {
      balanceEl.textContent = "Errore connessione API.";
      console.error(err);
    }
  }

  async function getOrders() {
    try {
      const res = await fetch(`${BASE_URL}/orders?status=all&limit=5`, {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": apiSecret
        }
      });
      const data = await res.json();
      ordersList.innerHTML = "";
      if (data.length === 0) {
        ordersList.innerHTML = "<li>Nessun ordine recente.</li>";
      } else {
        data.forEach(o => {
          const li = document.createElement("li");
          li.textContent = `${o.side.toUpperCase()} ${o.qty} ${o.symbol} @ ${o.filled_avg_price || 'pendente'}`;
          ordersList.appendChild(li);
        });
      }
    } catch (err) {
      ordersList.innerHTML = "<li>Errore nel recupero ordini.</li>";
      console.error(err);
    }
  }

  async function placeOrder(symbol = "AAPL", qty = 1, side = "buy") {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": apiSecret,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          symbol,
          qty,
          side,
          type: "market",
          time_in_force: "day"
        })
      });
      const order = await res.json();
      alert(`Ordine inviato: ${order.symbol} (${order.side})`);
      getOrders();
    } catch (err) {
      alert("Errore nell'invio dell’ordine");
      console.error(err);
    }
  }

  // Eventi
  buyBtn?.addEventListener("click", () => placeOrder());
  document.getElementById("disconnect")?.addEventListener("click", () => {
    localStorage.removeItem("alpacaKey");
    localStorage.removeItem("alpacaSecret");
    window.location.href = "login.html";
  });
  document.getElementById("logout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  await getAccount();
  await getOrders();
});
