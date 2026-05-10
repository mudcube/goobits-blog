import type { AdminPaymentDefaults } from '../payments/admin-payment-defaults.ts'
import type { CalendarFeedEvent } from '../bookings/social.ts'
import type { CalendarProgramState } from './programs.ts'

export type AdminBootstrapUser = {
	id: number | string
	email: string
	name: string | null
	avatar_url: string | null
	email_verified: number | boolean
	last_login_at: number | null
	provider: string | null
}

export type AdminBootstrapInvite = {
	id: number | string
	code: string
	email: string | null
	label?: string | null
	target_activity_slug?: string | null
	redirect_path?: string | null
	created_at: number
	uses_remaining: number | null
	expires_at: number | null
	[key: string]: unknown
}

export type AdminBootstrapPaymentIntegrations = {
	paypal: {
		clientId: string | null
		environment: 'sandbox' | 'live'
		source: 'stored' | 'env' | null
		enabled: boolean
	}
	square: {
		applicationId: string | null
		locationId: string | null
		environment: 'sandbox' | 'production'
		source: 'stored' | 'env' | null
		enabled: boolean
	}
}

export type AdminBootstrap = {
	programs: CalendarProgramState[]
	upcoming: CalendarFeedEvent[]
	recent: CalendarFeedEvent[]
	paymentDefaults: AdminPaymentDefaults
	paymentIntegrations: AdminBootstrapPaymentIntegrations
	invites: AdminBootstrapInvite[]
	users: AdminBootstrapUser[]
}

export function isAdminBootstrap(value: unknown): value is AdminBootstrap {
	if (!value || typeof value !== 'object') return false
	const v = value as Record<string, unknown>
	return (
		Array.isArray(v['programs']) &&
		Array.isArray(v['upcoming']) &&
		Array.isArray(v['recent']) &&
		typeof v['paymentDefaults'] === 'object' &&
		typeof v['paymentIntegrations'] === 'object' &&
		Array.isArray(v['invites']) &&
		Array.isArray(v['users'])
	)
}
