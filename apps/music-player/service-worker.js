importScripts('https://g.alicdn.com/kg/workbox/3.3.0/workbox-sw.js')

if (workbox) {
  console.log(`Workbox is loaded`)
} else {
  console.log(`Workbox didn't load`)
}

workbox.routing.registerRoute(
  /\.(html|js|css)/,
  new workbox.strategies.StaleWhileRevalidate()
)
