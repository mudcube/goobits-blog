<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { HandCoins, Landmark, Wallet } from '@lucide/svelte'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import AdminPageHero from '@components/Admin/AdminPageHero.svelte'
	import {
		getAdminCalendarWeekStart,
		setAdminCalendarWeekStart,
		type AdminCalendarWeekStart
	} from '$lib/admin/calendar-preferences'
	import { isAdminMockMode } from '$lib/admin/mock/mock-mode'
	import { mockPaymentDefaults } from '$lib/admin/mock/admin-mock-data'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const mockMode = $derived(isAdminMockMode($page.url))

	let toastMessage = $state('')
	let toastIsError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null
	let paymentAutosaveTimer: ReturnType<typeof setTimeout> | null = null
	let weekStartAutosaveTimer: ReturnType<typeof setTimeout> | null = null
	let suspendPaymentAutosave = $state(true)
	let suspendWeekStartAutosave = $state(true)

	type PaymentMethodKey = 'venmo' | 'zelle' | 'cashapp'
	type PaymentMethodState = Record<PaymentMethodKey, { enabled: boolean; handle: string }>

	function blankPaymentMethods(): PaymentMethodState {
		return {
			venmo: { enabled: false, handle: '' },
			zelle: { enabled: false, handle: '' },
			cashapp: { enabled: false, handle: '' }
		}
	}

	let paymentMethods = $state<PaymentMethodState>(blankPaymentMethods())
	let initialPaymentMethods = $state<PaymentMethodState>(blankPaymentMethods())
	type SyncProviderKey = 'google' | 'apple' | 'outlook'
	type SyncConnections = Record<SyncProviderKey, boolean>
	type SyncBusy = Record<SyncProviderKey, boolean>
	let syncConnections = $state<SyncConnections>({
		google: false,
		apple: false,
		outlook: false
	})
	let syncBusy = $state<SyncBusy>({
		google: false,
		apple: false,
		outlook: false
	})
	let syncOptionsExpanded = $state(false)
	let calendarWeekStart = $state<AdminCalendarWeekStart>('monday')
	const syncProviders: Array<{ value: SyncProviderKey; label: string }> = [
		{ value: 'google', label: 'Google Calendar' },
		{ value: 'apple', label: 'Apple Calendar' },
		{ value: 'outlook', label: 'Outlook' }
	]

	function singleSyncConnection(next: SyncConnections): SyncConnections {
		if (next.google) return { google: true, apple: false, outlook: false }
		if (next.apple) return { google: false, apple: true, outlook: false }
		if (next.outlook) return { google: false, apple: false, outlook: true }
		return { google: false, apple: false, outlook: false }
	}

	function setConnectedProvider(provider: SyncProviderKey | null) {
		if (!provider) {
			syncConnections = { google: false, apple: false, outlook: false }
			return
		}
		syncConnections = {
			google: provider === 'google',
			apple: provider === 'apple',
			outlook: provider === 'outlook'
		}
	}

	function sameSyncConnections(a: SyncConnections, b: SyncConnections) {
		return a.google === b.google && a.apple === b.apple && a.outlook === b.outlook
	}

	const paymentProviders = [
		{ value: 'venmo' as const, label: 'Venmo', icon: HandCoins, placeholder: 'e.g. @yourname' },
		{ value: 'zelle' as const, label: 'Zelle', icon: Landmark, placeholder: 'Email or phone' },
		{ value: 'cashapp' as const, label: 'Cash App', icon: Wallet, placeholder: 'e.g. $yourname' }
	]
	const weekStartOptions: Array<{ value: AdminCalendarWeekStart; label: string }> = [
		{ value: 'monday', label: 'Monday' },
		{ value: 'sunday', label: 'Sunday' }
	]

	function paymentSnapshot(methods: PaymentMethodState) {
		return JSON.stringify(methods)
	}

	function hydratePaymentMethods(provider: string | null | undefined, handle: string | null | undefined) {
		const next = blankPaymentMethods()
		const key = (provider || '').toLowerCase()
		if (key === 'venmo' || key === 'zelle' || key === 'cashapp') {
			next[key] = {
				enabled: true,
				handle: (handle || '').trim()
			}
		}
		return next
	}

	$effect(() => {
		if (!authed) return
		if (mockMode) {
			const next = hydratePaymentMethods(mockPaymentDefaults.provider, mockPaymentDefaults.handle)
			paymentMethods = next
			initialPaymentMethods = {
				venmo: { ...next.venmo },
				zelle: { ...next.zelle },
				cashapp: { ...next.cashapp }
			}
			suspendPaymentAutosave = false
			return
		}
		void dashboard.loadStatus()
		void dashboard.loadPaymentDefaults()
	})

	$effect(() => {
		if (!authed || mockMode) return
		const googleConnected = !!(dashboard.connected && !dashboard.connectionExpired)
		if (googleConnected) {
			setConnectedProvider('google')
			syncOptionsExpanded = false
			return
		}
		const normalized = singleSyncConnection(syncConnections)
		if (!sameSyncConnections(syncConnections, normalized)) {
			syncConnections = normalized
		}
	})

	$effect(() => {
		if (!authed || mockMode) return
		const next = hydratePaymentMethods(dashboard.paymentDefaults.provider, dashboard.paymentDefaults.handle)
		paymentMethods = next
		initialPaymentMethods = {
			venmo: { ...next.venmo },
			zelle: { ...next.zelle },
			cashapp: { ...next.cashapp }
		}
		suspendPaymentAutosave = false
	})

	onMount(() => {
		calendarWeekStart = getAdminCalendarWeekStart()
		try {
			const raw = localStorage.getItem('admin_sync_connections')
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<SyncConnections>
				syncConnections = singleSyncConnection({
					google: !!parsed.google,
					apple: !!parsed.apple,
					outlook: !!parsed.outlook
				})
			}
		} catch {
			// ignore invalid local settings payload
		}
		suspendWeekStartAutosave = false
		return () => {
			if (toastTimer) clearTimeout(toastTimer)
			if (paymentAutosaveTimer) clearTimeout(paymentAutosaveTimer)
			if (weekStartAutosaveTimer) clearTimeout(weekStartAutosaveTimer)
		}
	})

	$effect(() => {
		try {
			localStorage.setItem(
				'admin_sync_connections',
				JSON.stringify(singleSyncConnection(syncConnections))
			)
		} catch {
			// ignore storage write errors
		}
	})

	function showToast(message: string, isError = false) {
		toastMessage = message
		toastIsError = isError
		if (toastTimer) clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toastMessage = ''
			toastIsError = false
		}, 2200)
	}

	function providerConnected(provider: SyncProviderKey) {
		return syncConnections[provider]
	}

	function connectedProviders() {
		return syncProviders.filter((provider) => providerConnected(provider.value))
	}

	function primaryConnectedProvider() {
		const connected = connectedProviders()
		return connected[0] || null
	}

	function visibleSyncProviders() {
		const primary = primaryConnectedProvider()
		if (!primary || syncOptionsExpanded) return syncProviders
		return [primary]
	}

	async function disconnectProvider(provider: SyncProviderKey) {
		if (provider === 'google' && !mockMode) {
			await dashboard.disconnect()
			if (dashboard.error) {
				showToast(dashboard.error, true)
				return false
			}
		}
		setConnectedProvider(null)
		return true
	}

	async function connectProvider(provider: SyncProviderKey) {
		if (provider === 'google' && !mockMode) {
			await dashboard.reconnect()
			if (dashboard.error) {
				showToast(dashboard.error, true)
				return false
			}
		}
		setConnectedProvider(provider)
		return true
	}

	async function toggleSyncProvider(provider: SyncProviderKey) {
		if (syncBusy.google || syncBusy.apple || syncBusy.outlook) return
		const busyState: SyncBusy = { google: false, apple: false, outlook: false }
		busyState[provider] = true
		syncBusy = busyState
		try {
			const currentlyConnected = providerConnected(provider)
			if (currentlyConnected) {
				const ok = await disconnectProvider(provider)
				if (ok) {
					syncOptionsExpanded = false
					showToast('Saved')
				}
				return
			}

			const current = primaryConnectedProvider()
			if (current && current.value !== provider) {
				busyState[current.value] = true
				syncBusy = { ...busyState }
				const disconnected = await disconnectProvider(current.value)
				if (!disconnected) return
			}

			const connected = await connectProvider(provider)
			if (!connected) return
			syncOptionsExpanded = false
			showToast('Saved')
		} finally {
			syncBusy = { google: false, apple: false, outlook: false }
		}
	}

	async function startSwitchProvider() {
		const current = primaryConnectedProvider()
		if (!current) {
			syncOptionsExpanded = true
			return
		}
		if (syncBusy.google || syncBusy.apple || syncBusy.outlook) return
		syncBusy = { ...syncBusy, [current.value]: true }
		try {
			const ok = await disconnectProvider(current.value)
			if (!ok) return
			syncOptionsExpanded = true
			showToast('Saved')
		} finally {
			syncBusy = { google: false, apple: false, outlook: false }
		}
	}

	async function persistPayments(expectedSnapshot: string) {
		if (paymentSnapshot(paymentMethods) !== expectedSnapshot) return
		if (mockMode) {
			showToast('Saved')
			initialPaymentMethods = {
				venmo: { ...paymentMethods.venmo },
				zelle: { ...paymentMethods.zelle },
				cashapp: { ...paymentMethods.cashapp }
			}
			return
		}
		const enabledProviders = paymentProviders
			.filter((provider) => paymentMethods[provider.value].enabled)
			.map((provider) => provider.value)
		const primary = enabledProviders[0] || ''
		const primaryHandle = primary ? paymentMethods[primary].handle.trim() : ''
		dashboard.paymentDefaults = {
			provider: primary || '',
			handle: primaryHandle
		}
		await dashboard.savePaymentDefaults()
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		initialPaymentMethods = {
			venmo: { ...paymentMethods.venmo },
			zelle: { ...paymentMethods.zelle },
			cashapp: { ...paymentMethods.cashapp }
		}
		showToast('Saved')
	}

	$effect(() => {
		if (!authed || suspendPaymentAutosave) return
		if (paymentSnapshot(paymentMethods) === paymentSnapshot(initialPaymentMethods)) return
		if (paymentAutosaveTimer) clearTimeout(paymentAutosaveTimer)
		const expectedSnapshot = paymentSnapshot(paymentMethods)
		paymentAutosaveTimer = setTimeout(() => {
			void persistPayments(expectedSnapshot)
		}, 450)
	})

	$effect(() => {
		if (!authed || suspendWeekStartAutosave) return
		if (calendarWeekStart === getAdminCalendarWeekStart()) return
		if (weekStartAutosaveTimer) clearTimeout(weekStartAutosaveTimer)
		const expected = calendarWeekStart
		weekStartAutosaveTimer = setTimeout(() => {
			if (calendarWeekStart !== expected) return
			setAdminCalendarWeekStart(expected)
			showToast('Saved')
		}, 300)
	})

	function togglePaymentMethod(method: PaymentMethodKey) {
		const current = paymentMethods[method]
		paymentMethods = {
			...paymentMethods,
			[method]: {
				...current,
				enabled: !current.enabled
			}
		}
	}

	function updatePaymentHandle(method: PaymentMethodKey, value: string) {
		paymentMethods = {
			...paymentMethods,
			[method]: {
				...paymentMethods[method],
				handle: value
			}
		}
	}
