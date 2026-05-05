<script lang="ts">
	import { slide } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import {
		AlertTriangle,
		Check,
		ChevronDown,
		ChevronRight,
		HelpCircle,
		Plug,
		Plus,
		Star,
		Trash2
	} from '@lucide/svelte'
	import {
		paymentMethodUsesPayPalCheckout,
		type PaymentMethodKey
	} from './payment-settings-controller.svelte'
	import AdminInlineConfirm from '../shared/AdminInlineConfirm.svelte'
import Tooltip from '../../shared/Tooltip.svelte'

	type PaymentMethodMeta = {
		value: PaymentMethodKey
		label: string
		color: string
		placeholder: string
		handleLabel: string
		helper: (handle: string) => string
		checkoutBlurb: string
	}

	type PaymentController = {
		handles: Record<PaymentMethodKey, string>
		primary: PaymentMethodKey | ''
		lastSavedMethod: PaymentMethodKey | ''
		isConfigured: (method: PaymentMethodKey) => boolean
		updateHandle: (method: PaymentMethodKey, value: string) => void
		makePrimary: (method: PaymentMethodKey) => void
		integrationSourceLabel: (source: 'stored' | 'env' | null | undefined) => string
		payPalClientId: string
		payPalClientSecret: string
		payPalEnvironment: 'sandbox' | 'live'
		cashAppPayApplicationId: string
		cashAppPayLocationId: string
		cashAppPayAccessToken: string
		cashAppPayEnvironment: 'sandbox' | 'live'
		paymentIntegrationBusy: boolean
		openPayPalSetup: () => void
		openCashAppPaySetup: () => void
		savePayPalSetup: () => Promise<void>
		saveCashAppPaySetup: () => Promise<void>
		disconnectCheckout: (rail: 'paypal_checkout' | 'cash_app_pay') => Promise<void>
	}

	type CheckoutInfo = {
		enabled: boolean
		source: 'stored' | 'env' | null
	}

	const {
		meta,
		payment,
		checkout,
		mockMode = false,
		removeConfirm,
		onRequestRemove,
		onCancelRemove,
		onConfirmRemove
	}: {
		meta: PaymentMethodMeta
		payment: PaymentController
		checkout: CheckoutInfo
		mockMode?: boolean
		removeConfirm: boolean
		onRequestRemove: (method: PaymentMethodKey) => void
		onCancelRemove: () => void
		onConfirmRemove: (method: PaymentMethodKey) => void
	} = $props()

	let expanded = $state(false)
	let pendingOn = $state(false)

	const handle = $derived(payment.handles[meta.value] ?? '')
	const configured = $derived(payment.isConfigured(meta.value))
	const isPrimary = $derived(payment.primary === meta.value)
	const justSaved = $derived(payment.lastSavedMethod === meta.value && configured)
	const usesPayPalRail = $derived(paymentMethodUsesPayPalCheckout(meta.value))
	const railName = $derived<'paypal_checkout' | 'cash_app_pay'>(
		usesPayPalRail ? 'paypal_checkout' : 'cash_app_pay'
	)
	const handleErr = $derived(validateHandle(meta.value, handle))
	const switchOn = $derived(checkout.enabled || pendingOn)

	$effect(() => {
		if (checkout.enabled) pendingOn = false
	})

	function validateHandle(method: PaymentMethodKey, raw: string): string | null {
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
				return 'Cashtag: starts with a letter, no spaces.'
		}
		return null
	}

	function toggleRow() {
		expanded = !expanded
	}

	function toggleCheckout() {
		if (switchOn) {
			pendingOn = false
			if (checkout.enabled && !mockMode) void payment.disconnectCheckout(railName)
			return
		}
		pendingOn = true
		if (mockMode) return
		if (usesPayPalRail) payment.openPayPalSetup()
		else payment.openCashAppPaySetup()
	}

	async function handleSaveAdvanced() {
		if (mockMode) {
			pendingOn = false
			return
		}
		if (usesPayPalRail) await payment.savePayPalSetup()
		else await payment.saveCashAppPaySetup()
		if (!checkout.enabled) pendingOn = false
	}
</script>

<li
	class="payment-method-row"
	class:payment-method-row--primary={isPrimary && configured}
	class:payment-method-row--expanded={expanded}
	style="--method-color: {meta.color}"
