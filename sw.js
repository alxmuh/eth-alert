self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "ETH Alert";
  const body = data.body || "Price movement detected";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "/icon.png"
    })
  );
});
