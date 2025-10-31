<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Motore di investimento - ASI</title>
  <link rel="stylesheet" href="styles.css">
</head>

<body class="screen">
  <header class="navbar">
    <nav>
      <a href="dashboard.html">🏠 Dashboard</a>
      <a href="andamento.html">📈 Andamento</a>
      <a href="portafoglio.html">💼 Portafoglio</a>
      <a href="engine.html" class="active">🏁 Motore</a>
      <a href="impostazioni.html">⚙️ Impostazioni</a>
      <a href="index.html">🚪 Esci</a>
    </nav>
  </header>

  <main class="container">
    <h2>Motore di investimento ASI</h2>
    <p id="engine-status">🔴 Stato: Pausa</p>
    <p id="engine-type">Modalità: Buffett-style (70%) + Speculativa (30%)</p>
    <p id="engine-update">Ultimo aggiornamento AI: --</p>

    <div class="btn-group">
      <button id="startEngine" class="btn btn--gold">▶️ Attiva motore</button>
      <button id="pauseEngine" class="btn btn--gray">⏸️ Metti in pausa</button>
      <button id="recalcAI" class="btn btn--blue">🔄 Ricalcola soglie AI</button>
    </div>

    <section class="parameters">
      <h3>Parametri attivi</h3>
      <ul>
        <li>ETF Threshold: <span id="etf-threshold">+3.3%</span></li>
        <li>Stocks Threshold: <span id="stock-threshold">+2.0%</span></li>
        <li>Take Profit: -0.3% / Stop-loss dinamico: ON</li>
        <li>Ultima verifica automatica: <span id="last-check">--</span></li>
      </ul>
    </section>
  </main>

  <script src="engine.js"></script>
</body>
</html>
