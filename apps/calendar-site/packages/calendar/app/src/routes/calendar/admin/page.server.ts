import { redirect } from '@sveltejs/kit'
import { getCalendarConfig } from '@calendar/core/config'

export function load() {
	throw redirect(308, getCalendarConfig().routes.adminBase)
}
