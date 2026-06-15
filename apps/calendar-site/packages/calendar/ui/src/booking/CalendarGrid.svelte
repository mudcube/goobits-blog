<script lang="ts">
	import { ChevronLeft, ChevronRight, Star } from '@lucide/svelte'
	import { onMount } from 'svelte'
	import type { CalendarDay } from './types'

	let {
		days,
		weekdays,
		monthLabel = '',
		selectedDate = null,
		prevMonth,
		nextMonth,
		onSelect,
		variant = 'compact',
		testId = 'calendar-grid',
		onKeydown,
		interactive = 'active-only'
	}: {
		days: CalendarDay[]
		weekdays: string[]
		monthLabel?: string
		selectedDate?: Date | null
		prevMonth?: (() => void) | undefined
		nextMonth?: (() => void) | undefined
		onSelect?: (day: CalendarDay, element: HTMLButtonElement) => void
		variant?: 'compact' | 'member'
		testId?: string
		onKeydown?: (event: KeyboardEvent) => void
		interactive?: 'active-only' | 'all-future'
	} = $props()
	let isHydrated = $state(false)

	onMount(() => {
		isHydrated = true
	})

	function isSelected(day: CalendarDay) {
		if (!selectedDate) return false
		return day.date.getFullYear() === selectedDate.getFullYear() &&
			day.date.getMonth() === selectedDate.getMonth() &&
			day.date.getDate() === selectedDate.getDate()
	}

	function handleClick(day: CalendarDay, event: MouseEvent) {
		if (day.isPast) return
		if (interactive === 'active-only' && !day.isActive) return
		onSelect?.(day, event.currentTarget as HTMLButtonElement)
	}

	function rootClass() {
		return `cg ${variant === 'member' ? 'cg--member member-calendar' : ''}`.trim()
	}

	function navClass() {
		return `cg__nav ${variant === 'member' ? 'member-calendar__month-banner' : ''}`.trim()
	}

	function navButtonClass() {
		return `cg__nav-btn ${variant === 'member' ? 'member-calendar__month-button' : ''}`.trim()
	}

	function navLabelClass() {
		return `cg__nav-label ${variant === 'member' ? 'member-calendar__month-banner-title' : ''}`.trim()
	}

	function viewportClass() {
		return `cg__viewport ${variant === 'member' ? 'member-calendar__viewport' : ''}`.trim()
	}

	function gridClass() {
		return `cg__grid ${variant === 'member' ? 'member-calendar__grid' : ''}`.trim()
	}

	function cellClass(day: CalendarDay) {
		const classes = ['cg__cell']
		if (variant === 'member') classes.push('member-calendar__day')
		if (!day.inMonth) classes.push('cg__cell--other', 'member-calendar__day--adjacent')
		if (day.isPast) classes.push('cg__cell--past', 'member-calendar__day--past')
		if (day.isToday) classes.push('cg__cell--today', 'member-calendar__day--today')
		const treatAsClickable = !day.isPast && (day.isActive || interactive === 'all-future')
		if (treatAsClickable) classes.push('cg__cell--active', 'member-calendar__day--available')
		if (isSelected(day)) classes.push('cg__cell--selected', 'member-calendar__day--selected')
		return classes.join(' ')
	}
</script>

