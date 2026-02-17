import type { CalendarActivityConfig } from '../social/activities.ts'
import { buildPaymentLink } from './pay.ts'
import { getEnabledCalendarPrograms } from './programs.ts'
import { getCalendarProfile, listEventsFeed, listUpcomingEvents, type CalendarFeedEvent, type CalendarProfile } from './social.ts'
import type { D1DatabaseLike } from '../storage/d1.ts'

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
	const activities = await getEnabledCalendarPrograms(db)
	return { user, activities }
}

export async function loadCalendarMemberHomeData(
	db: D1DatabaseLike,
	input: { userId: string; onlyMine: boolean }
): Promise<CalendarMemberHomeData> {
	const activities = await getEnabledCalendarPrograms(db)
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
