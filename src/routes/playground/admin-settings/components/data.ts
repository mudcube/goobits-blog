import type { PaymentMethodMeta, ProviderOption } from './types'

export const paymentMethods: PaymentMethodMeta[] = [
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

export const providerOptions: ProviderOption[] = [
	{ value: 'google', label: 'Google Calendar' },
	{ value: 'apple', label: 'Apple Calendar' },
	{ value: 'outlook', label: 'Outlook' }
]
