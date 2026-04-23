<script lang="ts">
	import type { OpenDay } from './types'
	import InlineClaim from './InlineClaim.svelte'

	let {
		activity,
		calDays,
		weekdays,
		openDays,
		claimed = false,
		pendingDay = $bindable<OpenDay | null>(null),
		onSelectDay,
		onClaim,
	}: {
		activity: { icon: string; label: string; tagline: string }
		calDays: Array<{ date: Date; inMonth: boolean; isToday: boolean; isOpen: boolean; isPast: boolean; bookingCount: number }>
		weekdays: string[]
		openDays: OpenDay[]
		claimed?: boolean
		pendingDay?: OpenDay | null
		onSelectDay: (day: OpenDay) => void
		onClaim: (name: string) => void
	} = $props()

	function tapDay(cell: { date: Date }) {
		const match = openDays.find(od => od.date.getTime() === cell.date.getTime())
		if (!match) return
		pendingDay = match
		if (claimed) onSelectDay(match)
	}
</script>

<div class="cs__hero">
	<span class="cs__icon">{activity.icon}</span>
	<h2 class="cs__name">{activity.label}</h2>
	<p class="cs__tagline">{activity.tagline}</p>
</div>

<div class="cs__weekdays">{#each weekdays as w}<span>{w}</span>{/each}</div>
<div class="cs__grid" class:cs__grid--dimmed={!!pendingDay && !claimed}>
	{#each calDays as cell}
		<button type="button" class="cs__cell" class:cs__cell--other={!cell.inMonth} class:cs__cell--past={cell.isPast} class:cs__cell--today={cell.isToday} class:cs__cell--open={cell.isOpen} class:cs__cell--picked={pendingDay && cell.date.getTime() === pendingDay.date.getTime()} disabled={!cell.isOpen || cell.isPast} onclick={() => tapDay(cell)}>
			<span class="cs__num">{cell.date.getDate()}</span>
			{#if cell.isOpen && !cell.isPast}
				<span class="cs__dots"><span class="cs__dot"></span>{#if cell.bookingCount > 0}<span class="cs__dot cs__dot--grn"></span>{/if}</span>
			{/if}
		</button>
	{/each}
</div>

{#if !pendingDay && claimed}
	<p class="cs__hint">Tap a day with a dot to continue</p>
{/if}

{#if !claimed}
	<InlineClaim day={pendingDay?.date ?? null} {onClaim} />
{/if}

<style>
	.cs__hero { text-align: center; margin-bottom: 1rem; }
	.cs__icon { font-size: 1.8rem; display: block; margin-bottom: 0.2rem; }
	.cs__name { margin: 0; font-family: var(--font-display); font-size: 1.4rem; font-weight: 500; letter-spacing: -0.03em; }
	.cs__tagline { margin: 0.15rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 50%, transparent); }
	.cs__weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.2rem; }
	.cs__weekdays span { text-align: center; font-size: 0.58rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 40%, transparent); }
	.cs__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.22rem; transition: opacity 0.25s; }
	.cs__grid--dimmed { opacity: 0.5; }
	.cs__cell { position: relative; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, var(--panel-bg) 75%, transparent); font: inherit; cursor: pointer; padding: 0; transition: all 140ms; }
	.cs__cell:hover:not(:disabled) { border-color: color-mix(in srgb, var(--text) 18%, transparent); transform: translateY(-1px); }
	.cs__cell:disabled { cursor: default; }
	.cs__cell--other { opacity: 0.2; }
	.cs__cell--past { opacity: 0.3; }
	.cs__cell--today { border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.cs__cell--open { border-color: color-mix(in srgb, #a78bfa 28%, transparent); background: color-mix(in srgb, #a78bfa 5%, var(--panel-bg) 95%); }
	.cs__cell--picked { border-color: #a78bfa; background: color-mix(in srgb, #a78bfa 12%, var(--panel-bg) 88%); opacity: 1 !important; }
	.cs__num { position: absolute; top: 0.35rem; right: 0.4rem; font-size: 0.78rem; font-weight: 600; }
	.cs__dots { position: absolute; bottom: 0.32rem; left: 0.4rem; display: flex; gap: 0.16rem; }
	.cs__dot { width: 0.26rem; height: 0.26rem; border-radius: 999px; background: #a78bfa; }
	.cs__dot--grn { background: #4ade80; }
	.cs__hint { margin: 0.6rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 42%, transparent); text-align: center; }
</style>
