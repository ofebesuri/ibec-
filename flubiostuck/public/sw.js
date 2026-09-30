// FluBioStack Service Worker
const CACHE_NAME = 'flubiostack-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/glossary',
  '/tutorials',
  '/sdg',
  '/environment',
  '/safety-review',
  '/analysis',
  '/database'
];

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(err => console.log('[SW] Install cache failed:', err))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  
  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // For navigation requests, try network first then cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/')))
    );
    return;
  }

  // For static assets: cache first, fall back to network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
