<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte'
	import { fade, fly, slide } from 'svelte/transition'
	import { cubicOut, quintOut } from 'svelte/easing'
	import {
		ArrowRight,
		CalendarDays,
		Check,
		ChevronDown,
		ChevronRight,
		HelpCircle,
		LayoutDashboard,
		Loader2,
		LogOut,
		Plug,
		Plus,
		RefreshCw,
		Settings as SettingsIcon,
		Star,
		Trash2,
		Unplug,
		Users,
		AlertTriangle,
		X as XIcon
	} from '@lucide/svelte'

	type SyncProvider = 'google' | 'apple' | 'outlook'
	type PaymentMethod = 'venmo' | 'paypal' | 'cashapp'
	type SaveState = 'idle' | 'saving' | 'saved'
	type Preset = 'empty' | 'healthy' | 'attention'

	type SyncStatus = {
		active: SyncProvider | null
		syncedAtLabel: string | null
	}

	type PayPalCreds = { clientId: string; clientSecret: string; environment: 'sandbox' | 'live' }
	type SquareCreds = {
		applicationId: string
		locationId: string
		accessToken: string
		environment: 'sandbox' | 'live'
	}

	type PaymentRow = {
		handle: string
		expanded: boolean
		checkoutEnabled: boolean
		advancedOpen: boolean
		expiringSoon: boolean
	}

	const paymentMethods: Array<{
		key: PaymentMethod
		label: string
		color: string
		placeholder: string
		blurb: (handle: string) => string
		checkoutBlurb: string
	}> = [
		{
			key: 'venmo',
			label: 'Venmo',
			color: '#3D95CE',
			placeholder: '@yourname',
			blurb: (h) =>
				h
					? `Buyers see venmo.com/u/${h.replace(/^@/, '')}`
					: 'Buyers tap a link that opens the Venmo app.',
			checkoutBlurb: 'Adds a Venmo button to bookings (uses your PayPal account).'
		},
		{
			key: 'paypal',
			label: 'PayPal',
			color: '#0070BA',
			placeholder: 'Email or merchant ID',
			blurb: (h) => (h ? `Buyers see paypal.me/${h}` : 'Buyers tap a link that opens PayPal.'),
			checkoutBlurb: 'Adds a PayPal button to bookings.'
		},
		{
			key: 'cashapp',
			label: 'Cash App',
			color: '#00C244',
			placeholder: '$yourname',
			blurb: (h) =>
				h
					? `Buyers see cash.app/${h.replace(/^\$/, '$')}`
					: 'Buyers tap a link that opens Cash App.',
			checkoutBlurb: 'Adds a Cash App Pay button to bookings.'
		}
	]

	const providerOptions: Array<{ value: SyncProvider; label: string }> = [
		{ value: 'google', label: 'Google Calendar' },
		{ value: 'apple', label: 'Apple Calendar' },
		{ value: 'outlook', label: 'Outlook' }
	]

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
	let switchTarget = $state<SyncProvider | null>(null)
	let switchDisconnectOld = $state(true)
	let showAppleSheet = $state(false)
	let appleUser = $state('')
	let applePw = $state('')
	let appleUrl = $state('')
	let appleTestState = $state<'idle' | 'testing' | 'ok' | 'fail'>('idle')
	let connectingProvider = $state<SyncProvider | null>(null)
	let profileMenuOpen = $state(false)
	let removeConfirmFor = $state<PaymentMethod | null>(null)
	let lastSavedAt = $state<number | null>(null)
	let nowTick = $state(Date.now())
	let switchSheetEl = $state<HTMLDivElement | null>(null)
	let appleSheetEl = $state<HTMLDivElement | null>(null)

	type UndoSnapshot =
		| { kind: 'remove-handle'; method: PaymentMethod; row: PaymentRow; primary: PaymentMethod | null }
		| { kind: 'disconnect-sync'; sync: SyncStatus }

	let undoToast = $state<{ label: string; snapshot: UndoSnapshot } | null>(null)
	let undoTimer: ReturnType<typeof setTimeout> | null = null
	let removeConfirmTimer: ReturnType<typeof setTimeout> | null = null

	const calendarTimers = {
		saving: null as ReturnType<typeof setTimeout> | null,
		saved: null as ReturnType<typeof setTimeout> | null
	}
	const paymentsTimers = {
		saving: null as ReturnType<typeof setTimeout> | null,
		saved: null as ReturnType<typeof setTimeout> | null
	}

	let nowInterval: ReturnType<typeof setInterval> | null = null

	onMount(() => {
		const onClickAway = (e: MouseEvent) => {
			if (!profileMenuOpen) return
			const target = e.target as HTMLElement | null
			if (target && target.closest('.profile-menu')) return
			profileMenuOpen = false
		}
		window.addEventListener('mousedown', onClickAway)
		nowInterval = setInterval(() => (nowTick = Date.now()), 30000)
		return () => {
			window.removeEventListener('mousedown', onClickAway)
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
		appleTestState = 'idle'
		appleUser = ''
		applePw = ''
		appleUrl = ''
		connectingProvider = null
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

	function validateHandle(method: PaymentMethod, raw: string): string | null {
		const v = raw.trim()
		if (!v) return null
		if (method === 'venmo') {
			if (!/^@?[a-zA-Z0-9_-]{1,30}$/.test(v))
				return 'Letters, numbers, dashes or underscores only.'
		} else if (method === 'paypal') {
			const isEmail = /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(v)
			const isMerchant = /^[A-Z0-9]{6,20}$/.test(v)
			if (!isEmail && !isMerchant) return 'Use an email or PayPal merchant ID.'
		} else if (method === 'cashapp') {
			if (!/^\$?[a-zA-Z][a-zA-Z0-9_-]{0,30}$/.test(v))
				return 'Cashtag — starts with a letter, no spaces.'
		}
		return null
	}

	const configuredCount = $derived(
		paymentMethods.filter((m) => payments[m.key].handle.trim().length > 0).length
	)

	$effect(() => {
		if (showSwitchSheet && switchSheetEl) {
			void tick().then(() => {
				const el = switchSheetEl?.querySelector<HTMLElement>('button, [tabindex="0"], input')
				el?.focus()
			})
		}
	})
	$effect(() => {
		if (showAppleSheet && appleSheetEl) {
			void tick().then(() => {
				const el = appleSheetEl?.querySelector<HTMLElement>('input, button')
				el?.focus()
			})
		}
	})

	function relativeSavedLabel(stamp: number, now: number) {
		const seconds = Math.max(0, Math.floor((now - stamp) / 1000))
		if (seconds < 5) return 'All saved · just now'
		if (seconds < 60) return `All saved · ${seconds}s ago`
		const minutes = Math.floor(seconds / 60)
		if (minutes < 60) return `All saved · ${minutes}m ago`
		const hours = Math.floor(minutes / 60)
		return `All saved · ${hours}h ago`
	}

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

	function openSwitchSheet() {
		switchTarget = providerOptions.find((p) => p.value !== sync.active)?.value ?? null
		switchDisconnectOld = true
		showSwitchSheet = true
	}

	function closeSwitchSheet() {
		showSwitchSheet = false
		switchTarget = null
	}

	async function continueSwitch() {
		if (!switchTarget) return
		const target = switchTarget
		const disconnectOld = switchDisconnectOld
		showSwitchSheet = false
		if (target === 'apple') {
			showAppleSheet = true
			return
		}
		await simulateConnect(target, disconnectOld)
	}

	async function simulateConnect(provider: SyncProvider, _disconnectOld: boolean) {
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

	function providerLabel(p: SyncProvider) {
		return providerOptions.find((opt) => opt.value === p)?.label ?? p
	}

	async function testAppleConnection() {
		if (!appleUser.trim() || !applePw.trim() || !appleUrl.trim()) {
			appleTestState = 'fail'
			return
		}
		appleTestState = 'testing'
		await new Promise((r) => setTimeout(r, 700))
		appleTestState = 'ok'
	}

	async function ensureAppleTested() {
		if (appleTestState !== 'ok') await testAppleConnection()
	}

	async function connectApple() {
		await ensureAppleTested()
		if (appleTestState !== 'ok') return
		showAppleSheet = false
		await simulateConnect('apple', true)
		appleUser = ''
		applePw = ''
		appleUrl = ''
		appleTestState = 'idle'
	}

	function dismissAttention(key: 'paypal') {
		if (key === 'paypal') payments.paypal.expiringSoon = false
	}

	const globalSave = $derived<SaveState>(
		calendarSave === 'saving' || paymentsSave === 'saving'
			? 'saving'
			: calendarSave === 'saved' || paymentsSave === 'saved'
				? 'saved'
				: 'idle'
	)

	const savedDisplay = $derived.by(() => {
		if (globalSave === 'saving') return { state: 'saving' as const, label: 'Saving…' }
		if (globalSave === 'saved') return { state: 'saved' as const, label: 'Saved ✓' }
		if (lastSavedAt) {
			return { state: 'idle-saved' as const, label: relativeSavedLabel(lastSavedAt, nowTick) }
		}
		return { state: 'idle' as const, label: '' }
	})

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
				<span>Settings</span>
			</div>
			<div class="social-admin__breadcrumbs-actions">
				<button
					type="button"
					class="topbar-icon topbar-icon--active"
					aria-current="page"
					aria-label="Settings"
				>
					<SettingsIcon size={20} strokeWidth={2} />
				</button>
				<div class="profile-menu">
					<button
						type="button"
						class="topbar-avatar"
						aria-label="Account"
						aria-expanded={profileMenuOpen}
						aria-haspopup="menu"
						onclick={() => (profileMenuOpen = !profileMenuOpen)}
					>
						M
					</button>
					{#if profileMenuOpen}
						<div
							class="profile-menu__panel"
							role="menu"
							transition:fly={{ y: -4, duration: 140, easing: cubicOut }}
						>
							<div class="profile-menu__header">
								<div class="profile-menu__name">Miko</div>
								<div class="profile-menu__email">hello@miko.art</div>
							</div>
							<div class="profile-menu__divider" aria-hidden="true"></div>
							<button type="button" class="profile-menu__item" role="menuitem">
								<LogOut size={14} strokeWidth={1.8} /> Log out
							</button>
						</div>
					{/if}
				</div>
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

			<span class="settings__save" data-state={savedDisplay.state} aria-live="polite">
				{savedDisplay.label}
			</span>

			{#if undoToast}
				<div
					class="undo-toast"
					role="status"
					aria-live="polite"
					transition:fly={{ y: -8, duration: 180, easing: cubicOut }}
				>
					<span class="undo-toast__label">{undoToast.label}</span>
					<button type="button" class="undo-toast__undo" onclick={applyUndo}>Undo</button>
					<button
						type="button"
						class="undo-toast__dismiss"
						aria-label="Dismiss"
						onclick={dismissUndo}
					>
						<XIcon size={12} />
					</button>
				</div>
			{/if}

			<section id="calendar-sync" class="settings__section">
				<header class="settings__section-head">
					<h4>CALENDAR SYNC</h4>
				</header>

				{#if sync.active}
					<div class="sync-card">
						<span class="sync-card__icon" aria-hidden="true">{@render providerIcon(sync.active)}</span>
						<div class="sync-card__body">
							<div class="sync-card__name">{providerLabel(sync.active)}</div>
							<div
								class="sync-card__status"
								title={`Last successful sync ${sync.syncedAtLabel}. Next attempt in 8m.`}
							>
								<span class="sync-card__dot" aria-hidden="true"></span>
								Connected · synced {sync.syncedAtLabel}
							</div>
						</div>
						<div class="sync-card__actions">
							<button type="button" class="admin-btn" onclick={openSwitchSheet}>
								<RefreshCw size={13} strokeWidth={2} /> Switch
							</button>
							<button type="button" class="admin-btn admin-btn--danger" onclick={disconnectSync}>
								<Unplug size={13} strokeWidth={2} /> Disconnect
							</button>
						</div>
					</div>
				{:else if connectingProvider}
					<div class="sync-card sync-card--busy">
						<span class="sync-card__icon sync-card__icon--spinning" aria-hidden="true">
							<Loader2 size={16} strokeWidth={2} />
						</span>
						<div class="sync-card__body">
							<div class="sync-card__name">{providerLabel(connectingProvider)}</div>
							<div class="sync-card__status">Connecting…</div>
						</div>
					</div>
				{:else}
					<button type="button" class="admin-btn admin-btn--dashed" onclick={openSwitchSheet}>
						<Plus size={14} /> Connect a calendar
					</button>
				{/if}
			</section>

			<section id="calendar-view" class="settings__section">
				<header class="settings__section-head">
					<h4>WEEK START</h4>
				</header>

				<div class="week-pick" role="radiogroup" aria-label="Week starts on">
					{#each [{ value: 'monday', label: 'Monday' }, { value: 'sunday', label: 'Sunday' }] as opt}
						<label
							class="week-pick__opt"
							class:week-pick__opt--active={weekStart === opt.value}
						>
							<input
								type="radio"
								name="week-start"
								value={opt.value}
								checked={weekStart === opt.value}
								onchange={() => setWeekStart(opt.value as 'monday' | 'sunday')}
							/>
							<span>{opt.label}</span>
						</label>
					{/each}
				</div>
			</section>

			<section id="payments" class="settings__section">
				<header class="settings__section-head">
					<h4>PAYMENT</h4>
				</header>

				{#if configuredCount === 0}
					<p
						class="settings__empty-hint"
						transition:slide={{ duration: 180, easing: cubicOut }}
					>
						Add at least one method to accept bookings.
					</p>
				{/if}

				<ul class="payment-list">
					{#each paymentMethods as method}
						{@const row = payments[method.key]}
						{@const configured = row.handle.trim().length > 0}
						{@const isPrimary = primary === method.key}
						<li
							class="payment-row"
							class:payment-row--primary={isPrimary && configured}
							style="--method-color: {method.color}"
						>
							<button
								type="button"
								class="payment-row__head"
								onclick={() => toggleRow(method.key)}
								aria-expanded={row.expanded}
							>
								<span class="payment-row__dot" aria-hidden="true"></span>
								<span class="payment-row__name">{method.label}</span>
								<span class="payment-row__handle">
									{#if configured}
										{row.handle}
									{:else}
										<span class="payment-row__placeholder">not set up</span>
									{/if}
								</span>
								<span class="payment-row__meta">
									{#if isPrimary && configured}
										<span class="pill pill--primary" title="Default for new bookings.">
											Primary
										</span>
									{/if}
									{#if row.expiringSoon}
										<span class="pill pill--warn"><AlertTriangle size={11} /> Token</span>
									{/if}
									{#if !configured}
										<span class="payment-row__add"><Plus size={12} /> Add</span>
									{/if}
								</span>
								<span class="payment-row__chev" aria-hidden="true">
									{#if row.expanded}<ChevronDown size={14} />{:else}<ChevronRight size={14} />{/if}
								</span>
							</button>

							{#if row.expanded}
								{@const handleErr = validateHandle(method.key, row.handle)}
								<div
									class="payment-row__body"
									transition:slide={{ duration: 220, easing: cubicOut }}
								>
									<label class="field">
										<span class="field__label">Your handle</span>
										<div class="field__control" class:field__control--invalid={!!handleErr}>
											<input
												type="text"
												class="ui-form-control field__input"
												value={row.handle}
												placeholder={method.placeholder}
												aria-invalid={handleErr ? 'true' : undefined}
												oninput={(e) =>
													setHandle(method.key, (e.currentTarget as HTMLInputElement).value)}
											/>
											{#if handleErr}
												<span class="field__warn" aria-hidden="true">
													<AlertTriangle size={14} />
												</span>
											{:else if configured && paymentsSave === 'saved'}
												<span class="field__check" aria-hidden="true"><Check size={14} /></span>
											{/if}
										</div>
										{#if handleErr}
											<p
												class="field__error"
												transition:slide={{ duration: 160, easing: cubicOut }}
											>
												{handleErr}
											</p>
										{:else}
											<p class="field__hint">{method.blurb(row.handle)}</p>
										{/if}
									</label>

									<div class="checkout">
										<div class="checkout__head">
											<div>
												<div class="checkout__title">Accept {method.label} at checkout</div>
												<p class="checkout__blurb">{method.checkoutBlurb}</p>
											</div>
											<button
												type="button"
												class="switch"
												class:switch--on={row.checkoutEnabled}
												role="switch"
												aria-checked={row.checkoutEnabled}
												aria-label={`${row.checkoutEnabled ? 'Disable' : 'Enable'} ${method.label} checkout`}
												onclick={() => toggleCheckout(method.key)}
											>
												<span class="switch__track" aria-hidden="true">
													<span class="switch__knob"></span>
												</span>
												<span class="switch__label">
													{row.checkoutEnabled ? 'On' : 'Off'}
												</span>
											</button>
										</div>

										{#if row.expiringSoon}
											<div class="checkout__alert">
												<span class="checkout__alert-text">
													<AlertTriangle size={13} />
													PayPal token expires Mon
												</span>
												<button
													type="button"
													class="admin-btn admin-btn--warn"
													onclick={() => (row.advancedOpen = true)}
												>
													<RefreshCw size={13} strokeWidth={2} /> Reconnect
												</button>
											</div>
										{/if}

										{#if row.checkoutEnabled || row.advancedOpen}
											<button
												type="button"
												class="disclosure"
												onclick={() => (row.advancedOpen = !row.advancedOpen)}
												aria-expanded={row.advancedOpen}
											>
												{#if row.advancedOpen}
													<ChevronDown size={14} />
												{:else}
													<ChevronRight size={14} />
												{/if}
												Advanced setup
											</button>
										{/if}

										{#if row.advancedOpen}
											<div class="creds" transition:slide={{ duration: 200, easing: cubicOut }}>
												{#if method.key === 'cashapp'}
													<label class="field">
														<span class="field__label">
															Application ID
															{@render helpHint('Square Dashboard → Apps → your app → Credentials')}
														</span>
														<input
															type="text"
															class="ui-form-control"
															bind:value={squareCreds.applicationId}
														/>
													</label>
													<label class="field">
														<span class="field__label">
															Location ID
															{@render helpHint('Square Dashboard → Account → Locations')}
														</span>
														<input
															type="text"
															class="ui-form-control"
															bind:value={squareCreds.locationId}
														/>
													</label>
													<label class="field">
														<span class="field__label">
															Access token
															{@render helpHint('Personal access token. Treat it like a password.')}
														</span>
														<input
															type="password"
															class="ui-form-control"
															bind:value={squareCreds.accessToken}
														/>
													</label>
													<label class="field">
														<span class="field__label">Environment</span>
														<select class="ui-form-control" bind:value={squareCreds.environment}>
															<option value="sandbox">Sandbox</option>
															<option value="live">Live</option>
														</select>
													</label>
												{:else}
													<label class="field">
														<span class="field__label">
															Client ID
															{@render helpHint('PayPal Developer → My Apps & Credentials')}
														</span>
														<input
															type="text"
															class="ui-form-control"
															bind:value={payPalCreds.clientId}
														/>
													</label>
													<label class="field">
														<span class="field__label">
															Client secret
															{@render helpHint('Same screen as Client ID. Treat like a password.')}
														</span>
														<input
															type="password"
															class="ui-form-control"
															bind:value={payPalCreds.clientSecret}
														/>
													</label>
													<label class="field">
														<span class="field__label">Environment</span>
														<select class="ui-form-control" bind:value={payPalCreds.environment}>
															<option value="sandbox">Sandbox</option>
															<option value="live">Live</option>
														</select>
													</label>
												{/if}
												<div class="creds__actions">
													<button type="button" class="admin-btn">
														<Plug size={13} strokeWidth={2} /> Test connection
													</button>
													<button
														type="button"
														class="admin-btn admin-btn--solid"
														onclick={() => saveCheckoutAdvanced(method.key)}
													>
														<Check size={14} strokeWidth={2.2} /> Save
													</button>
												</div>
											</div>
										{/if}
									</div>

									<div class="payment-row__footer">
										{#if removeConfirmFor === method.key}
											<div class="confirm-row">
												<span class="confirm-row__text">
													Remove {method.label}?
												</span>
												<div class="confirm-row__actions">
													<button
														type="button"
														class="admin-btn admin-btn--muted"
														onclick={cancelRemove}
													>
														Cancel
													</button>
													<button
														type="button"
														class="admin-btn admin-btn--danger admin-btn--solid-danger"
														onclick={() => confirmRemove(method.key)}
													>
														<Trash2 size={13} strokeWidth={2} /> Yes, remove
													</button>
												</div>
											</div>
										{:else}
											<div class="payment-row__footer-primary">
												{#if configured && !isPrimary}
													<button
														type="button"
														class="admin-btn admin-btn--accent"
														onclick={() => makePrimary(method.key)}
													>
														<Star size={13} strokeWidth={2} /> Make primary
													</button>
												{/if}
											</div>
											{#if configured}
												<button
													type="button"
													class="admin-btn admin-btn--icon admin-btn--danger"
													aria-label={`Remove ${method.label}`}
													title={`Remove ${method.label}`}
													onclick={() => requestRemove(method.key)}
												>
													<Trash2 size={14} strokeWidth={2} />
												</button>
											{/if}
										{/if}
									</div>
								</div>
							{/if}
						</li>
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
		<div
			class="sheet-backdrop"
			role="presentation"
			onclick={closeSwitchSheet}
			onkeydown={(e) => e.key === 'Escape' && closeSwitchSheet()}
			transition:fade={{ duration: 160 }}
		>
			<div
				bind:this={switchSheetEl}
				class="sheet"
				role="dialog"
				aria-modal="true"
				aria-label="Switch provider"
				tabindex="-1"
				transition:fly={{ y: 12, duration: 200, easing: quintOut }}
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => {
					e.stopPropagation()
					if (e.key === 'Escape') closeSwitchSheet()
				}}
			>
				<header class="sheet__head">
					<h3>{sync.active ? 'Switch calendar provider' : 'Connect a calendar'}</h3>
				</header>
				<div class="sheet__body">
					{#if sync.active}
						<p class="sheet__current">
							Currently: <strong>{providerLabel(sync.active)}</strong> · synced {sync.syncedAtLabel}
						</p>
					{/if}
					<div class="sheet__list" role="radiogroup">
						{#each providerOptions.filter((p) => p.value !== sync.active) as opt}
							<button
								type="button"
								class="sheet__opt"
								class:sheet__opt--active={switchTarget === opt.value}
								role="radio"
								aria-checked={switchTarget === opt.value}
								onclick={() => (switchTarget = opt.value)}
							>
								<span class="sheet__opt-icon" aria-hidden="true">{@render providerIcon(opt.value)}</span>
								<span class="sheet__opt-label">{opt.label}</span>
								{#if switchTarget === opt.value}
									<Check size={16} aria-hidden="true" />
								{/if}
							</button>
						{/each}
					</div>
					{#if sync.active}
						<label class="sheet__check">
							<input type="checkbox" bind:checked={switchDisconnectOld} />
							<span>Disconnect {providerLabel(sync.active)} after the new one connects.</span>
						</label>
					{/if}
				</div>
				<footer class="sheet__foot">
					<button type="button" class="admin-btn admin-btn--muted" onclick={closeSwitchSheet}>
						Cancel
					</button>
					<button
						type="button"
						class="admin-btn admin-btn--solid"
						disabled={!switchTarget}
						onclick={continueSwitch}
					>
						Continue <ArrowRight size={14} strokeWidth={2.2} />
					</button>
				</footer>
			</div>
		</div>
	{/if}

	{#if showAppleSheet}
		<div
			class="sheet-backdrop"
			role="presentation"
			onclick={() => (showAppleSheet = false)}
			onkeydown={(e) => e.key === 'Escape' && (showAppleSheet = false)}
			transition:fade={{ duration: 160 }}
		>
			<div
				bind:this={appleSheetEl}
				class="sheet"
				role="dialog"
				aria-modal="true"
				aria-label="Connect Apple Calendar"
				tabindex="-1"
				transition:fly={{ y: 12, duration: 200, easing: quintOut }}
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => {
					e.stopPropagation()
					if (e.key === 'Escape') showAppleSheet = false
				}}
			>
				<header class="sheet__head">
					<h3>Connect Apple Calendar</h3>
				</header>
				<div class="sheet__body">
					<label class="field">
						<span class="field__label">Apple ID email</span>
						<input
							class="ui-form-control"
							type="email"
							bind:value={appleUser}
							autocomplete="username"
						/>
					</label>
					<label class="field">
						<span class="field__label">
							App-specific password
							{@render helpHint('Create one at appleid.apple.com → Sign-In & Security → App-Specific Passwords')}
						</span>
						<input
							class="ui-form-control"
							type="password"
							bind:value={applePw}
							autocomplete="new-password"
						/>
					</label>
					<label class="field">
						<span class="field__label">
							CalDAV URL
							{@render helpHint('From iCloud → Calendars → right-click your calendar → Public Calendar URL')}
						</span>
						<input
							class="ui-form-control"
							type="url"
							placeholder="https://caldav.icloud.com/..."
							bind:value={appleUrl}
						/>
					</label>
					{#if appleTestState === 'ok'}
						<div class="hint hint--ok"><Check size={14} /> Connection looks good.</div>
					{:else if appleTestState === 'fail'}
						<div class="hint hint--fail"><AlertTriangle size={14} /> Couldn't reach that calendar.</div>
					{/if}
				</div>
				<footer class="sheet__foot">
					<button
						type="button"
						class="admin-btn admin-btn--muted"
						onclick={() => (showAppleSheet = false)}
					>
						Cancel
					</button>
					<button
						type="button"
						class="admin-btn"
						disabled={appleTestState === 'testing'}
						onclick={testAppleConnection}
					>
						<Plug size={13} strokeWidth={2} />
						{appleTestState === 'testing' ? 'Testing…' : 'Test connection'}
					</button>
					<button type="button" class="admin-btn admin-btn--solid" onclick={connectApple}>
						<Plug size={14} strokeWidth={2.2} /> Connect
					</button>
				</footer>
			</div>
		</div>
	{/if}
</div>

{#snippet helpHint(text: string)}
	<button
		type="button"
		class="field__help-btn"
		title={text}
		aria-label={`Help: ${text}`}
		onclick={(e) => e.preventDefault()}
	>
		<HelpCircle size={12} strokeWidth={2} />
	</button>
{/snippet}

{#snippet providerIcon(p: SyncProvider)}
	{#if p === 'google'}
		<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
				fill="#4285F4"
			></path>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			></path>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			></path>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			></path>
		</svg>
	{:else if p === 'apple'}
		<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
			<path
				d="M16.37 12.45c.02 2.25 1.97 3 2 3.01-.02.05-.31 1.08-1.02 2.13-.61.91-1.25 1.82-2.25 1.84-.98.02-1.3-.58-2.43-.58-1.13 0-1.49.56-2.41.6-.96.04-1.69-.97-2.31-1.87-1.26-1.82-2.22-5.14-.93-7.38.64-1.11 1.79-1.82 3.04-1.84.95-.02 1.84.64 2.43.64.59 0 1.7-.79 2.86-.67.49.02 1.87.2 2.76 1.5-.07.04-1.65.96-1.64 2.62zM14.81 4.35c.51-.62.86-1.48.77-2.35-.74.03-1.64.49-2.18 1.1-.48.55-.9 1.42-.79 2.26.82.06 1.69-.42 2.2-1.01z"
			/>
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
			<path
				d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13Zm1.8.3v12.4h14.4V5.8H4.8Zm1.7 2.2h10.9v1.8H6.5V8Zm0 3.2h10.9V13H6.5v-1.8Zm0 3.2h7.1v1.8H6.5v-1.8Z"
			/>
		</svg>
	{/if}
{/snippet}

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
		--admin-nav-link: color-mix(in srgb, var(--text) 70%, transparent);
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
	.pg-settings :global(.social-admin__logout button) {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		border: none;
		background: transparent;
		color: color-mix(in srgb, var(--admin-muted) 80%, var(--text));
		font: inherit;
		font-size: 0.8125rem;
		cursor: pointer;
		text-align: left;
	}
	.pg-settings :global(.social-admin__logout button:hover) {
		color: var(--text);
		background: color-mix(in srgb, var(--text) 3.5%, transparent);
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
		margin: 0 auto;
	}
	.pg-settings :global(.social-admin__breadcrumbs-body) {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		gap: 0.35rem;
	}
	.pg-settings :global(.social-admin__breadcrumbs-body span) {
		color: var(--admin-muted);
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

	/* topbar icons */
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
		border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
		color: var(--admin-active-fg);
	}

	.topbar-avatar {
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.82rem;
		font-weight: 700;
		background: color-mix(in srgb, var(--admin-accent) 22%, transparent);
		color: var(--text);
		border: none;
		cursor: pointer;
	}
	.topbar-avatar:hover {
		background: color-mix(in srgb, var(--admin-accent) 32%, transparent);
	}

	.profile-menu {
		position: relative;
		display: inline-flex;
	}
	.profile-menu__panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		min-width: 12rem;
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		box-shadow: 0 14px 40px -10px color-mix(in srgb, black 28%, transparent);
		padding: 0.4rem 0;
		z-index: 30;
	}
	.profile-menu__header {
		padding: 0.45rem 0.85rem 0.55rem;
	}
	.profile-menu__name {
		font-size: 0.82rem;
		font-weight: 560;
		color: var(--text);
	}
	.profile-menu__email {
		font-size: 0.72rem;
		font-weight: 400;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 54%, transparent);
		margin-top: 0.15rem;
	}
	.profile-menu__divider {
		height: 1px;
		background: color-mix(in srgb, var(--text) 10%, transparent);
		margin: 0.3rem 0;
	}
	.profile-menu__item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.85rem;
		border: none;
		background: transparent;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 500;
		color: color-mix(in srgb, var(--text) 72%, transparent);
		cursor: pointer;
		text-align: left;
	}
	.profile-menu__item:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--text);
	}

	/* settings page — left-aligned, original-style typography */
	.settings {
		display: grid;
		gap: 1.6rem;
		width: 100%;
		max-width: var(--admin-content-max);
		position: relative;
	}

	.settings__save {
		position: absolute;
		top: 0.4rem;
		right: 0;
		font-size: 0.74rem;
		font-weight: 440;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
		opacity: 1;
		transition: opacity 200ms ease;
		pointer-events: none;
	}
	.settings__save[data-state='idle'] {
		opacity: 0;
	}
	.settings__save[data-state='idle-saved'] {
		opacity: 0.7;
	}
	.settings__save[data-state='saved'] {
		color: color-mix(in srgb, var(--admin-status-success-dot, #22c55e) 80%, var(--text) 20%);
	}

	.settings__empty-hint {
		margin: 0 0 0.2rem;
		font-size: 0.82rem;
		font-weight: 420;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		line-height: 1.5;
	}

	.undo-toast {
		position: fixed;
		top: calc(3rem + 0.6rem);
		right: clamp(1rem, 2.2vw, 2rem);
		z-index: 90;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.55rem 0.5rem 0.85rem;
		border-radius: 0.7rem;
		background: color-mix(in srgb, var(--text) 92%, var(--bg) 8%);
		color: var(--bg);
		font-size: 0.78rem;
		font-weight: 480;
		box-shadow: 0 12px 30px -10px color-mix(in srgb, black 38%, transparent);
	}
	.undo-toast__label {
		font-style: italic;
		opacity: 0.86;
	}
	.undo-toast__undo {
		border: none;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		padding: 0.2rem 0.55rem;
		border-radius: 0.4rem;
	}
	.undo-toast__undo:hover {
		background: color-mix(in srgb, var(--bg) 14%, transparent);
	}
	.undo-toast__dismiss {
		border: none;
		background: transparent;
		color: inherit;
		opacity: 0.55;
		display: inline-flex;
		padding: 0.25rem;
		cursor: pointer;
		border-radius: 0.35rem;
	}
	.undo-toast__dismiss:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--bg) 14%, transparent);
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
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: clamp(1.55rem, 2.4vw, 2rem);
		font-weight: 600;
		letter-spacing: -0.022em;
		line-height: 1.12;
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
	}
	.settings__section-head h4 {
		margin: 0;
		font-size: 0.75rem;
		letter-spacing: 0.09em;
		font-weight: 600;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}
	.sync-card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1rem;
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		background: var(--admin-card-bg);
	}
	.sync-card--busy {
		opacity: 0.75;
	}
	.sync-card__icon {
		display: inline-flex;
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 0.5rem;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--text) 6%, transparent);
	}
	.sync-card__icon--spinning {
		color: var(--admin-accent);
	}
	.sync-card__icon--spinning :global(svg) {
		animation: spin 0.9s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sync-card__icon--spinning :global(svg) {
			animation: none;
		}
		.switch__knob,
		.switch__track {
			transition: none;
		}
	}
	.sync-card__body {
		display: grid;
		gap: 0.15rem;
		min-width: 0;
	}
	.sync-card__name {
		font-size: 0.92rem;
		font-weight: 580;
		letter-spacing: -0.005em;
	}
	.sync-card__status {
		display: inline-flex;
		align-items: center;
		gap: 0.42rem;
		font-size: 0.76rem;
		font-weight: 420;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
		line-height: 1.4;
	}
	.sync-card__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--admin-status-success-dot, #22c55e);
		flex-shrink: 0;
	}
	.sync-card__actions {
		display: inline-flex;
		gap: 0.45rem;
	}

	/* unified button system */
	.admin-btn {
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
	.admin-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: var(--text);
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
	}
	.admin-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.admin-btn--accent {
		background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
		border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
		color: var(--text);
	}
	.admin-btn--accent:hover:not(:disabled) {
		background: color-mix(in srgb, var(--admin-accent) 18%, var(--bg) 82%);
		border-color: color-mix(in srgb, var(--admin-accent) 44%, transparent);
	}
	.admin-btn--solid {
		background: var(--admin-accent);
		border-color: var(--admin-accent);
		color: #fff;
	}
	.admin-btn--solid:hover:not(:disabled) {
		filter: brightness(1.08);
	}
	.admin-btn--muted {
		background: transparent;
		border-color: transparent;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}
	.admin-btn--muted:hover:not(:disabled) {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--text);
		border-color: transparent;
	}
	.admin-btn--danger:hover:not(:disabled) {
		background: color-mix(in srgb, #ef4444 10%, transparent);
		border-color: color-mix(in srgb, #ef4444 36%, transparent);
		color: #ef4444;
	}
	.admin-btn--warn {
		background: color-mix(in srgb, var(--admin-status-warn-fg) 14%, transparent);
		border-color: color-mix(in srgb, var(--admin-status-warn-fg) 32%, transparent);
		color: var(--admin-status-warn-fg);
	}
	.admin-btn--dashed {
		background: transparent;
		border-style: dashed;
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
		color: var(--text);
		justify-self: start;
	}
	.admin-btn--dashed:hover:not(:disabled) {
		border-color: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 6%, transparent);
	}
	.admin-btn--icon {
		min-height: 2rem;
		width: 2rem;
		padding: 0;
	}
	.admin-btn--icon:hover:not(:disabled) {
		background: color-mix(in srgb, #ef4444 10%, transparent);
		border-color: color-mix(in srgb, #ef4444 36%, transparent);
		color: #ef4444;
	}
	.admin-btn--solid-danger {
		background: #ef4444;
		border-color: #ef4444;
		color: #fff;
	}
	.admin-btn--solid-danger:hover:not(:disabled) {
		background: #dc2626;
		border-color: #dc2626;
		color: #fff;
	}

	.week-pick {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}
	.week-pick__opt {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 2.4rem;
		padding: 0 0.875rem;
		border-radius: 0.625rem;
		border: 1px solid var(--admin-card-border);
		background: var(--admin-card-bg);
		color: color-mix(in srgb, var(--text) 70%, transparent);
		cursor: pointer;
		font-size: 0.82rem;
		font-weight: 520;
		letter-spacing: -0.005em;
		transition:
			border-color 120ms ease,
			background 120ms ease,
			color 120ms ease;
	}
	.week-pick__opt:hover {
		background: var(--admin-card-bg-hover, var(--admin-card-bg));
		border-color: color-mix(in srgb, var(--admin-accent) 24%, transparent);
	}
	.week-pick__opt input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.week-pick__opt--active {
		border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
		color: var(--text);
	}

	/* payments — flat list, dividers only, no double borders */
	.payment-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}
	.payment-row {
		position: relative;
		border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.payment-row:last-child {
		border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.payment-row--primary::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.4rem;
		bottom: 0.4rem;
		width: 2px;
		border-radius: 1px;
		background: var(--method-color);
	}

	.payment-row__head {
		display: grid;
		grid-template-columns: auto auto 1fr auto auto;
		align-items: center;
		gap: 0.7rem;
		padding: 0.85rem 0.25rem 0.85rem 0.85rem;
		width: 100%;
		background: transparent;
		border: none;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.payment-row__head:hover {
		background: color-mix(in srgb, var(--admin-accent) 5%, transparent);
	}
	.payment-row__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--method-color);
		flex-shrink: 0;
	}
	.payment-row__name {
		font-size: 0.86rem;
		font-weight: 560;
	}
	.payment-row__handle {
		font-size: 0.78rem;
		font-weight: 400;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		font-variant-numeric: tabular-nums;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.payment-row__placeholder {
		font-style: italic;
		font-weight: 400;
		opacity: 0.7;
	}
	.payment-row__meta {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
	}
	.payment-row__add {
		display: inline-flex;
		align-items: center;
		gap: 0.32rem;
		font-size: 0.74rem;
		font-weight: 580;
		color: color-mix(in srgb, var(--admin-accent) 80%, var(--text) 20%);
		padding: 0.32rem 0.7rem;
		border: 1px solid color-mix(in srgb, var(--admin-accent) 30%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
	}
	.payment-row__chev {
		color: color-mix(in srgb, var(--text) 50%, transparent);
		display: inline-flex;
	}

	.pill {
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.3rem 0.6rem;
		border-radius: 0.5rem;
		line-height: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.pill--primary {
		background: color-mix(in srgb, var(--method-color) 14%, transparent);
		color: color-mix(in srgb, var(--method-color) 80%, var(--text) 20%);
		border: 1px solid color-mix(in srgb, var(--method-color) 32%, transparent);
	}
	.pill--warn {
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
		border: 1px solid color-mix(in srgb, var(--admin-status-warn-fg) 32%, transparent);
	}

	.payment-row__body {
		padding: 0.2rem 0.25rem 1rem 0.85rem;
		display: grid;
		gap: 0.95rem;
	}
	.payment-row__footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
		padding-top: 0.4rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
		min-height: 2.5rem;
	}
	.payment-row__footer-primary {
		display: inline-flex;
		gap: 0.5rem;
	}

	.confirm-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		width: 100%;
	}
	.confirm-row__text {
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--text);
	}
	.confirm-row__actions {
		display: inline-flex;
		gap: 0.45rem;
	}

	.field {
		display: grid;
		gap: 0.35rem;
		max-width: 26em;
	}
	.field__label {
		font-size: 0.74rem;
		font-weight: 540;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.field__control {
		position: relative;
	}
	.pg-settings :global(.ui-form-control) {
		min-height: 2rem;
		padding: 0 0.7rem;
		font-size: 0.84rem;
		border-radius: 0.625rem;
	}
	.pg-settings :global(select.ui-form-control) {
		padding-right: 1.6rem;
	}
	.field__check {
		position: absolute;
		right: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--admin-status-success-dot, #22c55e);
		display: inline-flex;
	}
	.field__warn {
		position: absolute;
		right: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		color: #c27800;
		display: inline-flex;
	}
	.field__control--invalid .field__input {
		border-color: color-mix(in srgb, #ef4444 50%, transparent);
		background: color-mix(in srgb, #ef4444 5%, transparent);
	}
	.field__error {
		margin: 0.25rem 0 0;
		font-size: 0.74rem;
		font-weight: 460;
		color: #c27800;
	}
	.field__help-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.1rem;
		height: 1.1rem;
		padding: 0;
		margin-left: 0.35rem;
		border: none;
		background: transparent;
		color: color-mix(in srgb, var(--text) 42%, transparent);
		cursor: help;
		vertical-align: -3px;
	}
	.field__help-btn:hover {
		color: var(--admin-accent);
	}
	.field__hint {
		margin: 0.2rem 0 0;
		font-size: 0.74rem;
		font-weight: 420;
		font-style: italic;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 54%, transparent);
	}

	.checkout {
		display: grid;
		gap: 0.6rem;
	}
	.checkout__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.85rem;
	}
	.checkout__title {
		font-size: 0.84rem;
		font-weight: 560;
		letter-spacing: -0.005em;
	}
	.checkout__blurb {
		margin: 0.25rem 0 0;
		font-size: 0.74rem;
		font-weight: 420;
		font-style: italic;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 54%, transparent);
	}
	.checkout__alert {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		font-size: 0.76rem;
		font-weight: 460;
		padding: 0.5rem 0.55rem 0.5rem 0.8rem;
		border-radius: 0.625rem;
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
		border: 1px solid color-mix(in srgb, var(--admin-status-warn-fg) 22%, transparent);
	}
	.checkout__alert-text {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.switch {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		border: none;
		background: transparent;
		padding: 0.15rem 0.1rem;
		cursor: pointer;
		font: inherit;
		min-height: 1.6rem;
	}
	.switch__track {
		position: relative;
		display: inline-block;
		width: 2.25rem;
		height: 1.3rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
		transition:
			background 160ms ease,
			border-color 160ms ease;
	}
	.switch__knob {
		position: absolute;
		top: 0.13rem;
		left: 0.15rem;
		width: 0.95rem;
		height: 0.95rem;
		border-radius: 999px;
		background: var(--bg);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
		transition: transform 160ms ease;
	}
	.switch__label {
		font-size: 0.74rem;
		font-weight: 500;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
		min-width: 1.5rem;
		text-align: left;
	}
	.switch--on .switch__track {
		background: var(--admin-accent);
		border-color: var(--admin-accent);
	}
	.switch--on .switch__knob {
		transform: translateX(0.94rem);
	}
	.switch--on .switch__label {
		color: var(--admin-accent);
		font-style: normal;
		font-weight: 580;
	}
	.switch:focus-visible .switch__track {
		outline: 2px solid var(--admin-focus-ring, var(--admin-accent));
		outline-offset: 2px;
	}

	.disclosure {
		justify-self: start;
		border: none;
		background: none;
		font: inherit;
		font-size: 0.74rem;
		font-weight: 500;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		cursor: pointer;
		padding: 0.2rem 0;
	}
	.disclosure:hover {
		color: var(--text);
	}

	.creds {
		display: grid;
		gap: 0.6rem;
		padding: 0.95rem;
		border-radius: 0.625rem;
		background: color-mix(in srgb, var(--admin-accent) 9%, var(--bg) 91%);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}
	.creds .field {
		max-width: 100%;
	}
	.creds :global(.ui-form-control) {
		background: var(--bg);
		border-color: color-mix(in srgb, var(--text) 16%, transparent);
	}
	.creds__actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.7rem;
		margin-top: 0.2rem;
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

	.hint {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		font-weight: 460;
		font-style: italic;
	}
	.hint--ok {
		color: var(--admin-status-success-dot, #16a34a);
	}
	.hint--fail {
		color: #ef4444;
	}

	/* state switcher (floating) */
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

	/* sheets — match admin-card aesthetic */
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--text) 30%, transparent);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 100;
	}
	.sheet {
		width: min(26rem, 100%);
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 14px;
		box-shadow: 0 24px 60px -18px color-mix(in srgb, black 36%, transparent);
		display: grid;
		max-height: 90vh;
		overflow: hidden;
	}
	.sheet__head {
		padding: 1.05rem 1.15rem 0.55rem;
	}
	.sheet__head h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 580;
		letter-spacing: -0.005em;
		color: var(--text);
	}
	.sheet__body {
		padding: 0.4rem 1.15rem 0.95rem;
		display: grid;
		gap: 0.7rem;
		overflow-y: auto;
	}
	.sheet__current {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 420;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}
	.sheet__list {
		display: grid;
		gap: 0.4rem;
	}
	.sheet__opt {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.7rem;
		min-height: 2.6rem;
		padding: 0.45rem 0.85rem;
		border-radius: 0.625rem;
		border: 1px solid var(--admin-card-border);
		background: color-mix(in srgb, var(--bg) 96%, var(--text) 4%);
		font: inherit;
		text-align: left;
		cursor: pointer;
		color: var(--text);
		transition:
			border-color 120ms ease,
			background 120ms ease;
	}
	.sheet__opt:hover {
		border-color: color-mix(in srgb, var(--admin-accent) 32%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 6%, var(--bg) 94%);
	}
	.sheet__opt--active {
		border-color: color-mix(in srgb, var(--admin-accent) 48%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 12%, var(--bg) 88%);
	}
	.sheet__opt--active :global(svg:last-child) {
		color: var(--admin-accent);
	}
	.sheet__opt-icon {
		display: inline-flex;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--text) 6%, transparent);
		align-items: center;
		justify-content: center;
	}
	.sheet__opt-label {
		font-size: 0.86rem;
		font-weight: 540;
	}
	.sheet__check {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		font-size: 0.78rem;
		font-weight: 420;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		padding: 0.3rem 0;
		line-height: 1.5;
		cursor: pointer;
	}
	.sheet__check input {
		flex-shrink: 0;
		width: 0.95rem;
		height: 0.95rem;
		margin: 0.18rem 0 0;
		accent-color: var(--admin-accent);
	}
	.sheet__foot {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1.15rem 1rem;
		border-top: 1px solid color-mix(in srgb, var(--admin-card-border) 80%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
	}

	@media (max-width: 48em) {
		.payment-row__head {
			grid-template-columns: auto 1fr auto;
		}
		.payment-row__handle {
			grid-column: 1 / -1;
			padding-left: 1.2rem;
		}
	}
</style>
