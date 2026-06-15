// Service Worker מינימלי — מאפשר התקנת האפליקציה (PWA)
// אסטרטגיית רשת-בלבד: תמיד מביא את הגרסה העדכנית, ללא קאש מיושן.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request)));
