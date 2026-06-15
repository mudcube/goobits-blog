<script lang="ts">
	import { onDestroy, onMount } from 'svelte'

	type SaveState = 'idle' | 'saving' | 'saved' | 'error'

	const {
		phase = 'idle',
		errorMessage = '',
		lastSavedAt = null
	} = $props<{
		phase?: SaveState
		errorMessage?: string
		lastSavedAt?: number | null
	}>()

	let nowTick = $state(Date.now())
	let interval: ReturnType<typeof setInterval> | null = null

	onMount(() => {
		interval = setInterval(() => (nowTick = Date.now()), 30000)
	})
	onDestroy(() => {
		if (interval) clearInterval(interval)
	})

	function relativeLabel(stamp: number, now: number) {
		const seconds = Math.max(0, Math.floor((now - stamp) / 1000))
		if (seconds < 5) return 'All saved · just now'
		if (seconds < 60) return `All saved · ${seconds}s ago`
		const minutes = Math.floor(seconds / 60)
		if (minutes < 60) return `All saved · ${minutes}m ago`
		const hours = Math.floor(minutes / 60)
		return `All saved · ${hours}h ago`
	}

	const display = $derived.by(() => {
		if (phase === 'error') return { label: errorMessage || 'Save failed', kind: 'error' }
		if (phase === 'saving') return { label: 'Saving…', kind: 'saving' }
		if (phase === 'saved') return { label: 'Saved ✓', kind: 'saved' }
		if (lastSavedAt) return { label: relativeLabel(lastSavedAt, nowTick), kind: 'idle-saved' }
		return null
	})
</script>

{#if display}
	<span
		class="admin-saved-indicator"
		class:admin-saved-indicator--error={display.kind === 'error'}
		class:admin-saved-indicator--saved={display.kind === 'saved'}
		class:admin-saved-indicator--idle={display.kind === 'idle-saved'}
		role="status"
		aria-live="polite"
	>
		{display.label}
	</span>
{/if}

<style>
	.admin-saved-indicator {
		position: absolute;
		top: 0.4rem;
		right: 0;
		font-size: 0.74rem;
		font-weight: 440;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
		opacity: 1;
		transition: opacity 200ms ease;
		pointer-events: none;
		z-index: 5;
	}
	.admin-saved-indicator--idle {
		opacity: 0.7;
	}
	.admin-saved-indicator--saved {
		color: var(--admin-success-fg);
	}
	.admin-saved-indicator--error {
		font-style: normal;
		font-weight: 540;
		color: var(--admin-danger);
		opacity: 1;
	}
</style>
