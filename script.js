/* ========================
   UTIL & SICUREZZA (client)
   ======================== */
// Nota: protezione password client-side = livello base (utile per chiave di volta).
// Per produzione: aggiungere backend per reset sicuro e audit.

function now() { return new Date().getTime(); }
function minutes(ms) { return ms * 60 * 1000; }

function initAsiLogin(cfg) {
  const form = document.getElementById('asiLogin');
  const pass = document.getElementById('asiPass');
  const lockMsg = document.getElementById('lockMsg');
  const forgot = document.getElementById('forgotLink');

  const key = 'asi.lock';
  const state = JSON.parse(localStorage.getItem(key) || '{"attempts":0,"until":0}');
  const refreshLockUI = () => {
    const remain = state.until - now();
    if (remain > 0) {
      lockMsg.style.display = 'block';
      lockMsg.textContent = `Troppe prove. Riprova tra ${Math.ceil(remain/60000)} min.`;
      form.querySelector('button').disabled = true;
    } else {
      lockMsg.style.display = 'none';
      form.querySelector('button').disabled = false;
    }
  };
  refreshLockUI();

  forgot.addEventListener('click', (e) => {
    e.preventDefault();
    cfg.onForgot?.();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.until > now()) return refreshLockUI();
    if (pass.value === cfg.password) {
      localStorage.setItem('asi.auth', JSON.stringify({ ok: true, t: now() }));
      localStorage.setItem(key, JSON.stringify({ attempts:0, until:0 }));
      cfg.onSuccess?.();
    } else {
      state.attempts++;
      if (state.attempts >= cfg.maxAttempts) {
        state.until = now() + minutes(cfg.lockMinutes);
        state.attempts = 0;
      }
      localStorage.setItem(key, JSON.stringify(state));
      refreshLockUI();
      alert('Password errata');
    }
  });
}

function guardAsi() {
  const s = JSON.parse(localStorage.getItem('asi.auth') || 'null');
  if (!s || !s.ok) location.href = 'index.html';
}
function logoutAsi() { localStorage.removeItem('asi.auth'); location.href = 'index.html'; }

/* ========================
   ALPACA STORAGE & LOGIN
   ======================== */
const ALP = {
  key: null,
  secret: null,
  endpoint: null
};

function initAlpacaLogin({ endpoint, onSuccess }) {
  // ripristino se salvate
  const saved = JSON.parse(localStorage.getItem('alpaca.auth') || 'null');
  if (saved) {
    document.getElementById('alpacaKey').value = saved.k;
    document.getElementById('alpacaSecret').value = saved.s;
    document.getElementById('remember').checked = true;
  }
  const form = document.getElementById('alpacaForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ALP.endpoint = endpoint;
    ALP.key = document.getElementById('alpacaKey').value.trim();
    ALP.secret = document.getElementById('alpacaSecret').value.trim();
    if (!ALP.key || !ALP.secret) return alert('Inserisci API Key e Secret');

    // test rapido: GET account
    try {
      const acc = await alpaca('/v2/account');
      if (acc && acc.status) {
        if (document.getElementById('remember').checked) {
          localStorage.setItem('alpaca.auth', JSON.stringify({ k: ALP.key, s: ALP.secret, e: endpoint }));
        } else {
          localStorage.removeItem('alpaca.auth');
        }
        onSuccess?.();
      } else {
        alert('Connessione Alpaca non valida');
      }
    } catch (err) {
      console.error(err);
      alert('Errore collegamento Alpaca');
    }
  });
}

function guardAlpaca() {
  if (!ALP.key) {
    const saved = JSON.parse(localStorage.getItem('alpaca.auth') || 'null');
    if (saved) {
      ALP.key = saved.k; ALP.secret = saved.s; ALP.endpoint = saved.e || 'https://api.alpaca.markets';
    }
  }
  if (!ALP.key) location.href = 'login.html';
}