>
	<button
		type="button"
		class="payment-method-row__head"
		onclick={toggleRow}
		aria-expanded={expanded}
	>
		<span class="payment-method-row__dot" aria-hidden="true"></span>
		<span class="payment-method-row__name">{meta.label}</span>
		<span class="payment-method-row__handle">
			{#if configured}
				{handle}
			{:else}
				<span class="payment-method-row__placeholder">not set up</span>
			{/if}
		</span>
		<span class="payment-method-row__meta">
			{#if isPrimary && configured}
				<span
					class="payment-method-row__pill payment-method-row__pill--primary"
					title="Default for new bookings."
				>
					Primary
				</span>
			{/if}
			{#if !configured}
				<span class="payment-method-row__add"><Plus size={12} /> Add</span>
			{/if}
		</span>
		<span class="payment-method-row__chev" aria-hidden="true">
			{#if expanded}
				<ChevronDown size={14} />
			{:else}
				<ChevronRight size={14} />
			{/if}
		</span>
	</button>

	{#if expanded}
		<div
			class="payment-method-row__body"
			transition:slide={{ duration: 220, easing: cubicOut }}
		>
			<label class="payment-method-row__field">
				<span class="payment-method-row__field-label">{meta.handleLabel}</span>
				<div
					class="payment-method-row__field-control"
					class:payment-method-row__field-control--invalid={!!handleErr}
				>
					<input
						type="text"
						class="ui-form-control payment-method-row__input"
						value={handle}
						placeholder={meta.placeholder}
						aria-invalid={handleErr ? 'true' : undefined}
						oninput={(e) =>
							payment.updateHandle(meta.value, (e.currentTarget as HTMLInputElement).value)}
					/>
					{#if handleErr}
						<span class="payment-method-row__field-warn" aria-hidden="true">
							<AlertTriangle size={14} />
						</span>
					{:else if justSaved}
						<span class="payment-method-row__field-check" aria-hidden="true">
							<Check size={14} />
						</span>
					{/if}
				</div>
				{#if handleErr}
					<p
						class="payment-method-row__field-error"
						transition:slide={{ duration: 160, easing: cubicOut }}
					>
						{handleErr}
					</p>
				{:else}
					<p class="payment-method-row__field-hint">{meta.helper(handle)}</p>
				{/if}
			</label>

			<div class="payment-method-row__checkout">
				<div class="payment-method-row__checkout-head">
					<div>
						<div class="payment-method-row__checkout-title">
							Accept {meta.label} at checkout
						</div>
						<p class="payment-method-row__checkout-blurb">{meta.checkoutBlurb}</p>
						{#if checkout.enabled}
							<p class="payment-method-row__checkout-source">
								<Check size={12} /> {payment.integrationSourceLabel(checkout.source)}
							</p>
						{/if}
					</div>
					<button
						type="button"
						class="payment-method-row__switch"
						class:payment-method-row__switch--on={switchOn}
						class:payment-method-row__switch--pending={pendingOn && !checkout.enabled}
						role="switch"
						aria-checked={switchOn}
						aria-label={`${switchOn ? 'Disable' : 'Enable'} ${meta.label} checkout`}
						disabled={payment.paymentIntegrationBusy}
						onclick={toggleCheckout}
					>
						<span class="payment-method-row__switch-label">
							{pendingOn && !checkout.enabled ? 'Setup…' : switchOn ? 'On' : 'Off'}
						</span>
						<span class="payment-method-row__switch-track" aria-hidden="true">
							<span class="payment-method-row__switch-knob"></span>
						</span>
					</button>
				</div>

				{#if switchOn}
					<div
						class="payment-method-row__creds"
						transition:slide={{ duration: 200, easing: cubicOut }}
					>
						{#if usesPayPalRail}
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">
									Client ID
									<button
										type="button"
										class="payment-method-row__field-help"
										title="PayPal Developer → My Apps & Credentials"
										aria-label="Help: Client ID"
										onclick={(e) => e.preventDefault()}
									>
										<HelpCircle size={12} strokeWidth={2} />
									</button>
								</span>
								<input
									type="text"
									class="ui-form-control"
									autocomplete="off"
									bind:value={payment.payPalClientId}
								/>
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">
									Client secret
									<button
										type="button"
										class="payment-method-row__field-help"
										title="Same screen as Client ID. Treat like a password."
										aria-label="Help: Client secret"
										onclick={(e) => e.preventDefault()}
									>
										<HelpCircle size={12} strokeWidth={2} />
									</button>
								</span>
								<input
									type="password"
									class="ui-form-control"
									autocomplete="new-password"
									bind:value={payment.payPalClientSecret}
								/>
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">Environment</span>
								<select class="ui-form-control" bind:value={payment.payPalEnvironment}>
									<option value="sandbox">Sandbox</option>
									<option value="live">Live</option>
								</select>
							</label>
						{:else}
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">
									Application ID
									<button
										type="button"
										class="payment-method-row__field-help"
										title="Square Dashboard → Apps → your app → Credentials"
										aria-label="Help: Application ID"
										onclick={(e) => e.preventDefault()}
									>
										<HelpCircle size={12} strokeWidth={2} />
									</button>
								</span>
								<input
									type="text"
									class="ui-form-control"
									autocomplete="off"
									bind:value={payment.cashAppPayApplicationId}
								/>
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">
									Location ID
									<button
										type="button"
										class="payment-method-row__field-help"
										title="Square Dashboard → Account → Locations"
										aria-label="Help: Location ID"
										onclick={(e) => e.preventDefault()}
									>
										<HelpCircle size={12} strokeWidth={2} />
									</button>
								</span>
								<input
									type="text"
									class="ui-form-control"
									autocomplete="off"
									bind:value={payment.cashAppPayLocationId}
								/>
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">
									Access token
									<button
										type="button"
										class="payment-method-row__field-help"
										title="Personal access token. Treat it like a password."
										aria-label="Help: Access token"
										onclick={(e) => e.preventDefault()}
									>
										<HelpCircle size={12} strokeWidth={2} />
									</button>
								</span>
								<input
									type="password"
									class="ui-form-control"
									autocomplete="new-password"
									bind:value={payment.cashAppPayAccessToken}
								/>
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">Environment</span>
								<select class="ui-form-control" bind:value={payment.cashAppPayEnvironment}>
									<option value="sandbox">Sandbox</option>
									<option value="live">Live</option>
								</select>
							</label>
						{/if}
						<div class="payment-method-row__creds-actions">
							<button
								type="button"
								class="admin-ui-btn admin-ui-btn--solid"
								disabled={payment.paymentIntegrationBusy}
								onclick={() => void handleSaveAdvanced()}
							>
								<Plug size={14} strokeWidth={2.2} />
								{payment.paymentIntegrationBusy ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				{/if}
			</div>

			<div class="payment-method-row__footer">
				{#if removeConfirm}
					<AdminInlineConfirm
						question={`Remove ${meta.label}?`}
						onCancel={onCancelRemove}
						onConfirm={() => onConfirmRemove(meta.value)}
					/>
				{:else}
					<div class="payment-method-row__footer-primary">
						{#if configured && !isPrimary}
							<button
								type="button"
								class="admin-ui-btn admin-ui-btn--accent"
								onclick={() => payment.makePrimary(meta.value)}
							>
								<Star size={13} strokeWidth={2} /> Make primary
							</button>
						{/if}
					</div>
					{#if configured}
						<Tooltip text={`Remove ${meta.label}`} placement="left">
							<button
								type="button"
								class="admin-ui-btn admin-ui-btn--icon"
								aria-label={`Remove ${meta.label}`}
								onclick={() => onRequestRemove(meta.value)}
							>
								<Trash2 size={14} strokeWidth={2} />
							</button>
						</Tooltip>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</li>

<style>
	.payment-method-row {
		position: relative;
		border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		list-style: none;
	}
	.payment-method-row:last-child {
		border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.payment-method-row--primary::before,
	.payment-method-row--expanded::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.4rem;
		bottom: 0.4rem;
		width: 2px;
		border-radius: 1px;
		background: var(--method-color);
	}
	.payment-method-row--expanded:not(.payment-method-row--primary)::before {
		opacity: 0.55;
	}

	.payment-method-row__head {
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
	.payment-method-row__head:hover {
		background: color-mix(in srgb, var(--admin-accent) 7%, var(--bg) 93%);
	}
	.payment-method-row__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--method-color);
		flex-shrink: 0;
	}
	.payment-method-row__name {
		font-size: 0.86rem;
		font-weight: 560;
	}
	.payment-method-row__handle {
		font-size: 0.78rem;
		font-weight: 400;
		color: var(--admin-text-soft);
		font-variant-numeric: tabular-nums;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.payment-method-row__placeholder {
		font-style: italic;
		font-weight: 400;
		opacity: 0.7;
	}
	.payment-method-row__meta {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
	}
	.payment-method-row__add {
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
	.payment-method-row__chev {
		color: var(--admin-text-muted);
		display: inline-flex;
	}

	.payment-method-row__pill {
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
	.payment-method-row__pill--primary {
		background: color-mix(in srgb, var(--method-color) 14%, transparent);
		color: color-mix(in srgb, var(--method-color) 80%, var(--text) 20%);
		border: 1px solid color-mix(in srgb, var(--method-color) 32%, transparent);
	}

	.payment-method-row__body {
		padding: 0.2rem 0.25rem 1rem 0.85rem;
		display: grid;
		gap: 0.95rem;
	}

	.payment-method-row__footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
		padding-top: 0.4rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
		min-height: 2.5rem;
	}
	.payment-method-row__footer-primary {
		display: inline-flex;
		gap: 0.5rem;
	}

	.payment-method-row__field {
		display: grid;
		gap: 0.35rem;
		max-width: 26em;
	}
	.payment-method-row__field-label {
		font-size: 0.74rem;
		font-weight: 540;
		color: var(--admin-text-soft);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.payment-method-row__field-help {
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
	}
	.payment-method-row__field-help:hover {
		color: var(--admin-accent);
	}
	.payment-method-row__field-control {
		position: relative;
	}
	.payment-method-row__field-control--invalid :global(.ui-form-control) {
		border-color: var(--admin-danger-border-strong);
		background: color-mix(in srgb, var(--admin-danger) 5%, transparent);
	}
	.payment-method-row__field-warn {
		position: absolute;
		right: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--admin-warn-strong);
		display: inline-flex;
	}
	.payment-method-row__field-check {
		position: absolute;
		right: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--admin-success);
		display: inline-flex;
	}
	.payment-method-row__field-error {
		margin: 0.25rem 0 0;
		font-size: 0.74rem;
		font-weight: 460;
		color: var(--admin-warn-strong);
	}
	.payment-method-row__input {
		font-size: 0.92rem;
	}
	.payment-method-row__field-hint {
		margin: 0.2rem 0 0;
		font-size: 0.74rem;
		font-weight: 420;
		font-style: italic;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 54%, transparent);
	}

	.payment-method-row__checkout {
		display: grid;
		gap: 0.6rem;
	}
	.payment-method-row__checkout-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.85rem;
	}
	.payment-method-row__checkout-title {
		font-size: 0.84rem;
		font-weight: 560;
		letter-spacing: -0.005em;
	}
	.payment-method-row__checkout-blurb {
		margin: 0.25rem 0 0;
		font-size: 0.74rem;
		font-weight: 420;
		font-style: italic;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 54%, transparent);
	}
	.payment-method-row__checkout-source {
		margin: 0.3rem 0 0;
		font-size: 0.72rem;
		font-weight: 460;
		font-style: italic;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--admin-success-fg);
	}

	.payment-method-row__switch {
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
	.payment-method-row__switch:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.payment-method-row__switch-track {
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
	.payment-method-row__switch-knob {
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
	.payment-method-row__switch-label {
		font-size: 0.74rem;
		font-weight: 500;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
		min-width: 2.4rem;
		text-align: right;
	}
	.payment-method-row__switch--on .payment-method-row__switch-track {
		background: var(--admin-accent);
		border-color: var(--admin-accent);
	}
	.payment-method-row__switch--on .payment-method-row__switch-knob {
		transform: translateX(0.94rem);
	}
	.payment-method-row__switch--on .payment-method-row__switch-label {
		color: var(--admin-accent);
		font-style: normal;
		font-weight: 580;
	}

	.payment-method-row__creds {
		display: grid;
		gap: 0.6rem;
		padding: 0.95rem;
		border-radius: 0.625rem;
		background: color-mix(in srgb, var(--admin-accent) 9%, var(--bg) 91%);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}
	.payment-method-row__creds .payment-method-row__field {
		max-width: 100%;
	}
	.payment-method-row__creds :global(.ui-form-control) {
		background: var(--bg);
		border-color: color-mix(in srgb, var(--text) 16%, transparent);
	}
	.payment-method-row__creds-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.7rem;
		margin-top: 0.2rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.payment-method-row__switch-knob,
		.payment-method-row__switch-track {
			transition: none;
		}
	}

	@media (max-width: 48em) {
		.payment-method-row__head {
			grid-template-columns: auto 1fr auto;
		}
		.payment-method-row__handle {
			grid-column: 1 / -1;
			padding-left: 1.2rem;
		}
	}
</style>
