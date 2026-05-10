import type { createAdminDashboardController } from '../../dashboard/admin-dashboard-controller.svelte'
import { blankDraft, draftsEqual, type DayDraft } from './day-dialog.types'

type DashboardController = ReturnType<typeof createAdminDashboardController>

export type ActiveDay = {
	time: string
	capacity: number
	repeatLabel?: string
	count: number
}

/**
 * Narrow view of the event record this controller consumes. The events
 * controller's full `EventRecord` type satisfies this structurally — naming
 * the projection separately keeps the dependency surface explicit (so it's
 * obvious which event fields the day-schedule logic actually reads).
 */
type EventRecordView = {
	id: number
	activitySlug: string
	startsAt: string
	endsAt: string
	capacity: number
	seatsTaken?: number
	title: string
}

type Options = {
	getDashboard: () => DashboardController
	getSlug: () => string
	getEventsSource: () => readonly EventRecordView[]
	isReady: () => boolean
	isMockMode: () => boolean
	flash: (message: string, isError?: boolean) => void
}

// Re-export the canonical isoDay from @calendar/core; previously
// duplicated locally before the consolidation.
import { isoDay } from '@calendar/core'
export { isoDay }

export function isPast(date: Date): boolean {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	return date < today
}

export function isToday(date: Date): boolean {
	const now = new Date()
	return (
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth() &&
		date.getDate() === now.getDate()
	)
}

export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}