async function alpaca(path, opts = {}) {
  const url = (ALP.endpoint || 'https://api.alpaca.markets') + path;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'APCA-API-KEY-ID': ALP.key,
      'APCA-API-SECRET-KEY': ALP.secret,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
function clearAlpaca(){ localStorage.removeItem('alpaca.auth'); location.href='login.html'; }

/* ========================
   DASHBOARD
   ======================== */
async function loadDashboard() {
  try {
    const acc = await alpaca('/v2/account');
    document.getElementById('accountValue').textContent =
      new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' })
        .format(acc.equity);

    const orders = await alpaca('/v2/orders?status=all&limit=10');
    const el = document.getElementById('orders');
    if (!orders.length) { el.innerHTML = '<p class="muted">Nessun ordine recente.</p>'; return; }
    el.innerHTML = `
      <div class="row header">
        <div>Data</div><div>Side</div><div>Symbol</div><div>Q.tà</div><div>Prezzo</div><div>Stato</div>
      </div>
      ${orders.map(o => `
        <div class="row">
          <div>${new Date(o.submitted_at).toLocaleString()}</div>
          <div>${o.side}</div>
          <div>${o.symbol}</div>
          <div>${o.qty}</div>
          <div>${o.filled_avg_price || '-'}</div>
          <div>${o.status}</div>
        </div>`).join('')}
    `;
  } catch (e) {
    console.error(e);
    alert('Errore dashboard');
  }
}

/* ========================
   INVEST (demo + live)
   ======================== */
function includeCostToTP(tpPct, feePct) {
  // aumenta il take-profit per coprire commissioni andata+ritorno
  return tpPct + feePct;
}

function bestTPForAsset(type){
  // euristica coerente con quanto discusso:
  // ETF (conservativo): ~3.3% ; singoli titoli: ~2.0–2.5%
  return (type === 'etf') ? 3.3 : 2.1;
}

function initInvest(){
  const btn = document.getElementById('activateBtn');
  const msg = document.getElementById('investMsg');

  btn.addEventListener('click', async () => {
    const capital = Number(document.getElementById('capital').value || 0);
    const mode = document.getElementById('mode').value;
    if (capital <= 0) return alert('Capitale non valido');

    try{
      // Portafoglio 70/30
      const conservative = capital * 0.70;
      const speculative  = capital * 0.30;

      // target TP con commissioni (0.1% stimato complessivo)
      const feePct = 0.10;
      const tpCon = includeCostToTP(bestTPForAsset('etf'), feePct);
      const tpSpe = includeCostToTP(bestTPForAsset('stock'), feePct);

      if (mode === 'backtest') {
        msg.textContent = `Backtest avviato (demo): 70% ETF TP≈${tpCon.toFixed(2)}%, 30% Stocks TP≈${tpSpe.toFixed(2)}%.`;
        return;
      }

      // LIVE – esempio semplice: compra VOO (ETF S&P) e KO (Coca-Cola)
      const legs = [
        { symbol:'VOO', usd: conservative },
        { symbol:'KO',  usd: speculative  }
      ];

      for (const leg of legs){
        // ottieni ultimo prezzo per calcolare la quantità
        const last = await alpaca(`/v2/stocks/${leg.symbol}/trades/latest`);
        const px = last.trade.p;
        const qty = Math.max(1, Math.floor(leg.usd / px));
        await alpaca('/v2/orders', {
          method:'POST',
          body: JSON.stringify({
            symbol: leg.symbol,
            qty,
            side: 'buy',
            type: 'market',
            time_in_force: 'day'
          })
        });
      }

      msg.textContent = 'Ordini di acquisto inviati. La strategia automatica (TP/SL) sarà aggiunta lato server in seguito.';
      setTimeout(()=>location.href='dashboard.html', 1500);
    }catch(e){
      console.error(e);
      alert('Errore investimento LIVE');
    }
  });
}