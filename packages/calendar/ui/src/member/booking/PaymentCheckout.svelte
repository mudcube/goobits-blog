<script lang="ts">
	import { onMount } from 'svelte'
	import {
		captureCalendarPayPalOrder,
		createCalendarCashAppPayment,
		createCalendarPayPalOrder,
		getCalendarPaymentConfig,
		type CalendarPaymentConfigResponse
	} from '../../api/calendar'

	type PaidEvent = {
		id: number
		title: string
		costCents: number
		currency: string
		paymentProvider: string | null
		paymentHandle: string | null
		payUrl?: string | null
	}

	type PayPalButtonsConfig = {
		fundingSource: string
		style?: Record<string, unknown>
		createOrder: () => Promise<string>
		onApprove: (data: { orderID?: string; orderId?: string }) => Promise<void>
		onError: (error: unknown) => void
	}

	type PayPalButtonsInstance = {
		render: (selector: string) => Promise<void>
		isEligible?: () => boolean
		close?: () => void
	}

	type PayPalGlobal = {
		FUNDING: {
			PAYPAL: string
			VENMO: string
		}
		Buttons: (config: PayPalButtonsConfig) => PayPalButtonsInstance
	}

	type SquareCashAppPay = {
		attach: (selector: string) => Promise<void>
		destroy?: () => void
		addEventListener: (
			name: 'ontokenization',
			listener: (event: { detail: { tokenResult?: { status?: string; token?: string }; error?: unknown } }) => void
		) => void
	}

	type SquarePayments = {
		paymentRequest: (input: Record<string, unknown>) => unknown
		cashAppPay: (
			paymentRequest: unknown,
			options: { redirectURL: string; referenceId: string }
		) => Promise<SquareCashAppPay>
	}

	type SquareGlobal = {
		payments: (applicationId: string, locationId: string) => Promise<SquarePayments> | SquarePayments
	}

	type PaymentWindow = Window & {
		paypal?: PayPalGlobal
		Square?: SquareGlobal
	}

	const {
		event,
		confirmationId = null
	}: {
		event: PaidEvent | null
		confirmationId?: string | null
	} = $props()

	let config = $state<CalendarPaymentConfigResponse['payments'] | null>(null)
	let status = $state('')
	let error = $state('')
	let paypalReady = $state(false)
	let cashAppReady = $state(false)
	let cashAppReceiptUrl = $state<string | null>(null)
	let paypalButtons: PayPalButtonsInstance[] = []
	let cashApp: SquareCashAppPay | null = null

	const isPaid = $derived(!!event && event.costCents > 0)
	const eventPaymentProvider = $derived((event?.paymentProvider || '').toLowerCase())
	const showPayPalCheckout = $derived(eventPaymentProvider === 'paypal')
	const showVenmoCheckout = $derived(eventPaymentProvider === 'venmo')
	const showCashAppCheckout = $derived(eventPaymentProvider === 'cashapp')
	const amountLabel = $derived(
		event
			? new Intl.NumberFormat(undefined, {
					style: 'currency',
					currency: event.currency || 'USD'
				}).format(event.costCents / 100)
			: ''
	)

	function scriptLoaded(srcPrefix: string) {
		return Array.from(document.scripts).some((script) => script.src.startsWith(srcPrefix))
	}

	function loadScript(src: string) {
		return new Promise<void>((resolve, reject) => {
			if (scriptLoaded(src)) {
				resolve()
				return
			}
			const script = document.createElement('script')
			script.src = src
			script.async = true
			script.onload = () => resolve()
			script.onerror = () => reject(new Error(`Failed to load ${src}`))
			document.head.appendChild(script)
		})
	}

	function paymentWindow() {
		return window as PaymentWindow
	}

	async function initPayPal(nextConfig: CalendarPaymentConfigResponse['payments']) {
		if (!event || (!showPayPalCheckout && !showVenmoCheckout) || !nextConfig.paypal.enabled || !nextConfig.paypal.clientId) return
		const currency = encodeURIComponent(event.currency || 'USD')
		const clientId = encodeURIComponent(nextConfig.paypal.clientId)
		await loadScript(`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&enable-funding=venmo`)
		const paypal = paymentWindow().paypal
		if (!paypal) return
		for (const button of paypalButtons) button.close?.()
		paypalButtons = []
		const targets: Array<{ selector: string; fundingSource: string }> = [
			{ selector: '#calendar-paypal-button', fundingSource: paypal.FUNDING.PAYPAL },
			{ selector: '#calendar-venmo-button', fundingSource: paypal.FUNDING.VENMO }
		]
		for (const target of targets) {
			if (target.fundingSource === paypal.FUNDING.PAYPAL && !showPayPalCheckout) continue
			if (target.fundingSource === paypal.FUNDING.VENMO && !showVenmoCheckout) continue
			const buttons = paypal.Buttons({
				fundingSource: target.fundingSource,
				style: {
					layout: 'vertical',
					height: 42,
					shape: 'rect',
					label: target.fundingSource === paypal.FUNDING.VENMO ? 'pay' : 'paypal'
				},
				createOrder: async () => {
					if (!event) throw new Error('Missing event')
					const order = await createCalendarPayPalOrder({
						eventId: event.id,
						confirmationId,
						fundingSource: target.fundingSource === paypal.FUNDING.VENMO ? 'venmo' : 'paypal'
					})
					return order.orderId
				},
				onApprove: async (data) => {
					const orderId = data.orderID || data.orderId
					if (!orderId) throw new Error('Missing PayPal order id')
					const result = await captureCalendarPayPalOrder(orderId)
					status = result.status === 'COMPLETED' ? 'Payment received' : `Payment ${result.status.toLowerCase()}`
					error = ''
				},
				onError: (err) => {
					console.error('PayPal checkout failed', err)
					error = 'Payment failed. Try again or use the direct payment link.'
				}
			})
			if (!buttons.isEligible || buttons.isEligible()) {
				await buttons.render(target.selector)
				paypalButtons.push(buttons)
			}
		}
		paypalReady = paypalButtons.length > 0
	}

	async function initCashApp(nextConfig: CalendarPaymentConfigResponse['payments']) {
		if (!event || !showCashAppCheckout || !nextConfig.square.enabled || !nextConfig.square.applicationId || !nextConfig.square.locationId) return
		const sdkUrl =
			nextConfig.square.environment === 'production'
				? 'https://web.squarecdn.com/v1/square.js'
				: 'https://sandbox.web.squarecdn.com/v1/square.js'
		await loadScript(sdkUrl)
		const square = paymentWindow().Square
		if (!square) return
		const payments = await square.payments(nextConfig.square.applicationId, nextConfig.square.locationId)
		const paymentRequest = payments.paymentRequest({
			countryCode: 'US',
			currencyCode: event.currency || 'USD',
			total: {
				amount: (event.costCents / 100).toFixed(2),
				label: event.title
			}
		})
		cashApp = await payments.cashAppPay(paymentRequest, {
			redirectURL: window.location.href,
			referenceId: confirmationId || `event-${event.id}`
		})
		cashApp.addEventListener('ontokenization', (tokenEvent) => {
			const token = tokenEvent.detail.tokenResult?.token
			if (tokenEvent.detail.error || !token || tokenEvent.detail.tokenResult?.status !== 'OK') {
				error = 'Cash App authorization failed.'
				return
			}
			void createCalendarCashAppPayment({
				eventId: event.id,
				confirmationId,
				sourceId: token
			}).then((result) => {
				status = result.status === 'COMPLETED' ? 'Payment received' : `Payment ${result.status.toLowerCase()}`
				cashAppReceiptUrl = result.receiptUrl
				error = ''
			}).catch((err: unknown) => {
				console.error('Cash App payment failed', err)
				error = 'Cash App payment failed. Try again or use the direct payment link.'
			})
		})
		await cashApp.attach('#calendar-cashapp-button')
		cashAppReady = true
	}

	onMount(() => {
		let active = true
		if (!isPaid) return
		void getCalendarPaymentConfig()
			.then(async (result) => {
				if (!active) return
				config = result.payments
				await Promise.allSettled([initPayPal(result.payments), initCashApp(result.payments)])
			})
			.catch((err: unknown) => {
				console.error('Payment config failed', err)
				error = 'Online checkout is unavailable.'
			})
		return () => {
			active = false
			for (const button of paypalButtons) button.close?.()
			cashApp?.destroy?.()
		}
	})
