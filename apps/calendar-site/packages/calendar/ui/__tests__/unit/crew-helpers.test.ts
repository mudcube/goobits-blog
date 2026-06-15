import { describe, expect, it } from 'vitest'
import {
	normalizeName,
	fallbackNameFromEmail,
	isTokenLikeName,
	safeInviteNameFromEmail,
	initials,
	categoryBadgeText,
	statusDotColor
} from '../../src/admin/members/crew-helpers'

describe('normalizeName', () => {
	it('coerces to string and trims', () => {
		expect(normalizeName('  Alice  ')).toBe('Alice')
		expect(normalizeName(undefined)).toBe('')
		expect(normalizeName(null)).toBe('')
		expect(normalizeName(42)).toBe('42')
	})
})

describe('fallbackNameFromEmail', () => {
	it('title-cases dotted local parts', () => {
		expect(fallbackNameFromEmail('alice.smith@example.com')).toBe('Alice Smith')
	})

	it('handles underscores and dashes as separators', () => {
		expect(fallbackNameFromEmail('alice_smith@example.com')).toBe('Alice Smith')
		expect(fallbackNameFromEmail('alice-smith@example.com')).toBe('Alice Smith')
	})

	it("returns 'Member' when local part is empty or all separators", () => {
		expect(fallbackNameFromEmail('@example.com')).toBe('Member')
		expect(fallbackNameFromEmail('___@example.com')).toBe('Member')
	})

	it('handles single-token local', () => {
		expect(fallbackNameFromEmail('alice@example.com')).toBe('Alice')
	})
})

describe('isTokenLikeName', () => {
	it('flags long all-hex strings', () => {
		expect(isTokenLikeName('abc123def456')).toBe(true)
	})

	it('flags long alphanumeric strings with digits', () => {
		expect(isTokenLikeName('user2026abcdef')).toBe(true)
	})

	it('does not flag normal names', () => {
		expect(isTokenLikeName('Alice Smith')).toBe(false)
		expect(isTokenLikeName('Bob')).toBe(false)
	})

	it('flags empty/whitespace as token-like', () => {
		expect(isTokenLikeName('')).toBe(true)
		expect(isTokenLikeName('   ')).toBe(true)
	})
})

describe('safeInviteNameFromEmail', () => {
	it('returns name when local part is human-readable', () => {
		expect(safeInviteNameFromEmail('alice.smith@example.com')).toBe('Alice Smith')
	})

	it('returns empty when local part looks token-like', () => {
		expect(safeInviteNameFromEmail('a1b2c3d4e5f6@example.com')).toBe('')
	})
})

describe('initials', () => {
	it('uses first letter of first two words', () => {
		expect(initials('Alice Smith')).toBe('AS')
	})

	it('falls back to second char of single word', () => {
		expect(initials('Alice')).toBe('AL')
	})

	it("uses 'X' when only single character available", () => {
		expect(initials('A')).toBe('AX')
	})

	it('uppercases the result', () => {
		expect(initials('alice smith')).toBe('AS')
	})

	it('handles extra whitespace', () => {
		expect(initials('  Alice   Smith  ')).toBe('AS')
	})
})

describe('categoryBadgeText', () => {
	it('maps known activity keywords to friendly labels', () => {
		expect(categoryBadgeText('Gym')).toBe('Gym Regular')
		expect(categoryBadgeText('Movie Night')).toBe('Movie Buff')
		expect(categoryBadgeText('Adventure Hike')).toBe('Explorer')
		expect(categoryBadgeText('Circus')).toBe('Acrobat')
		expect(categoryBadgeText('Social Mixer')).toBe('Social Butterfly')
	})

	it("falls back to '<label> Regular' for unknown keywords", () => {
		expect(categoryBadgeText('Pottery')).toBe('Pottery Regular')
	})
})

describe('statusDotColor', () => {
	it('returns distinct colors for each status', () => {
		const colors = new Set([
			statusDotColor('pending'),
			statusDotColor('expired'),
			statusDotColor('exhausted')
		])
		expect(colors.size).toBe(3)
	})
})
