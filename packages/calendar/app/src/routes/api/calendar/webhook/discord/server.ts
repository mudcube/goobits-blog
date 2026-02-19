import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { parseDiscordWebhookTextInput, TransportValidationError } from '@calendar/core'
import { apiOk, apiError, apiValidationError } from '@calendar/kit'

export async function POST(event: RequestEvent) {
	return runApiRequest('calendar.webhook.discord', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const env = await buildEnv(event.platform)
		const discordWebhook = env['DISCORD_WEBHOOK_URL']
		const webhookUrl = typeof discordWebhook === 'string' ? discordWebhook : ''
		if (!webhookUrl) {
			return apiError('DISCORD_WEBHOOK_URL not configured', { status: 400 })
		}

		const { text } = parseDiscordWebhookTextInput(await event.request.json().catch(() => null))

		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content: text })
		})
		if (!response.ok) {
			return apiError(`Discord webhook failed (${response.status})`, { status: 502 })
		}

		return apiOk({})
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
