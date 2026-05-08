<script lang="ts">
	import AdminCalendar from '../../dashboard/AdminCalendar.svelte'
	import DayDialog from './DayDialog.svelte'
	import {
		isoDay,
		isPast,
		isToday,
		type DayScheduleController
	} from './day-schedule-controller.svelte'

	type EventRecord = {
		id: number
		activitySlug: string
		startsAt: string
		capacity: number
		seatsTaken?: number
	}

	const {
		dayController,
		slug,
		eventsSource
	}: {
		dayController: DayScheduleController
		slug: string
		eventsSource: readonly EventRecord[]
	} = $props()
</script>

<div class="program-schedule-section__head">
	<h4 class="program-schedule-section__title">Events</h4>
	<button
		type="button"
		class="program-schedule-section__new-event"
		onclick={() => {
			const target = new Date()
			target.setHours(0, 0, 0, 0)
			if (isPast(target)) target.setDate(target.getDate() + 1)
			dayController.openDay(target)
		}}
	>
		+ New event
	</button>
</div>

<AdminCalendar
	currentMonth={dayController.currentMonth}
	selectedDateIso={dayController.selectedDayDate ? isoDay(dayController.selectedDayDate) : null}
	onPrev={dayController.prevMonth}
	onNext={dayController.nextMonth}
	onSelect={(date) => dayController.openDay(date)}
	{isPast}
	{isToday}
	isActive={(date) => !!dayController.activeDays[isoDay(date)]}
	eventCount={(date) => dayController.activeDays[isoDay(date)]?.count || 0}
	eventTone={() => slug}
	eventCapacity={(date) => {
		const ev = eventsSource.find((e) => {
			if (e.activitySlug !== slug) return false
			const d = new Date(e.startsAt)
			return (
				d.getFullYear() === date.getFullYear() &&
				d.getMonth() === date.getMonth() &&
				d.getDate() === date.getDate()
			)
		})
		if (!ev) return null
		return { filled: ev.seatsTaken ?? 0, capacity: ev.capacity, recurring: true }
	}}
	compact={true}
	interactive="all-future"
/>

{#if dayController.popOpen}
	<button
		type="button"
		class="program-schedule-section__scrim"
		aria-label="Close day editor"
		onclick={dayController.closePop}
	></button>
	{@const selectedDayActive = dayController.selectedDayDate
		? dayController.activeDays[isoDay(dayController.selectedDayDate)] ?? null
		: null}
	{@const selectedEvent = dayController.selectedEventId
		? (eventsSource.find((e) => e.id === dayController.selectedEventId) as
				| { seatsTaken?: number; capacity?: number }
				| undefined)
		: undefined}
	<DayDialog
		draft={dayController.popDraft}
		selectedDate={dayController.selectedDayDate}
		selectedLabel={dayController.selectedDayDate
			? dayController.selectedDayDate.toLocaleDateString(undefined, {
					weekday: 'short',
					month: 'short',
					day: 'numeric'
				})
			: ''}
		hasEventOnSelected={!!dayController.selectedEventId || !!selectedDayActive}
		filledOnSelected={selectedEvent?.seatsTaken ?? 0}
		capacityOnSelected={selectedEvent?.capacity ?? selectedDayActive?.capacity ?? 0}
		pendingDay={dayController.pendingDayDate != null}
		onDismiss={dayController.closePop}
		onSave={() => {
			if (dayController.selectedEventId) {
				void dayController.persistExistingDayEdits()
			} else {
				void dayController.persistDaySchedule()
			}
		}}
		onRemove={() => void dayController.removeDay()}
		onCancelDiscard={dayController.cancelDiscard}
		onConfirmDiscard={dayController.confirmDiscard}
	/>
{/if}

<style>
	.program-schedule-section__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		margin: 1.4rem 0 0.4rem;
		padding: 0 0.1rem;
	}

	.program-schedule-section__title {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}

	.program-schedule-section__new-event {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--admin-accent) 38%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
		color: color-mix(in srgb, var(--admin-accent) 78%, var(--text) 22%);
		border-radius: var(--admin-control-radius, 0.625rem);
		padding: 0.36rem 0.85rem;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 650;
		cursor: pointer;
		transition: background 140ms, box-shadow 140ms;
	}

	.program-schedule-section__new-event:hover {
		background: color-mix(in srgb, var(--admin-accent) 22%, var(--bg) 78%);
		box-shadow: 0 2px 10px color-mix(in srgb, var(--admin-accent) 22%, transparent);
	}

	.program-schedule-section__scrim {
		position: fixed;
		inset: 0;
		border: none;
		padding: 0;
		/* Dark scrim — dims toward black in both themes, not toward --text
		 * (which is light in dark mode and looks washed out). */
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		z-index: 40;
		cursor: pointer;
	}
</style>
