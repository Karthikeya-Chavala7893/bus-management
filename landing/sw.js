// Service Worker for Offline Support
// Caches all assets for offline access

const CACHE_NAME = 'bus-tracker-landing-v2';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js'
];

// Install - cache all assets
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(ASSETS);
            })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (name) {
                    return name !== CACHE_NAME;
                }).map(function (name) {
                    return caches.delete(name);
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                return fetch(e.request)
                    .then(function (response) {
                        // Cache new requests
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(function (cache) {
                                    cache.put(e.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(function () {
                        // Return cached index for navigation
                        if (e.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});
