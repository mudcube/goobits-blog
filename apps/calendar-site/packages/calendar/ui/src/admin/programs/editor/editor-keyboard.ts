export function isUndoShortcut(event: KeyboardEvent): boolean {
	return (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z'
}

export function isRedoShortcut(event: KeyboardEvent): boolean {
	const key = event.key.toLowerCase()
	return (
		(event.metaKey || event.ctrlKey) &&
		((event.shiftKey && key === 'z') || (!event.metaKey && !event.shiftKey && key === 'y'))
	)
}

export function isNativeUndoTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false
	if (target.closest('input, textarea, select')) return true
	if (target.isContentEditable) return true
	return !!target.closest('[contenteditable="true"]')
}
