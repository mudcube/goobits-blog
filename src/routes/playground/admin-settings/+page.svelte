<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { slide } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import {
		AlertTriangle,
		CalendarDays,
		LayoutDashboard,
		Settings as SettingsIcon,
		Users,
		X as XIcon
	} from '@lucide/svelte'
	import AppleCredentialSheet from './components/AppleCredentialSheet.svelte'
	import ConnectCalendarSheet from './components/ConnectCalendarSheet.svelte'
	import PaymentMethodRow from './components/PaymentMethodRow.svelte'
	import ProfileMenu from './components/ProfileMenu.svelte'
	import SaveIndicator from './components/SaveIndicator.svelte'
	import SyncCard from './components/SyncCard.svelte'
	import UndoToast from './components/UndoToast.svelte'
	import WeekStartPicker from './components/WeekStartPicker.svelte'
	import { paymentMethods } from './components/data'
	import { providerLabel } from './components/helpers'
	import type {
		PaymentMethod,
		PaymentRow,
		PayPalCreds,
		Preset,
		SaveState,
		SquareCreds,
		SyncProvider,
		SyncStatus,
		UndoSnapshot
	} from './components/types'

	function blankPayment(): PaymentRow {
		return {
			handle: '',
			expanded: false,
			checkoutEnabled: false,
			advancedOpen: false,
			expiringSoon: false
		}
	}

	function blankPayPalCreds(): PayPalCreds {
		return { clientId: '', clientSecret: '', environment: 'sandbox' }
	}

	function blankSquareCreds(): SquareCreds {
		return { applicationId: '', locationId: '', accessToken: '', environment: 'sandbox' }
	}

	let preset = $state<Preset>('healthy')
	let weekStart = $state<'monday' | 'sunday'>('monday')
	let sync = $state<SyncStatus>({ active: 'google', syncedAtLabel: '2m ago' })
	let payments = $state<Record<PaymentMethod, PaymentRow>>({
		venmo: { ...blankPayment(), handle: '@miko', checkoutEnabled: true },
		paypal: { ...blankPayment(), handle: 'hello@miko.art', checkoutEnabled: true },
		cashapp: blankPayment()
	})
	let primary = $state<PaymentMethod | null>('venmo')
	let payPalCreds = $state<PayPalCreds>({
		clientId: 'AaQ...••••',
		clientSecret: '',
		environment: 'sandbox'
	})
	let squareCreds = $state<SquareCreds>(blankSquareCreds())
	let calendarSave = $state<SaveState>('idle')
	let paymentsSave = $state<SaveState>('idle')
	let showSwitchSheet = $state(false)
	let showAppleSheet = $state(false)
	let connectingProvider = $state<SyncProvider | null>(null)
	let removeConfirmFor = $state<PaymentMethod | null>(null)
	let lastSavedAt = $state<number | null>(null)
	let nowTick = $state(Date.now())

	let undoToast = $state<{ label: string; snapshot: UndoSnapshot } | null>(null)
	let undoTimer: ReturnType<typeof setTimeout> | null = null
	let removeConfirmTimer: ReturnType<typeof setTimeout> | null = null
	let nowInterval: ReturnType<typeof setInterval> | null = null

	const calendarTimers = {
		saving: null as ReturnType<typeof setTimeout> | null,
		saved: null as ReturnType<typeof setTimeout> | null
	}
	const paymentsTimers = {
		saving: null as ReturnType<typeof setTimeout> | null,
		saved: null as ReturnType<typeof setTimeout> | null
	}

	onMount(() => {
		nowInterval = setInterval(() => (nowTick = Date.now()), 30000)
		return () => {
			if (nowInterval) clearInterval(nowInterval)
		}
	})

	onDestroy(() => {
		clearAll(calendarTimers)
		clearAll(paymentsTimers)
		if (undoTimer) clearTimeout(undoTimer)
		if (removeConfirmTimer) clearTimeout(removeConfirmTimer)
	})

	function clearAll(t: {
		saving: ReturnType<typeof setTimeout> | null
		saved: ReturnType<typeof setTimeout> | null
	}) {
		if (t.saving) clearTimeout(t.saving)
		if (t.saved) clearTimeout(t.saved)
	}

	function flagSaving(section: 'calendar' | 'payments') {
		const t = section === 'calendar' ? calendarTimers : paymentsTimers
		clearAll(t)
		if (section === 'calendar') calendarSave = 'saving'
		else paymentsSave = 'saving'
		t.saving = setTimeout(() => {
			if (section === 'calendar') calendarSave = 'saved'
			else paymentsSave = 'saved'
			lastSavedAt = Date.now()
			t.saved = setTimeout(() => {
				if (section === 'calendar') calendarSave = 'idle'
				else paymentsSave = 'idle'
			}, 1600)
		}, 550)
	}

	function loadPreset(next: Preset) {
		preset = next
		clearAll(calendarTimers)
		clearAll(paymentsTimers)
		calendarSave = 'idle'
		paymentsSave = 'idle'
		showSwitchSheet = false
		showAppleSheet = false
		connectingProvider = null
		dismissUndo()
		removeConfirmFor = null
		if (next === 'empty') {
			weekStart = 'monday'
			sync = { active: null, syncedAtLabel: null }
			payments = { venmo: blankPayment(), paypal: blankPayment(), cashapp: blankPayment() }
			primary = null
			payPalCreds = blankPayPalCreds()
			squareCreds = blankSquareCreds()
		} else if (next === 'healthy') {
			weekStart = 'monday'
			sync = { active: 'google', syncedAtLabel: '2m ago' }
			payments = {
				venmo: { ...blankPayment(), handle: '@miko', checkoutEnabled: true },
				paypal: { ...blankPayment(), handle: 'hello@miko.art', checkoutEnabled: true },
				cashapp: blankPayment()
			}
			primary = 'venmo'
			payPalCreds = { clientId: 'AaQ...••••', clientSecret: '', environment: 'sandbox' }
			squareCreds = blankSquareCreds()
		} else {
			weekStart = 'monday'
			sync = { active: 'google', syncedAtLabel: '2m ago' }
			payments = {
				venmo: { ...blankPayment(), handle: '@miko', checkoutEnabled: true },
				paypal: {
					...blankPayment(),
					handle: 'hello@miko.art',
					checkoutEnabled: true,
					expiringSoon: true
				},
				cashapp: blankPayment()
			}
			primary = 'venmo'
			payPalCreds = { clientId: 'AaQ...••••', clientSecret: '', environment: 'sandbox' }
			squareCreds = blankSquareCreds()
		}
	}

	const configuredCount = $derived(
		paymentMethods.filter((m) => payments[m.key].handle.trim().length > 0).length
	)

	const globalSave = $derived<SaveState>(
		calendarSave === 'saving' || paymentsSave === 'saving'
			? 'saving'
			: calendarSave === 'saved' || paymentsSave === 'saved'
				? 'saved'
				: 'idle'
	)

	function toggleRow(method: PaymentMethod) {
		payments[method].expanded = !payments[method].expanded
	}

	function setHandle(method: PaymentMethod, value: string) {
		payments[method].handle = value
		if (!payments[method].handle.trim() && primary === method) {
			const fallback = paymentMethods.find((m) => m.key !== method && payments[m.key].handle.trim())
			primary = fallback ? fallback.key : null
		}
		if (!primary && payments[method].handle.trim()) primary = method
		flagSaving('payments')
	}

	function makePrimary(method: PaymentMethod) {
		if (!payments[method].handle.trim()) return
		primary = method
		flagSaving('payments')
	}

	function requestRemove(method: PaymentMethod) {
		if (removeConfirmTimer) clearTimeout(removeConfirmTimer)
		removeConfirmFor = method
		removeConfirmTimer = setTimeout(() => {
			if (removeConfirmFor === method) removeConfirmFor = null
		}, 4000)
	}

	function cancelRemove() {
		if (removeConfirmTimer) clearTimeout(removeConfirmTimer)
		removeConfirmFor = null
	}

	function confirmRemove(method: PaymentMethod) {
		if (removeConfirmTimer) clearTimeout(removeConfirmTimer)
		removeConfirmFor = null
		const meta = paymentMethods.find((m) => m.key === method)
		const snapshot: UndoSnapshot = {
			kind: 'remove-handle',
			method,
			row: { ...payments[method] },
			primary
		}
		payments[method].handle = ''
		payments[method].checkoutEnabled = false
		payments[method].advancedOpen = false
		payments[method].expanded = false
		if (primary === method) {
			const fallback = paymentMethods.find((m) => m.key !== method && payments[m.key].handle.trim())
			primary = fallback ? fallback.key : null
		}
		flagSaving('payments')
		showUndoToast(`Removed ${meta?.label ?? method}`, snapshot)
	}

	function showUndoToast(label: string, snapshot: UndoSnapshot) {
		if (undoTimer) clearTimeout(undoTimer)
		undoToast = { label, snapshot }
		undoTimer = setTimeout(() => {
			undoToast = null
		}, 5000)
	}

	function dismissUndo() {
		if (undoTimer) clearTimeout(undoTimer)
		undoToast = null
	}

	function applyUndo() {
		if (!undoToast) return
		const { snapshot } = undoToast
		if (snapshot.kind === 'remove-handle') {
			payments[snapshot.method] = snapshot.row
			primary = snapshot.primary
			flagSaving('payments')
		} else if (snapshot.kind === 'disconnect-sync') {
			sync = snapshot.sync
			flagSaving('calendar')
		}
		dismissUndo()
	}

	function checkoutCredsConfigured(method: PaymentMethod) {
		if (method === 'cashapp') {
			return Boolean(squareCreds.applicationId && squareCreds.locationId && squareCreds.accessToken)
		}
		return Boolean(payPalCreds.clientId && payPalCreds.clientSecret)
	}

	function toggleCheckout(method: PaymentMethod) {
		const row = payments[method]
		const turningOn = !row.checkoutEnabled
		row.checkoutEnabled = turningOn
		if (turningOn && !checkoutCredsConfigured(method)) {
			row.advancedOpen = true
		}
		if (!turningOn) {
			row.advancedOpen = false
			row.expiringSoon = false
		}
		flagSaving('payments')
	}

	function saveCheckoutAdvanced(method: PaymentMethod) {
		payments[method].checkoutEnabled = true
		payments[method].advancedOpen = false
		payments[method].expiringSoon = false
		flagSaving('payments')
	}

	function setWeekStart(value: 'monday' | 'sunday') {
		if (weekStart === value) return
		weekStart = value
		flagSaving('calendar')
	}

	async function simulateConnect(provider: SyncProvider) {
		connectingProvider = provider
		await new Promise((r) => setTimeout(r, 900))
		sync = { active: provider, syncedAtLabel: 'just now' }
		connectingProvider = null
		flagSaving('calendar')
	}

	function disconnectSync() {
		if (!sync.active) return
		const label = providerLabel(sync.active)
		const snapshot: UndoSnapshot = {
			kind: 'disconnect-sync',
			sync: { ...sync }
		}
		sync = { active: null, syncedAtLabel: null }
		flagSaving('calendar')
		showUndoToast(`Disconnected ${label}`, snapshot)
	}

	async function handleSwitchContinue(target: SyncProvider, _disconnectOld: boolean) {
		showSwitchSheet = false
		if (target === 'apple') {
			showAppleSheet = true
			return
		}
		await simulateConnect(target)
	}

	async function handleAppleConnect(_creds: {
		username: string
		appPassword: string
		calendarUrl: string
	}) {
		showAppleSheet = false
		await simulateConnect('apple')
	}

	function dismissAttention(key: 'paypal') {
		if (key === 'paypal') payments.paypal.expiringSoon = false
	}

	const attentionItems = $derived.by(() => {
		const items: Array<{ key: 'paypal'; text: string; cta: string; onClick: () => void }> = []
		if (payments.paypal.expiringSoon)
			items.push({
				key: 'paypal',
				text: 'PayPal token expires Mon',
				cta: 'Reconnect',
				onClick: () => {
					payments.paypal.expanded = true
					payments.paypal.advancedOpen = true
					document.getElementById('payments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
				}
			})
		return items
	})
</script>

<svelte:head>
	<title>Admin Settings · Playground</title>
</svelte:head>

<div class="social-admin pg-settings">
	<aside class="social-admin__sidebar" aria-label="Admin nav">
		<span class="social-admin__brand">Admin</span>

		<nav class="social-admin__nav" aria-label="Admin">
			<button type="button" class="social-admin__nav-item">
				<LayoutDashboard size={16} strokeWidth={1.8} /> <span>Dashboard</span>
			</button>
			<button type="button" class="social-admin__nav-item">
				<Users size={16} strokeWidth={1.8} /> <span>Crew</span>
			</button>
			<button type="button" class="social-admin__nav-item">
				<CalendarDays size={16} strokeWidth={1.8} /> <span>Events</span>
			</button>
		</nav>

		<div class="social-admin__sidebar-spacer"></div>
	</aside>

	<nav class="social-admin__breadcrumbs" aria-label="Breadcrumbs">
		<div class="social-admin__breadcrumbs-inner">
			<div class="social-admin__breadcrumbs-body">
				<a href="#dashboard" class="social-admin__crumb-link">Dashboard</a>
				<span class="social-admin__crumb-sep" aria-hidden="true">›</span>
				<span>Settings</span>
			</div>
			<div class="social-admin__breadcrumbs-actions">
				<button
					type="button"
					class="topbar-icon topbar-icon--active"
					aria-current="page"
					aria-label="Settings"
				>
					<SettingsIcon size={16} strokeWidth={1.8} />
				</button>
				<ProfileMenu
					name="Miko"
					email="hello@miko.art"
					initials="M"
					onLogout={() => {}}
				/>
			</div>
		</div>
	</nav>

	<main class="social-admin__main">
		<div class="settings">
			{#if attentionItems.length}
				<div class="attention" role="status">
					{#each attentionItems as item}
						<div class="attention__item">
							<AlertTriangle size={14} />
							<span class="attention__text">{item.text}</span>
							<button type="button" class="attention__cta" onclick={item.onClick}>
								{item.cta} →
							</button>
							<button
								type="button"
								class="attention__dismiss"
								aria-label="Dismiss"
								onclick={() => dismissAttention(item.key)}
							>
								<XIcon size={12} />
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<header class="settings__head">
				<span class="settings__head-eyebrow">Preferences</span>
				<h1>Settings</h1>
				<p class="settings__head-sub">Calendar sync, week start, and payouts.</p>
			</header>

			<SaveIndicator saveState={globalSave} {lastSavedAt} {nowTick} />

			{#if undoToast}
				<UndoToast label={undoToast.label} onUndo={applyUndo} onDismiss={dismissUndo} />
			{/if}

			<section id="calendar-sync" class="settings__section">
				<header class="settings__section-head">
					<h4>CALENDAR SYNC</h4>
				</header>
				<SyncCard
					active={sync.active}
					syncedAtLabel={sync.syncedAtLabel}
					connecting={connectingProvider}
					onConnectStart={() => (showSwitchSheet = true)}
					onSwitch={() => (showSwitchSheet = true)}
					onDisconnect={disconnectSync}
				/>
			</section>

			<section id="calendar-view" class="settings__section">
				<header class="settings__section-head">
					<h4>WEEK START</h4>
				</header>
				<WeekStartPicker value={weekStart} onChange={setWeekStart} />
			</section>

			<section id="payments" class="settings__section">
				<header class="settings__section-head">
					<h4>PAYMENT</h4>
				</header>

				{#if configuredCount === 0}
					<p class="settings__empty-hint" transition:slide={{ duration: 180, easing: cubicOut }}>
						Add at least one method to accept bookings.
					</p>
				{/if}

				<ul class="payment-list">
					{#each paymentMethods as method}
						<PaymentMethodRow
							{method}
							bind:row={payments[method.key]}
							isPrimary={primary === method.key}
							{paymentsSave}
							removeConfirm={removeConfirmFor === method.key}
							bind:payPalCreds
							bind:squareCreds
							onToggleRow={toggleRow}
							onSetHandle={setHandle}
							onMakePrimary={makePrimary}
							onRequestRemove={requestRemove}
							onCancelRemove={cancelRemove}
							onConfirmRemove={confirmRemove}
							onToggleCheckout={toggleCheckout}
							onSaveAdvanced={saveCheckoutAdvanced}
						/>
					{/each}
				</ul>
			</section>
		</div>
	</main>

	<div class="pg-state-switcher" role="radiogroup" aria-label="Demo state">
		<span class="pg-state-switcher__label">demo</span>
		{#each [{ value: 'empty', label: 'Empty' }, { value: 'healthy', label: 'Healthy' }, { value: 'attention', label: 'Attention' }] as opt}
			<button
				type="button"
				class="pg-state-switcher__btn"
				class:pg-state-switcher__btn--active={preset === opt.value}
				onclick={() => loadPreset(opt.value as Preset)}
			>
				{opt.label}
			</button>
		{/each}
	</div>

	{#if showSwitchSheet}
		<ConnectCalendarSheet
			current={sync.active}
			currentSyncedAt={sync.syncedAtLabel}
			onCancel={() => (showSwitchSheet = false)}
			onContinue={handleSwitchContinue}
		/>
	{/if}

	{#if showAppleSheet}
		<AppleCredentialSheet
			onCancel={() => (showAppleSheet = false)}
			onConnect={handleAppleConnect}
		/>
	{/if}
</div>

<style>
	:global(.playground-shell:has(.pg-settings)) {
		padding: 0;
	}

	/* admin shell layout (mirrors @calendar/ui admin-route-shell.scss) */
	.pg-settings {
		--admin-muted: var(--muted);
		--admin-border: var(--border);
		--admin-active-bg: color-mix(in srgb, var(--admin-accent) 14%, transparent);
		--admin-active-fg: color-mix(in srgb, var(--text) 94%, transparent);
		--admin-hover-bg: color-mix(in srgb, var(--text) 4%, transparent);
		--admin-hover-fg: var(--text);
		--admin-nav-link: var(--text);
		--admin-content-max: 720px;
		--admin-content-pad-x: clamp(1.5rem, 2.2vw, 2rem);
		--admin-card-bg: color-mix(in srgb, var(--admin-accent) 6%, var(--bg) 94%);
		--admin-card-border: color-mix(in srgb, var(--admin-accent) 18%, transparent);
		--admin-status-success-dot: #34c759;
		--admin-status-warn-bg: color-mix(in srgb, #ff9500 10%, transparent);
		--admin-status-warn-fg: color-mix(in srgb, #c27800 88%, var(--text) 12%);
		--admin-accent: color-mix(in srgb, var(--link) 72%, #7a5af8 28%);
		min-width: 0;
		min-height: 100vh;
		display: grid;
		grid-template-columns: 13.75rem 1fr;
		grid-template-rows: 3rem auto;
		background: var(--bg);
		color: var(--text);
		overflow-x: clip;
	}

	.pg-settings :global(.social-admin__sidebar) {
		grid-row: 1 / span 2;
		grid-column: 1;
		position: sticky;
		top: 0;
		height: 100vh;
		z-index: 20;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 2rem 1rem 1.5rem 1.25rem;
		border-right: 1px solid color-mix(in srgb, var(--admin-border) 60%, transparent);
		min-width: 0;
		overflow-x: clip;
		overflow-y: auto;
	}
	.pg-settings :global(.social-admin__brand) {
		display: inline-flex;
		align-items: center;
		padding: 0 0.5rem;
		margin-bottom: 1.2rem;
		color: color-mix(in srgb, var(--text) 48%, transparent);
		font-size: 0.71rem;
		font-weight: 650;
		line-height: 1.2;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.pg-settings :global(.social-admin__nav) {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.pg-settings :global(.social-admin__sidebar-spacer) {
		flex: 1;
		min-height: 0.75rem;
	}
	.pg-settings :global(.social-admin__nav-item) {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		font: inherit;
		font-size: 0.8125rem;
		font-weight: 400;
		line-height: 1.25;
		color: var(--admin-nav-link);
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
	}
	.pg-settings :global(.social-admin__nav-item:hover) {
		background: var(--admin-hover-bg);
		color: var(--admin-hover-fg);
	}
	.pg-settings :global(.social-admin__nav-item svg) {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.pg-settings :global(.social-admin__breadcrumbs) {
		grid-column: 2;
		grid-row: 1;
		position: relative;
		z-index: 15;
		display: flex;
		align-items: center;
		padding: 0 var(--admin-content-pad-x);
		height: 3rem;
		border-bottom: 1px solid color-mix(in srgb, var(--admin-border) 60%, transparent);
		font-size: 0.76rem;
		box-sizing: border-box;
	}
	.pg-settings :global(.social-admin__breadcrumbs-inner) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		max-width: var(--admin-content-max);
		min-height: 1.5rem;
	}
	.pg-settings :global(.social-admin__breadcrumbs-body) {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		gap: 0.35rem;
	}
	.pg-settings :global(.social-admin__breadcrumbs-body span) {
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}
	.pg-settings :global(.social-admin__crumb-link) {
		color: var(--text);
		text-decoration: none;
		font-weight: 500;
	}
	.pg-settings :global(.social-admin__crumb-link:hover) {
		color: var(--admin-accent);
	}
	.pg-settings :global(.social-admin__crumb-sep) {
		color: color-mix(in srgb, var(--text) 36%, transparent);
		opacity: 0.65;
	}
	.pg-settings :global(.social-admin__breadcrumbs-actions) {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
		min-height: 32px;
		justify-content: flex-end;
	}

	.pg-settings :global(.social-admin__main) {
		grid-row: 2;
		grid-column: 2;
		position: relative;
		z-index: 1;
		width: 100%;
		padding: 1.1rem var(--admin-content-pad-x) 1.6rem;
		min-width: 0;
		--admin-content-center-x: calc(
			var(--admin-content-pad-x) +
				(min(var(--admin-content-max), calc(100% - (var(--admin-content-pad-x) * 2))) / 2)
		);
		background:
			radial-gradient(
				circle 420px at var(--admin-content-center-x) calc(68px + 4rem),
				color-mix(in srgb, #a78bfa 16%, transparent) 0%,
				transparent 72%
			),
			var(--bg);
	}

	/* topbar settings cog (avatar lives in ProfileMenu) */
	.topbar-icon {
		width: 2.4rem;
		height: 2.4rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid transparent;
		border-radius: 999px;
		background: transparent;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
	}
	.topbar-icon :global(svg) {
		display: block;
	}
	.topbar-icon:hover {
		background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
		color: var(--text);
	}
	.topbar-icon--active {
		background: var(--admin-active-bg);
		color: var(--admin-active-fg);
	}

	/* settings page */
	.settings {
		display: grid;
		gap: 1.6rem;
		width: 100%;
		max-width: var(--admin-content-max);
		position: relative;
	}

	.settings__head {
		display: block;
		margin: 0 0 0.9rem;
	}
	.settings__head-eyebrow {
		display: block;
		margin: 0 0 0.25rem;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.71rem;
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 48%, transparent);
	}
	.settings__head h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.7rem, 2.8vw, 2.35rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1.08;
		color: var(--text);
	}
	.settings__head-sub {
		margin: 0.5rem 0 0;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.9rem;
		font-weight: 400;
		font-style: italic;
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}

	.settings__section {
		display: grid;
		gap: 0.85rem;
	}

	.settings__section-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.55rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
	}
	.settings__section-head h4 {
		margin: 0;
		font-size: 0.78rem;
		letter-spacing: 0.09em;
		font-weight: 680;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}

	.settings__empty-hint {
		margin: 0;
		padding: 0.85rem 1rem;
		border-radius: 0.625rem;
		background: color-mix(in srgb, var(--admin-accent) 8%, var(--bg) 92%);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 24%, transparent);
		font-size: 0.84rem;
		font-weight: 460;
		font-style: italic;
		color: color-mix(in srgb, var(--admin-accent) 78%, var(--text) 22%);
		line-height: 1.5;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.settings__empty-hint::before {
		content: '✦';
		font-style: normal;
		font-size: 0.85rem;
		opacity: 0.85;
	}

	.payment-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	.attention {
		display: grid;
		gap: 0.4rem;
	}
	.attention__item {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.55rem 0.75rem;
		border-radius: 0.625rem;
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
		border: 1px solid color-mix(in srgb, var(--admin-status-warn-fg) 22%, transparent);
		font-size: 0.78rem;
		font-weight: 460;
		line-height: 1.4;
	}
	.attention__item :global(svg) {
		flex-shrink: 0;
	}
	.attention__text {
		flex: 1;
	}
	.attention__cta {
		border: none;
		background: none;
		font: inherit;
		font-weight: 660;
		color: inherit;
		cursor: pointer;
		padding: 0;
	}
	.attention__cta:hover {
		text-decoration: underline;
	}
	.attention__dismiss {
		border: none;
		background: none;
		color: inherit;
		opacity: 0.6;
		cursor: pointer;
		display: inline-flex;
		padding: 0.2rem;
	}
	.attention__dismiss:hover {
		opacity: 1;
	}

	/* state switcher (floating demo control) */
	.pg-state-switcher {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 80;
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.25rem 0.35rem;
		border-radius: 0.55rem;
		background: color-mix(in srgb, var(--bg) 92%, var(--text) 8%);
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		box-shadow: 0 8px 22px color-mix(in srgb, black 14%, transparent);
		font-size: 0.7rem;
		opacity: 0.55;
		transition: opacity 150ms ease;
	}
	.pg-state-switcher:hover {
		opacity: 1;
	}
	.pg-state-switcher__label {
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--text) 50%, transparent);
		padding: 0 0.3rem;
	}
	.pg-state-switcher__btn {
		border: none;
		background: transparent;
		font: inherit;
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 0.35rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		cursor: pointer;
	}
	.pg-state-switcher__btn--active {
		background: var(--admin-active-bg);
		color: var(--text);
	}

	/* unified button system — global so child components can reuse */
	:global(.admin-btn) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-height: 2rem;
		padding: 0 0.85rem;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 560;
		letter-spacing: -0.003em;
		border-radius: 0.625rem;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: color-mix(in srgb, var(--bg) 96%, var(--text) 4%);
		color: color-mix(in srgb, var(--text) 80%, transparent);
		cursor: pointer;
		transition:
			border-color 120ms ease,
			background 120ms ease,
			color 120ms ease;
		white-space: nowrap;
	}
	:global(.admin-btn:hover:not(:disabled)) {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: var(--text);
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
	}
	:global(.admin-btn:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}
	:global(.admin-btn--accent) {
		background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
		border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
		color: var(--text);
	}
	:global(.admin-btn--accent:hover:not(:disabled)) {
		background: color-mix(in srgb, var(--admin-accent) 18%, var(--bg) 82%);
		border-color: color-mix(in srgb, var(--admin-accent) 44%, transparent);
	}
	:global(.admin-btn--solid) {
		background: var(--admin-accent);
		border-color: var(--admin-accent);
		color: #fff;
	}
	:global(.admin-btn--solid:hover:not(:disabled)) {
		filter: brightness(1.08);
	}
	:global(.admin-btn--muted) {
		background: transparent;
		border-color: transparent;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}
	:global(.admin-btn--muted:hover:not(:disabled)) {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--text);
		border-color: transparent;
	}
	:global(.admin-btn--danger:hover:not(:disabled)) {
		background: color-mix(in srgb, #ef4444 10%, transparent);
		border-color: color-mix(in srgb, #ef4444 36%, transparent);
		color: #ef4444;
	}
	:global(.admin-btn--warn) {
		background: color-mix(in srgb, var(--admin-status-warn-fg) 14%, transparent);
		border-color: color-mix(in srgb, var(--admin-status-warn-fg) 32%, transparent);
		color: var(--admin-status-warn-fg);
	}
	:global(.admin-btn--dashed) {
		background: transparent;
		border-style: dashed;
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
		color: var(--text);
		justify-self: start;
	}
	:global(.admin-btn--dashed:hover:not(:disabled)) {
		border-color: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 6%, transparent);
	}
	:global(.admin-btn--icon) {
		min-height: 2rem;
		width: 2rem;
		padding: 0;
	}
	:global(.admin-btn--icon:hover:not(:disabled)) {
		background: color-mix(in srgb, #ef4444 10%, transparent);
		border-color: color-mix(in srgb, #ef4444 36%, transparent);
		color: #ef4444;
	}
	:global(.admin-btn--solid-danger) {
		background: #ef4444;
		border-color: #ef4444;
		color: #fff;
	}
	:global(.admin-btn--solid-danger:hover:not(:disabled)) {
		background: #dc2626;
		border-color: #dc2626;
		color: #fff;
	}

	/* form-control sizing override */
	.pg-settings :global(.ui-form-control) {
		min-height: 2rem;
		padding: 0 0.7rem;
		font-size: 0.84rem;
		border-radius: 0.625rem;
	}
	.pg-settings :global(select.ui-form-control) {
		padding-right: 1.6rem;
	}

	@media (max-width: 48em) {
		.pg-settings {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto 1fr;
		}
		.pg-settings :global(.social-admin__breadcrumbs) {
			grid-column: 1;
			grid-row: 1;
			padding: 0.5rem 1rem;
		}
		.pg-settings :global(.social-admin__sidebar) {
			grid-row: 2;
			grid-column: 1;
			position: static;
			height: auto;
			flex-direction: row;
			align-items: center;
			gap: 0.25rem;
			padding: 0.6rem 1rem;
			border-right: none;
			border-bottom: 1px solid color-mix(in srgb, var(--admin-border) 60%, transparent);
			overflow-x: auto;
			overflow-y: hidden;
		}
		.pg-settings :global(.social-admin__brand) {
			display: none;
		}
		.pg-settings :global(.social-admin__nav) {
			flex-direction: row;
			gap: 0.25rem;
			flex-wrap: nowrap;
		}
		.pg-settings :global(.social-admin__nav-item) {
			white-space: nowrap;
		}
		.pg-settings :global(.social-admin__main) {
			grid-row: 3;
			grid-column: 1;
			padding: 1.5rem 1rem;
		}
	}
</style>
