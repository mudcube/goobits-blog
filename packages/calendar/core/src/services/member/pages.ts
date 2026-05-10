import type { CalendarActivityConfig } from '../../social/activities.ts'
import { buildPaymentLink } from '../payments/pay.ts'
import { getEnabledCalendarPrograms } from '../admin/programs.ts'
import { getCalendarProfile, listEventsFeed, listUpcomingEvents, type CalendarFeedEvent, type CalendarProfile } from '../bookings/social.ts'
import { listUserProgramAccess } from '../../access/user-program-access.ts'
import type { D1DatabaseLike } from '../../storage/d1.ts'

export type CalendarHomeFeedEvent = CalendarFeedEvent & {
	payUrl: string | null
}

export type CalendarMemberHomeData = {
	activities: CalendarActivityConfig[]
	upcoming: CalendarHomeFeedEvent[]
	recent: CalendarFeedEvent[]
	onlyMine: boolean
}

export type CalendarShellUser = {
	avatarUrl?: string
	avatar?: string
	[key: string]: unknown
}

export type CalendarMemberShellData = {
	user: (CalendarShellUser & { avatarUrl?: string }) | null
	activities: CalendarActivityConfig[]
}

export async function loadCalendarMemberShellData(
	db: D1DatabaseLike,
	input: { user?: CalendarShellUser }
): Promise<CalendarMemberShellData> {
	const rawUser = input.user
	let user: CalendarMemberShellData['user'] = null
	if (rawUser) {
		const normalized: CalendarShellUser & { avatarUrl?: string } = { ...rawUser }
		const resolvedAvatar = rawUser.avatarUrl || rawUser.avatar
		if (resolvedAvatar) normalized.avatarUrl = resolvedAvatar
		user = normalized
	}
	let activities = await getEnabledCalendarPrograms(db)
	const userId = rawUser?.['id']
	if (userId != null) {
		const access = await listUserProgramAccess(db, String(userId), { seedIfMissing: false })
		if (access.length > 0) {
			const allowed = new Set(access.filter((row) => row.allowed).map((row) => row.programSlug))
			activities = activities.filter((activity) => allowed.has(activity.slug))
		}
	}
	return { user, activities }
}

export async function loadCalendarMemberHomeData(
	db: D1DatabaseLike,
	input: { userId: string; onlyMine: boolean }
): Promise<CalendarMemberHomeData> {
	let activities = await getEnabledCalendarPrograms(db)
	if (input.userId) {
		const access = await listUserProgramAccess(db, input.userId, { seedIfMissing: false })
		if (access.length > 0) {
			const allowed = new Set(access.filter((row) => row.allowed).map((row) => row.programSlug))
			activities = activities.filter((activity) => allowed.has(activity.slug))
		}
	}
	const feed = input.userId ? await listEventsFeed(db, input.userId, input.onlyMine) : { upcoming: [], recent: [] }
	const upcoming = feed.upcoming.map((entry) => ({
		...entry,
		payUrl: buildPaymentLink({
			provider: entry.paymentProvider,
			handle: entry.paymentHandle,
			amountCents: entry.costCents,
			currency: entry.currency,
			note: entry.paymentNoteTemplate || entry.title
		})
	}))
	return {
		activities,
		upcoming,
		recent: feed.recent,
		onlyMine: input.onlyMine
	}
}

export type CalendarMemberProfileData = {
	profile: CalendarProfile
	events: CalendarFeedEvent[]
}

export async function loadCalendarMemberProfileData(
	db: D1DatabaseLike,
	input: { userId: string }
): Promise<CalendarMemberProfileData> {
	if (!input.userId) {
		return {
			profile: { emergencyContact: '', dietaryRestrictions: '', chatHandle: '' },
			events: []
		}
	}

	const [profile, events] = await Promise.all([
		getCalendarProfile(db, input.userId),
		listUpcomingEvents(db, input.userId, true)
	])

	return { profile, events }
}
