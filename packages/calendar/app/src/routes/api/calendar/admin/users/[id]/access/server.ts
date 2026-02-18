import type { RequestEvent } from '@sveltejs/kit'
import { getAdminAuth } from '@calendar/kit'
import {
	getCalendarPrograms,
	listUserProgramAccess,
	parseAdminUserProgramAccessInput,
	setUserProgramAccess,
	TransportValidationError
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, logApiError } from '@calendar/kit'
import { enforceSameOrigin, requireAdminSession, unauthorized } from '@calendar/app/admin-api-helpers'

function normalizeUserId(param: string | undefined) {
	if (!param) return null
	const value = Number.parseInt(param, 10)
	return Number.isFinite(value) && value > 0 ? String(value) : null
}

export async function GET(event: RequestEvent) {
	try {
		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const userId = normalizeUserId(event.params['id'])
		if (!userId) return apiError('Invalid user id', { status: 400 })

		const { db } = await getAdminAuth({ event })
		const [programs, access] = await Promise.all([
			getCalendarPrograms(db),
			listUserProgramAccess(db, userId)
		])
		const accessMap = new Map(access.map((row) => [row.programSlug, row.allowed]))
		return apiOk({
			access: programs.map((program) => ({
				programSlug: program.slug,
				allowed: accessMap.get(program.slug) ?? true
			}))
		})
	} catch (err) {
		logApiError('admin.users.access.get', err)
		return apiError('Internal server error')
	}
}

export async function PUT(event: RequestEvent) {
	try {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf

		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const userId = normalizeUserId(event.params['id'])
		if (!userId) return apiError('Invalid user id', { status: 400 })

		const input = parseAdminUserProgramAccessInput(await event.request.json().catch(() => null))
		const { db } = await getAdminAuth({ event })
		await setUserProgramAccess(db, userId, input.access)
		return apiOk({})
	} catch (err) {
		if (err instanceof TransportValidationError) {
			return apiValidationError(err)
		}
		logApiError('admin.users.access.put', err)
		return apiError('Internal server error')
	}
}
