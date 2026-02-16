import { asJsonObject, readIntInRange, readOptionalString } from './parse.ts'

export type CalendarJoinEventInput = {
	guestCount: number
	note: string | null
}

export function parseCalendarJoinEventInput(input: unknown): CalendarJoinEventInput {
	const body = input == null ? {} : asJsonObject(input)
	return {
		guestCount: readIntInRange(body, 'guestCount', { min: 0, max: 8, defaultValue: 0 }),
		note: readOptionalString(body, 'note', { maxLength: 400 })
	}
}
