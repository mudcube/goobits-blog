import { redirect } from '@sveltejs/kit'
import { getCalendarConfig } from '@calendar/core'

export function load() {
	redirect(308, getCalendarConfig().routes.adminBase)
}
