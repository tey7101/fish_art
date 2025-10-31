// Service Worker for FishArt.Online
// Caches the ONNX model file for offline use and faster loading

const CACHE_NAME = 'fishart-model-cache-v1';
const MODEL_URL = '/fish_doodle_classifier.onnx';

// Install event - cache the model file
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching model file');
            return cache.add(MODEL_URL).catch((error) => {
                console.warn('[Service Worker] Model caching failed (will retry on fetch):', error);
            });
        })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all clients immediately
    return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    // Only intercept requests for the ONNX model
    if (event.request.url.includes('.onnx')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[Service Worker] Serving model from cache');
                    return cachedResponse;
                }
                
                console.log('[Service Worker] Fetching model from network');
                return fetch(event.request).then((response) => {
                    // Don't cache if the response is not ok
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        console.log('[Service Worker] Caching model for future use');
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                }).catch((error) => {
                    console.error('[Service Worker] Fetch failed:', error);
                    throw error;
                });
            })
        );
    }
    // Let other requests pass through
});

// Message event - allow clearing cache from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                console.log('[Service Worker] Cache cleared');
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

