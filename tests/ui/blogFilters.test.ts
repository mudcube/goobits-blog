import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildBlogFilterHref, createBlogFilterNavigation } from '../../src/ui/blogFilters.js'

afterEach(() => {
	vi.useRealTimers()
})

describe('buildBlogFilterHref', () => {
	it('preserves unrelated state while resetting pagination and normalizing defaults', () => {
		expect(
			buildBlogFilterHref('https://example.com/journal/?page=4&lang=es&sort=oldest#archive', {
				search: '  color piano  ',
				sort: 'newest'
			})
		).toBe('/journal/?lang=es&q=color+piano#archive')
	})

	it('removes an empty search and writes non-default sorting', () => {
		expect(buildBlogFilterHref('/journal/?q=old&page=2', { search: ' ', sort: 'title' })).toBe(
			'/journal/?sort=title'
		)
	})
})

describe('createBlogFilterNavigation', () => {
	it('debounces search changes and only navigates to the latest query', async () => {
		vi.useFakeTimers()
		const navigate = vi.fn<() => void>()
		const navigation = createBlogFilterNavigation({
			currentUrl: () => 'https://example.com/journal/',
			debounceMs: 250,
			navigate
		})

		navigation.scheduleSearch({ search: 'col', sort: 'newest' })
		navigation.scheduleSearch({ search: 'color', sort: 'newest' })
		await vi.advanceTimersByTimeAsync(249)
		expect(navigate).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(1)
		expect(navigate).toHaveBeenCalledOnce()
		expect(navigate).toHaveBeenCalledWith('/journal/?q=color')
	})

	it('skips identical locations and cancels scheduled work on an explicit apply', async () => {
		vi.useFakeTimers()
		const navigate = vi.fn<() => void>()
		const navigation = createBlogFilterNavigation({
			currentUrl: () => 'https://example.com/journal/?q=color',
			navigate
		})

		navigation.scheduleSearch({ search: 'stale', sort: 'newest' })
		expect(await navigation.apply({ search: 'color', sort: 'newest' })).toBe(false)
		await vi.runAllTimersAsync()
		expect(navigate).not.toHaveBeenCalled()
	})
})
