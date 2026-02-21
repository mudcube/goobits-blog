import {
	createAdminEvents,
	disconnectAdminGoogleIntegration,
	deleteAdminProgram,
	getAdminEvents,
	getAdminPrograms,
	getAdminStatus,
	cleanupAdminE2E,
	saveAdminRules,
	setAdminProgram,
	toggleAdminProgram,
	mutateAdminSyncQueue,
	updateAdminEventMemory,
	updateAdminEventCapacity,
	deleteAdminEvent,
	type AdminRulesInput
} from '../../api/admin'
import {
	createCalendarInvite,
	deleteCalendarInvite,
	getCalendarAdminInvites,
	getCalendarAdminUsers,
	startCalendarOAuth,
	type CreateInviteInput
} from '../../api/calendar'
import { getCalendarUiConfig } from '../../config'

export type AdminTabId = 'dashboard' | 'events' | 'rules' | 'programs' | 'people' | 'connections'

export type AdminNavItem = {
	label: string
	id: AdminTabId
	section: 'schedule' | 'settings'
}

export type AdminHours = {
	from: string
	to: string
}

export type AdminBookingStats = {
	upcoming: number
	seats: number
}

export type AdminRulesState = {
	hours: AdminHours
	buffer: number
	notice: number
	capacity: number
}

export const ADMIN_NAV: AdminNavItem[] = [
	{ label: 'Dashboard', id: 'dashboard', section: 'schedule' },
	{ label: 'Events', id: 'events', section: 'schedule' },
	{ label: 'Rules', id: 'rules', section: 'settings' },
	{ label: 'Programs', id: 'programs', section: 'settings' },
	{ label: 'People', id: 'people', section: 'settings' },
	{ label: 'Connections', id: 'connections', section: 'settings' }
]

const ADMIN_TAB_SEGMENTS: Record<AdminTabId, string> = {
	dashboard: 'overview',
	events: 'events',
	rules: 'availability',
	programs: 'programs',
	people: 'members',
	connections: 'integrations'
}

export function getAdminTabHref(tab: AdminTabId) {
	const adminBase = getCalendarUiConfig().routes.adminBase
	const segment = ADMIN_TAB_SEGMENTS[tab]
	return segment ? `${adminBase}/${segment}` : adminBase
}

export function isAdminTabId(value: string): value is AdminTabId {
	return value === 'dashboard' ||
		value === 'events' ||
		value === 'rules' ||
		value === 'programs' ||
		value === 'people' ||
		value === 'connections'
}

export const DEFAULT_ADMIN_RULES: AdminRulesState = {
	hours: { from: '06:00', to: '22:00' },
	buffer: 15,
	notice: 24,
	capacity: 4
}

export const DEFAULT_ADMIN_STATS: AdminBookingStats = {
	upcoming: 0,
	seats: 0
}

export const DEFAULT_INVITE_DRAFT: CreateInviteInput = {
	email: null,
	uses: 1,
	expiresInDays: 7
}

export function formatAdminDate(timestamp?: number | null) {
	if (!timestamp) return 'Never'
	return new Date(timestamp * 1000).toLocaleDateString()
}

export function buildInviteLink(origin: string, code: string) {
	const calendarLoginPath = getCalendarUiConfig().routes.calendarLoginPath
	return `${origin}${calendarLoginPath}?invite=${code}`
}

export function normalizeRulesInput(state: AdminRulesState): AdminRulesInput {
	return {
		hoursFrom: state.hours.from,
		hoursTo: state.hours.to,
		buffer: state.buffer,
		notice: state.notice,
		capacity: state.capacity
	}
}

export const fetchAdminStatus = getAdminStatus
export const cleanupAdminE2EData = cleanupAdminE2E

export async function persistAdminRules(state: AdminRulesState) {
	return saveAdminRules(normalizeRulesInput(state))
}

export const beginCalendarOAuth = startCalendarOAuth
export const disconnectCalendarOAuth = disconnectAdminGoogleIntegration
export const fetchAdminPrograms = getAdminPrograms

export async function persistAdminProgram(input: { slug: string; enabled: boolean }) {
	return toggleAdminProgram(input.slug, input.enabled)
}

export async function saveAdminProgram(input: {
	slug: string
	label: string
	activityName: string
	pageTitle: string
	eyebrow: string
	heroTitleLine1: string
	heroTitleLine2?: string
	heroSubtitle: string
	description: string
	icon: string
	eyebrowClass?: string
	glowClass?: string
	formGlowClass?: string
	serviceStatusNote?: string
	enabled: boolean
	sortOrder: number
}) {
	return setAdminProgram(input)
}

export const removeAdminProgram = deleteAdminProgram
export const fetchAdminEvents = getAdminEvents

export async function persistAdminEvents(input: {
	activitySlug: string
	title: string
	startsAt: string
	endsAt: string
	capacity: number
	costCents?: number
	currency?: string
	paymentProvider?: string
	paymentHandle?: string
	paymentNoteTemplate?: string
	repeatWeeks?: number
	location?: string
	note?: string
}) {
	return createAdminEvents(input)
}

export const persistAdminEventCapacity = updateAdminEventCapacity
export const persistAdminEventMemory = updateAdminEventMemory
export const removeAdminEvent = deleteAdminEvent

export async function processAdminSyncQueue(limit = 10) {
	return mutateAdminSyncQueue('process', limit)
}

export async function retryAdminSyncDeadLetters(limit = 10) {
	return mutateAdminSyncQueue('retry_dead_letters', limit)
}

export async function purgeAdminSyncDeadLetters(limit = 10) {
	return mutateAdminSyncQueue('purge_dead_letters', limit)
}

export async function fetchCalendarMembersData() {
	const [invitesData, usersData] = await Promise.all([getCalendarAdminInvites(), getCalendarAdminUsers()])
	return { invitesData, usersData }
}

export const persistInvite = createCalendarInvite
export const removeInvite = deleteCalendarInvite

export function getApiErrorMessage(data: unknown, fallback: string) {
	if (
		typeof data === 'object' &&
		data !== null &&
		'error' in data &&
		typeof (data as { error?: { message?: unknown } }).error?.message === 'string'
	) {
		return (data as { error: { message: string } }).error.message
	}
	return fallback
}
