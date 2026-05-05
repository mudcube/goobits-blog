import {
	createAdminEventsBatch,
	loadAdminEventsData,
	loadAdminEventTemplates,
	loadAdminEventDetail,
	promoteWaitlistEntry,
	updateAdminEventCapacityValue,
	updateAdminEventDetailsValue,
	updateAdminEventAttendanceValue,
	updateAdminEventMemoryValue,
	updateAdminEventRecapValue,
	uploadAdminEventHeroValue,
	clearAdminEventHeroValue,
	deleteAdminEventValue
} from '../dashboard/admin-dashboard'

export type EventRecord = {
	id: number
	activitySlug: string
	activityLabel: string
	title: string
	startsAt: string
	endsAt: string
	capacity: number
	seatsTaken: number
	seatsLeft: number
	waitlistCount: number
	costCents: number
	currency: string
	paymentProvider: string | null
	paymentHandle: string | null
	paymentNoteTemplate: string | null
	recapText: string | null
	heroImageUrl: string | null
	participants: Array<{
		userId: string
		name: string | null
		avatarUrl: string | null
		joinedAt: string | null
	}>
}

export type EventDraft = {
	activitySlug: string
	title: string
	startsAt: string
	endsAt: string
	capacity: number
	repeatWeeks: number
	costCents: number
	currency: string
	paymentProvider: string
	paymentHandle: string
	paymentNoteTemplate: string
	location: string
	note: string
}

export type EventTemplate = {
	id: number
	title: string
	activitySlug: string
	capacity: number
	costCents: number
	currency: string
	paymentProvider: string | null
	paymentHandle: string | null
	paymentNoteTemplate: string | null
	location: string | null
	note: string | null
}

export type EventDetailState = {
	event: {
		id: number
		activitySlug: string
		activityLabel: string
		title: string
		startsAt: string
		endsAt: string
		capacity: number
		waitlistCount: number
		recapText: string | null
		heroImageUrl: string | null
	}
	attendees: Array<{
		entryId: number
		userId: string
		name: string | null
		email: string | null
		status: 'joined' | 'waitlist'
		waitlistPosition: number | null
		attendanceStatus: 'unknown' | 'attended' | 'flaked'
		joinedAt: string
	}>
	weather: { summary: string; temperatureF: number } | null
}

type PaymentProviderKey = 'venmo' | 'paypal' | 'cashapp'

type PaymentDefaultsLike = {
	provider: string
	handle: string
	handles: Record<PaymentProviderKey, string>
}

type ControllerOptions = {
	onUnauthorized?: ((error: unknown) => boolean) | undefined
	getPaymentDefaults?: (() => PaymentDefaultsLike) | undefined
}

const PAYMENT_PROVIDER_KEYS: PaymentProviderKey[] = ['venmo', 'paypal', 'cashapp']

function paymentHandleFor(
	defaults: PaymentDefaultsLike,
	provider: string | null | undefined
) {
	const key = provider as PaymentProviderKey
	return PAYMENT_PROVIDER_KEYS.includes(key) ? defaults.handles[key] : ''
}

function normalizeLocalDateTimeInput(value: string) {
	const date = new Date(value)
	return Number.isFinite(date.getTime()) ? date.toISOString() : value
}

const BLANK_DRAFT: EventDraft = {
	activitySlug: '',
	title: '',
	startsAt: '',
	endsAt: '',
	capacity: 4,
	repeatWeeks: 0,
	costCents: 0,
	currency: 'USD',
	paymentProvider: 'venmo',
	paymentHandle: '',
	paymentNoteTemplate: '',
	location: '',
	note: ''
}

