/**
 * iLoveVAULT - Service Worker
 * Version: 8.0.0 (Billionaire Architecture)
 * Strategy: Network-First (Eliminates the Caching Trap forever)
 */

// Change this version name whenever you make a big update to force all users to get the new code
const CACHE_NAME = 'ilovevault-v8-billionaire';

// Core assets required for the app to function instantly and offline
const PRE_CACHE_ASSETS = [
    '/',
    '/index.html',
    '/script.js',
    '/vault-worker.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[iLoveVAULT] Pre-caching core assets...');
            return cache.addAll(PRE_CACHE_ASSETS);
        }).then(() => self.skipWaiting()) // Forces the new worker to install immediately
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    // Annihilate any cache that isn't the current V8 architecture
                    if (name !== CACHE_NAME) {
                        console.log('[iLoveVAULT] Purging old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Takes control of the clients immediately
    );
});

self.addEventListener('fetch', (event) => {
    // We only want to cache standard GET requests (like loading HTML/JS)
    if (event.request.method !== 'GET') return;

    // STRATEGY: Network-First, Fallback to Cache
    // 1. Try to get the absolute newest file from the internet.
    // 2. If successful, save a copy to the cache and show it to the user.
    // 3. If the internet fails (offline), load the saved copy from the cache.
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                console.log('[iLoveVAULT] Network unavailable, serving secured fallback from cache.');
                return caches.match(event.request);
            })
    );
});