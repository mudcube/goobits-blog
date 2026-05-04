import type { RequestEvent } from '@sveltejs/kit'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { buildEnv } from '@calendar/kit'
import {
	createInvite,
	deleteInvite,
	deleteInviteByCode,
	listInvites,
	parseCalendarInviteCreateInput,
	TransportValidationError
} from '@calendar/core'
import { apiOk, apiError, apiValidationError } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.invites.list', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const { DB: db } = await buildEnv(event.platform)
		const invites = await listInvites({ db })
		return apiOk({ invites })
	})
}

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.invites.create', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const { DB: db } = await buildEnv(event.platform)
		const input = parseCalendarInviteCreateInput(await event.request.json().catch(() => null))
		const uses = input.uses
		const expiresInDays = input.expiresInDays
		const expiresAt = expiresInDays
			? Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60)
			: null

		const invite = await createInvite({
			db,
			email: input.email,
			usesRemaining: uses,
			expiresAt
		})

		logAdminEvent(event, 'invite_create', { inviteId: invite?.id, email: invite?.email ?? null })
		return apiOk({ invite })
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}

export async function DELETE(event: RequestEvent) {
	return runApiRequest('admin.invites.delete', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const rawId = event.url.searchParams.get('id')
		if (!rawId) {
			return apiError('Missing invite id', { status: 400 })
		}

		const { DB: db } = await buildEnv(event.platform)
		const numericId = Number(rawId)
		if (Number.isFinite(numericId) && numericId > 0) {
			await deleteInvite({ db, inviteId: numericId })
			logAdminEvent(event, 'invite_delete', { inviteId: numericId })
		} else {
			// Fallback: delete by code (handles legacy/non-numeric IDs)
			await deleteInviteByCode({ db, code: rawId })
			logAdminEvent(event, 'invite_delete', { inviteCode: rawId })
		}
		return apiOk({})
	})
}
