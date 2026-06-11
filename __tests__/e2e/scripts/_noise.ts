export function shouldIgnoreKnownConsoleError(text: string) {
	const knownNoise = [
		'Failed to load resource: the server responded with a status of 404',
		'favicon.ico',
		'Failed to fetch dynamically imported module: http://localhost:3610/.svelte-kit/generated/client/nodes/',
		'Failed to load resource: the server responded with a status of 403 (Forbidden)'
	]
	return knownNoise.some((entry) => text.includes(entry))
}

export function shouldIgnoreTurnstileNoise(url: string, detail: string) {
	if (!url.includes('/contact')) return false
	return (
		detail.includes('[Cloudflare Turnstile] Error: 110200') ||
		detail.includes('Failed to load resource: the server responded with a status of 400') ||
		detail.includes('challenges.cloudflare.com') && detail.includes('was preloaded using link preload but not used')
	)
}
