/**
 * VAULT CACHE ENGINE - Service Worker v2.1
 * Strategy: Cache-First for Heavy Assets / Stale-While-Revalidate for UI
 */

const CACHE_NAME = 'vault-protocol-v4-dark-apex';

// Assets that must be cached immediately for instant boot
const PRE_CACHE_ASSETS = [
    './',
    './index.html',
    './script.js',
    './vault-worker.js',
    'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRE_CACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Clear old versions of VAULT to free up user disk space
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) return caches.delete(name);
                })
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = event.request.url;

    // STRATEGY: Cache-First for the Heavy Python Runtime (CDN)
    // Once your friend downloads the 10MB Pyodide engine once, 
    // he will NEVER have to wait for it again.
    if (url.includes('cdn.jsdelivr.net') || url.includes('pyodide')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } 
    // STRATEGY: Stale-While-Revalidate for UI files
    // Shows the app instantly, but updates it in the background if you push a fix.
    else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
                return cachedResponse || fetchPromise;
            })
        );
    }
});