import { dev } from '$app/environment'

function setIfMissing(headers: Headers, key: string, value: string) {
	if (!headers.has(key)) headers.set(key, value)
}

export function applySecurityHeaders(response: Response, url: URL, nonce: string) {
	const isHttps = url.protocol === 'https:'
	const noindexPrefixes = [
		'/api',
		'/auth',
		'/admin',
		'/login',
		'/profile',
		'/register',
		'/verify-email'
	]
	const shouldNoindex = noindexPrefixes.some(prefix => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))
	const csp = [
		"default-src 'self'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"img-src 'self' data: blob: https://cdn.jsdelivr.net https://challenges.cloudflare.com https://*.googleusercontent.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
		`script-src 'self' https://challenges.cloudflare.com https://www.paypal.com https://www.paypalobjects.com https://web.squarecdn.com https://sandbox.web.squarecdn.com 'nonce-${nonce}'${dev ? " 'unsafe-eval'" : ''}`,
		"frame-src 'self' https://challenges.cloudflare.com https://www.paypal.com https://www.sandbox.paypal.com",
		"connect-src 'self' https://challenges.cloudflare.com https://www.paypal.com https://www.sandbox.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://connect.squareup.com https://connect.squareupsandbox.com https://web.squarecdn.com https://sandbox.web.squarecdn.com",
		"font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com"
	].join('; ')

	setIfMissing(response.headers, 'Content-Security-Policy', csp)
	setIfMissing(response.headers, 'Referrer-Policy', 'strict-origin-when-cross-origin')
	setIfMissing(response.headers, 'X-Content-Type-Options', 'nosniff')
	setIfMissing(response.headers, 'X-Frame-Options', 'DENY')
	setIfMissing(response.headers, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
	if (shouldNoindex) {
		setIfMissing(response.headers, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
	}
	if (isHttps) {
		setIfMissing(response.headers, 'Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
	}
}
