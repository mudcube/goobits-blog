import type { RequestEvent } from '@sveltejs/kit'
import type { AdminTabId } from '@calendar/ui/admin/shared/admin'

export function createAdminSectionLoad(initialTab: AdminTabId) {
	return async (event: RequestEvent) => {
		const locals = event.locals as { user?: Record<string, unknown> }
		return {
			user: locals.user ?? null,
			initialTab
		}
	}
}
