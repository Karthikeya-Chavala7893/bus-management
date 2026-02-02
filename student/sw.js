// Service Worker for Student Portal - Offline Support
const CACHE_NAME = 'bustrack-student-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

// Install - Cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API calls (handle differently if needed)
    if (event.request.url.includes('/api/')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // Static assets - cache first
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) {
                    // Return cached, but update in background
                    fetchAndCache(event.request);
                    return cached;
                }
                return fetchAndCache(event.request);
            })
            .catch(() => {
                // Offline fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});

// Network first strategy (for API calls)
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw error;
    }
}

// Fetch and cache
async function fetchAndCache(request) {
    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
    }
    return response;
}

// Background sync for pending changes
self.addEventListener('sync', event => {
    if (event.tag === 'sync-changes') {
        event.waitUntil(syncPendingChanges());
    }
});

async function syncPendingChanges() {
    // Get pending changes from IndexedDB
    // Send to server
    // Clear pending on success
    console.log('Background sync triggered');
}

// Push notifications
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'Bus update available',
        icon: './bus-icon.svg',
        badge: './badge.svg',
        vibrate: [200, 100, 200],
        tag: data.tag || 'bus-update',
        data: { url: data.url || './' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Bus Tracker', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                // Focus existing window or open new
                for (const client of clientList) {
                    if (client.url.includes('/student') && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(event.notification.data.url);
            })
    );
});
