import { redirect } from '@sveltejs/kit'
import type { RequestEvent } from './$types'
import { actions as parentActions } from '@calendar/app/routes/admin/page.server'

export const actions = parentActions

export function load(event: RequestEvent) {
	redirect(308, `/schedule/admin/events/${event.params.slug}/`)
}
