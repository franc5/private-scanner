const CACHE_NAME = 'private-scanner-v1';
const URLS_TO_CACHE = [
  '/',
  '/main.css',
  '/main.js',
  '/load-opencv.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => (response) ? response : fetch(event.request))
  );
});
