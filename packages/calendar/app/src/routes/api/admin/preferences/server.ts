import type { RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'
import { buildEnv } from '@calendar/kit'
import { getAdminViewSettings, setAdminViewSettings } from '@calendar/core/admin'
import { TransportValidationError } from '@calendar/core/transport'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk, apiError, apiValidationError } from '@calendar/kit'

const ViewSettingsPatchSchema = z.object({
	weekStart: z.union([z.literal('sunday'), z.literal('monday')]).optional()
})

function getAdminUserId(event: RequestEvent): number | null {
	const locals = event.locals as { user?: { id?: string | number } | null }
	const raw = locals.user?.id
	if (typeof raw === 'number' && Number.isFinite(raw)) return raw
	if (typeof raw === 'string') {
		const parsed = Number.parseInt(raw, 10)
		if (Number.isFinite(parsed)) return parsed
	}
	return null
}

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.preferences.get', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const userId = getAdminUserId(event)
		if (userId == null) return apiError('Unauthorized', { status: 401 })
		const env = await buildEnv(event.platform)
		const view = await getAdminViewSettings(env.DB, userId)
		return apiOk({ view })
	})
}

export async function POST(event: RequestEvent) {
	return runApiRequest(
		'admin.preferences.set',
		async () => {
			const guard = requireAdminRequest(event, { csrf: true })
			if (guard) return guard
			const userId = getAdminUserId(event)
			if (userId == null) return apiError('Unauthorized', { status: 401 })

			const body = (await event.request.json().catch(() => null)) ?? {}
			const parsed = ViewSettingsPatchSchema.safeParse(body)
			if (!parsed.success) {
				throw new TransportValidationError(parsed.error.issues.map((issue) => issue.message).join('; '))
			}

			const env = await buildEnv(event.platform)
			const patch: { weekStart?: 'sunday' | 'monday' } = {}
			if (parsed.data.weekStart !== undefined) patch.weekStart = parsed.data.weekStart
			const view = await setAdminViewSettings(env.DB, userId, patch)
			logAdminEvent(event, 'preferences_set', { keys: Object.keys(parsed.data) })
			return apiOk({ view })
		},
		{
			onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
		}
	)
}
