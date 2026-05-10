import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { getCalendarPrograms } from '@calendar/core/admin'
import { listUserProgramAccess, setUserProgramAccess } from '@calendar/core/invites'
import {
	parseAdminUserProgramAccessInput,
	parsePositiveInteger,
	TransportValidationError
} from '@calendar/core/transport'
import { apiError, apiOk, apiValidationError } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'

function normalizeUserId(param: string | undefined) {
	const value = parsePositiveInteger(param)
	return value == null ? null : String(value)
}

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.users.access.get', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const userId = normalizeUserId(event.params['id'])
		if (!userId) return apiError('Invalid user id', { status: 400 })

		const { DB: db } = await buildEnv(event.platform)
		const [programs, access] = await Promise.all([getCalendarPrograms(db), listUserProgramAccess(db, userId)])
		const accessMap = new Map(access.map((row) => [row.programSlug, row.allowed]))
		return apiOk({
			access: programs.map((program) => ({
				programSlug: program.slug,
				allowed: accessMap.get(program.slug) ?? true
			}))
		})
	})
}

export async function PUT(event: RequestEvent) {
	return runApiRequest(
		'admin.users.access.put',
		async () => {
			const guard = requireAdminRequest(event, { csrf: true })
			if (guard) return guard
			const userId = normalizeUserId(event.params['id'])
			if (!userId) return apiError('Invalid user id', { status: 400 })

			const input = parseAdminUserProgramAccessInput(await event.request.json().catch(() => null))
			const { DB: db } = await buildEnv(event.platform)
			await setUserProgramAccess(db, userId, input.access)
			return apiOk({})
		},
		{
			onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
		}
	)
}
