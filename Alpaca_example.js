// Esempi di chiamate alle API Alpaca (non operative)
const BASE_URL = "https://paper-api.alpaca.markets/v2";
async function getAccount(apiKey, apiSecret) {
  const res = await fetch(BASE_URL + "/account", {
    headers: {
      "APCA-API-KEY-ID": apiKey,
      "APCA-API-SECRET-KEY": apiSecret
    }
  });
  return await res.json();
}
async function placeOrder(apiKey, apiSecret, symbol, qty, side) {
  const body = {
    symbol, qty, side, type: "market", time_in_force: "day"
  };
  const res = await fetch(BASE_URL + "/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "APCA-API-KEY-ID": apiKey,
      "APCA-API-SECRET-KEY": apiSecret
    },
    body: JSON.stringify(body)
  });
  return await res.json();
}