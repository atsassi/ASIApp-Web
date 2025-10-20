const CACHE = 'asiapp-v1';
const ASSETS = ['/', '/index.html','/login.html','/dashboard.html','/invest.html','/style.css','/script.js','/images/logo-toro.png','/images/wallstreet.jpg','/images/favicon.ico','/manifest.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));