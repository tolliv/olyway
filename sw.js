importScripts('version.js');
const CACHE_NAME = 'Olyway'+VERSION;
const ASSETS = [
  'apple-touch-icon.png',
  'download.js',
  'EcranCreer.js',
  'EcranEnregistrer.js',
  'EcranInfos.js',
  'EcranParcours.js',
  'EcranPrincipal.js',
  'EcranSuivre.js',
  'EcranTraces.js',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'geolocalisation.js',
  'home.css',
  'home.js',
  'icon-192.png',
  'icon-512.png',
  'index.html',
  'manifest.json',
  'version.js'
];

// Installation : Mise en cache des fichiers si changement du sw.js
self.addEventListener('install', (event) =>
{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Installation nouvelle version :', CACHE_NAME);
        return cache.addAll(ASSETS);
      })
  );
  self.skipWaiting();
});


// Stratégie : Répondre avec le cache si hors-ligne
self.addEventListener('fetch', (e) =>
{
  //console.log("Utilisation fichier local : ", e.request.url);
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});


// Activation nouveau Service Worker : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Si le nom du cache n'est pas celui de la version actuelle, on le supprime
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log('Activation du nouveau SW');
  return self.clients.claim();
});
