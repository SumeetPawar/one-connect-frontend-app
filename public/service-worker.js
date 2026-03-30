/**
 * service-worker.js
 * Place this file in your Next.js /public folder as: /public/service-worker.js
 *
 * Handles:
 *   - push events → shows notification
 *   - notificationclick → opens the app at the right URL
 */

const APP_URL = self.location.origin;
const BASE = "/socialapp"; // must match Next.js basePath

// ── Push received from server ─────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let data = { title: "New notification", body: "", url: "/" };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: BASE + "/web-app-manifest-192x192.png",
    // badge: BASE + "/favicon-192.png",
    data: { url: data.url || "/socialapp/" },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: "ges-push-" + (data.url || "default"),  // prevents silent drop from too many notifications
    renotify: true,                               // buzz even if same tag
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification clicked ──────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);
  event.notification.close();

  const targetUrl = APP_URL + (event.notification.data?.url || "/");

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.startsWith(APP_URL) && "focus" in client) {
            return client.focus().then(() => client.navigate(targetUrl));
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ── Activate immediately (don't wait for old SW to die) ──────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
