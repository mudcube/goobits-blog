<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte'
	import type { CalendarDay } from './types'

	let {
		days,
		weekdays,
		monthLabel = '',
		selectedDate = null,
		prevMonth,
		nextMonth,
		onSelect,
	}: {
		days: CalendarDay[]
		weekdays: string[]
		monthLabel?: string
		selectedDate?: Date | null
		prevMonth?: () => void
		nextMonth?: () => void
		onSelect?: (day: CalendarDay, element: HTMLButtonElement) => void
	} = $props()

	function isSelected(day: CalendarDay) {
		if (!selectedDate) return false
		return day.date.getFullYear() === selectedDate.getFullYear() &&
			day.date.getMonth() === selectedDate.getMonth() &&
			day.date.getDate() === selectedDate.getDate()
	}

	function handleClick(day: CalendarDay, event: MouseEvent) {
		if (!day.isActive || day.isPast) return
		onSelect?.(day, event.currentTarget as HTMLButtonElement)
	}
</script>

<div class="cg">
	<div class="cg__nav">
		<button type="button" class="cg__nav-btn" onclick={prevMonth} aria-label="Previous month"><ChevronLeft size={14} strokeWidth={2.2} /></button>
		<span class="cg__nav-label">{monthLabel}</span>
		<button type="button" class="cg__nav-btn" onclick={nextMonth} aria-label="Next month"><ChevronRight size={14} strokeWidth={2.2} /></button>
	</div>

	<div class="cg__weekdays">{#each weekdays as w}<span>{w}</span>{/each}</div>

	<div class="cg__grid">
		{#each days as day}
			<button
				type="button"
				class="cg__cell"
				class:cg__cell--other={!day.inMonth}
				class:cg__cell--past={day.isPast}
				class:cg__cell--today={day.isToday}
				class:cg__cell--active={day.isActive && !day.isPast}
				class:cg__cell--selected={isSelected(day)}
				disabled={!day.isActive || day.isPast}
				aria-label={day.ariaLabel ?? day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
				onclick={(e) => handleClick(day, e)}
			>
				<span class="cg__num">{day.date.getDate()}</span>
				{#if day.isActive && !day.isPast && (day.dotCount ?? 0) >= 0}
					<span class="cg__dots">
						<span class="cg__dot" style={day.dotColor ? `background:${day.dotColor}` : ''}></span>
						{#if (day.dotCount ?? 0) > 0}
							<span class="cg__dot cg__dot--secondary"></span>
						{/if}
					</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.cg__nav { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 0.5rem; }
	.cg__nav-btn { padding: 0.25rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.5rem; background: transparent; color: color-mix(in srgb, var(--text) 45%, transparent); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 150ms; font: inherit; }
	.cg__nav-btn:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.cg__nav-label { font-size: 0.78rem; font-weight: 600; color: var(--text); min-width: 8rem; text-align: center; }

	.cg__weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.2rem; }
	.cg__weekdays span { text-align: center; font-size: 0.58rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 40%, transparent); }

	.cg__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--cg-gap, 0.22rem); }

	.cg__cell { position: relative; aspect-ratio: 1; border: 1px solid transparent; border-radius: var(--cg-radius, 0.5rem); background: transparent; font: inherit; cursor: default; padding: 0; transition: all 140ms; color: color-mix(in srgb, var(--text) 35%, transparent); }
	.cg__cell--active { border-color: color-mix(in srgb, var(--cg-accent, var(--book-accent, #a78bfa)) 28%, transparent); background: color-mix(in srgb, var(--cg-accent, var(--book-accent, #a78bfa)) 5%, var(--panel-bg, var(--bg)) 95%); cursor: pointer; color: var(--text); }
	.cg__cell--active:hover:not(:disabled) { border-color: color-mix(in srgb, var(--cg-accent, var(--book-accent, #a78bfa)) 50%, transparent); transform: translateY(-1px); }
	.cg__cell--other { opacity: 0.15; }
	.cg__cell--past { opacity: 0.25; }
	.cg__cell--today { border-color: color-mix(in srgb, var(--text) 18%, transparent); }
	.cg__cell--selected { border-color: var(--cg-accent, var(--book-accent, #a78bfa)); background: color-mix(in srgb, var(--cg-accent, var(--book-accent, #a78bfa)) 12%, var(--panel-bg, var(--bg)) 88%); opacity: 1 !important; }

	.cg__num { position: absolute; top: 0.35rem; right: 0.4rem; font-size: var(--cg-num-size, 0.78rem); font-weight: 600; }
	.cg__dots { position: absolute; bottom: 0.32rem; left: 0.4rem; display: flex; gap: 0.16rem; }
	.cg__dot { width: 0.26rem; height: 0.26rem; border-radius: 999px; background: var(--cg-accent, var(--book-accent, #a78bfa)); }
	.cg__dot--secondary { background: var(--cg-dot-secondary, var(--book-dot-green, #4ade80)); }
</style>
