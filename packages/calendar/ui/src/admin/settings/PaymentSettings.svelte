<script lang="ts">
	import { onDestroy } from 'svelte'
	import {
		createPaymentSettingsController,
		paymentMethodUsesPayPalCheckout,
		type PaymentMethodKey,
		type RemoveSnapshot
	} from './payment-settings-controller.svelte'
	import PaymentMethodRow from './PaymentMethodRow.svelte'
	import AdminToast from '../shared/AdminToast.svelte'
	import type { AdminPaymentIntegrationsResponse } from '../../api/admin'

	type PaymentSettingsDashboard = {
		paymentDefaults: {
			provider: string
			handle: string
			primaryProvider?: string
			handles?: Partial<Record<PaymentMethodKey, string | null | undefined>>
		}
		paymentIntegrations: AdminPaymentIntegrationsResponse['payments']
		error: string
		loadStatus: () => Promise<void>
		savePaymentDefaults: () => Promise<void>
		connectPayPal: (input: {
			clientId: string
			clientSecret: string
			environment: 'sandbox' | 'live'
		}) => Promise<void>
		connectSquare: (input: {
			applicationId: string
			locationId: string
			accessToken: string
			environment: 'sandbox' | 'live'
		}) => Promise<void>
		disconnectPaymentIntegration: (provider: 'paypal' | 'square') => Promise<void>
	}

	const { dashboard, authed, mockMode, mockDefaults, showToast } = $props<{
		dashboard: PaymentSettingsDashboard
		authed: boolean
		mockMode: boolean
		mockDefaults: {
			provider: string | null
			handle: string | null
			primaryProvider?: string | null | undefined
			handles?: Partial<Record<PaymentMethodKey, string | null | undefined>> | undefined
		}
		showToast: (message: string, isError?: boolean) => void
	}>()

	const payment = createPaymentSettingsController({
		dashboard: () => dashboard,
		mockMode: () => mockMode,
		mockDefaults: () => mockDefaults,
		showToast: (message, isError) => showToast(message, isError)
	})

	type PaymentProviderMeta = {
		value: PaymentMethodKey
		label: string
		color: string
		placeholder: string
		handleLabel: string
		helper: (handle: string) => string
		checkoutBlurb: string
	}

	const paymentProviders: PaymentProviderMeta[] = [
		{
			value: 'venmo',
			label: 'Venmo',
			color: '#3D95CE',
			placeholder: '@yourname',
			handleLabel: 'Your Venmo handle',
			helper: (handle) =>
				handle.trim()
					? `Buyers see venmo.com/u/${handle.trim().replace(/^@/, '')}`
					: 'Buyers tap a link that opens the Venmo app.',
			checkoutBlurb: 'Adds a Venmo button to bookings (uses your PayPal account).'
		},
		{
			value: 'paypal',
			label: 'PayPal',
			color: '#0070BA',
			placeholder: 'Email or merchant ID',
			handleLabel: 'Your PayPal handle',
			helper: (handle) =>
				handle.trim()
					? `Buyers see paypal.me/${handle.trim()}`
					: 'Buyers tap a link that opens PayPal.',
			checkoutBlurb: 'Adds a PayPal button to bookings.'
		},
		{
			value: 'cashapp',
			label: 'Cash App',
			color: '#00C244',
			placeholder: '$yourname',
			handleLabel: 'Your Cash App handle',
			helper: (handle) =>
				handle.trim()
					? `Buyers see cash.app/${handle.trim().replace(/^\$/, '$')}`
					: 'Buyers tap a link that opens Cash App.',
			checkoutBlurb: 'Adds a Cash App Pay button to bookings.'
		}
	]

	let removeConfirmFor = $state<PaymentMethodKey | null>(null)
	let removeConfirmTimer: ReturnType<typeof setTimeout> | null = null
	let undoToast = $state<{ label: string; snapshot: RemoveSnapshot } | null>(null)
	let undoTimer: ReturnType<typeof setTimeout> | null = null

	$effect(() => {
		if (!authed) return
		void payment.load()
	})

	onDestroy(() => {
		payment.dispose()
		if (removeConfirmTimer) clearTimeout(removeConfirmTimer)
		if (undoTimer) clearTimeout(undoTimer)
	})

	const configuredCount = $derived(
		paymentProviders.filter((p) => payment.isConfigured(p.value)).length
	)

	function checkoutFor(method: PaymentMethodKey) {
		const usesPayPal = paymentMethodUsesPayPalCheckout(method)
		const integration = usesPayPal
			? dashboard.paymentIntegrations.paypal
			: dashboard.paymentIntegrations.square
		return {
			enabled: integration.enabled,
			source: integration.source
		}
	}

	function handleRequestRemove(method: PaymentMethodKey) {
		if (removeConfirmTimer) clearTimeout(removeConfirmTimer)
		removeConfirmFor = method
		removeConfirmTimer = setTimeout(() => {
			if (removeConfirmFor === method) removeConfirmFor = null
		}, 4000)
	}

	function handleCancelRemove() {
		if (removeConfirmTimer) clearTimeout(removeConfirmTimer)
		removeConfirmFor = null
	}

	function handleConfirmRemove(method: PaymentMethodKey) {
		if (removeConfirmTimer) clearTimeout(removeConfirmTimer)
		removeConfirmFor = null
		const snapshot = payment.removeHandleWithSnapshot(method)
		const meta = paymentProviders.find((p) => p.value === method)
		showUndoToast(`Removed ${meta?.label ?? method}`, snapshot)
	}

	function showUndoToast(label: string, snapshot: RemoveSnapshot) {
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
		payment.restoreHandle(undoToast.snapshot)
		dismissUndo()
	}
</script>

{#if undoToast}
	<AdminToast
		message={undoToast.label}
		variant="undo"
		actionLabel="Undo"
		onAction={applyUndo}
		onDismiss={dismissUndo}
	/>
{/if}

<section class="payment-settings admin-settings__section">
	<div class="admin-settings__section-head">
		<div>
			<h4>PAYMENT</h4>
		</div>
	</div>

	{#if payment.loaded && configuredCount === 0}
		<p class="payment-settings__empty-hint">
			Add at least one method to accept bookings.
		</p>
	{/if}

	<ul class="payment-settings__list">
		{#each paymentProviders as meta}
			<PaymentMethodRow
				{meta}
				{payment}
				{mockMode}
				checkout={checkoutFor(meta.value)}
				removeConfirm={removeConfirmFor === meta.value}
				onRequestRemove={handleRequestRemove}
				onCancelRemove={handleCancelRemove}
				onConfirmRemove={handleConfirmRemove}
			/>
		{/each}
	</ul>
</section>

<style>
	.payment-settings__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	.payment-settings__empty-hint {
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
	.payment-settings__empty-hint::before {
		content: '✦';
		font-style: normal;
		font-size: 0.85rem;
		opacity: 0.85;
	}

</style>
