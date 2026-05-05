import {
	connectAppleCalendarCredentials,
	disconnectAppleCalendarReconnect,
	disconnectCalendarReconnect,
	disconnectOutlookCalendarReconnect,
	getCalendarReconnectUrl,
	loadDashboardStatus,
	processDashboardSyncQueue,
	purgeDashboardSyncDeadLetters,
	retryDashboardSyncDeadLetters
} from '../dashboard/admin-dashboard'

export type SyncProviderKey = 'google' | 'outlook' | 'apple'

export type SyncProviderStatus = {
	connected: boolean
	expired: boolean
	expiresAt: number | null
	refreshFailed: boolean
	active: boolean
}

export type SyncOAuthConfig = {
	googleCalendarRedirectUri: string | null
	outlookRedirectUri: string | null
	googleLoginRedirectUri: string
	appleLoginRedirectUri: string
}

export type SyncQueueHealth = {
	pending: number
	processing: number
	failed: number
	deadLetter: number
	oldestPendingSeconds: number
	oldestDeadLetterSeconds: number
	hasBacklogAlert: boolean
	hasDeadLetterAlert: boolean
}

type StatusPayload = Awaited<ReturnType<typeof loadDashboardStatus>>

type ControllerOptions = {
	onUnauthorized?: ((error: unknown) => boolean) | undefined
}

const DEFAULT_PROVIDER_STATUS: SyncProviderStatus = {
	connected: false,
	expired: false,
	expiresAt: null,
	refreshFailed: false,
	active: false
}

const DEFAULT_QUEUE: SyncQueueHealth = {
	pending: 0,
	processing: 0,
	failed: 0,
	deadLetter: 0,
	oldestPendingSeconds: 0,
	oldestDeadLetterSeconds: 0,
	hasBacklogAlert: false,
	hasDeadLetterAlert: false
}

const DEFAULT_OAUTH: SyncOAuthConfig = {
	googleCalendarRedirectUri: null,
	outlookRedirectUri: null,
	googleLoginRedirectUri: '',
	appleLoginRedirectUri: ''
}

export function createSyncController(options: ControllerOptions = {}) {
	const { onUnauthorized } = options

	let connected = $state(false)
	let connectionExpired = $state(false)
	let connectionRefreshFailed = $state(false)
	let disconnecting = $state(false)
	let oauth = $state<SyncOAuthConfig>({ ...DEFAULT_OAUTH })
	let sync = $state<{
		activeProvider: SyncProviderKey | null
		providers: Record<SyncProviderKey, SyncProviderStatus>
	}>({
		activeProvider: null,
		providers: {
			google: { ...DEFAULT_PROVIDER_STATUS },
			outlook: { ...DEFAULT_PROVIDER_STATUS },
			apple: { ...DEFAULT_PROVIDER_STATUS }
		}
	})
	let syncQueue = $state<SyncQueueHealth>({ ...DEFAULT_QUEUE })
	let syncQueueBusy = $state(false)
	let error = $state('')

	function applyStatus(payload: Partial<StatusPayload>) {
		if (payload.connected !== undefined) connected = payload.connected
		if (payload.connectionExpired !== undefined) connectionExpired = payload.connectionExpired
		if (payload.connectionRefreshFailed !== undefined)
			connectionRefreshFailed = payload.connectionRefreshFailed
		if (payload.oauth) oauth = payload.oauth
		if (payload.sync) sync = payload.sync
		if (payload.syncQueue) syncQueue = payload.syncQueue
	}

	async function loadStatus() {
		try {
			const result = await loadDashboardStatus()
			applyStatus(result)
		} catch (err) {
			if (onUnauthorized?.(err)) return
			console.error('Failed to load sync status:', err)
		}
	}

	async function reconnect(provider: 'google' | 'outlook' = 'google') {
		try {
			const result = await getCalendarReconnectUrl(provider)
			if (result.ok) {
				window.location.href = result.authUrl
			} else {
				error = result.error
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : `Failed to connect to ${provider}`
		}
	}

	async function disconnect(provider: SyncProviderKey = 'google') {
		disconnecting = true
		try {
			const result =
				provider === 'outlook'
					? await disconnectOutlookCalendarReconnect()
					: provider === 'apple'
						? await disconnectAppleCalendarReconnect()
						: await disconnectCalendarReconnect()
			if (result.ok) {
				connected = false
				connectionExpired = false
				connectionRefreshFailed = false
				await loadStatus()
			} else {
				error = result.error
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : `Failed to disconnect ${provider}`
		} finally {
			disconnecting = false
		}
	}

	async function connectApple(input: {
		username: string
		appPassword: string
		calendarUrl: string
	}) {
		error = ''
		try {
			const result = await connectAppleCalendarCredentials(input)
			if (!result.ok) {
				error = result.error
				return
			}
			await loadStatus()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to connect Apple Calendar'
		}
	}

	async function processQueue() {
		syncQueueBusy = true
		error = ''
		try {
			const result = await processDashboardSyncQueue(20)
			if (!result.ok) {
				error = result.error
				return
			}
			await loadStatus()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to process sync queue'
		} finally {
			syncQueueBusy = false
		}
	}

	async function retryDeadLetters() {
		syncQueueBusy = true
		error = ''
		try {
			const result = await retryDashboardSyncDeadLetters(20)
			if (!result.ok) {
				error = result.error
				return
			}
			await loadStatus()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to requeue dead-letter jobs'
		} finally {
			syncQueueBusy = false
		}
	}

	async function purgeDeadLetters() {
		syncQueueBusy = true
		error = ''
		try {
			const result = await purgeDashboardSyncDeadLetters(100)
			if (!result.ok) {
				error = result.error
				return
			}
			await loadStatus()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to purge dead-letter jobs'
		} finally {
			syncQueueBusy = false
		}
	}

	return {
		get connected() { return connected },
		get connectionExpired() { return connectionExpired },
		get connectionRefreshFailed() { return connectionRefreshFailed },
		get disconnecting() { return disconnecting },
		get oauth() { return oauth },
		get sync() { return sync },
		get syncQueue() { return syncQueue },
		get syncQueueBusy() { return syncQueueBusy },
		get error() { return error },
		applyStatus,
		loadStatus,
		reconnect,
		disconnect,
		connectApple,
		processQueue,
		retryDeadLetters,
		purgeDeadLetters
	}
}

export type AdminSyncController = ReturnType<typeof createSyncController>
