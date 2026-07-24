// WakeLog Service Worker — macht die App offline startfähig.
// Strategie: Netz zuerst (damit Updates sofort ankommen), bei Ausfall
// die zuletzt gecachte Version. Firebase-Anfragen werden nie gecacht.
const CACHE = 'wakelog-shell-v1';

// Diese Dateien werden schon bei der Installation in den Offline-Cache gelegt,
// damit alle Jingles auch dann sofort verfügbar sind, wenn sie noch nie
// abgespielt wurden. Fehlt eine Datei im Repo, wird sie einfach übersprungen —
// die Installation schlägt deswegen nicht fehl.
const PRECACHE_FILES = [
  './index.html',
  './boat-horn.mp3',
  './sound-can-open.mp3',
  './drink-sip-and-swallow.mp3',
  './sound-burp-1.mp3', './sound-burp-2.mp3', './sound-burp-3.mp3',
  './sound-burp-4.mp3', './sound-burp-5.mp3', './sound-burp-6.mp3',
  './sound-burp-7.mp3', './sound-burp-8.mp3', './sound-burp-9.mp3',
  './sound-burp-10.mp3',
  './sounds/dreamer.m4a',
  './sounds/guets-moergeli.m4a',
  './sounds/hallo-vater.m4a',
  './sounds/hallo-muetter.m4a',
  './sounds/gib-mir-geld.m4a',
  './sounds/brueder-ich-ha-termin.m4a',
  './sounds/erfinder.m4a',
  './sounds/richi.m4a',
  './sounds/sautubel.m4a',
  './sounds/heb-din-schlitte.m4a'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(PRECACHE_FILES.map(f => cache.add(f).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
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
