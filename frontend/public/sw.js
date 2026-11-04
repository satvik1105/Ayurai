self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "AyurAI Wellness Reminder";

  const options = {
    body: payload.body || "It's time for your wellness reminder.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: payload.tag || "ayurai-wellness-reminder",
    data: { url: payload.url || "/" },
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      })
  );
});