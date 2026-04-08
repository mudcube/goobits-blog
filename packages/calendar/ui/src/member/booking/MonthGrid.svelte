<script lang="ts">
	import { dotColorForTone, isoDay, type CalendarTone, type MonthItem } from './month-stack'

	const {
		month,
		selectedDateIso = null,
		onSelect,
		isPast,
		isToday,
		isActive,
		eventCount = () => 0,
		eventTone = () => '',
		dayAriaLabel
	} = $props<{
		month: MonthItem
		selectedDateIso?: string | null
		onSelect: (date: Date, element: HTMLButtonElement) => void
		isPast: (date: Date) => boolean
		isToday: (date: Date) => boolean
		isActive: (date: Date) => boolean
		eventCount?: (date: Date) => number
		eventTone?: (date: Date) => CalendarTone
		dayAriaLabel: (date: Date) => string
	}>()
</script>

<section class="member-calendar__month" data-month-key={month.key}>
	<div class="member-calendar__grid">
		{#each month.cells as cell}
			{@const isDayPast = isPast(cell.date)}
			{@const isDayToday = isToday(cell.date)}
			{@const isDayActive = isActive(cell.date)}
			{@const dayEventCount = Math.max(0, eventCount(cell.date) || 0)}
			{@const dayTone = eventTone(cell.date)}
			<button
				type="button"
				class="member-calendar__day"
				class:member-calendar__day--adjacent={!cell.currentMonth}
				class:member-calendar__day--past={isDayPast}
				class:member-calendar__day--today={isDayToday}
				class:member-calendar__day--available={isDayActive}
				class:member-calendar__day--selected={selectedDateIso === isoDay(cell.date)}
				disabled={isDayPast}
				aria-label={dayAriaLabel(cell.date)}
				onclick={(event) => onSelect(cell.date, event.currentTarget as HTMLButtonElement)}
			>
				<span class="member-calendar__day-num">{cell.date.getDate()}</span>
				{#if dayEventCount > 0}
					<span
						class="member-calendar__event-dots"
						style={`--member-calendar-dot-override: ${dotColorForTone(dayTone) || 'var(--member-calendar-dot)'}`}
						aria-hidden="true"
					>
						<span class="member-calendar__event-dot"></span>
						{#if dayEventCount > 1}
							<span class="member-calendar__event-dot"></span>
						{/if}
					</span>
				{/if}
			</button>
		{/each}
	</div>
</section>

<style lang="scss">
	.member-calendar__month {
		display: grid;
		padding: 0.1rem 0 0;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.member-calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.35rem;
	}

	.member-calendar__day {
		position: relative;
		aspect-ratio: 1;
		border: 1px solid var(--member-calendar-border);
		border-radius: 1rem;
		background: var(--member-calendar-panel);
		cursor: pointer;
		padding: 0;
		transition:
			transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1),
			background 140ms ease,
			border-color 140ms ease,
			box-shadow 140ms ease;
	}

	.member-calendar__day:hover:not(:disabled) {
		background: var(--member-calendar-day-hover);
		border-color: color-mix(in srgb, var(--text) 18%, transparent);
		transform: translateY(-1px);
	}

	.member-calendar__day--adjacent {
		opacity: 0.42;
	}

	.member-calendar__day--past {
		cursor: default;
		opacity: 0.5;
	}

	.member-calendar__day--today {
		border-color: color-mix(in srgb, var(--text) 24%, transparent);
	}

	.member-calendar__day--available {
		border-color: color-mix(in srgb, var(--member-calendar-dot) 38%, var(--text) 10%);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--member-calendar-panel) 92%, white 8%) 0%,
				color-mix(in srgb, var(--member-calendar-panel) 100%, transparent) 100%
			);
		box-shadow: 0 10px 24px color-mix(in srgb, var(--member-calendar-dot) 10%, transparent);
	}

	.member-calendar__day--selected {
		background: var(--member-calendar-selected-bg);
		border-color: var(--member-calendar-selected-border);
		box-shadow: 0 0 0 2px var(--member-calendar-selected-ring);
		opacity: 1;
	}

	.member-calendar__day-num {
		position: absolute;
		top: 0.72rem;
		right: 0.72rem;
		font-size: 0.95rem;
		font-weight: 600;
		line-height: 1;
	}

	.member-calendar__event-dots {
		position: absolute;
		left: 0.72rem;
		bottom: 0.66rem;
		display: inline-flex;
		align-items: center;
		gap: 0.22rem;
	}

	.member-calendar__event-dot {
		width: 0.38rem;
		height: 0.38rem;
		border-radius: 999px;
		background: var(--member-calendar-dot-override, var(--member-calendar-dot));
	}

	@media (max-width: 720px) {
		.member-calendar__grid {
			gap: 0.28rem;
		}

		.member-calendar__day {
			border-radius: 0.82rem;
		}

		.member-calendar__day-num {
			top: 0.56rem;
			right: 0.56rem;
			font-size: 0.86rem;
		}

		.member-calendar__event-dots {
			left: 0.56rem;
			bottom: 0.56rem;
		}
	}
</style>
