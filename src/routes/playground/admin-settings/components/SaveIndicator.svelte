<script lang="ts">
	import { relativeSavedLabel } from './helpers'
	import type { SaveState } from './types'

	let {
		saveState,
		lastSavedAt,
		nowTick
	}: {
		saveState: SaveState
		lastSavedAt: number | null
		nowTick: number
	} = $props()

	const display = $derived.by(() => {
		if (saveState === 'saving') return { state: 'saving', label: 'Saving…' }
		if (saveState === 'saved') return { state: 'saved', label: 'Saved ✓' }
		if (lastSavedAt) {
			return {
				state: 'idle-saved',
				label: relativeSavedLabel(lastSavedAt, nowTick)
			}
		}
		return { state: 'idle', label: '' }
	})
</script>

<span class="save-indicator" data-state={display.state} aria-live="polite">
	{display.label}
</span>

<style>
	.save-indicator {
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
	}
	.save-indicator[data-state='idle'] {
		opacity: 0;
	}
	.save-indicator[data-state='idle-saved'] {
		opacity: 0.7;
	}
	.save-indicator[data-state='saved'] {
		color: color-mix(in srgb, var(--admin-status-success-dot, #22c55e) 80%, var(--text) 20%);
	}
</style>
