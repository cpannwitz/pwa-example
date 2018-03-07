importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.0.0-beta.2/workbox-sw.js");

workbox.skipWaiting();
workbox.clientsClaim();

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([
  {
    "url": "assets/css/material.min.css",
    "revision": "47d2209b491e91f5af769e3effb69222"
  },
  {
    "url": "assets/icons/icon144x144.png",
    "revision": "c8ae3fe19408abbcc1c8ba6e0ee82188"
  },
  {
    "url": "assets/icons/icon192x192.png",
    "revision": "1b49b80e2959151213ae21abee47c309"
  },
  {
    "url": "assets/icons/icon512x512.png",
    "revision": "831d976e8d0b020d3c8cca3338120c64"
  },
  {
    "url": "assets/js/app.js",
    "revision": "0d837bbd74377da36c1ae8d6ddce4ddd"
  },
  {
    "url": "assets/js/home.js",
    "revision": "3b26336c72d577044c3a3f97386d5a89"
  },
  {
    "url": "assets/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "index.html",
    "revision": "7ceb390bc63e6d726033ad21ad98c27d"
  },
  {
    "url": "manifest.json",
    "revision": "64fed54b947e4758b23e31b9119d262b"
  },
  {
    "url": "welcome.html",
    "revision": "3f91a67bd74e0e91cbffc9569f69b17a"
  }
]);

self.addEventListener('fetch', (event) => {
  // try to return new data, cache as fallback
  if (event.request.headers.get('accept').includes('application/json')) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request)
        const cache = await caches.open('dynamic_files')

        cache.put(event.request.url, response.clone())
        console.log('Return from fetch %s', event.request.url)

        return response

      } catch (error) {
        const cached = await caches.match(event.request)

        if (cached) {
          console.log('Return from cache %s', event.request.url)
          return cached
        }

        throw error
      }
    })())

    return
  }

  if (event.request.method === 'GET') {
    // fetch dynamic files the first time and return the second time from the cache
    event.respondWith((async () => {
      const response = await caches.match(event.request)

      if (response) return response;

      console.log('Dynamic Caching: %s', event.request.url)
      const result = await fetch(event.request)
      const cache = await caches.open('dynamic_files')

      cache.put(event.request.url, result.clone())

      return result
    })())
  }
})

// BackgroundSynchronisation
self.addEventListener('sync', event => {
  if(event.tag === 'sync-post') {
    event.waitUntil((async () => {
      try {
        setTimeout(async () => {
          const response = await fetch(
            'https://jsonplaceholder.typicode.com/posts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ title: 'How to Sync', body: 'Sync with ServiceWorker' })
            })

          const body = await response.json()
          const clients = await event.currentTarget.clients.matchAll()

          clients.forEach(client => client.postMessage(body))
          console.log('Sync %s', body.title)
        }, 1000)
      } catch (error) {
        console.log(error)
      }
    })())
  }
})

self.addEventListener('notificationclick', event => {
  const notification = event.notification;

  event.waitUntil((async () => {
    const list = await event.currentTarget.clients.matchAll()

    const client = list.find(entry => entry.visibilityState === 'visible')

    if (client !== undefined) {
      client.navigate('https://pwa.webdev-jogeleit.de/welcome.html')
      client.focus()
    } else {
      clients.openWindow('https://pwa.webdev-jogeleit.de/welcome.html')
    }

    notification.close();
  })())
});
