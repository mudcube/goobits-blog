import type { AdminBootstrap } from '@calendar/core/admin'
import { createEventsController } from '../events/events-controller.svelte'
import { createProgramsController } from '../programs/programs-controller.svelte'
import { createSyncController } from '../settings/sync-controller.svelte'
import { DEFAULT_ADMIN_RULES, DEFAULT_ADMIN_STATS } from '../shared/admin'
import {
	deletePaymentIntegration,
	loadAdminPaymentDefaults,
	loadPaymentIntegrations,
	loadDashboardBookings,
	loadDashboardStatus,
	saveAdminPaymentDefaults,
	saveDashboardRules,
	savePayPalIntegration,
	saveSquareIntegration
} from './admin-dashboard'

type UnauthorizedHandler = (error: unknown) => boolean

type DashboardControllerOptions = {
	onUnauthorized?: UnauthorizedHandler
}

type PaymentIntegrations = {
	paypal: {
		clientId: string | null
		environment: 'sandbox' | 'live'
		source: 'stored' | 'env' | null
		enabled: boolean
	}
	square: {
		applicationId: string | null
		locationId: string | null
		environment: 'sandbox' | 'production'
		source: 'stored' | 'env' | null
		enabled: boolean
	}
}

type PaymentProviderKey = 'venmo' | 'paypal' | 'cashapp'

type PaymentDefaults = {
	provider: string
	handle: string
	primaryProvider: PaymentProviderKey | ''
	handles: Record<PaymentProviderKey, string>
}

const PAYMENT_PROVIDER_KEYS: PaymentProviderKey[] = ['venmo', 'paypal', 'cashapp']

function blankPaymentDefaults(): PaymentDefaults {
	return {
		provider: '',
		handle: '',
		primaryProvider: '',
		handles: {
			venmo: '',
			paypal: '',
			cashapp: ''
		}
	}
}

function normalizePaymentDefaults(
	input:
		| {
				provider?: string | null | undefined
				handle?: string | null | undefined
				primaryProvider?: string | null | undefined
				handles?: Partial<Record<PaymentProviderKey, string | null>> | undefined
		  }
		| null
		| undefined
): PaymentDefaults {
	const provider = (input?.primaryProvider ?? input?.provider ?? '') || ''
	const normalizedProvider = PAYMENT_PROVIDER_KEYS.includes(
		provider as PaymentProviderKey
	)
		? (provider as PaymentProviderKey)
		: ''
	const handles = blankPaymentDefaults().handles
	for (const key of PAYMENT_PROVIDER_KEYS) {
		handles[key] = input?.handles?.[key] ?? ''
	}
	if (normalizedProvider && !handles[normalizedProvider] && input?.handle) {
		handles[normalizedProvider] = input.handle
	}
	return {
		provider: normalizedProvider,
		handle: normalizedProvider ? handles[normalizedProvider] : '',
		primaryProvider: normalizedProvider,
		handles
	}
}

