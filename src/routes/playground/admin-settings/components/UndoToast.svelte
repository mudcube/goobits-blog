<script lang="ts">
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { X as XIcon } from '@lucide/svelte'

	let {
		label,
		onUndo,
		onDismiss
	}: {
		label: string
		onUndo: () => void
		onDismiss: () => void
	} = $props()
</script>

<div
	class="undo-toast"
	role="status"
	aria-live="polite"
	transition:fly={{ y: -8, duration: 180, easing: cubicOut }}
>
	<span class="undo-toast__label">{label}</span>
	<button type="button" class="undo-toast__undo" onclick={onUndo}>Undo</button>
	<button type="button" class="undo-toast__dismiss" aria-label="Dismiss" onclick={onDismiss}>
		<XIcon size={12} />
	</button>
</div>

<style>
	.undo-toast {
		position: fixed;
		top: calc(3rem + 0.6rem);
		right: clamp(1rem, 2.2vw, 2rem);
		z-index: 90;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.55rem 0.5rem 0.85rem;
		border-radius: 0.7rem;
		background: color-mix(in srgb, var(--text) 92%, var(--bg) 8%);
		color: var(--bg);
		font-size: 0.78rem;
		font-weight: 480;
		box-shadow: 0 12px 30px -10px color-mix(in srgb, black 38%, transparent);
	}
	.undo-toast__label {
		font-style: italic;
		opacity: 0.86;
	}
	.undo-toast__undo {
		border: none;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		padding: 0.2rem 0.55rem;
		border-radius: 0.4rem;
	}
	.undo-toast__undo:hover {
		background: color-mix(in srgb, var(--bg) 14%, transparent);
	}
	.undo-toast__dismiss {
		border: none;
		background: transparent;
		color: inherit;
		opacity: 0.55;
		display: inline-flex;
		padding: 0.25rem;
		cursor: pointer;
		border-radius: 0.35rem;
	}
	.undo-toast__dismiss:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--bg) 14%, transparent);
	}
</style>
