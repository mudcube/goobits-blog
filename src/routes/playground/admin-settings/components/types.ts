export type SyncProvider = 'google' | 'apple' | 'outlook'
export type PaymentMethod = 'venmo' | 'paypal' | 'cashapp'
export type SaveState = 'idle' | 'saving' | 'saved' | 'idle-saved'
export type Preset = 'empty' | 'healthy' | 'attention'

export type SyncStatus = {
	active: SyncProvider | null
	syncedAtLabel: string | null
}

export type PayPalCreds = {
	clientId: string
	clientSecret: string
	environment: 'sandbox' | 'live'
}

export type SquareCreds = {
	applicationId: string
	locationId: string
	accessToken: string
	environment: 'sandbox' | 'live'
}

export type PaymentRow = {
	handle: string
	expanded: boolean
	checkoutEnabled: boolean
	advancedOpen: boolean
	expiringSoon: boolean
}

export type PaymentMethodMeta = {
	key: PaymentMethod
	label: string
	color: string
	placeholder: string
	blurb: (handle: string) => string
	checkoutBlurb: string
}

export type ProviderOption = {
	value: SyncProvider
	label: string
}

export type UndoSnapshot =
	| {
			kind: 'remove-handle'
			method: PaymentMethod
			row: PaymentRow
			primary: PaymentMethod | null
		}
	| {
			kind: 'disconnect-sync'
			sync: SyncStatus
		}
