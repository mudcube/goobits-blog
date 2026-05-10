import { describe, expect, it } from 'vitest'
import { createProgramEditorHistory } from '../../src/admin/programs/editor/program-editor-history.svelte'
import type { ProgramDraft } from '../../src/admin/programs/programs-controller.svelte'

function blankDraft(): ProgramDraft {
	return {
		slug: '',
		label: '',
		activityName: '',
		pageTitle: '',
		eyebrow: '',
		heroTitleLine1: '',
		heroTitleLine2: '',
		heroSubtitle: '',
		description: '',
		icon: '',
		eyebrowClass: '',
		glowClass: '',
		formGlowClass: '',
		serviceStatusNote: '',
		enabled: true,
		sortOrder: 0
	}
}

function setup() {
	let draft: ProgramDraft = blankDraft()
	const history = createProgramEditorHistory({
		getDraft: () => draft,
		setDraft: (next) => {
			draft = next
		}
	})
	return {
		history,
		getDraft: () => draft,
		setField: <K extends keyof ProgramDraft>(field: K, value: ProgramDraft[K]) => {
			draft = { ...draft, [field]: value }
		}
	}
}

describe('program-editor-history', () => {
	it('signature is stable across whitespace-only changes', () => {
		const { history, setField } = setup()
		history.reset()
		const first = history.signature()
		setField('label', '   ')
		expect(history.signature()).toBe(first)
	})

	it('signature changes when a field changes', () => {
		const { history, setField } = setup()
		history.reset()
		const before = history.signature()
		setField('label', 'Yoga')
		expect(history.signature()).not.toBe(before)
	})

	it('push then undo restores the previous draft (distinct scopes)', () => {
		const { history, setField, getDraft } = setup()
		history.reset()
		setField('label', 'Yoga')
		history.push('label')
		// Different scope so the pushes don't coalesce within the
		// 700ms coalesce window.
		setField('eyebrow', 'Morning')
		history.push('eyebrow')

		const undone = history.undo()
		expect(undone).not.toBeNull()
		// Undoing the eyebrow push restores eyebrow to the prior entry,
		// where label='Yoga' had already been applied.
		expect(getDraft().eyebrow).toBe('')
		expect(getDraft().label).toBe('Yoga')
	})

	it('redo replays an undone change', () => {
		const { history, setField, getDraft } = setup()
		history.reset()
		setField('label', 'Yoga')
		history.push('label')
		setField('eyebrow', 'Morning')
		history.push('eyebrow')
		history.undo()
		const redone = history.redo()
		expect(redone).not.toBeNull()
		expect(getDraft().eyebrow).toBe('Morning')
	})

	it('rapid same-scope pushes coalesce into a single history entry', () => {
		const { history, setField, getDraft } = setup()
		history.reset()
		setField('label', 'Yoga')
		history.push('label')
		setField('label', 'Boxing')
		history.push('label')
		// Coalesced — undo goes straight to the reset baseline.
		const undone = history.undo()
		expect(undone).not.toBeNull()
		expect(getDraft().label).toBe('')
	})

	it('reset auto-runs on first push when not yet ready', () => {
		const { history, setField } = setup()
		// No reset() called — the first push should self-bootstrap.
		setField('label', 'Yoga')
		history.push('label')
		// After self-reset, undo from the bootstrapped baseline returns null
		// because there's only one entry.
		expect(history.undo()).toBeNull()
	})
})
