importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js"
);


workbox.precaching.precacheAndRoute([
  { url: "/offline.html", revision: null },
]);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, 
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "static-resources",
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.pathname === "/" || url.pathname === "/index.html",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "html-cache",
  })
);

workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return caches.match("/offline.html");
  }

  return Response.error();
});
