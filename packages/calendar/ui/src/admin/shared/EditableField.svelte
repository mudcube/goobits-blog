<script lang="ts">
	import { onDestroy } from 'svelte'

	const {
		value,
		onCommit,
		validate,
		ariaLabel,
		placeholder = '',
		multiline = false,
		className = ''
	} = $props<{
		value: string
		onCommit: (next: string) => void | Promise<void>
		validate?: (next: string) => string | null
		ariaLabel?: string
		placeholder?: string
		multiline?: boolean
		className?: string
	}>()

	let el: HTMLElement | undefined = $state()
	let display = $state('')
	let shake = $state(false)
	let shakeTimer: ReturnType<typeof setTimeout> | null = null

	$effect(() => {
		// Sync external value into the element when it's not focused.
		if (!el || document.activeElement !== el) {
			if (display !== value) display = value
		}
	})

	onDestroy(() => {
		if (shakeTimer) clearTimeout(shakeTimer)
	})

	function selectAll() {
		if (!el) return
		const range = document.createRange()
		range.selectNodeContents(el)
		const sel = window.getSelection()
		if (!sel) return
		sel.removeAllRanges()
		sel.addRange(range)
	}

	function flashError() {
		shake = true
		if (shakeTimer) clearTimeout(shakeTimer)
		shakeTimer = setTimeout(() => {
			shake = false
		}, 380)
	}

	function commit(target: HTMLElement) {
		const next = (target.textContent ?? '').trim()
		if (next === value.trim()) {
			display = value
			return
		}
		const err = validate?.(next)
		if (err) {
			display = value
			target.textContent = value
			flashError()
			return
		}
		void onCommit(next)
		display = next
	}

	function onKey(e: KeyboardEvent) {
		const target = e.currentTarget as HTMLElement
		if (e.key === 'Enter' && !multiline) {
			e.preventDefault()
			target.blur()
			return
		}
		if (e.key === 'Escape') {
			e.preventDefault()
			target.textContent = value
			display = value
			target.blur()
		}
	}
</script>

<span
	bind:this={el}
	class={`editable-field ${className}`}
	class:editable-field--shake={shake}
	class:editable-field--multiline={multiline}
	contenteditable="true"
	role="textbox"
	tabindex="0"
	aria-label={ariaLabel}
	data-placeholder={placeholder}
	spellcheck={!multiline}
	onfocus={selectAll}
	onblur={(e) => commit(e.currentTarget as HTMLElement)}
	onkeydown={onKey}
>{display}</span>

<style>
	.editable-field {
		outline: none;
		cursor: text;
		border-bottom: 1px dashed color-mix(in srgb, var(--text) 18%, transparent);
		padding: 0 0.1rem;
		transition: border-color 150ms ease, transform 60ms ease;
		display: inline-block;
	}
	.editable-field:hover,
	.editable-field:focus {
		border-bottom-color: color-mix(in srgb, var(--text) 40%, transparent);
	}
	.editable-field:empty::before {
		content: attr(data-placeholder);
		color: color-mix(in srgb, var(--text) 40%, transparent);
		font-style: italic;
	}
	.editable-field--multiline {
		display: block;
		white-space: pre-wrap;
	}
	.editable-field--shake {
		animation: editable-field-shake 380ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}
	@keyframes editable-field-shake {
		10%,
		90% {
			transform: translateX(-1px);
		}
		20%,
		80% {
			transform: translateX(2px);
		}
		30%,
		50%,
		70% {
			transform: translateX(-3px);
		}
		40%,
		60% {
			transform: translateX(3px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.editable-field--shake {
			animation: none;
		}
	}
</style>
