import { isValidProgramSlug } from '../config/programs.ts'
import { asJsonObject, readIntInRange, readOptionalString, readRequiredString } from './parse.ts'
import { TransportValidationError } from './errors.ts'

export type CalendarJoinEventInput = {
	guestCount: number
	note: string | null
}

export type CalendarCreateEventInput = {
	activitySlug: string
	title: string
	startsAt: string
	endsAt: string
	capacity: number
	location: string | null
	note: string | null
	timezone: string | null
}

function readZonedDateTime(body: Record<string, unknown>, key: string) {
	const value = readRequiredString(body, key, {
		trim: true,
		maxLength: 64,
		message: 'Invalid event times'
	})
	if (!/(?:z|[+-]\d{2}:\d{2})$/i.test(value)) {
		throw new TransportValidationError('Invalid event times')
	}
	return value
}

function readOptionalTimezone(body: Record<string, unknown>, key: string): string | null {
	const raw = readOptionalString(body, key, { maxLength: 64 })
	if (!raw) return null
	if (!/^[A-Za-z]+\/[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)?$/.test(raw)) {
		throw new TransportValidationError('Invalid timezone')
	}
	return raw
}

export function parseCalendarCreateEventInput(input: unknown): CalendarCreateEventInput {
	const body = asJsonObject(input)
	const startsAt = readZonedDateTime(body, 'startsAt')
	const endsAt = readZonedDateTime(body, 'endsAt')
	const startsMs = Date.parse(startsAt)
	const endsMs = Date.parse(endsAt)
	if (!Number.isFinite(startsMs) || !Number.isFinite(endsMs) || endsMs <= startsMs) {
		throw new TransportValidationError('Invalid event times')
	}
	const activitySlug = readRequiredString(body, 'activitySlug', {
		trim: true,
		maxLength: 64
	})
	if (!isValidProgramSlug(activitySlug)) {
		throw new TransportValidationError('Invalid activitySlug')
	}
	return {
		activitySlug,
		title: readRequiredString(body, 'title', { trim: true, maxLength: 80 }),
		startsAt,
		endsAt,
		capacity: readIntInRange(body, 'capacity', {
			min: 1,
			max: 250,
			message: 'Invalid capacity'
		}),
		location: readOptionalString(body, 'location', { maxLength: 120 }),
		note: readOptionalString(body, 'note', { maxLength: 300 }),
		timezone: readOptionalTimezone(body, 'timezone')
	}
}

export function parseCalendarJoinEventInput(input: unknown): CalendarJoinEventInput {
	const body = input == null ? {} : asJsonObject(input)
	return {
		guestCount: readIntInRange(body, 'guestCount', {
			min: 0,
			max: 8,
			defaultValue: 0
		}),
		note: readOptionalString(body, 'note', { maxLength: 400 })
	}
}

export type CalendarProfileInput = {
	emergencyContact: string
	dietaryRestrictions: string
	chatHandle: string
}

export function parseCalendarProfileInput(input: unknown): CalendarProfileInput {
	const body = asJsonObject(input)
	return {
		emergencyContact: readOptionalString(body, 'emergencyContact', { maxLength: 120 }) ?? '',
		dietaryRestrictions: readOptionalString(body, 'dietaryRestrictions', { maxLength: 240 }) ?? '',
		chatHandle: readOptionalString(body, 'chatHandle', { maxLength: 80 }) ?? ''
	}
}

export type CalendarInviteCreateInput = {
	email: string | null
	uses: number
	expiresInDays: number | null
	label: string | null
	activitySlug: string | null
}

export function parseCalendarInviteCreateInput(input: unknown): CalendarInviteCreateInput {
	const body = asJsonObject(input)
	const uses = readIntInRange(body, 'uses', {
		min: 1,
		max: 100,
		defaultValue: 1
	})
	const expiresRaw = body['expiresInDays']
	let expiresInDays: number | null = null
	if (expiresRaw != null && String(expiresRaw).trim() !== '') {
		expiresInDays = readIntInRange(body, 'expiresInDays', {
			min: 1,
			max: 365,
			message: 'Invalid expiresInDays'
		})
	}
	const activitySlug = readOptionalString(body, 'activitySlug', { maxLength: 64 })
	if (activitySlug && !isValidProgramSlug(activitySlug)) {
		throw new TransportValidationError('Invalid activitySlug')
	}
	return {
		email: readOptionalString(body, 'email', { maxLength: 320 }),
		uses,
		expiresInDays,
		label: readOptionalString(body, 'label', { maxLength: 80 }),
		activitySlug
	}
}

export type CalendarSessionBootstrapInput = {
	email: string
	name: string
}

export function parseCalendarSessionBootstrapInput(input: unknown): CalendarSessionBootstrapInput {
	const body = input == null ? {} : asJsonObject(input)
	const email = (
		readOptionalString(body, 'email', { maxLength: 320 }) ?? `e2e-calendar-${Date.now()}@example.com`
	).toLowerCase()
	const name = readOptionalString(body, 'name', { maxLength: 120 }) ?? 'E2E Calendar User'
	return { email, name }
}

export type CalendarInviteClaimInput = {
	code: string
	name: string
	email: string | null
}

export function parseCalendarInviteClaimInput(input: unknown): CalendarInviteClaimInput {
	const body = input == null ? {} : asJsonObject(input)
	return {
		code: readRequiredString(body, 'code', { maxLength: 25 }),
		name: readRequiredString(body, 'name', { maxLength: 120 }),
		email: readOptionalString(body, 'email', { maxLength: 320 })?.toLowerCase() ?? null
	}
}

export type CalendarAvailabilityInput = {
	date: string
	activitySlug: string | null
}

export function parseCalendarAvailabilityInput(input: unknown): CalendarAvailabilityInput {
	const body = input == null ? {} : asJsonObject(input)
	const date = readRequiredString(body, 'date', { maxLength: 10 })
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TransportValidationError('Invalid date format, expected YYYY-MM-DD')
	return {
		date,
		activitySlug: readOptionalString(body, 'activitySlug', { maxLength: 60 })
	}
}

export type CalendarBookingLookupInput = {
	confirmationId: string
}

export function parseCalendarBookingLookupInput(input: unknown): CalendarBookingLookupInput {
	const body = asJsonObject(input)
	return {
		confirmationId: readRequiredString(body, 'confirmationId', {
			maxLength: 64
		})
	}
}

export function parseDiscordWebhookTextInput(input: unknown) {
	const body = asJsonObject(input)
	const text = readOptionalString(body, 'text', { maxLength: 1500 }) ?? ''
	if (!text) throw new TransportValidationError('Missing text')
	return { text }
}
