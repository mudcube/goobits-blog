/**
 * Shared types for the program-editor day-dialog system.
 *
 * Migration target: when these components move to
 * `packages/calendar/ui/src/admin/programs/editor/day-dialog/`, this file
 * goes with them. Nothing here is playground-specific.
 */

export type DayDraft = {
	/** 24-hour HH:MM string for the time input (e.g. "19:00"). */
	time: string
	/** Capacity (1-50). */
	capacity: number
	/** Whether this event repeats weekly. */
	repeat: boolean
	/** When repeat is on: 'ongoing' = no end, 'date' = stop after untilDate. */
	untilMode: 'ongoing' | 'date'
	/** ISO date string for the until-date input (only used when untilMode='date'). */
	untilDate: string
}

export function blankDraft(time = '19:00', capacity = 12): DayDraft {
	return {
		time,
		capacity,
		repeat: false,
		untilMode: 'ongoing',
		untilDate: ''
	}
}

export function draftsEqual(a: DayDraft, b: DayDraft): boolean {
	return (
		a.time === b.time &&
		a.capacity === b.capacity &&
		a.repeat === b.repeat &&
		a.untilMode === b.untilMode &&
		a.untilDate === b.untilDate
	)
}
