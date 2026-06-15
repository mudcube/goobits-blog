import { createHistory } from '../../history/create-history'
import type { ProgramDraft } from '../programs-controller.svelte'

export type ProgramEditorSnapshot = {
	programDraft: ProgramDraft
}

type Options = {
	getDraft: () => ProgramDraft
	setDraft: (draft: ProgramDraft) => void
}

/**
 * Wraps the generic history primitive with program-editor-specific
 * snapshot/restore + signature computation for autosave comparison.
 */
export function createProgramEditorHistory({ getDraft, setDraft }: Options) {
	const history = createHistory<ProgramEditorSnapshot>({
		maxEntries: 100,
		coalesceMs: 700
	})
	let ready = false

	function snapshot(): ProgramEditorSnapshot {
		return { programDraft: { ...getDraft() } }
	}

	function apply(snap: ProgramEditorSnapshot) {
		setDraft({ ...snap.programDraft })
	}

	function reset() {
		history.clear(snapshot())
		ready = true
	}

	function push(scope: string) {
		if (!ready) {
			reset()
			return
		}
		history.push(snapshot(), { scope })
	}

	function undo(): ProgramEditorSnapshot | null {
		const next = history.undo(snapshot())
		if (next) apply(next)
		return next
	}

	function redo(): ProgramEditorSnapshot | null {
		const next = history.redo(snapshot())
		if (next) apply(next)
		return next
	}

	function signature(): string {
		const draft = getDraft()
		return JSON.stringify({
			slug: draft.slug.trim(),
			label: draft.label.trim(),
			activityName: draft.activityName.trim(),
			pageTitle: draft.pageTitle.trim(),
			eyebrow: draft.eyebrow.trim(),
			heroTitleLine1: draft.heroTitleLine1.trim(),
			heroTitleLine2: draft.heroTitleLine2.trim(),
			heroSubtitle: draft.heroSubtitle.trim(),
			description: draft.description.trim(),
			icon: draft.icon.trim(),
			eyebrowClass: draft.eyebrowClass.trim(),
			glowClass: draft.glowClass.trim(),
			formGlowClass: draft.formGlowClass.trim(),
			serviceStatusNote: draft.serviceStatusNote.trim(),
			enabled: draft.enabled,
			sortOrder: Number(draft.sortOrder) || 0
		})
	}

	return { reset, push, undo, redo, signature }
}

export type ProgramEditorHistory = ReturnType<typeof createProgramEditorHistory>
