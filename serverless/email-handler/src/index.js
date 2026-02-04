import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const MY_EMAIL = 'hello@miko.art'
const MAX_BODY_BYTES = 4096
const ALLOWED_ORIGINS = [
	'https://miko.art',
	'https://www.miko.art',
	'http://localhost:5173',
	'http://localhost:4173'
]

let cachedSesClient = null

function getEnv(name) {
	return typeof globalThis[name] !== 'undefined' ? globalThis[name] : undefined
}

function isAllowedOrigin(origin) {
	if (!origin) return true
	return ALLOWED_ORIGINS.includes(origin)
}

function buildCorsHeaders(origin) {
	const headers = new Headers({
		'Access-Control-Allow-Headers': 'content-type',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Vary': 'Origin'
	})
	if (origin && isAllowedOrigin(origin)) {
		headers.set('Access-Control-Allow-Origin', origin)
	}
	return headers
}

function sanitizeHeader(value) {
	if (!value) return ''
	return String(value).replace(/[\r\n]+/g, ' ').trim()
}

function normalizeText(value, maxLength) {
	if (typeof value !== 'string') return ''
	const trimmed = value.trim()
	if (!trimmed) return ''
	return trimmed.length > maxLength ? '' : trimmed
}

function normalizeEmail(value) {
	if (typeof value !== 'string') return ''
	const trimmed = value.trim().toLowerCase()
	if (!trimmed || trimmed.length > 254) return ''
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailPattern.test(trimmed) ? trimmed : ''
}

function getSesClient() {
	if (cachedSesClient) return cachedSesClient
	const accessKeyId = getEnv('SES_ACCESS_KEY_ID') || getEnv('AWS_ACCESS_KEY_ID')
	const secretAccessKey = getEnv('SES_SECRET_ACCESS_KEY') || getEnv('AWS_SECRET_ACCESS_KEY')
	const region = getEnv('SES_REGION') || getEnv('AWS_REGION') || 'us-east-1'
	if (!accessKeyId || !secretAccessKey) return null
	cachedSesClient = new SESClient({
		region,
		credentials: { accessKeyId, secretAccessKey }
	})
	return cachedSesClient
}

async function readJson(request) {
	const contentLength = request.headers.get('content-length')
	if (contentLength) {
		const bytes = Number.parseInt(contentLength, 10)
		if (Number.isFinite(bytes) && bytes > MAX_BODY_BYTES) {
			return { ok: false, status: 413 }
		}
	}
	const text = await request.text()
	if (text.length > MAX_BODY_BYTES) {
		return { ok: false, status: 413 }
	}
	try {
		return { ok: true, value: JSON.parse(text) }
	} catch (error) {
		return { ok: false, status: 400 }
	}
}

/**
 *
 * @param request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
	const origin = request.headers.get('Origin')
	const corsHeaders = buildCorsHeaders(origin)
	if (origin && !isAllowedOrigin(origin)) {
		return new Response('Forbidden', {
			status: 403,
			headers: corsHeaders
		})
	}

	const parsed = await readJson(request)
	if (!parsed.ok) {
		return new Response('Bad Request', {
			status: parsed.status,
			headers: corsHeaders
		})
	}

	const payload = parsed.value || {}
	const name = normalizeText(payload.name, 100)
	const email = normalizeEmail(payload.email)
	const message = normalizeText(payload.message, 2000)

	if (!email || !message) {
		return new Response('Bad Request', {
			status: 400,
			headers: corsHeaders
		})
	}

	const sesClient = getSesClient()
	if (!sesClient) {
		return new Response('Service unavailable', {
			status: 503,
			headers: corsHeaders
		})
	}

	try {
		const safeName = sanitizeHeader(name) || 'Website Visitor'
		const safeEmail = sanitizeHeader(email)
		const { status } = await sesClient.send(new SendEmailCommand({
			Source: `${safeName} <${MY_EMAIL}>`,
			Destination: {
				ToAddresses: [MY_EMAIL]
			},
			ReplyToAddresses: [safeEmail],
			Message: {
				Body: {
					Text: {
						Charset: "UTF-8",
						Data: message
					}
				},
				Subject: {
					Charset: "UTF-8",
					Data: `Miko.art: Contact`
				}
			}
		}))

		return new Response(`SES responded okay ${status}`, {
			status: 200,
			headers: corsHeaders
		})
	} catch (error) {
		return new Response('Internal server error', {
			status: 500,
			headers: corsHeaders
		})
	}
}

addEventListener('fetch', event => {
	switch (event.request.method) {
		case 'POST':
			event.respondWith(
				handleRequest(event.request)
			)
			break

		case 'OPTIONS': {
			const origin = event.request.headers.get('Origin')
			const corsHeaders = buildCorsHeaders(origin)
			if (origin && !isAllowedOrigin(origin)) {
				event.respondWith(
					new Response('Forbidden', {
						status: 403,
						headers: corsHeaders
					})
				)
				break
			}
			event.respondWith(
				new Response(null, {
					status: 200,
					headers: corsHeaders
				})
			)
			break
		}

		default:
			event.respondWith(
				new Response('Bad Request', {
					status: 400,
					headers: corsHeaders
				})
			)
			break
	}
})
