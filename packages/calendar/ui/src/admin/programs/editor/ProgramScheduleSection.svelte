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