</script>

{#if authed}
	<div class="admin-settings admin-content">
		{#if toastMessage}
			<div class="admin-settings__toast admin-ui-toast" class:admin-ui-toast--error={toastIsError} role="status">
				{#if !toastIsError}✓ {/if}{toastMessage}
			</div>
		{/if}

		<AdminPageHero
			eyebrow="Preferences"
			title="Settings"
			subtitle="Configure sync & payment defaults for your space."
		/>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<div>
					<h3 class="admin-settings__section-label">Calendar sync</h3>
				</div>
			</div>

			{#if primaryConnectedProvider() && !syncOptionsExpanded}
				<div class="admin-settings__sync-top-actions">
					<button
						type="button"
						class="admin-settings__switch-link"
						onclick={() => void startSwitchProvider()}
					>
						Switch provider
					</button>
				</div>
			{/if}
			<div class="admin-settings__sync-list">
				{#each visibleSyncProviders() as provider}
					<div class="admin-settings__sync-card">
						<div class="admin-settings__sync-main">
							<span class="admin-settings__sync-icon" aria-hidden="true">
								{#if provider.value === 'google'}
									<svg viewBox="0 0 24 24">
										<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"></path>
										<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
										<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
										<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
									</svg>
								{:else if provider.value === 'apple'}
									<svg viewBox="0 0 24 24" fill="currentColor">
										<path d="M16.37 12.45c.02 2.25 1.97 3 2 3.01-.02.05-.31 1.08-1.02 2.13-.61.91-1.25 1.82-2.25 1.84-.98.02-1.3-.58-2.43-.58-1.13 0-1.49.56-2.41.6-.96.04-1.69-.97-2.31-1.87-1.26-1.82-2.22-5.14-.93-7.38.64-1.11 1.79-1.82 3.04-1.84.95-.02 1.84.64 2.43.64.59 0 1.7-.79 2.86-.67.49.02 1.87.2 2.76 1.5-.07.04-1.65.96-1.64 2.62zM14.81 4.35c.51-.62.86-1.48.77-2.35-.74.03-1.64.49-2.18 1.1-.48.55-.9 1.42-.79 2.26.82.06 1.69-.42 2.2-1.01z"/>
									</svg>
								{:else}
									<svg viewBox="0 0 24 24" fill="currentColor">
										<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13Zm1.8.3v12.4h14.4V5.8H4.8Zm1.7 2.2h10.9v1.8H6.5V8Zm0 3.2h10.9V13H6.5v-1.8Zm0 3.2h7.1v1.8H6.5v-1.8Z"/>
									</svg>
								{/if}
							</span>
							<div class="admin-settings__sync-info">
								<div class="admin-settings__sync-name">{provider.label}</div>
								<span class="admin-settings__status" class:admin-settings__status--ok={providerConnected(provider.value)} class:admin-settings__status--warn={!providerConnected(provider.value)}>
									<span class="admin-settings__status-dot"></span>
									{providerConnected(provider.value) ? 'CONNECTED' : 'NOT CONNECTED'}
								</span>
							</div>
						</div>
						<button
							type="button"
							class="admin-ui-btn"
							class:admin-ui-btn--danger={providerConnected(provider.value)}
							onclick={() => void toggleSyncProvider(provider.value)}
							disabled={syncBusy[provider.value] || (provider.value === 'google' ? dashboard.disconnecting : false)}
						>
							{#if syncBusy[provider.value] || (provider.value === 'google' && dashboard.disconnecting)}
								{providerConnected(provider.value) ? 'Disconnecting…' : 'Connecting…'}
							{:else}
								{providerConnected(provider.value) ? 'Disconnect' : 'Connect'}
							{/if}
						</button>
					</div>
				{/each}
			</div>
			{#if primaryConnectedProvider() && syncOptionsExpanded}
				<div class="admin-settings__sync-top-actions">
					<button
						type="button"
						class="admin-settings__switch-link"
						onclick={() => (syncOptionsExpanded = false)}
					>
						Hide other providers
					</button>
				</div>
			{/if}
		</section>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<div>
					<h3 class="admin-settings__section-label">Calendar view</h3>
				</div>
			</div>

			<fieldset class="admin-settings__platform-field">
				<legend>Week starts on</legend>
				<div class="admin-settings__platform-options" role="radiogroup" aria-label="Week starts on">
					{#each weekStartOptions as option}
						<label
							class="admin-settings__platform-option"
							class:admin-settings__platform-option--active={calendarWeekStart === option.value}
						>
							<input type="radio" name="calendar-week-start" value={option.value} bind:group={calendarWeekStart} />
							<span class="admin-settings__platform-label">{option.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>
		</section>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<div>
					<h3 class="admin-settings__section-label">Payment info</h3>
				</div>
			</div>

			<div class="admin-settings__payment-cards" role="group" aria-label="Payment platforms">
				{#each paymentProviders as provider}
					<div class="admin-settings__payment-card" class:admin-settings__payment-card--active={paymentMethods[provider.value].enabled}>
						<button
							type="button"
							class="admin-settings__payment-toggle"
							onclick={() => togglePaymentMethod(provider.value)}
							aria-pressed={paymentMethods[provider.value].enabled}
						>
							<span class="admin-settings__platform-icon" aria-hidden="true">
								<provider.icon size={14} strokeWidth={2} />
							</span>
							<span class="admin-settings__platform-label">{provider.label}</span>
							<span class="admin-settings__payment-state" class:admin-settings__payment-state--on={paymentMethods[provider.value].enabled} class:admin-settings__payment-state--off={!paymentMethods[provider.value].enabled}>
								{paymentMethods[provider.value].enabled ? 'ON' : 'OFF'}
							</span>
						</button>
						{#if paymentMethods[provider.value].enabled}
							<div class="admin-settings__payment-input-wrap">
								<label for={`admin-settings-payment-${provider.value}`}>Handle</label>
								<input
									id={`admin-settings-payment-${provider.value}`}
									class="admin-ui-input"
									type="text"
									value={paymentMethods[provider.value].handle}
									placeholder={provider.placeholder}
									oninput={(event) => updatePaymentHandle(provider.value, (event.currentTarget as HTMLInputElement).value)}
								/>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	</div>
{/if}

<style>
	.admin-settings {
		font-family: var(--font-ui-sans, var(--font-sans));
		display: grid;
		gap: 0.9rem;
		width: 100%;
	}

	.admin-settings__section {
		position: relative;
		display: grid;
		gap: 0.85rem;
		padding: 1.55rem 1rem 0;
		border-top: none;
	}

	.admin-settings__section + .admin-settings__section {
		margin-top: 1rem;
	}

	.admin-settings__section::before {
		content: '';
		position: absolute;
		top: 0.2rem;
		left: 0;
		right: 0;
		height: 10rem;
		border-radius: 0.7rem 0.7rem 0 0;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--admin-card-border) 18%, transparent) 0%,
			color-mix(in srgb, var(--admin-card-border) 6%, transparent) 42%,
			transparent 100%
		);
		pointer-events: none;
	}

	.admin-settings__section::after {
		content: '';
		position: absolute;
		top: 0.2rem;
		left: 0;
		right: 0;
		height: 10rem;
		border: 1px solid var(--admin-card-border);
		border-bottom: none;
		border-radius: 0.7rem 0.7rem 0 0;
		box-sizing: border-box;
		-webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.34) 42%, transparent 100%);
		mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.34) 42%, transparent 100%);
		pointer-events: none;
	}

	.admin-settings__section:first-of-type {
		padding-top: 0;
	}

	.admin-settings__section:first-of-type::before {
		display: none;
	}

	.admin-settings__section:first-of-type::after {
		display: none;
	}

	.admin-settings__section-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.admin-settings__section-label {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 620;
		letter-spacing: -0.01em;
		color: var(--text);
	}

	.admin-settings__status {
		display: inline-flex;
		align-items: center;
		gap: 0.34rem;
		padding: 0.18rem 0.6rem;
		border-radius: 0.45rem;
		font-size: 0.69rem;
		font-weight: 650;
		line-height: 1;
		white-space: nowrap;
		margin-top: 0.1rem;
	}

	.admin-settings__status-dot {
		width: 0.35rem;
		height: 0.35rem;
		border-radius: 999px;
		flex-shrink: 0;
	}

	.admin-settings__status--warn {
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
	}

	.admin-settings__status--warn .admin-settings__status-dot {
		background: var(--admin-status-warn-dot);
	}

	.admin-settings__status--ok {
		background: var(--admin-status-success-bg);
		color: var(--admin-status-success-fg);
	}

	.admin-settings__status--ok .admin-settings__status-dot {
		background: var(--admin-status-success-dot);
	}

	.admin-settings__sync-list {
		display: grid;
		gap: 0.55rem;
	}

	.admin-settings__sync-top-actions {
		display: flex;
		justify-content: flex-end;
	}

	.admin-settings__switch-link {
		border: none;
		background: none;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		font: inherit;
		font-size: 0.72rem;
		font-weight: 560;
		cursor: pointer;
		padding: 0;
	}

	.admin-settings__switch-link:hover {
		color: color-mix(in srgb, var(--admin-accent) 82%, var(--text) 18%);
	}

	.admin-settings__sync-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.62rem 0.72rem;
		border: 1px solid var(--admin-card-border);
		background: color-mix(in srgb, var(--admin-card-bg) 88%, var(--bg) 12%);
		border-radius: 0.64rem;
	}

	.admin-settings__sync-main {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		min-width: 0;
	}

	.admin-settings__sync-icon {
		width: 1.35rem;
		height: 1.35rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: color-mix(in srgb, var(--text) 72%, transparent);
	}

	.admin-settings__sync-icon svg {
		width: 1.1rem;
		height: 1.1rem;
		display: block;
	}

	.admin-settings__sync-info {
		display: grid;
		gap: 0.2rem;
	}

	.admin-settings__sync-name {
		font-size: 0.8rem;
		font-weight: 620;
		color: var(--text);
	}

	.admin-settings__platform-field {
		border: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.4rem;
	}

	.admin-settings__platform-field legend {
		font-size: 0.74rem;
		font-weight: 620;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		margin-bottom: 0.05rem;
	}

	.admin-settings__platform-options {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.45rem;
	}

	.admin-settings__platform-option {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.42rem;
		min-height: 2.05rem;
		padding: 0 0.62rem;
		border-radius: 0.6rem;
		border: 1px solid var(--admin-card-border);
		background: color-mix(in srgb, var(--admin-card-bg) 86%, var(--bg) 14%);
		color: color-mix(in srgb, var(--text) 70%, transparent);
		cursor: pointer;
		transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
	}

	.admin-settings__platform-option:hover {
		background: var(--admin-card-bg-hover, var(--admin-card-bg));
		border-color: color-mix(in srgb, var(--admin-accent) 24%, transparent);
	}

	.admin-settings__platform-option input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.admin-settings__platform-option--active {
		border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
		color: var(--text);
	}

	.admin-settings__platform-icon {
		width: 1.15rem;
		height: 1.15rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.admin-settings__platform-label {
		font-size: 0.76rem;
		font-weight: 620;
		letter-spacing: -0.005em;
	}

	.admin-settings__payment-cards {
		display: grid;
		gap: 0.55rem;
	}

	.admin-settings__payment-card {
		border: 1px solid var(--admin-card-border);
		background: color-mix(in srgb, var(--admin-card-bg) 86%, var(--bg) 14%);
		border-radius: 0.7rem;
		overflow: clip;
	}

	.admin-settings__payment-card--active {
		border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 10%, var(--bg) 90%);
	}

	.admin-settings__payment-toggle {
		width: 100%;
		min-height: 2.4rem;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.7rem;
		border: none;
		background: transparent;
		color: inherit;
		cursor: pointer;
		text-align: left;
		font: inherit;
	}

	.admin-settings__payment-state {
		font-size: 0.66rem;
		font-weight: 650;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.16rem 0.44rem;
		border-radius: 0.42rem;
		line-height: 1;
	}

	.admin-settings__payment-state--on {
		background: var(--admin-status-success-bg);
		color: var(--admin-status-success-fg);
	}

	.admin-settings__payment-state--off {
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
	}

	.admin-settings__payment-input-wrap {
		display: grid;
		gap: 0.3rem;
		padding: 0 0.7rem 0.7rem;
	}

	.admin-settings__payment-input-wrap label {
		font-size: 0.72rem;
		font-weight: 620;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.admin-settings__toast {
		bottom: 1rem;
		z-index: 120;
		font-size: 0.78rem;
	}

	@media (max-width: 720px) {
		.admin-settings__section-head {
			flex-direction: column;
			gap: 0.5rem;
		}

		.admin-settings__platform-options {
			grid-template-columns: 1fr;
		}
	}
</style>
