import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { parseAdminRulesInput, TransportValidationError } from '@calendar/core'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk, apiValidationError } from '@calendar/kit'

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.rules.save', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const env = await buildEnv(event.platform)
		const db = env.DB

		const { hoursFrom, hoursTo, buffer, notice, capacity } = parseAdminRulesInput(
			await event.request.json().catch(() => null)
		)
		const now = Date.now()

		// Save each setting
		const settings = [
			['hoursFrom', hoursFrom],
			['hoursTo', hoursTo],
			['buffer', String(buffer)],
			['notice', String(notice)],
			['capacity', String(capacity)]
		]

		for (const [key, value] of settings) {
			await db.prepare(
				`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
				 ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
			).bind(key, value, now).run()
		}

		logAdminEvent(event, 'rules_update', { hoursFrom, hoursTo, buffer, notice, capacity })
		return apiOk({})
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
