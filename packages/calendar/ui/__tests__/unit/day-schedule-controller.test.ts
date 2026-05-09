import { describe, expect, it } from 'vitest'
import { isoDay, isPast, isToday, isSameDay } from '../../src/admin/programs/editor/day-schedule-controller.svelte'

describe('day-schedule-controller helpers', () => {
	describe('isoDay', () => {
		it('formats year-month-day with zero padding', () => {
			expect(isoDay(new Date(2026, 0, 5))).toBe('2026-01-05')
			expect(isoDay(new Date(2026, 11, 31))).toBe('2026-12-31')
		})
	})

	describe('isPast', () => {
		it('returns true for yesterday', () => {
			const d = new Date()
			d.setDate(d.getDate() - 1)
			expect(isPast(d)).toBe(true)
		})

		it('returns false for today', () => {
			expect(isPast(new Date())).toBe(false)
		})

		it('returns false for tomorrow', () => {
			const d = new Date()
			d.setDate(d.getDate() + 1)
			expect(isPast(d)).toBe(false)
		})
	})

	describe('isToday', () => {
		it('returns true for now', () => {
			expect(isToday(new Date())).toBe(true)
		})

		it('returns false for tomorrow', () => {
			const d = new Date()
			d.setDate(d.getDate() + 1)
			expect(isToday(d)).toBe(false)
		})
	})

	describe('isSameDay', () => {
		it('returns true for two dates on the same calendar day', () => {
			const a = new Date(2026, 4, 9, 8, 0, 0)
			const b = new Date(2026, 4, 9, 23, 59, 0)
			expect(isSameDay(a, b)).toBe(true)
		})

		it('returns false across midnight', () => {
			const a = new Date(2026, 4, 9, 23, 59, 0)
			const b = new Date(2026, 4, 10, 0, 1, 0)
			expect(isSameDay(a, b)).toBe(false)
		})
	})
})
