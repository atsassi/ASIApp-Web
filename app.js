// PWA install prompt
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredPrompt=e;
 const b=document.getElementById('installBtn');if(!b)return;
 b.hidden=false;b.onclick=async()=>{b.hidden=true;deferredPrompt.prompt();
 await deferredPrompt.userChoice;deferredPrompt=null;};});
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js');}

const els={
  gateCard:()=>document.getElementById('gateCard'),
  credsCard:()=>document.getElementById('credsCard'),
  dashRow:()=>document.getElementById('dashRow'),
  logCard:()=>document.getElementById('logCard'),
  loginEmail:()=>document.getElementById('loginEmail'),
  loginPass:()=>document.getElementById('loginPass'),
  usersUrl:()=>document.getElementById('usersUrl'),
  btnLogin:()=>document.getElementById('btnLogin'),
  apiKey:()=>document.getElementById('apiKey'),
  apiSecret:()=>document.getElementById('apiSecret'),
  endpoint:()=>document.getElementById('endpoint'),
  mode:()=>document.getElementById('mode'),
  saveCreds:()=>document.getElementById('saveCreds'),
  start:()=>document.getElementById('startBot'),
  stop:()=>document.getElementById('stopBot'),
  log:()=>document.getElementById('log'),
  btnBuy:()=>document.getElementById('btnBuy'),
  btnSell:()=>document.getElementById('btnSell'),
  btnQuote:()=>document.getElementById('btnQuote'),
  manSymbol:()=>document.getElementById('manSymbol'),
  manQty:()=>document.getElementById('manQty'),
  manType:()=>document.getElementById('manType'),
  etfSymbol:()=>document.getElementById('etfSymbol'),
  specSymbol:()=>document.getElementById('specSymbol'),
  tpEtf:()=>document.getElementById('tpEtf'),
  slEtf:()=>document.getElementById('slEtf'),
  rbEtf:()=>document.getElementById('rbEtf'),
  tpSpec:()=>document.getElementById('tpSpec'),
  slSpec:()=>document.getElementById('slSpec'),
  rbSpec:()=>document.getElementById('rbSpec'),
  freq:()=>document.getElementById('freq'),
  qty:()=>document.getElementById('qty'),
};

function logm(...parts){
 const t=parts.map(p=>typeof p==='string'?p:JSON.stringify(p)).join(' ');
 els.log().textContent+=`[${new Date().toLocaleTimeString()}] ${t}\n`;
 els.log().scrollTop=els.log().scrollHeight;
}

async function checkLogin(email,pass,url){
 try{
   const res=await fetch(url,{cache:'no-store'});
   const js=await res.json();
   const u=(js.users||[]).find(x=>x.email===email&&x.password===pass&&x.active===true);
   return !!u;
 }catch(e){logm('Auth errore',e.message);return false;}
}
function showAppUI(){
 els.gateCard().classList.add('hidden');
 els.credsCard().classList.remove('hidden');
 els.dashRow().classList.remove('hidden');
 els.logCard().classList.remove('hidden');
}

els.btnLogin().addEventListener('click',async()=>{
 const ok=await checkLogin(els.loginEmail().value.trim(),els.loginPass().value.trim(),'https://asiapp.ch/asi-users.json');
 if(ok){localStorage.setItem('asi_auth','ok');showAppUI();logm('Login OK');}
 else{alert('Utente non autorizzato');}
});

els.saveCreds().addEventListener('click',()=>{
 localStorage.setItem('asi_creds',JSON.stringify({
   apiKey:els.apiKey().value.trim(),
   apiSecret:els.apiSecret().value.trim(),
   endpoint:els.endpoint().value,
   mode:els.mode().value
 }));
 logm('Credenziali salvate localmente.');
});

