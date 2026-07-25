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
  './sounds/heb-din-schlitte.m4a',
  // Jingle-Paket 2 (bereits geliefert)
  './sounds/ach-leck-mich-doch.m4a', './sounds/du-dummer-dreckswichser.m4a', './sounds/du-arschloch.m4a',
  './sounds/bist-du-komplett-durchgedreht.m4a', './sounds/du-opfer.m4a', './sounds/endlich-freitag.m4a',
  './sounds/fuck.m4a', './sounds/furz.m4a', './sounds/du-bloede-sau.m4a', './sounds/handlungsbedarf.m4a',
  './sounds/kein-widerspruch.m4a', './sounds/ja-scheisse.m4a', './sounds/arschloch.m4a', './sounds/fickschnitzel.m4a',
  './sounds/mahlzeit.m4a', './sounds/laeuft.m4a', './sounds/change-request.m4a', './sounds/applaus.m4a',
  './sounds/kaffee.m4a', './sounds/leck-mich-am-arsch.m4a',
  // Noch ausstehende Dateien: schlagen beim Precache einfach fehl (wird übersprungen)
  // und werden automatisch gecacht, sobald sie im Repo liegen und einmal gespielt wurden.
  './sounds/restricted-area.m4a', './sounds/was-kannst-du-eigentlich.m4a', './sounds/oh-mann.m4a',
  './sounds/zonk.m4a', './sounds/was-stimmt-bi-dier-noed.m4a', './sounds/morgen.m4a', './sounds/pfff.m4a',
  './sounds/nein-nein-nein.m4a', './sounds/negativ.m4a', './sounds/schoen-aber-nein.m4a', './sounds/och-nee.m4a',
  './sounds/mhhh-noe.m4a', './sounds/scheissegal.m4a', './sounds/zuviel-geld.m4a',
  './sounds/nicht-meine-kostenstelle.m4a', './sounds/kuemmer-mich-drum.m4a',
  './sounds/no-1.m4a', './sounds/no-2.m4a', './sounds/no-3.m4a', './sounds/no-4.m4a', './sounds/no-5.m4a',
  './sounds/no-6.m4a', './sounds/no-7.m4a', './sounds/no-8.m4a', './sounds/no-9.m4a', './sounds/no-10.m4a',
  './sounds/yes-1.m4a', './sounds/yes-2.m4a', './sounds/yes-3.m4a', './sounds/yes-4.m4a', './sounds/yes-5.m4a',
  './sounds/yes-6.m4a', './sounds/yes-7.m4a', './sounds/yes-8.m4a', './sounds/yes-9.m4a', './sounds/yes-10.m4a'
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
