import { redirect } from '@sveltejs/kit'
import { actions as parentActions } from '@calendar/app/routes/admin/page.server'

export const actions = parentActions
export function load() {
	redirect(307, '/schedule/admin/settings/')
}
