export type HistoryClone<T> = (snapshot: T) => T
export type HistoryEquals<T> = (left: T, right: T) => boolean

export type HistoryPushOptions = {
	scope?: string
	now?: number
}

export type HistoryOptions<T> = {
	initial?: T
	maxEntries?: number
	coalesceMs?: number
	clone?: HistoryClone<T>
	equals?: HistoryEquals<T>
}

type HistoryEntry<T> = {
	snapshot: T
	scope: string | null
	createdAt: number
}

function defaultClone<T>(snapshot: T): T {
	if (typeof structuredClone === 'function') {
		return structuredClone(snapshot)
	}
	return JSON.parse(JSON.stringify(snapshot)) as T
}

function defaultEquals<T>(left: T, right: T): boolean {
	return JSON.stringify(left) === JSON.stringify(right)
}

export function createHistory<T>(options: HistoryOptions<T> = {}) {
	const maxEntries = Math.max(1, Math.floor(options.maxEntries ?? 100))
	const coalesceMs = Math.max(0, Math.floor(options.coalesceMs ?? 0))
	const clone = options.clone ?? defaultClone<T>
	const equals = options.equals ?? defaultEquals<T>
	let entries: Array<HistoryEntry<T>> = []
	let index = -1

	function makeEntry(snapshot: T, pushOptions: HistoryPushOptions = {}): HistoryEntry<T> {
		return {
			snapshot: clone(snapshot),
			scope: pushOptions.scope ?? null,
			createdAt: pushOptions.now ?? Date.now()
		}
	}

	function trimToMaxEntries() {
		while (entries.length > maxEntries) {
			entries.shift()
			index -= 1
		}
		if (entries.length === 0) {
			index = -1
			return
		}
		index = Math.max(0, Math.min(index, entries.length - 1))
	}

	function currentEntry() {
		return index >= 0 ? entries[index] : null
	}

	function push(snapshot: T, pushOptions: HistoryPushOptions = {}) {
		const current = currentEntry()
		if (current && equals(current.snapshot, snapshot)) return

		const next = makeEntry(snapshot, pushOptions)
		if (
			current &&
			coalesceMs > 0 &&
			current.scope &&
			next.scope &&
			current.scope === next.scope &&
			next.createdAt - current.createdAt <= coalesceMs
		) {
			entries[index] = next
			return
		}

		entries = entries.slice(0, index + 1)
		entries.push(next)
		index = entries.length - 1
		trimToMaxEntries()
	}

	function replaceCurrent(snapshot: T, pushOptions: HistoryPushOptions = {}) {
		const next = makeEntry(snapshot, pushOptions)
		if (index < 0) {
			entries = [next]
			index = 0
			return
		}
		entries[index] = next
	}

	function undo(currentSnapshot?: T): T | null {
		if (index <= 0) return null
		if (currentSnapshot !== undefined) {
			const current = entries[index]
			const pushOptions: HistoryPushOptions = {}
			if (current?.scope) pushOptions.scope = current.scope
			if (current) pushOptions.now = current.createdAt
			entries[index] = makeEntry(currentSnapshot, pushOptions)
		}
		index -= 1
		const previous = entries[index]
		return previous ? clone(previous.snapshot) : null
	}

	function redo(currentSnapshot?: T): T | null {
		if (index < 0 || index >= entries.length - 1) return null
		if (currentSnapshot !== undefined) {
			const current = entries[index]
			const pushOptions: HistoryPushOptions = {}
			if (current?.scope) pushOptions.scope = current.scope
			if (current) pushOptions.now = current.createdAt
			entries[index] = makeEntry(currentSnapshot, pushOptions)
		}
		index += 1
		const next = entries[index]
		return next ? clone(next.snapshot) : null
	}

	function clear(snapshot?: T) {
		entries = snapshot === undefined ? [] : [makeEntry(snapshot)]
		index = entries.length - 1
	}

	if (options.initial !== undefined) {
		replaceCurrent(options.initial)
	}

	return {
		push,
		replaceCurrent,
		undo,
		redo,
		clear,
		get canUndo() {
			return index > 0
		},
		get canRedo() {
			return index >= 0 && index < entries.length - 1
		},
		get size() {
			return entries.length
		}
	}
}
