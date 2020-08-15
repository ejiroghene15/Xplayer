const cacheName = "cache-v1";
const resourceToPrecache = [
	"/",
	"index.html",
	"./assets/css/bootstrap.min.css",
	"./assets/imgs/",
	"./assets/css/animate.min.css",
	"./assets/css/xplayer.css",
	"/assets//css/fa/css/font-awesome.min.css",
];

self.addEventListener("install", (event) => {
	console.log("SW Install event!");
	event.waitUntil(
		caches.open(cacheName).then((cache) => {
			return cache.addAll(resourceToPrecache);
		})
	);
});

self.addEventListener("activate", (event) => {
	console.log("Activate event!");
});

self.addEventListener("fetch", (event) => {
	console.log("Fetch intercepted for:", event.request.url);
});
