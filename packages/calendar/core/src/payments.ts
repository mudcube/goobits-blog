// Payments sub-entry for @calendar/core.
//
// Checkout flow (PayPal + Square Cash App), payment-link helper, and the
// admin-side payment defaults. Note: admin payment defaults are also
// re-exported from @calendar/core/admin (it's a cross-cutting fact) but
// they "physically" live in the payments domain.

export {
	capturePayPalCheckoutOrder,
	createPayPalCheckoutOrder,
	createSquareCashAppPayment,
	deletePaymentCredentials,
	getPaymentCheckoutConfig,
	getPaymentCheckoutContext,
	savePayPalPaymentCredentials,
	saveSquarePaymentCredentials,
	type CheckoutProvider,
	type PaymentCheckoutContext
} from './services/payments/checkout.ts'

export { buildPaymentLink, type PaymentProvider } from './services/payments/pay.ts'

export {
	getAdminPaymentDefaults,
	setAdminPaymentDefaults,
	type AdminPaymentDefaults
} from './services/payments/admin-payment-defaults.ts'
