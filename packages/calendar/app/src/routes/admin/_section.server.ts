import type { RequestEvent } from '@sveltejs/kit'

type AdminTabId = 'dashboard' | 'events' | 'rules' | 'programs' | 'people' | 'invites' | 'connections'

export function createAdminSectionLoad(initialTab: AdminTabId) {
	return async (event: RequestEvent) => {
		const locals = event.locals as { user?: Record<string, unknown> }
		return {
			user: locals.user ?? null,
			initialTab
		}
	}
}
