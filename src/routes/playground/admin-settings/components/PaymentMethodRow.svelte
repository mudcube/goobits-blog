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
		RefreshCw,
		Star,
		Trash2
	} from '@lucide/svelte'
	import { validateHandle } from './helpers'
	import type {
		PaymentMethod,
		PaymentMethodMeta,
		PaymentRow,
		PayPalCreds,
		SaveState,
		SquareCreds
	} from './types'

	let {
		method,
		row = $bindable(),
		isPrimary,
		paymentsSave,
		removeConfirm,
		payPalCreds = $bindable(),
		squareCreds = $bindable(),
		onToggleRow,
		onSetHandle,
		onMakePrimary,
		onRequestRemove,
		onCancelRemove,
		onConfirmRemove,
		onToggleCheckout,
		onSaveAdvanced
	}: {
		method: PaymentMethodMeta
		row: PaymentRow
		isPrimary: boolean
		paymentsSave: SaveState
		removeConfirm: boolean
		payPalCreds: PayPalCreds
		squareCreds: SquareCreds
		onToggleRow: (key: PaymentMethod) => void
		onSetHandle: (key: PaymentMethod, value: string) => void
		onMakePrimary: (key: PaymentMethod) => void
		onRequestRemove: (key: PaymentMethod) => void
		onCancelRemove: () => void
		onConfirmRemove: (key: PaymentMethod) => void
		onToggleCheckout: (key: PaymentMethod) => void
		onSaveAdvanced: (key: PaymentMethod) => void
	} = $props()

	const configured = $derived(row.handle.trim().length > 0)
	const handleErr = $derived(validateHandle(method.key, row.handle))
</script>

<li
	class="payment-method-row"
	class:payment-method-row--primary={isPrimary && configured}
	style="--method-color: {method.color}"
