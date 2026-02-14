import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const MY_EMAIL = 'hello@miko.art'
const MAX_BODY_BYTES = 4096
const ALLOWED_ORIGINS = [
	'https://miko.art',
	'https://www.miko.art',
	'http://localhost:5173',
	'http://localhost:4173'
]

type FetchEventLike = {
	request: Request
	respondWith: (response: Response | Promise<Response>) => void
}

declare const addEventListener: (type: 'fetch', listener: (event: FetchEventLike) => void) => void

let cachedSesClient: SESClient | null = null

function getEnv(name: string): string | undefined {
	const globals = globalThis as Record<string, unknown>
	const value = globals[name]
	return typeof value === 'string' ? value : undefined
}

function isAllowedOrigin(origin: string | null) {
	if (!origin) return true
	return ALLOWED_ORIGINS.includes(origin)
}

function buildCorsHeaders(origin: string | null) {
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

function sanitizeHeader(value: unknown) {
	if (!value) return ''
	return String(value).replace(/[\r\n]+/g, ' ').trim()
}

function normalizeText(value: unknown, maxLength: number) {
	if (typeof value !== 'string') return ''
	const trimmed = value.trim()
	if (!trimmed) return ''
	return trimmed.length > maxLength ? '' : trimmed
}

function normalizeEmail(value: unknown) {
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

async function readJson(request: Request) {
	const contentLength = request.headers.get('content-length')
	if (contentLength) {
		const bytes = Number.parseInt(contentLength, 10)
		if (Number.isFinite(bytes) && bytes > MAX_BODY_BYTES) {
			return { ok: false as const, status: 413 as const }
		}
	}
	const text = await request.text()
	if (text.length > MAX_BODY_BYTES) {
		return { ok: false as const, status: 413 as const }
	}
	try {
		return { ok: true as const, value: JSON.parse(text) as unknown }
	} catch {
		return { ok: false as const, status: 400 as const }
	}
}

/**
 *
 * @param request
 * @returns {Promise<Response>}
 */
async function handleRequest(request: Request) {
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

	const payload = (parsed.value && typeof parsed.value === 'object')
		? (parsed.value as Record<string, unknown>)
		: {}
	const name = normalizeText(payload['name'], 100)
	const email = normalizeEmail(payload['email'])
	const message = normalizeText(payload['message'], 2000)

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
		const response = await sesClient.send(new SendEmailCommand({
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
		const status = response.$metadata?.httpStatusCode ?? 200

		return new Response(`SES responded okay ${status}`, {
			status: 200,
			headers: corsHeaders
		})
	} catch {
		return new Response('Internal server error', {
			status: 500,
			headers: corsHeaders
		})
	}
}

addEventListener('fetch', (event: FetchEventLike) => {
	const { request } = event
	switch (request.method) {
		case 'POST':
			event.respondWith(
				handleRequest(request)
			)
			break

		case 'OPTIONS': {
			const origin = request.headers.get('Origin')
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
			{
				const origin = request.headers.get('Origin')
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
			}
			event.respondWith(
				new Response('Bad Request', {
					status: 400,
					headers: buildCorsHeaders(request.headers.get('Origin'))
				})
			)
			break
	}
})
