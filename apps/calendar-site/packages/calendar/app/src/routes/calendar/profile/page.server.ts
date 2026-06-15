import { buildEnv } from '@calendar/kit'
import { loadCalendarMemberProfileData } from '@calendar/core/booking'

export async function load({ platform, locals }: { platform: App.Platform; locals: { user?: { id?: string | number } } }) {
	const rawUserId = locals.user?.id
	const userId = typeof rawUserId === 'string' ? rawUserId : typeof rawUserId === 'number' ? String(rawUserId) : ''

	const env = await buildEnv(platform)
	return loadCalendarMemberProfileData(env.DB, { userId })
}