>
	<button
		type="button"
		class="payment-method-row__head"
		onclick={() => onToggleRow(method.key)}
		aria-expanded={row.expanded}
	>
		<span class="payment-method-row__dot" aria-hidden="true"></span>
		<span class="payment-method-row__name">{method.label}</span>
		<span class="payment-method-row__handle">
			{#if configured}
				{row.handle}
			{:else}
				<span class="payment-method-row__placeholder">not set up</span>
			{/if}
		</span>
		<span class="payment-method-row__meta">
			{#if isPrimary && configured}
				<span class="payment-method-row__pill payment-method-row__pill--primary" title="Default for new bookings.">
					Primary
				</span>
			{/if}
			{#if row.expiringSoon}
				<span class="payment-method-row__pill payment-method-row__pill--warn">
					<AlertTriangle size={11} /> Token
				</span>
			{/if}
			{#if !configured}
				<span class="payment-method-row__add"><Plus size={12} /> Add</span>
			{/if}
		</span>
		<span class="payment-method-row__chev" aria-hidden="true">
			{#if row.expanded}
				<ChevronDown size={14} />
			{:else}
				<ChevronRight size={14} />
			{/if}
		</span>
	</button>

	{#if row.expanded}
		<div
			class="payment-method-row__body"
			transition:slide={{ duration: 220, easing: cubicOut }}
		>
			<label class="payment-method-row__field">
				<span class="payment-method-row__field-label">Your handle</span>
				<div
					class="payment-method-row__field-control"
					class:payment-method-row__field-control--invalid={!!handleErr}
				>
					<input
						type="text"
						class="ui-form-control payment-method-row__input"
						value={row.handle}
						placeholder={method.placeholder}
						aria-invalid={handleErr ? 'true' : undefined}
						oninput={(e) =>
							onSetHandle(method.key, (e.currentTarget as HTMLInputElement).value)}
					/>
					{#if handleErr}
						<span class="payment-method-row__field-warn" aria-hidden="true">
							<AlertTriangle size={14} />
						</span>
					{:else if configured && paymentsSave === 'saved'}
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
					<p class="payment-method-row__field-hint">{method.blurb(row.handle)}</p>
				{/if}
			</label>

			<div class="payment-method-row__checkout">
				<div class="payment-method-row__checkout-head">
					<div>
						<div class="payment-method-row__checkout-title">
							Accept {method.label} at checkout
						</div>
						<p class="payment-method-row__checkout-blurb">{method.checkoutBlurb}</p>
					</div>
					<button
						type="button"
						class="payment-method-row__switch"
						class:payment-method-row__switch--on={row.checkoutEnabled}
						role="switch"
						aria-checked={row.checkoutEnabled}
						aria-label={`${row.checkoutEnabled ? 'Disable' : 'Enable'} ${method.label} checkout`}
						onclick={() => onToggleCheckout(method.key)}
					>
						<span class="payment-method-row__switch-track" aria-hidden="true">
							<span class="payment-method-row__switch-knob"></span>
						</span>
						<span class="payment-method-row__switch-label">
							{row.checkoutEnabled ? 'On' : 'Off'}
						</span>
					</button>
				</div>

				{#if row.expiringSoon}
					<div class="payment-method-row__checkout-alert">
						<span class="payment-method-row__checkout-alert-text">
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
						class="payment-method-row__disclosure"
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
					<div
						class="payment-method-row__creds"
						transition:slide={{ duration: 200, easing: cubicOut }}
					>
						{#if method.key === 'cashapp'}
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">
									Application ID
									<button
										type="button"
										class="payment-method-row__field-help"
										title="Square Dashboard → Apps → your app → Credentials"
										aria-label="Help: application ID"
										onclick={(e) => e.preventDefault()}
									>
										<HelpCircle size={12} strokeWidth={2} />
									</button>
								</span>
								<input type="text" class="ui-form-control" bind:value={squareCreds.applicationId} />
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">
									Location ID
									<button
										type="button"
										class="payment-method-row__field-help"
										title="Square Dashboard → Account → Locations"
										aria-label="Help: location ID"
										onclick={(e) => e.preventDefault()}
									>
										<HelpCircle size={12} strokeWidth={2} />
									</button>
								</span>
								<input type="text" class="ui-form-control" bind:value={squareCreds.locationId} />
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">
									Access token
									<button
										type="button"
										class="payment-method-row__field-help"
										title="Personal access token. Treat it like a password."
										aria-label="Help: access token"
										onclick={(e) => e.preventDefault()}
									>
										<HelpCircle size={12} strokeWidth={2} />
									</button>
								</span>
								<input type="password" class="ui-form-control" bind:value={squareCreds.accessToken} />
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">Environment</span>
								<select class="ui-form-control" bind:value={squareCreds.environment}>
									<option value="sandbox">Sandbox</option>
									<option value="live">Live</option>
								</select>
							</label>
						{:else}
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
								<input type="text" class="ui-form-control" bind:value={payPalCreds.clientId} />
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
									bind:value={payPalCreds.clientSecret}
								/>
							</label>
							<label class="payment-method-row__field">
								<span class="payment-method-row__field-label">Environment</span>
								<select class="ui-form-control" bind:value={payPalCreds.environment}>
									<option value="sandbox">Sandbox</option>
									<option value="live">Live</option>
								</select>
							</label>
						{/if}
						<div class="payment-method-row__creds-actions">
							<button type="button" class="admin-btn">
								<Plug size={13} strokeWidth={2} /> Test connection
							</button>
							<button
								type="button"
								class="admin-btn admin-btn--solid"
								onclick={() => onSaveAdvanced(method.key)}
							>
								<Check size={14} strokeWidth={2.2} /> Save
							</button>
						</div>
					</div>
				{/if}
			</div>

			<div class="payment-method-row__footer">
				{#if removeConfirm}
					<div class="payment-method-row__confirm">
						<span class="payment-method-row__confirm-text">Remove {method.label}?</span>
						<div class="payment-method-row__confirm-actions">
							<button
								type="button"
								class="admin-btn admin-btn--muted"
								onclick={onCancelRemove}
							>
								Cancel
							</button>
							<button
								type="button"
								class="admin-btn admin-btn--solid-danger"
								onclick={() => onConfirmRemove(method.key)}
							>
								<Trash2 size={13} strokeWidth={2} /> Yes, remove
							</button>
						</div>
					</div>
				{:else}
					<div class="payment-method-row__footer-primary">
						{#if configured && !isPrimary}
							<button
								type="button"
								class="admin-btn admin-btn--accent"
								onclick={() => onMakePrimary(method.key)}
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
							onclick={() => onRequestRemove(method.key)}
						>
							<Trash2 size={14} strokeWidth={2} />
						</button>
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
	.payment-method-row--primary::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.4rem;
		bottom: 0.4rem;
		width: 2px;
		border-radius: 1px;
		background: var(--method-color);
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
		color: color-mix(in srgb, var(--text) 60%, transparent);
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
		color: color-mix(in srgb, var(--text) 50%, transparent);
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
	.payment-method-row__pill--warn {
		background: var(--admin-status-warn-bg);
		color: var(--admin-status-warn-fg);
		border: 1px solid color-mix(in srgb, var(--admin-status-warn-fg) 32%, transparent);
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

	.payment-method-row__confirm {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		width: 100%;
	}
	.payment-method-row__confirm-text {
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--text);
	}
	.payment-method-row__confirm-actions {
		display: inline-flex;
		gap: 0.45rem;
	}

	.payment-method-row__field {
		display: grid;
		gap: 0.35rem;
		max-width: 26em;
	}
	.payment-method-row__field-label {
		font-size: 0.74rem;
		font-weight: 540;
		color: color-mix(in srgb, var(--text) 60%, transparent);
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
		border-color: color-mix(in srgb, #ef4444 50%, transparent);
		background: color-mix(in srgb, #ef4444 5%, transparent);
	}
	.payment-method-row__input {
		font-size: 0.92rem;
	}
	.payment-method-row__field-check {
		position: absolute;
		right: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--admin-status-success-dot, #22c55e);
		display: inline-flex;
	}
	.payment-method-row__field-warn {
		position: absolute;
		right: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		color: #c27800;
		display: inline-flex;
	}
	.payment-method-row__field-error {
		margin: 0.25rem 0 0;
		font-size: 0.74rem;
		font-weight: 460;
		color: #c27800;
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
	.payment-method-row__checkout-alert {
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
	.payment-method-row__checkout-alert-text {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
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
		min-width: 1.5rem;
		text-align: left;
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

	.payment-method-row__disclosure {
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
	.payment-method-row__disclosure:hover {
		color: var(--text);
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