<div class={rootClass()} data-testid={testId} data-calendar-ready={isHydrated ? 'true' : 'false'}>
	<div class={navClass()} data-current-month-key={monthLabel}>
		<button type="button" class={navButtonClass()} onclick={prevMonth} aria-label="Previous month"><ChevronLeft size={variant === 'member' ? 18 : 14} strokeWidth={2.2} /></button>
		<span class={navLabelClass()}>{monthLabel}</span>
		<button type="button" class={navButtonClass()} onclick={nextMonth} aria-label="Next month"><ChevronRight size={variant === 'member' ? 18 : 14} strokeWidth={2.2} /></button>
	</div>

	<div class={`cg__weekdays ${variant === 'member' ? 'member-calendar__weekday-row' : ''}`.trim()}>{#each weekdays as w}<span>{w}</span>{/each}</div>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		class={viewportClass()}
		aria-label="Calendar month view"
		tabindex={variant === 'member' ? 0 : undefined}
		onkeydown={onKeydown}
	>
		<div class={gridClass()}>
			{#each days as day}
				<button
					type="button"
					class={cellClass(day)}
					disabled={day.isPast || (interactive === 'active-only' && !day.isActive)}
					aria-label={day.ariaLabel ?? day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
					onclick={(e) => handleClick(day, e)}
				>
					{#if day.isToday}
						<span class="cg__today-star" aria-hidden="true">
							<Star size={variant === 'member' ? 12 : 10} strokeWidth={2.2} fill="currentColor" />
						</span>
					{/if}
					<span class={`cg__num ${variant === 'member' ? 'member-calendar__day-num' : ''}`.trim()}>{day.date.getDate()}</span>
					{#if day.capacity}
						{@const cap = day.capacity}
						{@const isFull = cap.filled >= cap.capacity}
						<span
							class="cg__chip"
							class:cg__chip--full={isFull}
							class:cg__chip--once={cap.recurring === false}
						>
							<span class="cg__chip-bar" aria-hidden="true">
								<span
									class="cg__chip-fill"
									style="width: {Math.min(100, (cap.filled / Math.max(cap.capacity, 1)) * 100)}%"
								></span>
							</span>
							<span class="cg__chip-text">
								{#if isFull}Full{:else}{cap.filled}/{cap.capacity}{/if}
							</span>
						</span>
					{:else if day.isActive && !day.isPast && (day.dotCount ?? 0) > 0}
						{@const visibleDots = Math.min(day.dotCount ?? 0, 3)}
						{@const perDotColors = day.dotColors ?? []}
						<span
							class={`cg__dots ${variant === 'member' ? 'member-calendar__event-dots' : ''}`.trim()}
							style={day.dotColor ? `--member-calendar-dot-override:${day.dotColor};` : ''}
							aria-label={`${day.dotCount} event${day.dotCount === 1 ? '' : 's'}`}
						>
							{#each Array.from({ length: visibleDots }) as _, i (i)}
								{@const dotColor = perDotColors[i] || perDotColors[perDotColors.length - 1] || day.dotColor || ''}
								<span
									class={`cg__dot ${dotColor ? '' : i > 0 ? 'cg__dot--secondary' : ''} ${variant === 'member' ? 'member-calendar__event-dot' : ''}`.trim()}
									style={dotColor ? `background:${dotColor}` : ''}
								></span>
							{/each}
						</span>
					{/if}
				</button>
			{/each}
		</div>
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
	.cg__today-star {
		position: absolute;
		top: 0.35rem;
		left: 0.4rem;
		display: inline-flex;
		color: color-mix(in srgb, var(--text) 18%, transparent);
		pointer-events: none;
	}
	.cg__cell--selected { border-color: var(--cg-accent, var(--book-accent, #a78bfa)); background: color-mix(in srgb, var(--cg-accent, var(--book-accent, #a78bfa)) 32%, var(--panel-bg, var(--bg)) 68%); box-shadow: inset 0 0 0 2px var(--cg-accent, var(--book-accent, #a78bfa)), 0 4px 14px color-mix(in srgb, var(--cg-accent, var(--book-accent, #a78bfa)) 30%, transparent); color: var(--text); opacity: 1 !important; }

	.cg__num { position: absolute; top: 0.35rem; right: 0.4rem; font-size: var(--cg-num-size, 0.78rem); font-weight: 600; }
	.cg__dots { position: absolute; bottom: 0.32rem; left: 0.4rem; display: flex; gap: 0.16rem; }
	.cg__dot { width: 0.26rem; height: 0.26rem; border-radius: 999px; background: var(--cg-accent, var(--book-accent, #a78bfa)); }
	.cg__dot--secondary { background: var(--cg-dot-secondary, var(--book-dot-green, #4ade80)); }

	/* Capacity chip — replaces dots when day.capacity is provided. Shows
	 * a thin progress bar + filled/total text (or "Full" when at capacity). */
	.cg__chip {
		position: absolute;
		bottom: 0.32rem;
		left: 0.4rem;
		right: 0.4rem;
		display: grid;
		gap: 0.18rem;
		font-size: 0.6rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		text-align: center;
		color: color-mix(in srgb, var(--cg-accent, var(--book-accent, #a78bfa)) 92%, var(--text) 8%);
	}

	.cg__chip--once {
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.cg__chip--full {
		color: color-mix(in srgb, var(--admin-warn-strong, #c27800) 90%, var(--text) 10%);
	}

	.cg__chip-bar {
		height: 3px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--cg-accent, var(--book-accent, #a78bfa)) 16%, transparent);
		overflow: hidden;
	}

	.cg__chip--once .cg__chip-bar {
		background: color-mix(in srgb, var(--text) 10%, transparent);
	}

	.cg__chip--full .cg__chip-bar {
		background: color-mix(in srgb, var(--admin-warn, #ff9500) 18%, transparent);
	}

	.cg__chip-fill {
		display: block;
		height: 100%;
		background: var(--cg-accent, var(--book-accent, #a78bfa));
		border-radius: 999px;
		transition: width 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.cg__chip--once .cg__chip-fill {
		background: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.cg__chip--full .cg__chip-fill {
		background: var(--admin-warn, #ff9500);
	}

	.cg__chip-text {
		letter-spacing: 0.01em;
		line-height: 1;
	}

	/* On tiny cells (mobile), hide the chip text and let the progress bar do
	 * the talking — the digits become illegible below ~50px cell width. */
	@container (max-width: 320px) {
		.cg__chip-text { display: none; }
		.cg__chip { gap: 0; }
	}

	@media (max-width: 480px) {
		.cg__chip-text { display: none; }
		.cg__chip { gap: 0; }
	}

	@media (prefers-reduced-motion: reduce) {
		.cg__chip-fill { transition: none; }
	}

	.cg--member {
		--member-calendar-dot: color-mix(in srgb, var(--link) 72%, var(--text) 28%);
		--cg-accent: var(--member-calendar-dot);
		--cg-gap: 0.35rem;
		--cg-radius: 0.78rem;
		--cg-num-size: 0.95rem;
		display: grid;
		gap: 0.65rem;
		width: 100%;
	}

	.cg--member .cg__nav {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
	}

	.cg--member .cg__nav-label {
		min-width: 0;
		font-size: clamp(1rem, 2.4vw, 1.25rem);
		font-weight: 650;
		line-height: 1.1;
	}

	.cg--member .cg__nav-btn {
		width: 2.35rem;
		height: 2.35rem;
		border-radius: 999px;
		background: transparent;
		color: var(--text);
	}

	.cg--member .cg__weekdays {
		gap: 0.35rem;
		margin: 0;
		padding: 0 0.15rem;
		color: color-mix(in srgb, var(--text) 42%, transparent);
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.04em;
	}

	.cg--member .cg__viewport {
		touch-action: pan-y;
		outline: none;
	}

	.cg--member .cg__viewport:focus-visible {
		border-radius: 1.2rem;
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--member-calendar-dot) 28%, transparent);
	}

	.cg--member .cg__grid {
		gap: 0.35rem;
	}

	.cg--member .cg__cell {
		color: color-mix(in srgb, var(--text) 35%, transparent);
	}

	.cg--member .cg__cell:hover:not(:disabled) {
		border-color: color-mix(in srgb, var(--member-calendar-dot) 50%, transparent);
	}

	.cg--member .cg__cell--other {
		opacity: 0.15;
	}

	.cg--member .cg__cell--past {
		cursor: default;
		opacity: 0.25;
	}

	.cg--member .cg__cell--today {
		border-color: color-mix(in srgb, var(--text) 24%, transparent);
	}

	.cg--member .cg__today-star {
		top: 0.66rem;
		left: 0.66rem;
		color: color-mix(in srgb, var(--text) 24%, transparent);
	}

	.cg--member .cg__cell--active {
		color: var(--text);
	}

	.cg--member .cg__cell--selected {
		opacity: 1 !important;
	}

	.cg--member .cg__num {
		top: 0.72rem;
		right: 0.72rem;
		font-size: 0.95rem;
		line-height: 1;
	}

	.cg--member .cg__dots {
		left: 0.72rem;
		bottom: 0.66rem;
		gap: 0.22rem;
	}

	.cg--member .cg__dot {
		width: 0.38rem;
		height: 0.38rem;
		background: var(--member-calendar-dot-override, var(--member-calendar-dot));
	}

	@media (max-width: 720px) {
		.cg--member .cg__nav {
			padding: 0;
		}

		.cg--member .cg__nav-btn {
			width: 2.15rem;
			height: 2.15rem;
		}

		.cg--member .cg__weekdays,
		.cg--member .cg__grid {
			gap: 0.28rem;
		}

		.cg--member .cg__cell {
			--cg-radius: 0.72rem;
		}

		.cg--member .cg__num {
			top: 0.56rem;
			right: 0.56rem;
			font-size: 0.86rem;
		}

		.cg--member .cg__dots {
			left: 0.56rem;
			bottom: 0.56rem;
		}
	}
</style>
