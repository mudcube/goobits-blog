import { providerOptions } from './data'
import type { PaymentMethod, SyncProvider } from './types'

export function providerLabel(p: SyncProvider): string {
	return providerOptions.find((opt) => opt.value === p)?.label ?? p
}

export function validateHandle(method: PaymentMethod, raw: string): string | null {
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
			return 'Cashtag — starts with a letter, no spaces.'
	}
	return null
}

export function relativeSavedLabel(stamp: number, now: number): string {
	const seconds = Math.max(0, Math.floor((now - stamp) / 1000))
	if (seconds < 5) return 'All saved · just now'
	if (seconds < 60) return `All saved · ${seconds}s ago`
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `All saved · ${minutes}m ago`
	const hours = Math.floor(minutes / 60)
	return `All saved · ${hours}h ago`
}
