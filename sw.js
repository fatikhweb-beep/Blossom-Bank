const CACHE_NAME = 'blossom-bank-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match('./index.html'))));
});
self.addEventListener('push', event => {
  let data = {title: 'Blossom Bank', body: 'یه سر به برنامه‌ات بزن 🌸'};
  try { if (event.data) data = {...data, ...event.data.json()}; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: './icons/icon-192.png', badge: './icons/icon-192.png',
    tag: data.tag || 'blossom-bank-reminder', data: {url: data.url || './index.html'}
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './index.html', self.location.origin).href;
  event.waitUntil(clients.matchAll({type: 'window', includeUncontrolled: true}).then(list => {
    for (const client of list) if (client.url.startsWith(self.location.origin) && 'focus' in client) return client.focus();
    return clients.openWindow(target);
  }));
});
