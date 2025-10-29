ASIApp Web – PWA  
Versione: Ottobre 2025  
---------------------------------

🔹 Descrizione:
ASIApp Web è una Progressive Web App collegata ad Alpaca API per la gestione automatizzata di strategie di investimento.  
Funziona sia in ambiente di test (Paper Trading) sia in produzione, tramite chiavi API configurabili da Render.

🔹 Deploy
1. Apri https://dashboard.render.com → New → Static Site  
2. Connetti il repository GitHub “ASIApp-Web”  
3. Imposta:
   - Build Command: (lascia vuoto)
   - Publish Directory: `.`
4. Dopo il deploy, l’app sarà disponibile su  
   👉 https://asiapp-web.onrender.com  

🔹 Dominio personalizzato (GoDaddy):
   - Type: CNAME  
   - Name: www  
   - Value: asiapp-web.onrender.com  
   - TTL: 600  

🔹 Attivazione API reali:
   1. Apri `App.js`  
   2. Inserisci le chiavi API Alpaca reali o Paper:
      - Endpoint: `https://paper-api.alpaca.markets/v2`
      - Key e Secret: da impostare come variabili su Render  
   3. Le funzioni di esempio sono integrate in `Alpaca_example.js`

🔹 Note:
   - File principale: `index.html`
   - Service Worker: `service-worker.js`
   - Manifest e icone aggiornati
