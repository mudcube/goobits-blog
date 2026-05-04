import { buildEnv } from '@calendar/kit'
import { isCalendarAdmin, loadCalendarMemberShellData } from '@calendar/core'

type CalendarUser = {
	id?: string | number
	avatarUrl?: string
	avatar?: string
	email?: string
	[key: string]: unknown
}

export async function load({
	locals,
	platform
}: {
	locals: { user?: CalendarUser }
	platform: App.Platform
}) {
	const env = await buildEnv(platform)
	const shellData = await loadCalendarMemberShellData(env.DB, locals.user ? { user: locals.user } : {})
	return {
		...shellData,
		isAdmin: await isCalendarAdmin({ db: env.DB, userId: locals.user?.id as string | number | undefined })
	}
}
