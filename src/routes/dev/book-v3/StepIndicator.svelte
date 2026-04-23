<script lang="ts">
	import { Check } from '@lucide/svelte'

	let {
		current = 0,
		labels = ['Day', 'Time', 'Booked'],
		onNavigate,
	}: {
		current?: number
		labels?: [string, string, string]
		onNavigate?: (step: number) => void
	} = $props()
</script>

<nav class="si">
	{#each labels as label, i}
		{#if i > 0}<span class="si__line" class:si__line--done={current > i - 1}></span>{/if}
		<button type="button" class="si__step" class:si__step--active={current === i} class:si__step--done={current > i} disabled={i >= current} onclick={() => onNavigate?.(i)}>
			<span class="si__dot">
				{#if current > i}<Check size={11} strokeWidth={3} />{:else}{i + 1}{/if}
			</span>
			<span class="si__label">{label}</span>
		</button>
	{/each}
</nav>

<style>
	.si { display: flex; align-items: flex-start; gap: 0; margin-bottom: 0.75rem; }
	.si__line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 14%, transparent); margin-top: 0.7rem; }
	.si__line--done { background: #a78bfa; }
	.si__step { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0; border: none; background: none; font: inherit; cursor: pointer; min-width: 2.5rem; }
	.si__step:disabled { cursor: default; }
	.si__dot { width: 1.4rem; height: 1.4rem; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 700; flex-shrink: 0; border: 1.5px solid color-mix(in srgb, var(--text) 18%, transparent); color: color-mix(in srgb, var(--text) 40%, transparent); background: transparent; transition: all 150ms; }
	.si__step--active .si__dot { border-color: #a78bfa; color: #a78bfa; background: color-mix(in srgb, #a78bfa 8%, transparent); }
	.si__step--done .si__dot { border-color: #a78bfa; background: #a78bfa; color: #fff; }
	.si__label { font-size: 0.55rem; font-weight: 600; color: color-mix(in srgb, var(--text) 32%, transparent); white-space: nowrap; max-width: 5rem; overflow: hidden; text-overflow: ellipsis; text-align: center; }
	.si__step--active .si__label { color: color-mix(in srgb, var(--text) 68%, transparent); }
	.si__step--done .si__label { color: color-mix(in srgb, #a78bfa 60%, transparent); }
</style>
