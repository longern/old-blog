importScripts('https://cdn.jsdelivr.net/npm/workbox-sw@4.3.1/build/workbox-sw.min.js')

if (workbox) {
  console.log(`Workbox is loaded`)
} else {
  console.log(`Workbox didn't load`)
}

workbox.routing.registerRoute(
  /\.(html|js|css)/,
  new workbox.strategies.StaleWhileRevalidate()
)
