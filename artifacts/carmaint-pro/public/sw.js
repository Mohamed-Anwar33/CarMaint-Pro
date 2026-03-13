// CarMaint Pro Service Worker — Push Notifications + Offline Cache
const CACHE_NAME = "carmaint-v1";
const APP_URL = self.location.origin;

// ────────────────────────────────────────────────────────────
// Install — pre-cache shell
// ────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/manifest.json"])
    )
  );
});

// ────────────────────────────────────────────────────────────
// Activate — clean old caches
// ────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ────────────────────────────────────────────────────────────
// Push — receive and show notification
// ────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "صيانة سيارتي", body: "لديك تنبيه جديد", tag: "general", url: "/" };
  try { data = { ...data, ...event.data.json() }; } catch (_) {}

  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "carmaint",
    dir: "rtl",
    lang: "ar",
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    data: { url: data.url || "/" },
    actions: data.actions || [
      { action: "open", title: "فتح التطبيق" },
      { action: "dismiss", title: "رفض" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ────────────────────────────────────────────────────────────
// Notification click — open/focus the app
// ────────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  if (event.action === "dismiss") return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(APP_URL) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open new tab
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

// ────────────────────────────────────────────────────────────
// Background Sync — retry failed notification registrations
// ────────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notifications") {
    event.waitUntil(
      self.clients.matchAll().then((clients) =>
        clients.forEach((c) => c.postMessage({ type: "SYNC_PUSH_SUBSCRIPTION" }))
      )
    );
  }
});