</script>

{#if isPaid && event}
	<section class="payment-checkout" aria-label="Payment checkout">
		<div class="payment-checkout__head">
			<div>
				<p class="payment-checkout__eyebrow">Payment due</p>
				<h3>{amountLabel}</h3>
			</div>
			<span>{event.currency || 'USD'}</span>
		</div>

			<div class="payment-checkout__buttons">
				<div id="calendar-paypal-button" class:payment-checkout__hidden={!config?.paypal.enabled || !showPayPalCheckout}></div>
				<div id="calendar-venmo-button" class:payment-checkout__hidden={!config?.paypal.enabled || !showVenmoCheckout}></div>
				<div id="calendar-cashapp-button" class:payment-checkout__hidden={!config?.square.enabled || !showCashAppCheckout}></div>
			</div>

		{#if !paypalReady && !cashAppReady && event.payUrl}
			<a class="payment-checkout__fallback" href={event.payUrl} target="_blank" rel="noopener">Open payment link</a>
		{/if}
		{#if cashAppReceiptUrl}
			<a class="payment-checkout__fallback" href={cashAppReceiptUrl} target="_blank" rel="noopener">View receipt</a>
		{/if}
		{#if status}
			<p class="payment-checkout__status">{status}</p>
		{/if}
		{#if error}
			<p class="payment-checkout__error">{error}</p>
		{/if}
	</section>
{/if}

<style>
	.payment-checkout {
		margin-top: 1rem;
		padding: 0.8rem;
		border: 1px solid rgba(167, 139, 250, 0.14);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.035);
		text-align: left;
	}

	.payment-checkout__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.payment-checkout__eyebrow {
		margin: 0 0 0.12rem;
		font-size: 0.64rem;
		font-weight: 700;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.38);
	}

	.payment-checkout h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 750;
		color: rgba(255, 255, 255, 0.84);
	}

	.payment-checkout__head span {
		font-size: 0.68rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.38);
	}

	.payment-checkout__buttons {
		display: grid;
		gap: 0.45rem;
	}

	.payment-checkout__hidden {
		display: none;
	}

	.payment-checkout__fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 2.6rem;
		margin-top: 0.45rem;
		border-radius: 0.35rem;
		background: #10b981;
		color: #05130f;
		font-size: 0.76rem;
		font-weight: 800;
		text-decoration: none;
	}

	.payment-checkout__status,
	.payment-checkout__error {
		margin: 0.55rem 0 0;
		font-size: 0.72rem;
		font-weight: 700;
	}

	.payment-checkout__status {
		color: #6ee7b7;
	}

	.payment-checkout__error {
		color: #fca5a5;
	}
</style>
