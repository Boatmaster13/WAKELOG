// WakeLog Service Worker — macht die App offline startfähig.
// Strategie: Netz zuerst (damit Updates sofort ankommen), bei Ausfall
// die zuletzt gecachte Version. Firebase-Anfragen werden nie gecacht.
const CACHE = 'wakelog-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return; // Firebase, CDN & Co. nie anfassen
  event.respondWith(
    fetch(req).then(res => {
      if(res && res.ok){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(req).then(r => r || caches.match('./index.html'))
    )
  );
});
