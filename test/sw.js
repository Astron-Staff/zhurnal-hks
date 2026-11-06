const CACHE = 'zhurnal-hks-test-94c8dc1b96';
const FILES = ["./", "config.json", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/logo-96.jpg", "index.html", "lib/jspdf.umd.min.js", "lib/pdf.min.js", "lib/pdf.worker.min.js", "manifest.webmanifest"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith('zhurnal-hks-test-')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const put = (req, res) => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/(version|seed|config)[.]json$|data[.]enc$/.test(url.pathname)) return;
  if (req.mode === 'navigate') {
    // сначала сеть (свежая версия), без сети — из кэша
    e.respondWith(Promise.race([fetch(req, { cache: 'no-cache' }).then(r => put(req, r)), new Promise((_, rej) => setTimeout(rej, 4000))])
      .catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => put(req, r))));
});
