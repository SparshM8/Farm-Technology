const CACHE_NAME = 'farm-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/farm.html',
  '/farm.css',
  '/farm.js',
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Some assets failed to cache during install', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Ignore extension or unsupported schemes (e.g., chrome-extension://)
  try {
    const url = new URL(event.request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  } catch (e) {
    return; // malformed URL - don't handle
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Optionally cache the new resource
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(err => {
          // Some requests (chrome-extension) or opaque responses may fail to cache — ignore
          console.warn('Cache put failed for', event.request.url, err && err.message);
        });
        return response;
      }).catch(() => {
        // Fallback: try root HTML from cache
        return caches.match('/farm.html');
      });
    })
  );
});
