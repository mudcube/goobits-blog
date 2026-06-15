import { describe, expect, it } from 'vitest'
import { createHistory } from '../../../ui/src/admin/history/create-history'

type Snapshot = {
	title: string
	nested?: { enabled: boolean }
}

describe('createHistory', () => {
	it('undoes and redoes snapshots', () => {
		const history = createHistory<Snapshot>({ initial: { title: 'one' } })

		history.push({ title: 'two' })
		history.push({ title: 'three' })

		expect(history.canUndo).toBe(true)
		expect(history.undo()).toEqual({ title: 'two' })
		expect(history.undo()).toEqual({ title: 'one' })
		expect(history.canUndo).toBe(false)
		expect(history.redo()).toEqual({ title: 'two' })
		expect(history.redo()).toEqual({ title: 'three' })
		expect(history.canRedo).toBe(false)
	})

	it('clears redo snapshots after a new push', () => {
		const history = createHistory<Snapshot>({ initial: { title: 'one' } })

		history.push({ title: 'two' })
		history.push({ title: 'three' })
		expect(history.undo()).toEqual({ title: 'two' })

		history.push({ title: 'four' })

		expect(history.canRedo).toBe(false)
		expect(history.undo()).toEqual({ title: 'two' })
	})

	it('bounds history to maxEntries', () => {
		const history = createHistory<Snapshot>({ maxEntries: 3 })

		history.push({ title: 'one' })
		history.push({ title: 'two' })
		history.push({ title: 'three' })
		history.push({ title: 'four' })

		expect(history.size).toBe(3)
		expect(history.undo()).toEqual({ title: 'three' })
		expect(history.undo()).toEqual({ title: 'two' })
		expect(history.undo()).toBeNull()
	})

	it('coalesces rapid pushes with the same scope', () => {
		const history = createHistory<Snapshot>({
			initial: { title: 'one' },
			coalesceMs: 500
		})

		history.push({ title: 'two' }, { scope: 'title', now: 1000 })
		history.push({ title: 'three' }, { scope: 'title', now: 1200 })

		expect(history.size).toBe(2)
		expect(history.undo()).toEqual({ title: 'one' })
		expect(history.redo()).toEqual({ title: 'three' })
	})

	it('does not coalesce different scopes', () => {
		const history = createHistory<Snapshot>({
			initial: { title: 'one' },
			coalesceMs: 500
		})

		history.push({ title: 'two' }, { scope: 'title', now: 1000 })
		history.push({ title: 'three' }, { scope: 'subtitle', now: 1200 })

		expect(history.size).toBe(3)
		expect(history.undo()).toEqual({ title: 'two' })
	})

	it('clones snapshots in and out of the stack', () => {
		const first = { title: 'one', nested: { enabled: true } }
		const history = createHistory<Snapshot>({ initial: first })

		first.nested.enabled = false

		const restored = history.undo() ?? history.redo() ?? history.redo()
		expect(restored).toBeNull()

		history.push({ title: 'two', nested: { enabled: false } })
		const previous = history.undo()
		expect(previous).toEqual({ title: 'one', nested: { enabled: true } })

		if (previous?.nested) previous.nested.enabled = false
		expect(history.redo()).toEqual({ title: 'two', nested: { enabled: false } })
		expect(history.undo()).toEqual({ title: 'one', nested: { enabled: true } })
	})
})

