/* Esse · Service Worker — çevrimdışı destek ve hızlı açılış */
const CACHE = "esse-v1";
const ASSETS = [
  "/index.html", "/shop.html", "/product.html", "/about.html", "/contact.html",
  "/assets/css/style.css", "/assets/js/app.js", "/assets/js/products.js",
  "/manifest.webmanifest",
  "/assets/img/favicon.svg",
  "/assets/icons/apple-touch-icon.png", "/assets/icons/icon-192.png", "/assets/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // sadece kendi varlıklarımız

  // HTML için: önce ağ, olmazsa önbellek (taze içerik önceliği)
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  // Diğer varlıklar (görsel/CSS/JS): önce önbellek, arkada güncelle
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
