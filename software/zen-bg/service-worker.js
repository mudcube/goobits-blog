import {manifest, version} from '@parcel/service-worker'

self.addEventListener('install', event => event.waitUntil(async function install() {
	const cache = await caches.open(version)
	await cache.addAll(manifest)
}()))

self.addEventListener('activate', event => event.waitUntil(async function activate() {
	const keys = await caches.keys()
	await Promise.all(
		keys.map(key => key !== version && caches.delete(key))
	)
}()))

self.addEventListener('fetch', event => {
	if (event.request.url.startsWith(self.location.origin)) {
		event.respondWith(
			caches.match(event.request).then(cachedResponse => {
				if (cachedResponse) {
					return cachedResponse
				}

				return caches.open('runtime').then(cache => {
					return fetch(event.request).then(response => {
						return cache.put(event.request, response.clone()).then(() => {
							return response
						})
					})
				})
			})
		)
	}
})