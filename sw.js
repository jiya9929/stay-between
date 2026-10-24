/* 스테이 비트윈 안내 앱: 한 번 연 화면과 사진을 휴대폰에 저장해 두고,
   인터넷이 끊겨도 안내를 볼 수 있게 합니다. 이 파일은 고치지 않으셔도 됩니다. */
var CACHE = "stay-between-v1";
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(["./", "./index.html", "./manifest.json"]); }).catch(function () {}));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* 새 내용이 있으면 늘 새것을 먼저 쓰고, 인터넷이 없을 때만 저장해 둔 것을 씁니다 */
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match("./index.html"); });
    })
  );
});
