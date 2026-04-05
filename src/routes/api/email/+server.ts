import { dev } from '$app/environment'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { mergeRuntimeEnv } from '$lib/server/runtime'
import { runContactAntiAbuse } from '$lib/server/antiabuse'
import { getAsn, getClientIp } from '$lib/server/request-meta'

type ContactBody = {
	name: string
	email: string
	message: string
	from?: string
	topic?: string
	device_id?: string
	started_at?: string
	website?: string
	['cf-turnstile-response']?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_MESSAGE_LENGTH = 12
const MIN_MESSAGE_WORDS = 3

function isContactBody(input: unknown): input is ContactBody {
	if (typeof input !== 'object' || input === null) return false
	const record = input as Record<string, unknown>
	return (
		typeof record['name'] === 'string' &&
		typeof record['email'] === 'string' &&
		typeof record['message'] === 'string' &&
		(!('from' in record) || typeof record['from'] === 'string' || record['from'] === undefined) &&
		(!('topic' in record) || typeof record['topic'] === 'string' || record['topic'] === undefined) &&
		(!('device_id' in record) || typeof record['device_id'] === 'string' || record['device_id'] === undefined) &&
		(!('started_at' in record) || typeof record['started_at'] === 'string' || record['started_at'] === undefined) &&
		(!('website' in record) || typeof record['website'] === 'string' || record['website'] === undefined) &&
		(
			!('cf-turnstile-response' in record) ||
			typeof record['cf-turnstile-response'] === 'string' ||
			record['cf-turnstile-response'] === undefined
		)
	)
}

function sanitizeContextValue(raw: unknown, maxLength: number) {
	if (typeof raw !== 'string') return undefined
	const cleaned = raw.replace(/[\r\n\t]+/g, ' ').trim()
	if (!cleaned) return undefined
	return cleaned.slice(0, maxLength)
}

function sanitize(body: ContactBody): ContactBody {
	const from = sanitizeContextValue(body.from, 64)
	const topic = sanitizeContextValue(body.topic, 64)
	const deviceId = sanitizeContextValue(body.device_id, 128)
	const honeypot = sanitizeContextValue(body.website, 256)
	const turnstileToken = sanitizeContextValue(body['cf-turnstile-response'], 4096)
	const startedAt = sanitizeContextValue(body.started_at, 32)
	return {
		name: body.name.trim(),
		email: body.email.trim(),
		message: body.message.trim(),
		...(from ? { from } : {}),
		...(topic ? { topic } : {}),
		...(deviceId ? { device_id: deviceId } : {}),
		...(honeypot ? { website: honeypot } : {}),
		...(turnstileToken ? { 'cf-turnstile-response': turnstileToken } : {}),
		...(startedAt ? { started_at: startedAt } : {})
	}
}

function hasSubstantiveMessage(message: string) {
	const cleaned = message.replace(/\s+/g, ' ').trim()
	if (cleaned.length < MIN_MESSAGE_LENGTH) return false
	const wordCount = cleaned
		.split(' ')
		.filter((word) => /[a-z0-9]/i.test(word)).length
	return wordCount >= MIN_MESSAGE_WORDS
}

function getContactRedirectUrl(requestUrl: string, error?: string) {
	const url = new URL('/contact/', requestUrl)
	if (error) url.searchParams.set('error', error)
	return url
}

function redirectForForm(location: URL | string) {
	return new Response(null, {
		status: 303,
		headers: {
			location: typeof location === 'string' ? location : location.toString()
		}
	})
}

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const contentType = request.headers.get('content-type') || ''
	const expectsJson = contentType.includes('application/json')
	let payload: unknown
	try {
		if (expectsJson) {
			payload = await request.json()
		} else {
			const formData = await request.formData()
			payload = Object.fromEntries(formData.entries())
		}
	} catch {
		if (expectsJson) {
			return json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
		}
		return redirectForForm(getContactRedirectUrl(request.url, 'Invalid request body.'))
	}

	if (!isContactBody(payload)) {
		if (expectsJson) {
			return json({ ok: false, error: 'Missing required fields.' }, { status: 400 })
		}
		return redirectForForm(getContactRedirectUrl(request.url, 'Missing required fields.'))
	}

	const body = sanitize(payload)
	if (!body.name || !body.message || !EMAIL_RE.test(body.email)) {
		if (expectsJson) {
			return json({ ok: false, error: 'Please provide a valid name, email, and message.' }, { status: 400 })
		}
		return redirectForForm(getContactRedirectUrl(request.url, 'Please provide a valid name, email, and message.'))
	}

	if (!hasSubstantiveMessage(body.message)) {
		const error = 'Please include a more substantive message with at least a few words.'
		if (expectsJson) {
			return json({ ok: false, error }, { status: 400 })
		}
		return redirectForForm(getContactRedirectUrl(request.url, error))
	}

	const env = mergeRuntimeEnv(platform?.env)
	const antiAbuse = await runContactAntiAbuse({
		email: body.email,
		ip: getClientIp(request, { env, getClientAddress }),
		asn: getAsn(request),
		deviceId: body.device_id?.trim() || '',
		honeypot: body.website?.trim() || '',
		startedAtMs: Number.parseInt(body.started_at || '0', 10),
		turnstileToken: body['cf-turnstile-response']?.trim() || '',
		env
	})

	if (!antiAbuse.ok) {
		const error = antiAbuse.message || 'We could not complete that request. Please try again later.'
		if (expectsJson) {
			return json(
				{
					ok: false,
					error,
					requiresChallenge: antiAbuse.requiresChallenge
				},
				{ status: 400 }
			)
		}
		return redirectForForm(getContactRedirectUrl(request.url, error))
	}

	const envWebhook = platform?.env?.['CONTACT_WEBHOOK_URL']
	const processWebhook = process.env['CONTACT_WEBHOOK_URL']
	const webhook = typeof envWebhook === 'string' ? envWebhook : typeof processWebhook === 'string' ? processWebhook : ''

	if (!webhook) {
		if (!dev) {
			console.error('[contact] CONTACT_WEBHOOK_URL missing in non-dev environment')
			if (expectsJson) {
				return json({ ok: false, error: 'Contact delivery is not configured.' }, { status: 503 })
			}
			return redirectForForm(getContactRedirectUrl(request.url, 'Contact delivery is not configured.'))
		}

		console.info('[contact] message accepted (no CONTACT_WEBHOOK_URL configured)', {
			from: body.email,
			name: body.name,
			length: body.message.length
		})
		if (expectsJson) {
			return json({ ok: true }, { status: 202 })
		}
		return redirectForForm(new URL('/contact/thank-you/', request.url))
	}

	const response = await fetch(String(webhook), {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			event: 'miko-contact-form',
			source: 'miko.art',
			sentAt: new Date().toISOString(),
			...body
		})
	})

	if (!response.ok) {
		if (expectsJson) {
			return json({ ok: false, error: 'Contact delivery failed.' }, { status: 502 })
		}
		return redirectForForm(getContactRedirectUrl(request.url, 'Contact delivery failed.'))
	}

	if (expectsJson) {
		return json({ ok: true }, { status: 200 })
	}

	return redirectForForm(new URL('/contact/thank-you/', request.url))
}
