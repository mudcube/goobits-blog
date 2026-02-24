import type { RequestEvent } from './$types'
import { actions as parentActions } from '@calendar/app/routes/admin/page.server'

export const actions = parentActions

export function load(event: RequestEvent) {
	return {
		user: event.locals.user ?? null,
		userId: event.params.userId
	}
}

