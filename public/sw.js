// Service worker mínimo para PWA instalável (Android)
const CACHE = 'cigana-v1'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})
