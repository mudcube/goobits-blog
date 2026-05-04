<script lang="ts">
	import { onDestroy } from 'svelte'
	import {
		CalendarDays,
		Check,
		ChevronDown,
		ChevronRight,
		LayoutDashboard,
		LogOut,
		Plus,
		Settings as SettingsIcon,
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
		paypal: { ...blankPayment(), handle: 'hello@miko.art', expanded: true, checkoutEnabled: true },
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

	const calendarTimers = {
		saving: null as ReturnType<typeof setTimeout> | null,
		saved: null as ReturnType<typeof setTimeout> | null
	}
	const paymentsTimers = {
		saving: null as ReturnType<typeof setTimeout> | null,
		saved: null as ReturnType<typeof setTimeout> | null
	}

	onDestroy(() => {
		clearAll(calendarTimers)
		clearAll(paymentsTimers)
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
				paypal: { ...blankPayment(), handle: 'hello@miko.art', expanded: true, checkoutEnabled: true },
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
					expanded: true,
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

	function configuredCount() {
		return paymentMethods.filter((m) => payments[m.key].handle.trim().length > 0).length
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

	function removeHandle(method: PaymentMethod) {
		payments[method].handle = ''
		payments[method].checkoutEnabled = false
		payments[method].advancedOpen = false
		if (primary === method) {
			const fallback = paymentMethods.find((m) => m.key !== method && payments[m.key].handle.trim())
			primary = fallback ? fallback.key : null
		}
		flagSaving('payments')
	}

	function toggleCheckout(method: PaymentMethod) {
		const row = payments[method]
		if (row.checkoutEnabled) {
			row.checkoutEnabled = false
			row.advancedOpen = false
			row.expiringSoon = false
			flagSaving('payments')
		} else {
			row.advancedOpen = true
		}
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
		if (!confirm(`Disconnect ${providerLabel(sync.active)}?`)) return
		sync = { active: null, syncedAtLabel: null }
		flagSaving('calendar')
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

	function saveLabel(state: SaveState) {
		if (state === 'saving') return 'Saving…'
		if (state === 'saved') return 'Saved ✓'
		return ''
	}
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

		<form class="social-admin__logout">
			<button type="button">
				<LogOut size={16} strokeWidth={1.8} /> <span>Log out</span>
			</button>
		</form>
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
					<SettingsIcon size={16} strokeWidth={1.8} />
				</button>
				<button type="button" class="topbar-avatar" aria-label="Account">M</button>
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
				<p class="settings__head-sub">Configure sync &amp; payment defaults for your space.</p>
			</header>

			<section id="calendar-sync" class="settings__section">
				<header class="settings__section-head">
					<h4>CALENDAR SYNC</h4>
					<span class="save-indicator" data-state={calendarSave}>{saveLabel(calendarSave)}</span>
				</header>

				<div class="settings__row settings__row--stack">
					{#if sync.active}
						<div class="sync-line">
							<span class="sync-line__icon" aria-hidden="true">{@render providerIcon(sync.active)}</span>
							<span class="sync-line__name">{providerLabel(sync.active)}</span>
							<span class="sync-line__status">
								<span class="sync-line__dot" aria-hidden="true"></span>
								Connected · synced {sync.syncedAtLabel}
							</span>
							<span class="sync-line__actions">
								<button type="button" class="link" onclick={openSwitchSheet}>Switch</button>
								<button type="button" class="link link--muted" onclick={disconnectSync}>
									Disconnect
								</button>
							</span>
						</div>
					{:else if connectingProvider}
						<div class="sync-line sync-line--busy">
							<span class="sync-line__icon" aria-hidden="true">{@render providerIcon(connectingProvider)}</span>
							<span class="sync-line__name">{providerLabel(connectingProvider)}</span>
							<span class="sync-line__status">Connecting…</span>
						</div>
					{:else}
						<button type="button" class="connect-cta" onclick={openSwitchSheet}>
							<Plus size={14} /> Connect a calendar
						</button>
					{/if}
				</div>
			</section>

			<section id="calendar-view" class="settings__section">
				<header class="settings__section-head">
					<h4>CALENDAR VIEW</h4>
				</header>

				<div class="settings__row">
					<div class="settings__row-label">Week starts on</div>
					<div class="seg" role="radiogroup" aria-label="Week starts on">
						<button
							type="button"
							class="seg__opt"
							class:seg__opt--active={weekStart === 'monday'}
							aria-pressed={weekStart === 'monday'}
							onclick={() => setWeekStart('monday')}
						>
							Mon
						</button>
						<button
							type="button"
							class="seg__opt"
							class:seg__opt--active={weekStart === 'sunday'}
							aria-pressed={weekStart === 'sunday'}
							onclick={() => setWeekStart('sunday')}
						>
							Sun
						</button>
					</div>
				</div>
			</section>

			<section id="payments" class="settings__section">
				<header class="settings__section-head">
					<div>
						<h4>PAYMENT</h4>
						<p class="settings__section-sub">
							How buyers pay you. Add as many methods as you want — pick one as primary.
						</p>
					</div>
					<div class="settings__section-meta">
						<span class="settings__count">{configuredCount()} of 3</span>
						<span class="save-indicator" data-state={paymentsSave}>{saveLabel(paymentsSave)}</span>
					</div>
				</header>

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
										<span class="pill pill--primary">Primary</span>
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
								<div class="payment-row__body">
									<label class="field">
										<span class="field__label">Your handle</span>
										<div class="field__control">
											<input
												type="text"
												class="ui-form-control field__input"
												value={row.handle}
												placeholder={method.placeholder}
												oninput={(e) =>
													setHandle(method.key, (e.currentTarget as HTMLInputElement).value)}
											/>
											{#if configured && paymentsSave === 'saved'}
												<span class="field__check" aria-hidden="true"><Check size={14} /></span>
											{/if}
										</div>
										<p class="field__hint">{method.blurb(row.handle)}</p>
									</label>

									<div class="checkout">
										<div class="checkout__head">
											<div>
												<div class="checkout__title">Accept {method.label} at checkout</div>
												<p class="checkout__blurb">{method.checkoutBlurb}</p>
											</div>
											<button
												type="button"
												class="toggle"
												class:toggle--on={row.checkoutEnabled}
												aria-pressed={row.checkoutEnabled}
												aria-label={`${row.checkoutEnabled ? 'Disable' : 'Enable'} ${method.label} checkout`}
												onclick={() => toggleCheckout(method.key)}
											>
												<span class="toggle__knob"></span>
											</button>
										</div>

										{#if row.expiringSoon}
											<div class="checkout__alert">
												<AlertTriangle size={13} />
												PayPal token expires Mon ·
												<button type="button" class="link" onclick={() => (row.advancedOpen = true)}>
													Reconnect
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
											<div class="creds">
												{#if method.key === 'cashapp'}
													<label class="field">
														<span class="field__label">Application ID</span>
														<input
															type="text"
															class="ui-form-control"
															bind:value={squareCreds.applicationId}
														/>
													</label>
													<label class="field">
														<span class="field__label">Location ID</span>
														<input
															type="text"
															class="ui-form-control"
															bind:value={squareCreds.locationId}
														/>
													</label>
													<label class="field">
														<span class="field__label">Access token</span>
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
														<span class="field__label">Client ID</span>
														<input
															type="text"
															class="ui-form-control"
															bind:value={payPalCreds.clientId}
														/>
													</label>
													<label class="field">
														<span class="field__label">Client secret</span>
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
													<button type="button" class="link">Test connection</button>
													<button
														type="button"
														class="admin-ui-btn admin-ui-btn--primary"
														onclick={() => saveCheckoutAdvanced(method.key)}
													>
														Save
													</button>
												</div>
											</div>
										{/if}
									</div>

									<div class="payment-row__footer">
										{#if configured && !isPrimary}
											<button type="button" class="link" onclick={() => makePrimary(method.key)}>
												Make primary
											</button>
										{/if}
										{#if configured}
											<button
												type="button"
												class="link link--muted"
												onclick={() => removeHandle(method.key)}
											>
												Remove {method.label}
											</button>
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
		>
			<div
				class="sheet"
				role="dialog"
				aria-modal="true"
				aria-label="Switch provider"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
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
							<label
								class="sheet__opt"
								class:sheet__opt--active={switchTarget === opt.value}
							>
								<input
									type="radio"
									name="switch-target"
									value={opt.value}
									checked={switchTarget === opt.value}
									onchange={() => (switchTarget = opt.value)}
								/>
								<span class="sheet__opt-icon" aria-hidden="true">{@render providerIcon(opt.value)}</span>
								<span class="sheet__opt-label">{opt.label}</span>
							</label>
						{/each}
					</div>
					{#if sync.active}
						<label class="sheet__check">
							<input type="checkbox" bind:checked={switchDisconnectOld} />
							Disconnect {providerLabel(sync.active)} after the new one connects
						</label>
					{/if}
				</div>
				<footer class="sheet__foot">
					<button type="button" class="link" onclick={closeSwitchSheet}>Cancel</button>
					<button
						type="button"
						class="admin-ui-btn admin-ui-btn--primary"
						disabled={!switchTarget}
						onclick={continueSwitch}
					>
						Continue
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
		>
			<div
				class="sheet"
				role="dialog"
				aria-modal="true"
				aria-label="Connect Apple Calendar"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
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
						<span class="field__label">App-specific password</span>
						<input
							class="ui-form-control"
							type="password"
							bind:value={applePw}
							autocomplete="new-password"
						/>
					</label>
					<label class="field">
						<span class="field__label">CalDAV URL</span>
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
					<button type="button" class="link" onclick={() => (showAppleSheet = false)}>Cancel</button>
					<button
						type="button"
						class="link"
						disabled={appleTestState === 'testing'}
						onclick={testAppleConnection}
					>
						{appleTestState === 'testing' ? 'Testing…' : 'Test connection'}
					</button>
					<button
						type="button"
						class="admin-ui-btn admin-ui-btn--primary"
						onclick={connectApple}
					>
						Connect
					</button>
				</footer>
			</div>
		</div>
	{/if}
</div>

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
		width: 1.85rem;
		height: 1.85rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		background: transparent;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
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
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.74rem;
		font-weight: 700;
		background: color-mix(in srgb, var(--admin-accent) 22%, transparent);
		color: var(--text);
		border: none;
		cursor: pointer;
	}
	.topbar-avatar:hover {
		background: color-mix(in srgb, var(--admin-accent) 32%, transparent);
	}

	/* settings page — left-aligned, original-style typography */
	.settings {
		display: grid;
		gap: 0.9rem;
		width: 100%;
		max-width: var(--admin-content-max);
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
		font-weight: 650;
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
		margin: 0.42rem 0 0;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.9rem;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 64%, transparent);
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
		letter-spacing: 0.08em;
		font-weight: 700;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}
	.settings__section-sub {
		margin: 0.15rem 0 0;
		font-size: 0.74rem;
		font-weight: 520;
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}
	.settings__section-meta {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		flex-shrink: 0;
	}
	.settings__count {
		font-size: 0.72rem;
		font-weight: 540;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}

	.save-indicator {
		font-size: 0.72rem;
		font-weight: 620;
		color: color-mix(in srgb, var(--text) 56%, transparent);
		min-width: 4rem;
		text-align: right;
	}
	.save-indicator[data-state='idle'] {
		visibility: hidden;
	}

	.settings__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.4rem 0;
	}
	.settings__row--stack {
		flex-direction: column;
		align-items: stretch;
		gap: 0.55rem;
	}
	.settings__row-label {
		font-size: 0.78rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}

	.sync-line {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		flex-wrap: wrap;
	}
	.sync-line--busy {
		opacity: 0.7;
	}
	.sync-line__icon {
		display: inline-flex;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 0.4rem;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--text) 6%, transparent);
	}
	.sync-line__name {
		font-size: 0.92rem;
		font-weight: 680;
		letter-spacing: -0.005em;
	}
	.sync-line__status {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.76rem;
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}
	.sync-line__dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 999px;
		background: var(--admin-status-success-dot, #22c55e);
	}
	.sync-line__actions {
		margin-left: auto;
		display: inline-flex;
		gap: 0.85rem;
	}

	.connect-cta {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.85rem;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 620;
		border: 1px dashed color-mix(in srgb, var(--text) 22%, transparent);
		border-radius: 0.625rem;
		background: transparent;
		color: var(--text);
		cursor: pointer;
	}
	.connect-cta:hover {
		border-color: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 6%, transparent);
	}

	.seg {
		display: inline-flex;
		padding: 0.18rem;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--text) 6%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.seg__opt {
		border: none;
		background: transparent;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.32rem 0.85rem;
		border-radius: 0.36rem;
		color: color-mix(in srgb, var(--text) 55%, transparent);
		cursor: pointer;
	}
	.seg__opt--active {
		background: var(--bg);
		color: var(--text);
		box-shadow: 0 1px 2px color-mix(in srgb, var(--text) 14%, transparent);
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
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--method-color);
	}

	.payment-row__head {
		display: grid;
		grid-template-columns: auto auto 1fr auto auto;
		align-items: center;
		gap: 0.7rem;
		padding: 0.85rem 0.25rem;
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
	}
	.payment-row__name {
		font-size: 0.86rem;
		font-weight: 620;
	}
	.payment-row__handle {
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		font-variant-numeric: tabular-nums;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.payment-row__placeholder {
		font-style: italic;
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
		gap: 0.25rem;
		font-size: 0.74rem;
		font-weight: 620;
		color: var(--method-color);
	}
	.payment-row__chev {
		color: color-mix(in srgb, var(--text) 50%, transparent);
		display: inline-flex;
	}

	.pill {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.32rem 0.7rem;
		border-radius: 0.5rem;
		line-height: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.pill--primary {
		background: var(--method-color);
		color: #fff;
	}
	.pill--warn {
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
	}

	.payment-row__body {
		padding: 0.2rem 0.25rem 1rem;
		display: grid;
		gap: 0.95rem;
	}
	.payment-row__footer {
		display: flex;
		justify-content: space-between;
		gap: 0.8rem;
		padding-top: 0.4rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.field {
		display: grid;
		gap: 0.35rem;
	}
	.field__label {
		font-size: 0.74rem;
		font-weight: 660;
		color: color-mix(in srgb, var(--text) 64%, transparent);
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.field__control {
		position: relative;
	}
	.field__input {
		font-size: 0.92rem;
	}
	.field__check {
		position: absolute;
		right: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--admin-status-success-dot, #22c55e);
		display: inline-flex;
	}
	.field__hint {
		margin: 0.15rem 0 0;
		font-size: 0.74rem;
		font-weight: 520;
		color: color-mix(in srgb, var(--text) 56%, transparent);
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
		font-weight: 660;
		letter-spacing: -0.005em;
	}
	.checkout__blurb {
		margin: 0.2rem 0 0;
		font-size: 0.74rem;
		font-weight: 520;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}
	.checkout__alert {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.74rem;
		padding: 0.5rem 0.7rem;
		border-radius: 0.45rem;
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
	}

	.toggle {
		flex-shrink: 0;
		width: 2.1rem;
		height: 1.2rem;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 8%, transparent);
		cursor: pointer;
		transition: background 150ms ease;
		position: relative;
	}
	.toggle__knob {
		position: absolute;
		top: 0.13rem;
		left: 0.13rem;
		width: 0.86rem;
		height: 0.86rem;
		border-radius: 999px;
		background: var(--bg);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
		transition: transform 150ms ease;
	}
	.toggle--on {
		background: var(--method-color);
		border-color: var(--method-color);
	}
	.toggle--on .toggle__knob {
		transform: translateX(0.88rem);
	}

	.disclosure {
		justify-self: start;
		border: none;
		background: none;
		font: inherit;
		font-size: 0.74rem;
		font-weight: 580;
		color: color-mix(in srgb, var(--text) 60%, transparent);
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
		gap: 0.55rem;
		padding: 0.85rem;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--text) 4%, transparent);
	}
	.creds__actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.7rem;
		margin-top: 0.2rem;
	}

	.link {
		border: none;
		background: none;
		font: inherit;
		font-size: 0.76rem;
		font-weight: 580;
		color: var(--admin-accent);
		cursor: pointer;
		padding: 0;
	}
	.link:hover {
		text-decoration: underline;
	}
	.link--muted {
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}
	.link--muted:hover {
		color: var(--text);
		text-decoration: underline;
	}
	.link:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.attention {
		display: grid;
		gap: 0.4rem;
	}
	.attention__item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.75rem;
		border-radius: 0.55rem;
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
		font-size: 0.78rem;
		font-weight: 580;
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
		font-size: 0.76rem;
		font-weight: 560;
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

	/* sheets */
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, #000 55%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 100;
	}
	.sheet {
		width: min(28rem, 100%);
		background: var(--bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 0.95rem;
		box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.4);
		display: grid;
		max-height: 90vh;
	}
	.sheet__head {
		padding: 1rem 1.15rem 0.6rem;
	}
	.sheet__head h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 680;
	}
	.sheet__body {
		padding: 0.4rem 1.15rem 0.85rem;
		display: grid;
		gap: 0.7rem;
		overflow-y: auto;
	}
	.sheet__current {
		margin: 0;
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}
	.sheet__list {
		display: grid;
		gap: 0.4rem;
	}
	.sheet__opt {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 0.8rem;
		border-radius: 0.55rem;
		border: 1px solid var(--admin-card-border);
		cursor: pointer;
		background: var(--bg);
	}
	.sheet__opt input {
		appearance: none;
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--text) 30%, transparent);
		display: inline-grid;
		place-content: center;
	}
	.sheet__opt input:checked {
		border-color: var(--admin-accent);
	}
	.sheet__opt input:checked::after {
		content: '';
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 999px;
		background: var(--admin-accent);
	}
	.sheet__opt--active {
		border-color: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 8%, var(--bg) 92%);
	}
	.sheet__opt-icon {
		display: inline-flex;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--text) 6%, transparent);
		align-items: center;
		justify-content: center;
	}
	.sheet__opt-label {
		font-size: 0.84rem;
		font-weight: 600;
	}
	.sheet__check {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 70%, transparent);
		padding: 0.3rem 0;
	}
	.sheet__foot {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1.15rem 1rem;
		border-top: 1px solid var(--admin-card-border);
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
