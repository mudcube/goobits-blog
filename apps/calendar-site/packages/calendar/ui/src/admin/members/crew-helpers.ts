/**
 * Pure helpers for the Crew page — string normalization, name derivation,
 * category badge mapping, and invite-status types. Kept icon-free so this
 * module can be unit-tested without a Svelte/lucide loader. The matching
 * Lucide icon lookup lives in `./crew-status-icons.ts`.
 */

export type InviteStatus = 'pending' | 'expired' | 'exhausted'

export function statusDotColor(status: InviteStatus): string {
	if (status === 'expired') return '#9ca3af'
	if (status === 'exhausted') return '#d97706'
	return '#a78bfa'
}

export function normalizeName(value: unknown): string {
	return String(value || '').trim()
}

export function fallbackNameFromEmail(email: string): string {
	const local = email.split('@')[0] ?? ''
	const clean = local.replace(/[._-]+/g, ' ').trim()
	if (!clean) return 'Member'
	return clean
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')
}

export function isTokenLikeName(value: string): boolean {
	const compact = value.replace(/\s+/g, '').toLowerCase()
	if (!compact) return true
	if (compact.length >= 10 && /^[a-f0-9]+$/.test(compact)) return true
	if (compact.length >= 10 && /^[a-z0-9]+$/.test(compact) && /\d/.test(compact)) return true
	return false
}

export function safeInviteNameFromEmail(email: string): string {
	const name = fallbackNameFromEmail(email)
	return isTokenLikeName(name) ? '' : name
}

export function initials(name: string): string {
	const parts = name.split(/\s+/).filter(Boolean)
	const a = parts[0]?.[0] ?? ''
	let b = parts[1]?.[0] ?? ''
	if (!b) {
		const first = (parts[0] || name || '').trim()
		b = first.length > 1 ? first[1] || 'X' : 'X'
	}
	return `${a}${b}`.toUpperCase()
}

export function categoryBadgeText(label: string): string {
	const key = label.toLowerCase()
	if (key.includes('gym')) return 'Gym Regular'
	if (key.includes('movie')) return 'Movie Buff'
	if (key.includes('adventure') || key.includes('hike')) return 'Explorer'
	if (key.includes('circus')) return 'Acrobat'
	if (key.includes('social')) return 'Social Butterfly'
	return `${label} Regular`
}
