import type { RequestEvent } from '@sveltejs/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { getAdminAuth } from '@calendar/kit'
import { listCalendarUsers } from '@calendar/core'
import { apiOk } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.users.list', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const { db } = await getAdminAuth({ event })
		const users = await listCalendarUsers({ db })
		type UserRow = { id: number; email: string; name: string; avatar_url: string | null; email_verified: number; last_login_at: number | null; provider: string | null }
		const sanitized = (users as UserRow[]).map(user => ({
			id: user.id,
			email: user.email,
			name: user.name,
			avatar_url: user.avatar_url,
			email_verified: user.email_verified,
			last_login_at: user.last_login_at,
			provider: user.provider
		}))
		return apiOk({ users: sanitized })
	})
}