export function createAdminDashboardController(
	options: DashboardControllerOptions = {}
) {
	const { onUnauthorized } = options

	let hours = $state({ ...DEFAULT_ADMIN_RULES.hours })
	let buffer = $state(DEFAULT_ADMIN_RULES.buffer)
	let notice = $state(DEFAULT_ADMIN_RULES.notice)
	let capacity = $state(DEFAULT_ADMIN_RULES.capacity)
	let saved = $state(false)
	let saving = $state(false)
	const syncController = createSyncController({ onUnauthorized })
	const programsController = createProgramsController({ onUnauthorized })
	const eventsController = createEventsController({
		onUnauthorized,
		getPaymentDefaults: () => paymentDefaults
	})
	let bookings = $state<unknown[]>([])
	let paymentDefaults = $state<PaymentDefaults>(blankPaymentDefaults())
	let paymentIntegrations = $state<PaymentIntegrations>({
		paypal: {
			clientId: null,
			environment: 'sandbox',
			source: null,
			enabled: false
		},
		square: {
			applicationId: null,
			locationId: null,
			environment: 'sandbox',
			source: null,
			enabled: false
		}
	})
	let stats = $state(DEFAULT_ADMIN_STATS)
	let loading = $state(true)
	let error = $state('')

	function alignEventDraftWithPrograms() {
		const programs = programsController.programs
		const draft = eventsController.eventDraft
		const firstEnabled = programs.find((program) => program.enabled)
		if (
			firstEnabled &&
			(!draft.activitySlug ||
				!programs.some(
					(program) => program.slug === draft.activitySlug && program.enabled
				))
		) {
			eventsController.setActivitySlugIfMissing(firstEnabled.slug)
		}
	}

	function bootstrap(input: Partial<AdminBootstrap> | null | undefined) {
		if (!input) return
		if (input.programs) {
			programsController.applyPrograms(input.programs as never)
			alignEventDraftWithPrograms()
		}
		if (input.upcoming) {
			eventsController.applyUpcoming(input.upcoming as never)
		}
		if (input.recent) {
			eventsController.applyRecent(input.recent as never)
		}
		if (input.paymentDefaults) {
			paymentDefaults = normalizePaymentDefaults(input.paymentDefaults)
		}
		if (input.paymentIntegrations) {
			paymentIntegrations = input.paymentIntegrations
		}
	}

	async function loadStatus() {
		try {
			const dashboardStatus = await loadDashboardStatus()
			syncController.applyStatus(dashboardStatus)
			paymentDefaults = dashboardStatus.paymentDefaults
				? normalizePaymentDefaults(dashboardStatus.paymentDefaults)
				: paymentDefaults
			paymentIntegrations =
				dashboardStatus.paymentIntegrations ?? paymentIntegrations
			if (dashboardStatus.rules) {
				hours = {
					from: dashboardStatus.rules.hoursFrom,
					to: dashboardStatus.rules.hoursTo
				}
				buffer = dashboardStatus.rules.buffer
				notice = dashboardStatus.rules.notice
				capacity = dashboardStatus.rules.capacity
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			console.error('Failed to load status:', err)
		}
	}

	async function loadPaymentDefaults() {
		try {
			const result = await loadAdminPaymentDefaults()
			paymentDefaults = normalizePaymentDefaults(result.payment)
			eventsController.applyPaymentDefaultsToDraft(paymentDefaults)
		} catch (err) {
			if (onUnauthorized?.(err)) return
		}
	}

	async function savePaymentDefaults() {
		error = ''
		try {
			const primaryProvider =
				paymentDefaults.primaryProvider.trim() || paymentDefaults.provider.trim()
			const handles = {
				venmo: paymentDefaults.handles.venmo.trim() || null,
				paypal: paymentDefaults.handles.paypal.trim() || null,
				cashapp: paymentDefaults.handles.cashapp.trim() || null
			}
			if (
				(primaryProvider === 'venmo' ||
					primaryProvider === 'paypal' ||
					primaryProvider === 'cashapp') &&
				!handles[primaryProvider] &&
				paymentDefaults.handle.trim()
			) {
				handles[primaryProvider] = paymentDefaults.handle.trim()
			}
			const result = await saveAdminPaymentDefaults({
				provider: primaryProvider || null,
				handle: paymentDefaults.handle.trim() || null,
				primaryProvider: primaryProvider || null,
				handles
			})
			if (!result.ok) {
				error = result.error
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error =
				err instanceof Error ? err.message : 'Failed to save payment defaults'
		}
	}

	async function loadPaymentProviderIntegrations() {
		try {
			const result = await loadPaymentIntegrations()
			if (result.ok) {
				paymentIntegrations = result.payments
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error =
				err instanceof Error
					? err.message
					: 'Failed to load payment integrations'
		}
	}

	async function connectPayPal(input: {
		clientId: string
		clientSecret: string
		environment: 'sandbox' | 'live'
	}) {
		error = ''
		try {
			const result = await savePayPalIntegration(input)
			if (!result.ok) {
				error = result.error
				return
			}
			await loadPaymentProviderIntegrations()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to save PayPal checkout'
		}
	}

	async function connectSquare(input: {
		applicationId: string
		locationId: string
		accessToken: string
		environment: 'sandbox' | 'live'
	}) {
		error = ''
		try {
			const result = await saveSquareIntegration(input)
			if (!result.ok) {
				error = result.error
				return
			}
			await loadPaymentProviderIntegrations()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to save Cash App Pay'
		}
	}

	async function disconnectPaymentIntegration(provider: 'paypal' | 'square') {
		error = ''
		try {
			const result = await deletePaymentIntegration(provider)
			if (!result.ok) {
				error = result.error
				return
			}
			await loadPaymentProviderIntegrations()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error =
				err instanceof Error
					? err.message
					: 'Failed to disconnect payment integration'
		}
	}

	async function loadBookings() {
		loading = true
		error = ''
		try {
			const dashboardBookings = await loadDashboardBookings()
			bookings = dashboardBookings.bookings
			stats = dashboardBookings.stats || DEFAULT_ADMIN_STATS
			error = dashboardBookings.error
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to load bookings'
		} finally {
			loading = false
		}
	}

	async function save() {
		saving = true
		try {
			const saveResult = await saveDashboardRules({
				hours: { ...hours },
				buffer,
				notice,
				capacity
			})
			if (saveResult.ok) {
				saved = true
				setTimeout(() => {
					saved = false
				}, 2200)
			} else {
				error = saveResult.error
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to save rules'
		} finally {
			saving = false
		}
	}

	async function loadPrograms() {
		await programsController.load()
		alignEventDraftWithPrograms()
	}

	return {
		get hours() { return hours },
		set hours(value) { hours = value },
		get buffer() { return buffer },
		set buffer(value) { buffer = value },
		get notice() { return notice },
		set notice(value) { notice = value },
		get capacity() { return capacity },
		set capacity(value) { capacity = value },
		get saved() { return saved },
		get saving() { return saving },
		get connected() { return syncController.connected },
		get connectionExpired() { return syncController.connectionExpired },
		get connectionRefreshFailed() { return syncController.connectionRefreshFailed },
		get disconnecting() { return syncController.disconnecting },
		get oauth() { return syncController.oauth },
		get sync() { return syncController.sync },
		get syncQueue() { return syncController.syncQueue },
		get syncQueueBusy() { return syncController.syncQueueBusy },
		get paymentDefaults() { return paymentDefaults },
		set paymentDefaults(value) { paymentDefaults = value },
		get paymentIntegrations() { return paymentIntegrations },
		get bookings() { return bookings },
		get stats() { return stats },
		get loading() { return loading },
		get error() {
			return (
				error ||
				syncController.error ||
				programsController.error ||
				eventsController.error
			)
		},
		get programs() { return programsController.programs },
		get programsLoading() { return programsController.programsLoading },
		get programsLoaded() { return programsController.programsLoaded },
		get programUpdatingSlug() { return programsController.programUpdatingSlug },
		get selectedProgramSlug() { return programsController.selectedProgramSlug },
		get programDraft() { return programsController.programDraft },
		set programDraft(value) { programsController.programDraft = value },
		get programSaving() { return programsController.programSaving },
		get programDeleting() { return programsController.programDeleting },
		get enabledPrograms() { return programsController.enabledPrograms },
		get events() { return eventsController.events },
		get recentEvents() { return eventsController.recentEvents },
		get eventsLoading() { return eventsController.eventsLoading },
		get eventsLoaded() { return eventsController.eventsLoaded },
		get eventsCreating() { return eventsController.eventsCreating },
		get eventUpdatingId() { return eventsController.eventUpdatingId },
		get eventDraft() { return eventsController.eventDraft },
		set eventDraft(value) { eventsController.eventDraft = value },
		get eventTemplates() { return eventsController.eventTemplates },
		get selectedEventDetail() { return eventsController.selectedEventDetail },
		bootstrap,
		loadStatus,
		loadBookings,
		loadPaymentDefaults,
		loadPrograms,
		loadEvents: eventsController.loadEvents,
		save,
		reconnect: syncController.reconnect,
		disconnect: syncController.disconnect,
		connectApple: syncController.connectApple,
		loadPaymentProviderIntegrations,
		connectPayPal,
		connectSquare,
		disconnectPaymentIntegration,
		toggleProgram: programsController.toggleProgram,
		selectProgram: programsController.selectProgram,
		newProgramDraft: programsController.newProgramDraft,
		saveProgram: programsController.saveProgram,
		moveProgram: programsController.moveProgram,
		reorderPrograms: programsController.reorderPrograms,
		deleteProgram: programsController.deleteProgram,
		createEvents: eventsController.createEvents,
		applyTemplate: eventsController.applyTemplate,
		openEventDetail: eventsController.openEventDetail,
		closeEventDetail: eventsController.closeEventDetail,
		promoteWaitlist: eventsController.promoteWaitlist,
		updateEventCapacity: eventsController.updateEventCapacity,
		updateEventDetails: eventsController.updateEventDetails,
		updateEventAttendance: eventsController.updateEventAttendance,
		updateEventMemory: eventsController.updateEventMemory,
		updateEventRecap: eventsController.updateEventRecap,
		uploadEventHero: eventsController.uploadEventHero,
		clearEventHero: eventsController.clearEventHero,
		deleteEvent: eventsController.deleteEvent,
		savePaymentDefaults,
		processSyncQueue: syncController.processQueue,
		retryDeadLetters: syncController.retryDeadLetters,
		purgeDeadLetters: syncController.purgeDeadLetters
	}
}
