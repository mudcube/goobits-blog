import { buildEnv } from '@calendar/kit'
import { getCalendarConfig, loadCalendarMemberShellData } from '@calendar/core'

type CalendarUser = {
	avatarUrl?: string
	avatar?: string
	email?: string
	[key: string]: unknown
}

export async function load({ locals, platform }: { locals: { user?: CalendarUser }; platform: App.Platform }) {
	const env = await buildEnv(platform)
	const shellData = await loadCalendarMemberShellData(env.DB, locals.user ? { user: locals.user } : {})
	const adminEmail = getCalendarConfig().brand.adminEmail.toLowerCase()
	const currentEmail = typeof locals.user?.email === 'string' ? locals.user.email.toLowerCase() : ''
	return {
		...shellData,
		isAdmin: currentEmail === adminEmail
	}
}
