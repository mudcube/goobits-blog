<script lang="ts">
	import type { Person } from './types'
	import { ft, formatDate } from './time'

	let {
		activityIcon,
		activityLabel,
		date,
		start,
		end,
		overlapping = [],
		onBack,
	}: {
		activityIcon: string
		activityLabel: string
		date: Date
		start: number
		end: number
		overlapping?: Person[]
		onBack: () => void
	} = $props()
</script>

<div class="dn">
	<div class="dn__badge">✓</div>
	<h2 class="dn__title">You're in.</h2>
	<p class="dn__detail">{activityIcon} {activityLabel} · {formatDate(date)}</p>
	<p class="dn__time">{ft(start)} – {ft(end)}</p>
	{#if overlapping.length > 0}
		<p class="dn__crew">{overlapping.map(p => p.name).join(' and ')} will be there too 🤙</p>
	{/if}
	<button type="button" class="dn__btn" onclick={onBack}>Back to calendar</button>
</div>

<style>
	.dn { text-align: center; padding: 2rem 0; }
	.dn__badge { width: 3rem; height: 3rem; border-radius: 999px; background: color-mix(in srgb, #3cbf8a 8%, transparent); border: 1px solid color-mix(in srgb, #3cbf8a 22%, transparent); color: #3cbf8a; display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; }
	.dn__title { margin: 0; font-family: var(--font-display); font-size: 1.6rem; font-weight: 500; letter-spacing: -0.03em; }
	.dn__detail { margin: 0.4rem 0 0; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.dn__time { margin: 0.1rem 0 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 500; }
	.dn__crew { margin: 0.6rem 0 1.25rem; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.dn__btn { width: 100%; padding: 0.6rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
	.dn__btn:hover { background: color-mix(in srgb, var(--text) 4%, transparent); }
</style>
