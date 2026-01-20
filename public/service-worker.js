self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push notification received:', event);
  let data = {};
  if (event.data) {
    data = event.data.json();
    console.log('[Service Worker] Push data:', data);
  }
  const title = data.title || 'Hony Fitness Notification';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.url || '/',
  };
  console.log('[Service Worker] Showing notification:', title, options);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked:', event.notification);
  const urlToOpen = event.notification.data || '/';
  console.log('[Service Worker] Opening URL:', urlToOpen);
  event.notification.close();
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
