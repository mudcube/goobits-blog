<script lang="ts">
	type CalendarEvent = {
		time: string
		capacity: number
		filled: number
		recurring: boolean
	}

	let {
		monthLabel,
		cells,
		events,
		selectedDay = null,
		pulseDay = null,
		onSelectDay,
		onPrevMonth = () => {},
		onNextMonth = () => {},
		dayAriaLabel
	} = $props<{
		monthLabel: string
		cells: Array<{ day: number | null; weekday: number }>
		events: Record<number, CalendarEvent>
		selectedDay?: number | null
		pulseDay?: number | null
		onSelectDay: (day: number) => void
		onPrevMonth?: () => void
		onNextMonth?: () => void
		dayAriaLabel: (day: number, ev: CalendarEvent | undefined) => string
	}>()

	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
</script>

<section class="calendar-card">
	<header class="calendar-card__head">
		<div class="calendar-card__title">Schedule · {monthLabel}</div>
		<div class="calendar-card__nav">
			<button type="button" class="calendar-card__nav-btn" aria-label="Previous month" onclick={onPrevMonth}>‹</button>
			<button type="button" class="calendar-card__nav-btn" aria-label="Next month" onclick={onNextMonth}>›</button>
		</div>
	</header>

	<div class="calendar">
		<div class="calendar__weekdays" aria-hidden="true">
			{#each weekdays as day}
				<span>{day}</span>
			{/each}
		</div>

		<div class="calendar__grid">
			{#each cells as cell, idx (idx)}
				{#if cell.day == null}
					<div class="calendar__cell calendar__cell--empty" aria-hidden="true"></div>
				{:else}
					{@const ev = events[cell.day]}
					{@const isSelected = selectedDay === cell.day}
					{@const isPulsing = pulseDay === cell.day}
					{@const isFull = ev != null && ev.filled >= ev.capacity}
					<button
						type="button"
						class="calendar__cell"
						class:calendar__cell--has-event={!!ev}
						class:calendar__cell--full={isFull}
						class:calendar__cell--selected={isSelected}
						class:calendar__cell--pulse={isPulsing}
						aria-label={dayAriaLabel(cell.day, ev)}
						onclick={() => onSelectDay(cell.day!)}
					>
						<span class="calendar__date">{cell.day}</span>
						{#if ev}
							<span
								class="calendar__chip"
								class:calendar__chip--once={!ev.recurring}
								class:calendar__chip--full={isFull}
							>
								<span class="calendar__chip-bar" aria-hidden="true">
									<span
										class="calendar__chip-fill"
										style="width: {Math.min(100, (ev.filled / ev.capacity) * 100)}%"
									></span>
								</span>
								<span class="calendar__chip-text">
									{#if isFull}Full{:else}{ev.filled}/{ev.capacity}{/if}
								</span>
							</span>
						{:else}
							<span class="calendar__chip-placeholder" aria-hidden="true">+</span>
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	</div>
</section>

<style>
	.calendar-card {
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 1rem;
		overflow: hidden;
	}

	.calendar-card__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.calendar-card__title {
		font-size: 0.85rem;
		font-weight: 650;
	}

	.calendar-card__nav { display: flex; gap: 0.25rem; }

	.calendar-card__nav-btn {
		appearance: none;
		border: 1px solid var(--admin-calendar-arrow-border, color-mix(in srgb, var(--text) 22%, transparent));
		background: var(--admin-calendar-arrow-bg, transparent);
		color: var(--admin-calendar-arrow-fg, var(--admin-text-soft));
		width: 28px;
		height: 28px;
		border-radius: 999px;
		font: inherit;
		font-size: 0.95rem;
		cursor: pointer;
		display: grid;
		place-items: center;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.calendar-card__nav-btn:hover {
		background: var(--admin-calendar-arrow-hover-bg, color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%));
		color: var(--admin-calendar-arrow-hover-fg, var(--admin-accent));
		border-color: color-mix(in srgb, var(--admin-accent) 36%, transparent);
	}

	.calendar { padding: 0.5rem; position: relative; }

	.calendar__weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.25rem;
		padding: 0.4rem 0.4rem 0.55rem;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--admin-text-muted);
	}

	.calendar__weekdays span { text-align: center; }

	.calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.3rem;
	}

	.calendar__cell {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
		background: color-mix(in srgb, var(--text) 2%, transparent);
		border-radius: 0.65rem;
		min-height: 4rem;
		padding: 0.45rem 0.5rem 0.4rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.35rem;
		font: inherit;
		color: var(--text);
		cursor: pointer;
		transition: background 120ms, border-color 120ms, transform 120ms;
		position: relative;
	}

	.calendar__cell:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		border-color: color-mix(in srgb, var(--text) 18%, transparent);
	}

	.calendar__cell--empty {
		background: transparent;
		border: 1px dashed color-mix(in srgb, var(--text) 6%, transparent);
		cursor: default;
	}

	.calendar__cell--has-event {
		background: color-mix(in srgb, var(--admin-accent) 6%, var(--bg));
		border-color: color-mix(in srgb, var(--admin-accent) 26%, transparent);
	}

	.calendar__cell--full {
		background: color-mix(in srgb, var(--admin-warn) 8%, var(--bg));
		border-color: color-mix(in srgb, var(--admin-warn) 30%, transparent);
	}

	.calendar__cell--selected {
		outline: 2px solid color-mix(in srgb, var(--admin-accent) 80%, transparent);
		outline-offset: -1px;
	}

	.calendar__cell--pulse {
		animation: cell-pulse 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	@keyframes cell-pulse {
		0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--admin-accent) 50%, transparent); }
		60% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--admin-accent) 0%, transparent); }
		100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--admin-accent) 0%, transparent); }
	}

	.calendar__date {
		font-size: 0.72rem;
		font-weight: 650;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}

	.calendar__cell--has-event .calendar__date { color: var(--text); }

	.calendar__chip {
		display: grid;
		gap: 0.2rem;
		font-size: 0.66rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--admin-accent) 92%, var(--text) 8%);
	}

	.calendar__chip--once { color: var(--admin-text-soft); }

	.calendar__chip--full {
		color: color-mix(in srgb, var(--admin-warn-strong) 88%, var(--text) 12%);
	}

	.calendar__chip-bar {
		height: 3px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--admin-accent) 16%, transparent);
		overflow: hidden;
	}

	.calendar__chip--once .calendar__chip-bar {
		background: color-mix(in srgb, var(--text) 10%, transparent);
	}

	.calendar__chip--full .calendar__chip-bar {
		background: color-mix(in srgb, var(--admin-warn) 18%, transparent);
	}

	.calendar__chip-fill {
		display: block;
		height: 100%;
		background: var(--admin-accent);
		border-radius: 999px;
		transition: width 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.calendar__chip--once .calendar__chip-fill {
		background: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.calendar__chip--full .calendar__chip-fill {
		background: var(--admin-warn);
	}

	.calendar__chip-text {
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.01em;
	}

	.calendar__chip-placeholder {
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--text) 28%, transparent);
		opacity: 0;
		transition: opacity 120ms;
		align-self: center;
	}

	.calendar__cell:hover .calendar__chip-placeholder { opacity: 1; }

	@media (max-width: 720px) {
		.calendar__cell { min-height: 4rem; }
	}

	@media (prefers-reduced-motion: reduce) {
		.calendar__cell--pulse { animation: none; }
		.calendar__chip-fill { transition: none; }
	}
</style>
