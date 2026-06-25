// Service Worker Rawat Bhumi — Web Push (pendekatan native Next.js)
self.addEventListener("push", function (event) {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192.png",
    badge: "/badge.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.refId || "1",
      url: data.url || "/beranda",
    },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/beranda";
  event.waitUntil(clients.openWindow(url));
});