export function createEventsController(options: ControllerOptions = {}) {
	const { onUnauthorized, getPaymentDefaults } = options

	let events = $state<EventRecord[]>([])
	let recentEvents = $state<EventRecord[]>([])
	let eventsLoading = $state(false)
	let eventsLoaded = $state(false)
	let eventsCreating = $state(false)
	let eventUpdatingId = $state<number | null>(null)
	let eventDraft = $state<EventDraft>({ ...BLANK_DRAFT })
	let eventTemplates = $state<EventTemplate[]>([])
	let selectedEventDetail = $state<EventDetailState | null>(null)
	let error = $state('')

	function applyUpcoming(input: EventRecord[]) {
		events = input
		eventsLoaded = true
	}

	function applyRecent(input: EventRecord[]) {
		recentEvents = input
		eventsLoaded = true
	}

	function setActivitySlugIfMissing(slug: string) {
		if (eventDraft.activitySlug === slug) return
		eventDraft = { ...eventDraft, activitySlug: slug }
	}

	function applyPaymentDefaultsToDraft(defaults: PaymentDefaultsLike) {
		if (!eventDraft.paymentProvider && defaults.provider) {
			eventDraft = { ...eventDraft, paymentProvider: defaults.provider }
		}
		if (!eventDraft.paymentHandle) {
			const handle = paymentHandleFor(
				defaults,
				eventDraft.paymentProvider || defaults.provider
			)
			if (handle) eventDraft = { ...eventDraft, paymentHandle: handle }
		}
	}

	async function loadEvents() {
		eventsLoading = true
		error = ''
		try {
			const result = await loadAdminEventsData()
			events = result.upcoming
			recentEvents = result.recent
			error = result.error
			const templatesResult = await loadAdminEventTemplates()
			eventTemplates = templatesResult.templates
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to load events'
		} finally {
			eventsLoading = false
			eventsLoaded = true
		}
	}

	async function createEvents() {
		eventsCreating = true
		error = ''
		try {
			if (!eventDraft.activitySlug) {
				error = 'Select a program before creating events.'
				return
			}
			if (!eventDraft.title || !eventDraft.startsAt || !eventDraft.endsAt) {
				error = 'Title, start, and end are required.'
				return
			}
			const result = await createAdminEventsBatch({
				...eventDraft,
				startsAt: normalizeLocalDateTimeInput(eventDraft.startsAt),
				endsAt: normalizeLocalDateTimeInput(eventDraft.endsAt)
			})
			if (!result.ok) {
				error = result.error
				return
			}
			eventDraft = {
				...eventDraft,
				title: '',
				location: '',
				note: '',
				repeatWeeks: 0,
				costCents: 0,
				paymentHandle: '',
				paymentNoteTemplate: ''
			}
			await loadEvents()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to create events'
		} finally {
			eventsCreating = false
		}
	}

	function applyTemplate(templateId: number) {
		const template = eventTemplates.find((item) => item.id === templateId)
		if (!template) return
		const paymentDefaults = getPaymentDefaults?.()
		eventDraft = {
			...eventDraft,
			activitySlug: template.activitySlug,
			title: template.title,
			capacity: template.capacity,
			costCents: template.costCents,
			currency: template.currency || 'USD',
			paymentProvider:
				template.paymentProvider ?? paymentDefaults?.provider ?? 'venmo',
			paymentHandle:
				template.paymentHandle ??
				(paymentDefaults
					? paymentHandleFor(
							paymentDefaults,
							template.paymentProvider ?? paymentDefaults.provider
						)
					: '') ??
				'',
			paymentNoteTemplate: template.paymentNoteTemplate ?? '',
			location: template.location ?? '',
			note: template.note ?? ''
		}
	}

	async function openEventDetail(eventId: number) {
		error = ''
		try {
			const result = await loadAdminEventDetail(eventId)
			selectedEventDetail = {
				event: {
					id: result.event.id,
					activitySlug: result.event.activitySlug,
					activityLabel: result.event.activityLabel,
					title: result.event.title,
					startsAt: result.event.startsAt,
					endsAt: result.event.endsAt,
					capacity: result.event.capacity,
					waitlistCount: result.event.waitlistCount,
					recapText: result.event.recapText,
					heroImageUrl: result.event.heroImageUrl
				},
				attendees: result.attendees,
				weather: result.weather
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to load event detail'
		}
	}

	function closeEventDetail() {
		selectedEventDetail = null
	}

	async function promoteWaitlist(eventId: number, entryId: number) {
		error = ''
		try {
			const result = await promoteWaitlistEntry(eventId, entryId)
			if (result.status === 'full') {
				error = "Event is full; couldn't promote."
				return
			}
			if (result.status === 'already_joined') {
				error = 'Already joined this event.'
				return
			}
			await Promise.all([loadEvents(), openEventDetail(eventId)])
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to promote waitlist user'
		}
	}

	async function updateEventCapacity(eventId: number, capacity: number) {
		eventUpdatingId = eventId
		error = ''
		try {
			const result = await updateAdminEventCapacityValue(eventId, capacity)
			if (!result.ok) {
				error = result.error
				return
			}
			events = events.map((event) =>
				event.id === eventId ? { ...event, capacity } : event
			)
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to update event capacity'
		} finally {
			eventUpdatingId = null
		}
	}

	async function updateEventDetails(
		eventId: number,
		input: { title: string; startsAt: string; endsAt: string }
	) {
		eventUpdatingId = eventId
		error = ''
		try {
			const normalizedInput = {
				...input,
				startsAt: normalizeLocalDateTimeInput(input.startsAt),
				endsAt: normalizeLocalDateTimeInput(input.endsAt)
			}
			const result = await updateAdminEventDetailsValue(eventId, normalizedInput)
			if (!result.ok) {
				error = result.error
				return
			}
			events = events.map((event) =>
				event.id === eventId
					? {
							...event,
							title: normalizedInput.title,
							startsAt: normalizedInput.startsAt,
							endsAt: normalizedInput.endsAt
						}
					: event
			)
			recentEvents = recentEvents.map((event) =>
				event.id === eventId
					? {
							...event,
							title: normalizedInput.title,
							startsAt: normalizedInput.startsAt,
							endsAt: normalizedInput.endsAt
						}
					: event
			)
			if (selectedEventDetail?.event.id === eventId) {
				selectedEventDetail = {
					...selectedEventDetail,
					event: {
						...selectedEventDetail.event,
						title: normalizedInput.title,
						startsAt: normalizedInput.startsAt,
						endsAt: normalizedInput.endsAt
					}
				}
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to update event details'
		} finally {
			eventUpdatingId = null
		}
	}

	async function updateEventAttendance(
		eventId: number,
		userId: string,
		attendanceStatus: 'unknown' | 'attended' | 'flaked'
	) {
		eventUpdatingId = eventId
		error = ''
		try {
			const result = await updateAdminEventAttendanceValue(eventId, {
				userId,
				attendanceStatus
			})
			if (!result.ok) {
				error = result.error
				return
			}
			if (selectedEventDetail?.event.id === eventId) {
				selectedEventDetail = {
					...selectedEventDetail,
					attendees: selectedEventDetail.attendees.map((attendee) =>
						attendee.userId === userId ? { ...attendee, attendanceStatus } : attendee
					)
				}
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to update attendance'
		} finally {
			eventUpdatingId = null
		}
	}

	async function updateEventMemory(
		eventId: number,
		recapText: string,
		heroImageUrl: string
	) {
		eventUpdatingId = eventId
		error = ''
		try {
			const result = await updateAdminEventMemoryValue(eventId, {
				recapText,
				heroImageUrl
			})
			if (!result.ok) {
				error = result.error
				return
			}
			recentEvents = recentEvents.map((event) =>
				event.id === eventId ? { ...event, recapText, heroImageUrl } : event
			)
			if (selectedEventDetail?.event.id === eventId) {
				selectedEventDetail = {
					...selectedEventDetail,
					event: {
						...selectedEventDetail.event,
						recapText,
						heroImageUrl: heroImageUrl || null
					}
				}
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to update event memory'
		} finally {
			eventUpdatingId = null
		}
	}

	async function updateEventRecap(eventId: number, recapText: string) {
		eventUpdatingId = eventId
		error = ''
		try {
			const result = await updateAdminEventRecapValue(eventId, recapText)
			if (!result.ok) {
				error = result.error
				return
			}
			events = events.map((event) =>
				event.id === eventId ? { ...event, recapText } : event
			)
			recentEvents = recentEvents.map((event) =>
				event.id === eventId ? { ...event, recapText } : event
			)
			if (selectedEventDetail?.event.id === eventId) {
				selectedEventDetail = {
					...selectedEventDetail,
					event: { ...selectedEventDetail.event, recapText }
				}
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to save description'
		} finally {
			eventUpdatingId = null
		}
	}

	function applyHeroImage(eventId: number, heroImageUrl: string | null) {
		events = events.map((event) =>
			event.id === eventId ? { ...event, heroImageUrl } : event
		)
		recentEvents = recentEvents.map((event) =>
			event.id === eventId ? { ...event, heroImageUrl } : event
		)
		if (selectedEventDetail?.event.id === eventId) {
			selectedEventDetail = {
				...selectedEventDetail,
				event: { ...selectedEventDetail.event, heroImageUrl }
			}
		}
	}

	async function uploadEventHero(eventId: number, file: File) {
		eventUpdatingId = eventId
		error = ''
		try {
			const result = await uploadAdminEventHeroValue(eventId, file)
			if (!result.ok) {
				error = result.error
				return null
			}
			applyHeroImage(eventId, result.url)
			return result.url
		} catch (err) {
			if (onUnauthorized?.(err)) return null
			error = err instanceof Error ? err.message : 'Failed to upload image'
			return null
		} finally {
			eventUpdatingId = null
		}
	}

	async function clearEventHero(eventId: number) {
		eventUpdatingId = eventId
		error = ''
		try {
			const result = await clearAdminEventHeroValue(eventId)
			if (!result.ok) {
				error = result.error
				return false
			}
			applyHeroImage(eventId, null)
			return true
		} catch (err) {
			if (onUnauthorized?.(err)) return false
			error = err instanceof Error ? err.message : 'Failed to remove image'
			return false
		} finally {
			eventUpdatingId = null
		}
	}

	async function deleteEvent(eventId: number) {
		eventUpdatingId = eventId
		error = ''
		try {
			const result = await deleteAdminEventValue(eventId)
			if (!result.ok) {
				error = result.error
				return
			}
			events = events.filter((event) => event.id !== eventId)
			recentEvents = recentEvents.filter((event) => event.id !== eventId)
			if (selectedEventDetail?.event.id === eventId) {
				selectedEventDetail = null
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to delete event'
		} finally {
			eventUpdatingId = null
		}
	}

	return {
		get events() { return events },
		get recentEvents() { return recentEvents },
		get eventsLoading() { return eventsLoading },
		get eventsLoaded() { return eventsLoaded },
		get eventsCreating() { return eventsCreating },
		get eventUpdatingId() { return eventUpdatingId },
		get eventDraft() { return eventDraft },
		set eventDraft(value) { eventDraft = value },
		get eventTemplates() { return eventTemplates },
		get selectedEventDetail() { return selectedEventDetail },
		get error() { return error },
		applyUpcoming,
		applyRecent,
		applyPaymentDefaultsToDraft,
		setActivitySlugIfMissing,
		loadEvents,
		createEvents,
		applyTemplate,
		openEventDetail,
		closeEventDetail,
		promoteWaitlist,
		updateEventCapacity,
		updateEventDetails,
		updateEventAttendance,
		updateEventMemory,
		updateEventRecap,
		uploadEventHero,
		clearEventHero,
		deleteEvent
	}
}

export type AdminEventsController = ReturnType<typeof createEventsController>
