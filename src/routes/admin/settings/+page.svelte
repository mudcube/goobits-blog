<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { Ban, HandCoins, Landmark, Wallet, Save } from '@lucide/svelte'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import AdminPageHero from '@components/Admin/AdminPageHero.svelte'
	import AdminActionButton from '@components/Admin/AdminActionButton.svelte'
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

	let disconnectConfirm = $state(false)
	let toastMessage = $state('')
	let toastIsError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	let paymentDraft = $state({
		provider: 'none',
		handle: ''
	})
	let mockConnected = $state(false)
	let calendarWeekStart = $state<AdminCalendarWeekStart>('monday')

	const paymentProviders = [
		{ value: 'none', label: 'None', icon: Ban },
		{ value: 'venmo', label: 'Venmo', icon: HandCoins },
		{ value: 'zelle', label: 'Zelle', icon: Landmark },
		{ value: 'cashapp', label: 'Cash App', icon: Wallet }
	]
	const weekStartOptions: Array<{ value: AdminCalendarWeekStart; label: string }> = [
		{ value: 'monday', label: 'Monday' },
		{ value: 'sunday', label: 'Sunday' }
	]

	const paymentChanged = $derived(
		paymentDraft.provider !== (dashboard.paymentDefaults.provider || 'none') ||
			paymentDraft.handle !== (dashboard.paymentDefaults.handle || '')
	)
	const weekStartChanged = $derived(calendarWeekStart !== getAdminCalendarWeekStart())

	$effect(() => {
		if (!authed) return
		if (mockMode) {
			paymentDraft = {
				provider: mockPaymentDefaults.provider || 'none',
				handle: mockPaymentDefaults.handle || ''
			}
			return
		}
		void dashboard.loadStatus()
		void dashboard.loadPaymentDefaults()
	})

	$effect(() => {
		if (!authed || mockMode) return
		paymentDraft = {
			provider: dashboard.paymentDefaults.provider || 'none',
			handle: dashboard.paymentDefaults.handle || ''
		}
	})

	onMount(() => {
		calendarWeekStart = getAdminCalendarWeekStart()
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

	async function connectCalendar() {
		if (mockMode) {
			mockConnected = true
			showToast('Mock mode: calendar connected')
			return
		}
		await dashboard.reconnect()
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		showToast('Calendar connection started')
	}

	async function disconnectCalendar() {
		if (mockMode) {
			mockConnected = false
			disconnectConfirm = false
			showToast('Mock mode: calendar disconnected')
			return
		}
		await dashboard.disconnect()
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		disconnectConfirm = false
		showToast('Calendar disconnected')
	}

	async function savePayments() {
		if (mockMode) {
			showToast('Mock mode: payment info saved')
			return
		}
		dashboard.paymentDefaults = {
			provider: paymentDraft.provider === 'none' ? '' : paymentDraft.provider,
			handle: paymentDraft.handle.trim()
		}
		await dashboard.savePaymentDefaults()
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		showToast('Payment info saved')
	}

	function saveCalendarSettings() {
		setAdminCalendarWeekStart(calendarWeekStart)
		showToast('Calendar settings saved')
	}

	function paymentHint() {
		if (paymentDraft.provider === 'venmo') return 'e.g. @yourname'
		if (paymentDraft.provider === 'cashapp') return 'e.g. $yourname'
		if (paymentDraft.provider === 'zelle') return 'Email or phone'
		return ''
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
			subtitle="Configure sync and payment defaults for your space."
		/>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<div>
					<h3 class="admin-settings__section-label">Calendar sync</h3>
					<p class="admin-settings__section-desc">Events sync to Google Calendar for you and your crew automatically.</p>
				</div>
				{#if mockMode ? mockConnected : dashboard.connected && !dashboard.connectionExpired}
					<span class="admin-settings__status admin-settings__status--ok"><span class="admin-settings__status-dot"></span>Connected</span>
				{:else}
					<span class="admin-settings__status admin-settings__status--warn"><span class="admin-settings__status-dot"></span>Not connected</span>
				{/if}
			</div>

			<div class="admin-settings__module">
				{#if mockMode ? mockConnected : dashboard.connected && !dashboard.connectionExpired}
					<div class="admin-settings__connected-row">
						<span class="admin-settings__connected-label">Google Calendar connected</span>
						{#if !disconnectConfirm}
							<button type="button" class="admin-settings__connected-action" onclick={() => (disconnectConfirm = true)}>Disconnect</button>
						{:else}
							<div class="admin-settings__actions">
								<button type="button" class="admin-ui-btn admin-ui-btn--danger" onclick={disconnectCalendar} disabled={dashboard.disconnecting}>
									{dashboard.disconnecting ? 'Disconnecting…' : 'Yes, disconnect'}
								</button>
								<button type="button" class="admin-ui-btn" onclick={() => (disconnectConfirm = false)}>Never mind</button>
							</div>
						{/if}
					</div>
				{:else}
					<div class="admin-settings__actions admin-settings__actions--start">
						<button type="button" class="admin-settings__google-btn" onclick={connectCalendar}>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"></path>
								<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
								<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
								<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
							</svg>
							Connect Google Calendar
						</button>
					</div>
					<p class="admin-settings__field-hint">Events will show up on Google Calendar for you and your crew.</p>
				{/if}
			</div>
		</section>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<div>
					<h3 class="admin-settings__section-label">Calendar view</h3>
					<p class="admin-settings__section-desc">Choose which day your calendar week starts on.</p>
				</div>
			</div>

			<div class="admin-settings__module">
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
				<div class="admin-settings__actions">
					<AdminActionButton variant="primary" icon={Save} onclick={saveCalendarSettings} disabled={!weekStartChanged}>Save</AdminActionButton>
				</div>
			</div>
		</section>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<div>
					<h3 class="admin-settings__section-label">Payment info</h3>
					<p class="admin-settings__section-desc">Show members how to pay you. This appears on booking confirmations as the default. Individual events can override it.</p>
				</div>
			</div>

			<div class="admin-settings__module">
				<div class="admin-settings__fields-row">
					<fieldset class="admin-settings__platform-field">
						<legend>Platform</legend>
						<div class="admin-settings__platform-options" role="radiogroup" aria-label="Payment platform">
							{#each paymentProviders as provider}
								<label
									class="admin-settings__platform-option"
									class:admin-settings__platform-option--active={paymentDraft.provider === provider.value}
								>
									<input type="radio" name="payment-platform" value={provider.value} bind:group={paymentDraft.provider} />
									<span class="admin-settings__platform-icon" aria-hidden="true">
										<provider.icon size={14} strokeWidth={2} />
									</span>
									<span class="admin-settings__platform-label">{provider.label}</span>
								</label>
							{/each}
						</div>
					</fieldset>
					<div class="admin-settings__field">
						<label for="admin-settings-handle">Handle</label>
						<input
							id="admin-settings-handle"
							class="admin-ui-input"
							type="text"
							bind:value={paymentDraft.handle}
							placeholder={paymentHint() || '@yourname'}
							disabled={paymentDraft.provider === 'none'}
						/>
					</div>
				</div>
				<p class="admin-settings__field-hint">Members see this after booking so they know where to send payment.</p>
				<div class="admin-settings__actions">
					<AdminActionButton variant="primary" icon={Save} onclick={savePayments} disabled={!paymentChanged}>Save</AdminActionButton>
				</div>
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
		display: grid;
		gap: 0.85rem;
		padding: 1.35rem 0 0;
		border-top: 1px solid var(--admin-card-border);
	}

	.admin-settings__section:first-of-type {
		border-top: none;
		padding-top: 0;
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

	.admin-settings__section-desc {
		margin: 0.15rem 0 0;
		max-width: 26rem;
		font-size: 0.82rem;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 58%, transparent);
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

	.admin-settings__module {
		border-radius: 0.9rem;
		border: 1px solid var(--admin-card-border);
		background: var(--admin-card-bg);
		padding: 0.95rem;
		display: grid;
		gap: 0.75rem;
	}

	.admin-settings__connected-row {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		justify-content: space-between;
		padding: 0.6rem 0.7rem;
		border-radius: 0.6rem;
		border: 1px solid color-mix(in srgb, var(--admin-status-success-dot) 24%, transparent);
		background: color-mix(in srgb, var(--admin-status-success-dot) 8%, transparent);
	}

	.admin-settings__connected-label {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--admin-status-success-fg);
	}

	.admin-settings__connected-action {
		border: none;
		background: none;
		cursor: pointer;
		font: inherit;
		font-size: 0.72rem;
		font-weight: 560;
		color: color-mix(in srgb, var(--text) 46%, transparent);
	}

	.admin-settings__connected-action:hover {
		color: var(--status-error-text);
	}

	.admin-settings__fields-row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.72rem;
	}

	.admin-settings__field label {
		display: block;
		font-size: 0.74rem;
		font-weight: 620;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		margin-bottom: 0.32rem;
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
		border: 1px solid var(--admin-control-border);
		background: color-mix(in srgb, var(--bg) 96%, var(--text) 4%);
		color: color-mix(in srgb, var(--text) 66%, transparent);
		cursor: pointer;
		transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
	}

	.admin-settings__platform-option:hover {
		background: color-mix(in srgb, var(--bg) 92%, var(--text) 8%);
	}

	.admin-settings__platform-option input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.admin-settings__platform-option--active {
		border-color: var(--admin-selected-border);
		background: var(--admin-selected-bg);
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

	.admin-settings__field-hint {
		margin: 0;
		font-size: 0.72rem;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 44%, transparent);
	}

	.admin-settings__actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		align-items: center;
	}

	.admin-settings__actions--start {
		justify-content: flex-start;
	}

	.admin-settings__google-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2rem;
		padding: 0 0.85rem;
		border-radius: 0.55rem;
		border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
		background: color-mix(in srgb, var(--bg) 98%, var(--text) 2%);
		color: var(--text);
		font: inherit;
		font-size: 0.76rem;
		font-weight: 560;
		cursor: pointer;
	}

	.admin-settings__google-btn:hover {
		background: color-mix(in srgb, var(--bg) 92%, var(--text) 8%);
	}

	.admin-settings__google-btn svg {
		width: 1rem;
		height: 1rem;
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

		.admin-settings__fields-row {
			grid-template-columns: 1fr;
		}

		.admin-settings__platform-options {
			grid-template-columns: 1fr;
		}
	}
</style>