export function createDayScheduleController({
	getDashboard,
	getSlug,
	getEventsSource,
	isReady,
	isMockMode,
	flash
}: Options) {
	let currentMonth = $state(new Date())
	let selectedDayDate = $state<Date | null>(null)
	let popOpen = $state(false)
	let selectedEventId = $state<number | null>(null)
	const popDraft = $state<DayDraft>(blankDraft('10:30', 8))
	let originalPopDraft = $state<DayDraft>(blankDraft('10:30', 8))
	let pendingDayDate = $state<Date | null>(null)
	let activeDays = $state<Record<string, ActiveDay>>({})

	$effect(() => {
		if (!isReady()) return
		const slug = getSlug()
		const map: Record<string, ActiveDay> = {}
		for (const ev of getEventsSource()) {
			if (ev.activitySlug !== slug) continue
			const d = new Date(ev.startsAt)
			if (
				d.getFullYear() !== currentMonth.getFullYear() ||
				d.getMonth() !== currentMonth.getMonth()
			) {
				continue
			}
			const dayKey = isoDay(d)
			if (map[dayKey]) {
				map[dayKey] = { ...map[dayKey], count: (map[dayKey]?.count || 1) + 1 }
				continue
			}
			map[dayKey] = {
				time: d.toLocaleTimeString(undefined, {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				}),
				capacity: ev.capacity,
				repeatLabel: `Every ${d.toLocaleDateString(undefined, { weekday: 'long' })}`,
				count: 1
			}
		}
		activeDays = map
	})

	$effect(() => {
		if (!popOpen || !selectedDayDate) return
		const dayKey = isoDay(selectedDayDate)
		if (!activeDays[dayKey]) return
		const current = activeDays[dayKey] as ActiveDay
		if (current.time === popDraft.time && current.capacity === popDraft.capacity) return
		activeDays = {
			...activeDays,
			[dayKey]: { ...current, time: popDraft.time, capacity: popDraft.capacity }
		}
	})

	function applyDraft(dayDate: Date) {
		selectedDayDate = dayDate
		const existing = activeDays[isoDay(dayDate)]
		popDraft.time = existing?.time ?? '10:30'
		popDraft.capacity = existing?.capacity ?? 8
		popDraft.repeat = existing ? !!existing.repeatLabel : false
		popDraft.untilMode = 'ongoing'
		popDraft.untilDate = ''
		originalPopDraft = { ...popDraft }
		const slug = getSlug()
		const eventForDay = getEventsSource().find((ev) => {
			if (ev.activitySlug !== slug) return false
			const d = new Date(ev.startsAt)
			return (
				d.getFullYear() === dayDate.getFullYear() &&
				d.getMonth() === dayDate.getMonth() &&
				d.getDate() === dayDate.getDate()
			)
		})
		selectedEventId = eventForDay?.id ?? null
		popOpen = true
	}

	function openDay(dayDate: Date) {
		if (isPast(dayDate)) return
		if (
			popOpen &&
			selectedDayDate &&
			!isSameDay(selectedDayDate, dayDate) &&
			!draftsEqual(popDraft, originalPopDraft)
		) {
			pendingDayDate = dayDate
			return
		}
		applyDraft(dayDate)
	}

	function cancelDiscard() {
		pendingDayDate = null
	}

	function confirmDiscard() {
		const next = pendingDayDate
		pendingDayDate = null
		if (next) applyDraft(next)
	}

	function closePop() {
		popOpen = false
		selectedDayDate = null
		selectedEventId = null
		pendingDayDate = null
	}

	function prevMonth() {
		const now = new Date()
		const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		if (prev.getFullYear() < now.getFullYear()) return
		if (prev.getFullYear() === now.getFullYear() && prev.getMonth() < now.getMonth()) return
		currentMonth = prev
		closePop()
	}

	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		closePop()
	}

	type RepeatPlan = { weeks: number } | { error: string }

	function computeRepeatWeeks(startDate: Date): RepeatPlan {
		if (!popDraft.repeat) return { weeks: 0 }
		if (popDraft.untilMode === 'ongoing') return { weeks: 12 }
		const target = Date.parse(popDraft.untilDate)
		if (!Number.isFinite(target)) return { weeks: 12 }
		const diffMs = target - startDate.getTime()
		if (diffMs <= 0) {
			return { error: 'Repeat-until date must be after the start date.' }
		}
		return { weeks: Math.min(52, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))) }
	}

	async function persistDaySchedule() {
		if (!selectedDayDate) return
		if (isMockMode()) {
			const dayKey = isoDay(selectedDayDate)
			const nextDay: ActiveDay = {
				time: popDraft.time,
				capacity: popDraft.capacity,
				count: activeDays[dayKey]?.count || 1,
				...(popDraft.repeat
					? {
							repeatLabel: `Every ${selectedDayDate.toLocaleDateString(undefined, { weekday: 'long' })}`
						}
					: {})
			}
			activeDays = { ...activeDays, [dayKey]: nextDay }
			flash('Mock mode: schedule preview updated')
			closePop()
			return
		}
		const [hours, minutes] = popDraft.time.split(':').map((part) => Number.parseInt(part, 10))
		const safeHours = Number.isFinite(hours) ? (hours as number) : 10
		const safeMinutes = Number.isFinite(minutes) ? (minutes as number) : 30
		const start = new Date(selectedDayDate)
		start.setHours(safeHours, safeMinutes, 0, 0)
		const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
		const repeatPlan = computeRepeatWeeks(start)
		if ('error' in repeatPlan) {
			flash(repeatPlan.error, true)
			return
		}
		const dashboard = getDashboard()
		const draft = dashboard.programDraft
		const eventDraft = dashboard.eventDraft
		const activity = draft.slug || getSlug()
		const title = draft.label ? `${draft.label} Event` : 'Event'

		dashboard.eventDraft = {
			...eventDraft,
			activitySlug: activity,
			title,
			startsAt: start.toISOString(),
			endsAt: end.toISOString(),
			capacity: popDraft.capacity,
			repeatWeeks: repeatPlan.weeks,
			costCents: eventDraft.costCents || 0,
			currency: eventDraft.currency || 'USD',
			paymentProvider: eventDraft.paymentProvider || 'venmo',
			paymentHandle: eventDraft.paymentHandle || '',
			paymentNoteTemplate: eventDraft.paymentNoteTemplate || '',
			location: eventDraft.location || '',
			note: eventDraft.note || ''
		}

		await dashboard.createEvents()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Event schedule added')
		closePop()
	}

	async function removeDay() {
		if (isMockMode()) {
			if (!selectedDayDate) return
			const next = { ...activeDays }
			delete next[isoDay(selectedDayDate)]
			activeDays = next
			flash('Mock mode: removed from preview')
			closePop()
			return
		}
		if (selectedEventId) {
			const dashboard = getDashboard()
			await dashboard.deleteEvent(selectedEventId)
			if (dashboard.error) {
				flash(dashboard.error, true)
				return
			}
			flash('Event removed')
			closePop()
			return
		}
		if (!selectedDayDate) return
		const next = { ...activeDays }
		delete next[isoDay(selectedDayDate)]
		activeDays = next
		closePop()
	}

	async function persistExistingDayEdits() {
		if (isMockMode()) {
			flash('Mock mode: edits are preview-only')
			closePop()
			return
		}
		if (!selectedEventId) {
			closePop()
			return
		}
		const dashboard = getDashboard()
		const selectedEvent = getEventsSource().find((ev) => ev.id === selectedEventId)
		if (popDraft.capacity !== originalPopDraft.capacity) {
			await dashboard.updateEventCapacity(selectedEventId, popDraft.capacity)
			if (dashboard.error) {
				flash(dashboard.error, true)
				return
			}
		}
		if (popDraft.time !== originalPopDraft.time && selectedDayDate && selectedEvent) {
			const [hours, minutes] = popDraft.time.split(':').map((part) => Number.parseInt(part, 10))
			const safeHours = Number.isFinite(hours) ? (hours as number) : 10
			const safeMinutes = Number.isFinite(minutes) ? (minutes as number) : 30
			const originalStartMs = new Date(selectedEvent.startsAt).getTime()
			const originalEndMs = new Date(selectedEvent.endsAt).getTime()
			const durationMs = Math.max(15 * 60 * 1000, originalEndMs - originalStartMs)
			const nextStart = new Date(selectedDayDate)
			nextStart.setHours(safeHours, safeMinutes, 0, 0)
			const nextEnd = new Date(nextStart.getTime() + durationMs)
			await dashboard.updateEventDetails(selectedEventId, {
				title: selectedEvent.title,
				startsAt: nextStart.toISOString(),
				endsAt: nextEnd.toISOString()
			})
			if (dashboard.error) {
				flash(dashboard.error, true)
				return
			}
		}
		if (!draftsEqual(popDraft, originalPopDraft)) flash('Event updated')
		closePop()
	}

	return {
		get currentMonth() {
			return currentMonth
		},
		get selectedDayDate() {
			return selectedDayDate
		},
		get popOpen() {
			return popOpen
		},
		get selectedEventId() {
			return selectedEventId
		},
		get pendingDayDate() {
			return pendingDayDate
		},
		get activeDays() {
			return activeDays
		},
		popDraft,
		openDay,
		closePop,
		cancelDiscard,
		confirmDiscard,
		prevMonth,
		nextMonth,
		persistDaySchedule,
		removeDay,
		persistExistingDayEdits
	}
}

export type DayScheduleController = ReturnType<typeof createDayScheduleController>
