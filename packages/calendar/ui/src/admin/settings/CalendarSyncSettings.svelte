<script lang="ts">
	import AppleCredentialSheet from './AppleCredentialSheet.svelte'
	import ConnectCalendarSheet from './ConnectCalendarSheet.svelte'
	import SyncCard from './SyncCard.svelte'
	import type { SyncProvider } from './ProviderIcon.svelte'

	type ProviderStatus = {
		connected: boolean
		expired: boolean
		expiresAt: number | null
		refreshFailed: boolean
		active: boolean
	}
	type DashboardSync = {
		activeProvider: SyncProvider | null
		providers: Record<SyncProvider, ProviderStatus>
	}
	type DashboardController = {
		sync: DashboardSync
		disconnecting: boolean
		error: string
		reconnect: (provider: 'google' | 'outlook') => Promise<void>
		disconnect: (provider: SyncProvider) => Promise<void>
		connectApple: (input: {
			username: string
			appPassword: string
			calendarUrl: string
		}) => Promise<void>
	}

	const { dashboard, mockMode = false, showToast } = $props<{
		dashboard: DashboardController
		mockMode?: boolean
		showToast: (message: string, isError?: boolean) => void
	}>()

	const providers: Array<{ value: SyncProvider; label: string; supported: boolean }> = [
		{ value: 'google', label: 'Google Calendar', supported: true },
		{ value: 'apple', label: 'Apple Calendar', supported: true },
		{ value: 'outlook', label: 'Outlook', supported: true }
	]

	const activeStatus = $derived.by(() => {
		const ap = dashboard.sync.activeProvider
		if (!ap) return null
		return dashboard.sync.providers[ap] ?? null
	})

	const activeProvider = $derived<SyncProvider | null>(
		dashboard.sync.activeProvider && activeStatus?.connected && !activeStatus?.expired
			? dashboard.sync.activeProvider
			: null
	)
	const needsReconnect = $derived(
		Boolean(
			dashboard.sync.activeProvider &&
				activeStatus?.connected &&
				(activeStatus?.expired || activeStatus?.refreshFailed)
		)
	)
	const displayedProvider = $derived<SyncProvider | null>(
		activeProvider || (needsReconnect ? dashboard.sync.activeProvider : null)
	)

	let showSwitchSheet = $state(false)
	let showAppleSheet = $state(false)
	let pendingDisconnectAfter = $state<SyncProvider | null>(null)
	let appleBusy = $state(false)
	let appleError = $state('')
	let connectingProvider = $state<SyncProvider | null>(null)

	async function handleReconnect() {
		const provider = dashboard.sync.activeProvider
		if (!provider) return
		if (mockMode) {
			showToast(`${providerLabels(provider)} reconnected`)
			return
		}
		if (provider === 'apple') {
			showAppleSheet = true
			return
		}
		await dashboard.reconnect(provider)
		if (dashboard.error) showToast(dashboard.error, true)
	}

	async function handleDisconnect() {
		const provider = dashboard.sync.activeProvider
		if (!provider) return
		if (mockMode) {
			showToast('Calendar disconnected')
			return
		}
		await dashboard.disconnect(provider)
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		showToast('Calendar disconnected')
	}

	async function handleSwitchContinue(target: SyncProvider, disconnectOld: boolean) {
		showSwitchSheet = false
		const previous = dashboard.sync.activeProvider
		if (target === 'apple') {
			if (disconnectOld && previous && previous !== 'apple') {
				pendingDisconnectAfter = previous
			}
			showAppleSheet = true
			return
		}
		if (mockMode) {
			showToast(`${providerLabels(target)} connected`)
			return
		}
		await dashboard.reconnect(target)
		if (dashboard.error) showToast(dashboard.error, true)
	}

	function providerLabels(p: SyncProvider) {
		const map = { google: 'Google Calendar', apple: 'Apple Calendar', outlook: 'Outlook' } as const
		return map[p]
	}

	async function handleAppleConnect(creds: {
		username: string
		appPassword: string
		calendarUrl: string
	}) {
		appleBusy = true
		appleError = ''
		connectingProvider = 'apple'
		try {
			if (mockMode) {
				showAppleSheet = false
				pendingDisconnectAfter = null
				showToast('Apple Calendar connected')
				return
			}
			await dashboard.connectApple(creds)
			if (dashboard.error) {
				appleError = dashboard.error
				return
			}
			if (pendingDisconnectAfter && pendingDisconnectAfter !== 'apple') {
				await dashboard.disconnect(pendingDisconnectAfter)
			}
			pendingDisconnectAfter = null
			showAppleSheet = false
			showToast('Apple Calendar connected')
		} finally {
			appleBusy = false
			connectingProvider = null
		}
	}

	function closeAppleSheet() {
		showAppleSheet = false
		pendingDisconnectAfter = null
		appleError = ''
	}
</script>

<section class="calendar-sync-settings admin-settings__section">
	<div class="admin-settings__section-head">
		<div>
			<h4>CALENDAR SYNC</h4>
		</div>
	</div>

	<SyncCard
		active={activeProvider}
		connecting={connectingProvider}
		statusLabel={null}
		expiringSoon={needsReconnect}
		onConnectStart={() => (showSwitchSheet = true)}
		onSwitch={() => (showSwitchSheet = true)}
		onReconnect={() => void handleReconnect()}
		onDisconnect={() => void handleDisconnect()}
	/>
</section>

{#if showSwitchSheet}
	<ConnectCalendarSheet
		current={displayedProvider}
		currentStatusLabel={null}
		{providers}
		onCancel={() => (showSwitchSheet = false)}
		onContinue={(target, disconnectOld) => void handleSwitchContinue(target, disconnectOld)}
	/>
{/if}

{#if showAppleSheet}
	<AppleCredentialSheet
		busy={appleBusy}
		errorMessage={appleError}
		onCancel={closeAppleSheet}
		onConnect={(creds) => void handleAppleConnect(creds)}
	/>
{/if}
