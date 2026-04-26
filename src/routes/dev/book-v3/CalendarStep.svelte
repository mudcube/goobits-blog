<script lang="ts">
	import type { OpenDay } from './types'
	import { ChevronLeft, ChevronRight } from '@lucide/svelte'
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
		monthLabel = '',
		prevMonth,
		nextMonth,
	}: {
		activity: { icon: string; label: string; tagline: string }
		calDays: Array<{ date: Date; inMonth: boolean; isToday: boolean; isOpen: boolean; isPast: boolean; bookingCount: number }>
		weekdays: string[]
		openDays: OpenDay[]
		claimed?: boolean
		pendingDay?: OpenDay | null
		onSelectDay: (day: OpenDay) => void
		onClaim: (name: string) => void
		monthLabel?: string
		prevMonth?: () => void
		nextMonth?: () => void
	} = $props()

	const hasOpenDays = $derived(calDays.some(c => c.isOpen && !c.isPast))
	const isEntireMonthPast = $derived(calDays.filter(c => c.inMonth).every(c => c.isPast))

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
</div>

<div class="cs__month-nav">
	<button type="button" class="cs__month-btn" onclick={prevMonth} aria-label="Previous month"><ChevronLeft size={14} strokeWidth={2.2} /></button>
	<span class="cs__month-label">{monthLabel}</span>
	<button type="button" class="cs__month-btn" onclick={nextMonth} aria-label="Next month"><ChevronRight size={14} strokeWidth={2.2} /></button>
</div>

<div class="cs__weekdays">{#each weekdays as w}<span>{w}</span>{/each}</div>
<div class="cs__grid" class:cs__grid--dimmed={!!pendingDay && !claimed}>
	{#each calDays as cell}
		<button type="button" class="cs__cell" class:cs__cell--other={!cell.inMonth} class:cs__cell--past={cell.isPast} class:cs__cell--today={cell.isToday} class:cs__cell--open={cell.isOpen} class:cs__cell--picked={pendingDay && cell.date.getTime() === pendingDay.date.getTime()} disabled={!cell.isOpen || cell.isPast} aria-label="{cell.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}{cell.isOpen && !cell.isPast ? ', available' : ''}" onclick={() => tapDay(cell)}>
			<span class="cs__num">{cell.date.getDate()}</span>
			{#if cell.isOpen && !cell.isPast}
				<span class="cs__dots"><span class="cs__dot"></span>{#if cell.bookingCount > 0}<span class="cs__dot cs__dot--grn"></span>{/if}</span>
			{/if}
		</button>
	{/each}
</div>

{#if hasOpenDays}
	<div class="cs__legend">
		<span class="cs__legend-item"><span class="cs__dot"></span> Available</span>
		{#if calDays.some(c => c.bookingCount > 0)}<span class="cs__legend-item"><span class="cs__dot cs__dot--grn"></span> Others going</span>{/if}
	</div>
{:else}
	<div class="cs__empty">
		{#if isEntireMonthPast}
			<p class="cs__empty-title">This month has passed</p>
			<p class="cs__empty-sub">Navigate forward to find upcoming open days.</p>
		{:else}
			<p class="cs__empty-title">No open days this month</p>
			<p class="cs__empty-sub">Try checking next month, or ask the organizer to open more days.</p>
		{/if}
	</div>
{/if}

{#if !claimed}
	<InlineClaim day={pendingDay?.date ?? null} {onClaim} />
{/if}

<style>
	.cs__hero { text-align: center; margin-bottom: 0.75rem; }
	.cs__icon { font-size: 1.5rem; display: block; margin-bottom: 0.1rem; }
	.cs__name { margin: 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.03em; }
	.cs__month-nav { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 0.5rem; }
	.cs__month-btn { padding: 0.25rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.5rem; background: transparent; color: color-mix(in srgb, var(--text) 45%, transparent); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 150ms; font: inherit; }
	.cs__month-btn:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.cs__month-label { font-size: 0.78rem; font-weight: 600; color: var(--text); min-width: 8rem; text-align: center; }
	.cs__weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.2rem; }
	.cs__weekdays span { text-align: center; font-size: 0.58rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 40%, transparent); }
	.cs__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.22rem; transition: opacity 0.25s; }
	.cs__grid--dimmed { opacity: 0.5; }
	.cs__cell { position: relative; aspect-ratio: 1; border: 1px solid transparent; border-radius: 0.5rem; background: transparent; font: inherit; cursor: default; padding: 0; transition: all 140ms; color: color-mix(in srgb, var(--text) 35%, transparent); }
	.cs__cell--open { border-color: color-mix(in srgb, var(--book-accent) 28%, transparent); background: color-mix(in srgb, var(--book-accent) 5%, var(--panel-bg) 95%); cursor: pointer; color: var(--text); }
	.cs__cell--open:hover:not(:disabled) { border-color: color-mix(in srgb, var(--book-accent) 50%, transparent); transform: translateY(-1px); }
	.cs__cell--other { opacity: 0.15; }
	.cs__cell--past { opacity: 0.25; }
	.cs__cell--today { border-color: color-mix(in srgb, var(--text) 18%, transparent); }
	.cs__cell--picked { border-color: var(--book-accent); background: color-mix(in srgb, var(--book-accent) 12%, var(--panel-bg) 88%); opacity: 1 !important; }
	.cs__num { position: absolute; top: 0.35rem; right: 0.4rem; font-size: 0.78rem; font-weight: 600; }
	.cs__dots { position: absolute; bottom: 0.32rem; left: 0.4rem; display: flex; gap: 0.16rem; }
	.cs__dot { width: 0.26rem; height: 0.26rem; border-radius: 999px; background: var(--book-accent); }
	.cs__dot--grn { background: var(--book-dot-green); }
	.cs__legend { display: flex; justify-content: center; gap: 1rem; margin-top: 0.5rem; }
	.cs__legend-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.58rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); }
	.cs__legend .cs__dot { position: static; }
	.cs__empty { text-align: center; padding: 0.75rem 0; }
	.cs__empty-title { margin: 0; font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.cs__empty-sub { margin: 0.2rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 38%, transparent); }
</style>