function hasMarketOpenNow(){
 const now=new Date();
 const utc=now.getUTCHours()*60+now.getUTCMinutes();
 const start=14*60+30,end=21*60;
 return utc>=start&&utc<=end;
}
async function latestPrice(symbol){
 const p=60+Math.sin(Date.now()/60000+symbol.length)*2+Math.random();
 return Number(p.toFixed(2));
}
async function placeOrder(symbol,qty,side,type='market'){
 const c=JSON.parse(localStorage.getItem('asi_creds')||'{}');
 if((c.mode||'dry')==='dry'){logm('[DRY]',side,qty,symbol);return{id:'dry-'+Date.now()};}
 logm('[LIVE PLACEHOLDER]',side,qty,symbol);
 return{id:'live-placeholder'};
}

document.getElementById('btnBuy')?.addEventListener('click',async()=>{
 try{const r=await placeOrder(els.manSymbol().value,els.manQty().value,'buy',els.manType().value);
 logm('BUY',r.id||'OK');}catch(e){logm('BUY ERR',e.message);}
});
document.getElementById('btnSell')?.addEventListener('click',async()=>{
 try{const r=await placeOrder(els.manSymbol().value,els.manQty().value,'sell',els.manType().value);
 logm('SELL',r.id||'OK');}catch(e){logm('SELL ERR',e.message);}
});
document.getElementById('btnQuote')?.addEventListener('click',async()=>{
 try{const p=await latestPrice(els.manSymbol().value);logm('Prezzo',els.manSymbol().value,p);}
 catch(e){logm('QUOTE ERR',e.message);}
});

const memory={};
async function tick(symbol,tp,sl,rb,qty){
 if(!hasMarketOpenNow())return;
 const p=await latestPrice(symbol);if(!p){logm('Prezzo assente',symbol);return;}
 let s=memory[symbol]||{pos:'flat',entry:null,peak:null,trough:p};
 if(s.pos==='flat'){
   s.trough=Math.min(s.trough,p);
   if(p>=s.trough*(1+rb/100)){
     await placeOrder(symbol,qty,'buy');
     s={pos:'long',entry:p,peak:p,trough:p};
     logm('BUY',symbol,'@',p.toFixed(2));
   }
 }else{
   s.peak=Math.max(s.peak,p);
   const gain=(p-s.entry)/s.entry*100;
   const drop=(s.peak-p)/s.peak*100;
   if(gain>=tp&&drop>=0.1){
     await placeOrder(symbol,qty,'sell');
     logm('TP SELL',symbol,'gain',gain.toFixed(2)+'%');
     s={pos:'flat',entry:null,peak:null,trough:p};
   }else{
     const loss=(s.entry-p)/s.entry*100;
     if(loss>=sl){
       await placeOrder(symbol,qty,'sell');
       logm('SL SELL',symbol,'loss',loss.toFixed(2)+'%');
       s={pos:'flat',entry:null,peak:null,trough:p};
     }
   }
 }
 memory[symbol]=s;
}
let loopId=null;
document.getElementById('startBot')?.addEventListener('click',()=>{
 if(loopId)clearInterval(loopId);
 const etf=els.etfSymbol().value.toUpperCase();
 const sp=els.specSymbol().value.toUpperCase();
 const q=Number(els.qty().value)||1;
 const tpE=Number(els.tpEtf().value),slE=Number(els.slEtf().value),rbE=Number(els.rbEtf().value);
 const tpS=Number(els.tpSpec().value),slS=Number(els.slSpec().value),rbS=Number(els.rbSpec().value);
 const f=Math.max(15,Number(els.freq().value)||60)*1000;
 logm('BOT ON',{etf,sp,q,f});
 loopId=setInterval(()=>{tick(etf,tpE,slE,rbE,q);tick(sp,tpS,slS,rbS,q);},f);
});
document.getElementById('stopBot')?.addEventListener('click',()=>{
 if(loopId){clearInterval(loopId);loopId=null;logm('BOT OFF');}});

window.addEventListener('DOMContentLoaded',()=>{if(localStorage.getItem('asi_auth')==='ok')showAppUI();});
