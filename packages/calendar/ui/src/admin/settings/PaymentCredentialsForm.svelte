<script lang="ts">
	import { slide } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { HelpCircle, Plug } from '@lucide/svelte'

	type Rail = 'paypal_checkout' | 'cash_app_pay'

	type PaymentController = {
		payPalClientId: string
		payPalClientSecret: string
		payPalEnvironment: 'sandbox' | 'live'
		cashAppPayApplicationId: string
		cashAppPayLocationId: string
		cashAppPayAccessToken: string
		cashAppPayEnvironment: 'sandbox' | 'live'
		paymentIntegrationBusy: boolean
	}

	const {
		rail,
		payment,
		onSave
	}: {
		rail: Rail
		payment: PaymentController
		onSave: () => void
	} = $props()
</script>

<div
	class="payment-credentials"
	transition:slide={{ duration: 200, easing: cubicOut }}
>
	{#if rail === 'paypal_checkout'}
		<label class="payment-credentials__field">
			<span class="payment-credentials__field-label">
				Client ID
				<button
					type="button"
					class="payment-credentials__field-help"
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
		<label class="payment-credentials__field">
			<span class="payment-credentials__field-label">
				Client secret
				<button
					type="button"
					class="payment-credentials__field-help"
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
		<label class="payment-credentials__field">
			<span class="payment-credentials__field-label">Environment</span>
			<select class="ui-form-control" bind:value={payment.payPalEnvironment}>
				<option value="sandbox">Sandbox</option>
				<option value="live">Live</option>
			</select>
		</label>
	{:else}
		<label class="payment-credentials__field">
			<span class="payment-credentials__field-label">
				Application ID
				<button
					type="button"
					class="payment-credentials__field-help"
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
		<label class="payment-credentials__field">
			<span class="payment-credentials__field-label">
				Location ID
				<button
					type="button"
					class="payment-credentials__field-help"
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
		<label class="payment-credentials__field">
			<span class="payment-credentials__field-label">
				Access token
				<button
					type="button"
					class="payment-credentials__field-help"
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
		<label class="payment-credentials__field">
			<span class="payment-credentials__field-label">Environment</span>
			<select class="ui-form-control" bind:value={payment.cashAppPayEnvironment}>
				<option value="sandbox">Sandbox</option>
				<option value="live">Live</option>
			</select>
		</label>
	{/if}
	<div class="payment-credentials__actions">
		<button
			type="button"
			class="admin-ui-btn admin-ui-btn--solid"
			disabled={payment.paymentIntegrationBusy}
			onclick={onSave}
		>
			<Plug size={14} strokeWidth={2.2} />
			{payment.paymentIntegrationBusy ? 'Saving…' : 'Save'}
		</button>
	</div>
</div>

<style>
	.payment-credentials {
		display: grid;
		gap: 0.6rem;
		padding: 0.95rem;
		border-radius: 0.625rem;
		background: color-mix(in srgb, var(--admin-accent) 9%, var(--bg) 91%);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}
	.payment-credentials :global(.ui-form-control) {
		background: var(--bg);
		border-color: color-mix(in srgb, var(--text) 16%, transparent);
	}
	.payment-credentials__field {
		display: grid;
		gap: 0.35rem;
		max-width: 100%;
	}
	.payment-credentials__field-label {
		font-size: 0.74rem;
		font-weight: 540;
		color: var(--admin-text-soft);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.payment-credentials__field-help {
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
	.payment-credentials__field-help:hover {
		color: var(--admin-accent);
	}
	.payment-credentials__actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.7rem;
		margin-top: 0.2rem;
	}
</style>
