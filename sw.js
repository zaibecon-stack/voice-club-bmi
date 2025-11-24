const CACHE_NAME = 'bmi-calculator-v1';
const urlsToCache = [
    // These are the files that will be saved locally on the user's device
    '/', // The root directory
    '/index.html',
    '/manifest.json'
];

// 1. Install Event: Cache all essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                // We use 'addAll' but wrap it in a try/catch in case some network requests fail.
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('Failed to cache resources:', err);
                });
            })
    );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch Event: Intercept network requests and serve from cache first
self.addEventListener('fetch', (event) => {
    // Only intercept requests for resources we might have cached
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if found
                if (response) {
                    return response;
                }
                // Otherwise, fetch from the network
                return fetch(event.request);
            })
    );
});