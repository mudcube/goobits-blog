import { buildEnv } from '@calendar/kit'
import { ADMIN_COOKIE_NAME, getCalendarConfig, loadCalendarMemberShellData } from '@calendar/core'

type CalendarUser = {
	avatarUrl?: string
	avatar?: string
	email?: string
	[key: string]: unknown
}

export async function load({
	locals,
	platform,
	cookies
}: {
	locals: { user?: CalendarUser }
	platform: App.Platform
	cookies: { get: (name: string) => string | undefined }
}) {
	const env = await buildEnv(platform)
	const shellData = await loadCalendarMemberShellData(env.DB, locals.user ? { user: locals.user } : {})
	const adminEmail = getCalendarConfig().brand.adminEmail.toLowerCase()
	const currentEmail = typeof locals.user?.email === 'string' ? locals.user.email.toLowerCase() : ''
	const hasAdminSession = !!cookies.get(ADMIN_COOKIE_NAME)
	return {
		...shellData,
		isAdmin: currentEmail === adminEmail || hasAdminSession
	}
}
