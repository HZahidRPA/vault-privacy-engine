const CACHE_NAME = 'vault-secure-core-v1';

// We install the worker and immediately take control
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// The "Network-First, Cache-Fallback" Strategy
self.addEventListener('fetch', (event) => {
    // Only intercept GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // If we have the massive Python files saved, return them instantly!
                return cachedResponse;
            }

            // Otherwise, fetch from the internet and save it for next time
            return fetch(event.request).then((networkResponse) => {
                // Only cache successful requests from our site or the Pyodide CDN
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' || event.request.url.includes('cdn.jsdelivr.net')) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Ignore errors (prevents crashing if offline)
            });
        })
    );
});