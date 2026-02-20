<script lang="ts">
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import { getCalendarUiConfig } from '@calendar/ui/config'
	import { enhance } from '$app/forms'

	type SectionId = 'space' | 'rules' | 'calendar' | 'payments' | null

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const calendarConfig = getCalendarUiConfig()
	const authed = $derived(!!data.user)

	let editing = $state<SectionId>(null)
	let disconnectConfirm = $state(false)
	let toastMessage = $state('')
	let toastIsError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	let spaceDraft = $state(calendarConfig.brand.calendarName)
	let rulesDraft = $state({
		from: '08:00',
		to: '21:00',
		notice: 2,
		capacity: 6
	})
	let paymentDraft = $state({
		provider: 'none',
		handle: ''
	})

	const noticeOptions = [
		{ label: '30 min', value: 0.5 },
		{ label: '1 hr', value: 1 },
		{ label: '2 hr', value: 2 },
		{ label: '4 hr', value: 4 },
		{ label: '24 hr', value: 24 }
	]
	const paymentProviders = [
		{ value: 'none', label: 'None' },
		{ value: 'venmo', label: 'Venmo' },
		{ value: 'zelle', label: 'Zelle' },
		{ value: 'cashapp', label: 'Cash App' }
	]

	$effect(() => {
		if (!authed) return
		void dashboard.loadStatus()
		void dashboard.loadPaymentDefaults()
	})

	$effect(() => {
		if (!authed) return
		rulesDraft = {
			from: dashboard.hours.from,
			to: dashboard.hours.to,
			notice: dashboard.notice,
			capacity: dashboard.capacity
		}
		paymentDraft = {
			provider: dashboard.paymentDefaults.provider || 'none',
			handle: dashboard.paymentDefaults.handle || ''
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

	function toggleSection(section: Exclude<SectionId, null>) {
		disconnectConfirm = false
		editing = editing === section ? null : section
	}

	async function saveRules() {
		dashboard.hours = { from: rulesDraft.from, to: rulesDraft.to }
		dashboard.notice = rulesDraft.notice
		dashboard.capacity = rulesDraft.capacity
		await dashboard.save()
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		editing = null
		showToast('House rules saved')
	}

	async function connectCalendar() {
		await dashboard.reconnect()
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		showToast('Calendar connection started')
	}

	async function disconnectCalendar() {
		await dashboard.disconnect()
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		disconnectConfirm = false
		editing = null
		showToast('Calendar disconnected')
	}

	async function savePayments() {
		dashboard.paymentDefaults = {
			provider: paymentDraft.provider === 'none' ? '' : paymentDraft.provider,
			handle: paymentDraft.handle.trim()
		}
		await dashboard.savePaymentDefaults()
		if (dashboard.error) {
			showToast(dashboard.error, true)
			return
		}
		editing = null
		showToast('Payment info saved')
	}

	function paymentLabel() {
		const provider = paymentProviders.find((item) => item.value === (dashboard.paymentDefaults.provider || 'none'))
		const handle = dashboard.paymentDefaults.handle || ''
		if (!provider || provider.value === 'none' || !handle) return 'No payment method set'
		return `${provider.label} · ${handle}`
	}

	function paymentHint() {
		if (paymentDraft.provider === 'venmo') return 'e.g. @yourname'
		if (paymentDraft.provider === 'cashapp') return 'e.g. $yourname'
		if (paymentDraft.provider === 'zelle') return 'Email or phone'
		return ''
	}
</script>

{#if authed}
	<div class="admin-settings">
		{#if toastMessage}
			<div class="admin-settings__toast" class:admin-settings__toast--error={toastIsError} role="status">
				{#if !toastIsError}✓ {/if}{toastMessage}
			</div>
		{/if}

		<h2>Settings</h2>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<h3><span aria-hidden="true">🌈</span> Your Space</h3>
				<button type="button" onclick={() => toggleSection('space')}>
					{editing === 'space' ? 'Close' : 'Edit'}
				</button>
			</div>
			<div class="admin-settings__card">
				<div class:admin-settings__card-base--muted={editing === 'space'} class="admin-settings__card-base">
					<div class="admin-settings__row">
						<span>{calendarConfig.brand.calendarName}</span>
					</div>
				</div>
				{#if editing === 'space'}
					<div class="admin-settings__editor">
						<label for="admin-settings-space">Community name</label>
						<input id="admin-settings-space" type="text" bind:value={spaceDraft} />
						<p class="admin-settings__subtle">Brand name is currently theme-managed in config. In-page persistence is not wired yet.</p>
						<div class="admin-settings__actions">
							<button type="button" class="admin-settings__button-secondary" onclick={() => (editing = null)}>Close</button>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<h3><span aria-hidden="true">🕒</span> House Rules</h3>
				<button type="button" onclick={() => toggleSection('rules')}>
					{editing === 'rules' ? 'Close' : 'Edit'}
				</button>
			</div>
			<div class="admin-settings__card">
				<div class:admin-settings__card-base--muted={editing === 'rules'} class="admin-settings__card-base">
					<div class="admin-settings__row">
						<span>Open hours</span>
						<strong>{dashboard.hours.from} - {dashboard.hours.to}</strong>
					</div>
					<div class="admin-settings__row">
						<span>Min notice</span>
						<strong>{dashboard.notice} hours</strong>
					</div>
					<div class="admin-settings__row">
						<span>Default spots</span>
						<strong>{dashboard.capacity}</strong>
					</div>
				</div>
				{#if editing === 'rules'}
					<div class="admin-settings__editor">
						<div class="admin-settings__grid">
							<div>
								<label for="admin-settings-open">Open</label>
								<input id="admin-settings-open" type="time" bind:value={rulesDraft.from} />
							</div>
							<div>
								<label for="admin-settings-close">Close</label>
								<input id="admin-settings-close" type="time" bind:value={rulesDraft.to} />
							</div>
						</div>
						<div class="admin-settings__grid">
							<div>
								<label for="admin-settings-notice">Min notice</label>
								<select id="admin-settings-notice" bind:value={rulesDraft.notice}>
									{#each noticeOptions as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="admin-settings-capacity">Default spots</label>
								<input id="admin-settings-capacity" type="number" min="2" max="20" step="1" bind:value={rulesDraft.capacity} />
							</div>
						</div>
						<div class="admin-settings__actions">
							<button type="button" class="admin-settings__button-secondary" onclick={() => (editing = null)}>Cancel</button>
							<button type="button" onclick={saveRules} disabled={dashboard.saving}>
								{dashboard.saving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<h3><span aria-hidden="true">📅</span> Calendar Sync</h3>
				<button type="button" onclick={() => toggleSection('calendar')}>
					{editing === 'calendar' ? 'Close' : 'Edit'}
				</button>
			</div>
			<div class="admin-settings__card" class:admin-settings__card--warn={!dashboard.connected && editing !== 'calendar'}>
				<div class:admin-settings__card-base--muted={editing === 'calendar'} class="admin-settings__card-base">
					{#if dashboard.connected && !dashboard.connectionExpired}
						<div class="admin-settings__status admin-settings__status--ok">
							<span aria-hidden="true"></span>
							<strong>Google Calendar connected</strong>
						</div>
					{:else}
						<div class="admin-settings__status admin-settings__status--warn">
							<strong>Not connected yet</strong>
							<small>Events will not sync to calendars</small>
						</div>
					{/if}
				</div>
				{#if editing === 'calendar'}
					<div class="admin-settings__editor">
						{#if dashboard.connected && !dashboard.connectionExpired}
							<div class="admin-settings__status admin-settings__status--ok">
								<span aria-hidden="true"></span>
								<strong>Connected and syncing</strong>
							</div>
							{#if !disconnectConfirm}
								<button type="button" class="admin-settings__link-button" onclick={() => (disconnectConfirm = true)}>Disconnect...</button>
							{:else}
								<div class="admin-settings__danger-box">
									<p>Disconnect calendar?</p>
									<small>Future events stop syncing. Past events stay.</small>
									<div class="admin-settings__actions">
										<button type="button" class="admin-settings__button-danger" onclick={disconnectCalendar} disabled={dashboard.disconnecting}>
											{dashboard.disconnecting ? 'Disconnecting…' : 'Yes, disconnect'}
										</button>
										<button type="button" class="admin-settings__button-secondary" onclick={() => (disconnectConfirm = false)}>Never mind</button>
									</div>
								</div>
							{/if}
						{:else}
							<p class="admin-settings__subtle">Events will show up on Google Calendar for you and your crew.</p>
							<button type="button" onclick={connectCalendar}>Connect Google Calendar</button>
						{/if}
					</div>
				{/if}
			</div>
		</section>

		<section class="admin-settings__section">
			<div class="admin-settings__section-head">
				<h3><span aria-hidden="true">💰</span> Payments</h3>
				<button type="button" onclick={() => toggleSection('payments')}>
					{editing === 'payments' ? 'Close' : 'Edit'}
				</button>
			</div>
			<div class="admin-settings__card" class:admin-settings__card--warn={!dashboard.paymentDefaults.provider || !dashboard.paymentDefaults.handle}>
				<div class:admin-settings__card-base--muted={editing === 'payments'} class="admin-settings__card-base">
					{#if dashboard.paymentDefaults.provider && dashboard.paymentDefaults.handle}
						<div class="admin-settings__status admin-settings__status--ok">
							<span aria-hidden="true"></span>
							<strong>{paymentLabel()}</strong>
						</div>
					{:else}
						<div class="admin-settings__status admin-settings__status--warn">
							<strong>No payment method set</strong>
							<small>Paid events will not show where to pay</small>
						</div>
					{/if}
				</div>
				{#if editing === 'payments'}
					<div class="admin-settings__editor">
						<p class="admin-settings__subtle">We display your info for members; we do not process payments.</p>
						<div class="admin-settings__grid">
							<div>
								<label for="admin-settings-provider">Platform</label>
								<select id="admin-settings-provider" bind:value={paymentDraft.provider}>
									{#each paymentProviders as provider}
										<option value={provider.value}>{provider.label}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="admin-settings-handle">Your handle</label>
								<input id="admin-settings-handle" type="text" bind:value={paymentDraft.handle} placeholder={paymentHint()} disabled={paymentDraft.provider === 'none'} />
								{#if paymentHint()}
									<small>{paymentHint()}</small>
								{/if}
							</div>
						</div>
						<div class="admin-settings__actions">
							<button type="button" class="admin-settings__button-secondary" onclick={() => (editing = null)}>Cancel</button>
							<button type="button" onclick={savePayments}>Save</button>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<div class="admin-settings__logout-wrap">
			<form method="POST" action="/admin?/logout" use:enhance>
				<button type="submit" class="admin-settings__logout">Log out</button>
			</form>
		</div>
	</div>
{/if}

<style>
	.admin-settings {
		--panel: color-mix(in srgb, var(--bg) 92%, var(--text) 8%);
		--panel-soft: color-mix(in srgb, var(--bg) 95%, var(--text) 5%);
		--panel-border: color-mix(in srgb, var(--text) 14%, transparent);
		--panel-border-soft: color-mix(in srgb, var(--text) 10%, transparent);
		--muted: color-mix(in srgb, var(--text) 62%, transparent);
		--warning-bg: color-mix(in srgb, var(--color-warning) 10%, var(--bg) 90%);
		--warning-border: color-mix(in srgb, var(--color-warning) 32%, transparent);
		--danger-bg: color-mix(in srgb, var(--status-error-text) 10%, var(--bg) 90%);
		--danger-border: color-mix(in srgb, var(--status-error-text) 28%, transparent);
		--ok: var(--status-success-text);
		display: grid;
		gap: 1rem;
	}

	.admin-settings h2 {
		margin: 0 0 0.4rem;
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text);
	}

	.admin-settings__section {
		display: grid;
		gap: 0.55rem;
	}

	.admin-settings__section-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
	}

	.admin-settings__section-head h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--text);
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.admin-settings__section-head button {
		min-height: 30px;
		padding: 0 0.8rem;
		border-radius: 999px;
		border: 1px solid var(--panel-border);
		background: var(--bg);
		color: color-mix(in srgb, var(--text) 72%, transparent);
		font-size: 0.7rem;
		font-weight: 700;
		cursor: pointer;
	}

	.admin-settings__card {
		border-radius: 14px;
		border: 1px solid var(--panel-border);
		background: var(--panel-soft);
		overflow: hidden;
		box-shadow: 0 1px 2px var(--shadow-softest);
	}

	.admin-settings__card--warn {
		background: var(--warning-bg);
		border-color: var(--warning-border);
	}

	.admin-settings__card-base {
		transition: opacity 120ms ease;
	}

	.admin-settings__card-base--muted {
		opacity: 0.34;
		pointer-events: none;
	}

	.admin-settings__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		padding: 0.8rem 1rem;
	}

	.admin-settings__row + .admin-settings__row {
		border-top: 1px solid var(--panel-border-soft);
	}

	.admin-settings__row span {
		font-size: 0.83rem;
		color: var(--muted);
	}

	.admin-settings__row strong {
		font-size: 0.86rem;
		color: var(--text);
		font-weight: 700;
	}

	.admin-settings__editor {
		border-top: 1px solid var(--panel-border-soft);
		background: var(--bg);
		padding: 0.95rem 1rem;
		display: grid;
		gap: 0.7rem;
	}

	.admin-settings__editor p,
	.admin-settings__editor small,
	.admin-settings__subtle {
		margin: 0;
		font-size: 0.76rem;
		color: var(--muted);
	}

	.admin-settings__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.65rem;
	}

	.admin-settings label {
		display: block;
		font-size: 0.74rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 70%, transparent);
		margin-bottom: 0.25rem;
	}

	.admin-settings input,
	.admin-settings select {
		width: 100%;
		min-height: 36px;
		padding: 0 0.7rem;
		border-radius: 8px;
		border: 1px solid var(--panel-border);
		background: var(--bg);
		color: var(--text);
		font: inherit;
	}

	.admin-settings__status {
		padding: 0.85rem 1rem;
		display: grid;
		gap: 0.15rem;
	}

	.admin-settings__status strong {
		font-size: 0.82rem;
	}

	.admin-settings__status small {
		font-size: 0.74rem;
		color: color-mix(in srgb, var(--text) 66%, transparent);
	}

	.admin-settings__status--ok {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.admin-settings__status--ok span {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: var(--ok);
	}

	.admin-settings__status--ok strong {
		color: var(--ok);
	}

	.admin-settings__status--warn strong {
		color: color-mix(in srgb, var(--color-warning) 70%, var(--text) 30%);
	}

	.admin-settings__link-button {
		padding: 0;
		background: none;
		border: 0;
		color: var(--muted);
		font: inherit;
		font-size: 0.78rem;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
		width: fit-content;
	}

	.admin-settings__danger-box {
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--danger-border);
		background: var(--danger-bg);
		display: grid;
		gap: 0.3rem;
	}

	.admin-settings__danger-box p {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--status-error-text);
	}

	.admin-settings__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.45rem;
		padding-top: 0.3rem;
	}

	.admin-settings__actions button,
	.admin-settings__editor > button {
		min-height: 34px;
		padding: 0 0.95rem;
		border-radius: 999px;
		border: 1px solid var(--panel-border);
		background: color-mix(in srgb, var(--text) 12%, var(--bg) 88%);
		color: var(--text);
		font-weight: 700;
		cursor: pointer;
	}

	.admin-settings__button-secondary {
		background: var(--bg) !important;
		color: color-mix(in srgb, var(--text) 72%, transparent) !important;
	}

	.admin-settings__button-danger {
		border-color: var(--danger-border) !important;
		background: color-mix(in srgb, var(--status-error-text) 85%, var(--bg) 15%) !important;
		color: var(--bg) !important;
	}

	.admin-settings__logout-wrap {
		display: flex;
		justify-content: center;
		margin-top: 0.75rem;
	}

	.admin-settings__logout {
		background: transparent;
		border: 0;
		color: var(--muted);
		font: inherit;
		font-size: 0.82rem;
		padding: 0.4rem 0.8rem;
		border-radius: 8px;
		cursor: pointer;
	}

	.admin-settings__logout:hover {
		background: color-mix(in srgb, var(--status-error-text) 10%, transparent);
		color: var(--status-error-text);
	}

	.admin-settings__toast {
		position: fixed;
		left: 50%;
		bottom: 1rem;
		transform: translateX(-50%);
		z-index: 120;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--status-success-text) 88%, var(--bg) 12%);
		color: var(--bg);
		font-size: 0.78rem;
		font-weight: 700;
	}

	.admin-settings__toast--error {
		background: color-mix(in srgb, var(--status-error-text) 85%, var(--bg) 15%);
	}

	@media (max-width: 720px) {
		.admin-settings__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
