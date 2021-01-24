// Temporary workaround to allow caching using GitHub Pages subdomain
const ORIGIN = '/private-scanner/';

const CACHE_NAME = 'private-scanner-v1';
const URLS_TO_CACHE = [
  `${ORIGIN}`,
  `${ORIGIN}main.css`,
  `${ORIGIN}main.js`,
  `${ORIGIN}load-opencv.js`,
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
