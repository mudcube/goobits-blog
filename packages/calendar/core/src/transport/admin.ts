import { isValidProgramSlug } from '../social/programs.ts'
import { TransportValidationError } from './errors.ts'
import { asJsonObject, readBoolean, readEnum, readIntInRange, readOptionalString, readRequiredString } from './parse.ts'

export type AdminRulesInput = {
	hoursFrom: string
	hoursTo: string
	buffer: number
	notice: number
	capacity: number
}

export type AdminProgramUpsertInput = {
	slug: string
	label: string
	activityName: string
	pageTitle: string
	eyebrow: string
	heroTitleLine1: string
	heroTitleLine2: string | null
	heroSubtitle: string
	description: string
	icon: string
	eyebrowClass: string | null
	glowClass: string | null
	formGlowClass: string | null
	serviceStatusNote: string | null
	enabled: boolean
	sortOrder: number
}

export type AdminProgramMutationInput =
	| { action: 'delete'; slug: string }
	| { action: 'toggle'; slug: string; enabled: boolean }
	| { action: 'upsert'; program: AdminProgramUpsertInput }

export type AdminCreateEventsBatchInput = {
	activitySlug: string
	title: string
	startsAt: string
	endsAt: string
	capacity: number
	repeatWeeks: number
	costCents: number
	currency: string
	paymentProvider: string | null
	paymentHandle: string | null
	paymentNoteTemplate: string | null
	location: string | null
	note: string | null
}

export type AdminEventUpdateInput =
	| { action: 'capacity'; capacity: number }
	| { action: 'attendance'; userId: string; attendanceStatus: 'unknown' | 'attended' | 'flaked' }
	| { action: 'memory'; recapText: string | null; heroImageUrl: string | null }

export type AdminSyncQueueActionInput = {
	action: 'process' | 'retry_dead_letters' | 'purge_dead_letters'
	limit: number
}

export type AdminUserProgramAccessInput = {
	access: Array<{ programSlug: string; allowed: boolean }>
}

export type AdminPaymentDefaultsInput = {
	provider: string | null
	handle: string | null
}

export function parseAdminRulesInput(input: unknown): AdminRulesInput {
	const body = asJsonObject(input)
	const hoursFrom = readRequiredString(body, 'hoursFrom', { trim: true, maxLength: 5 })
	const hoursTo = readRequiredString(body, 'hoursTo', { trim: true, maxLength: 5 })
	const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
	if (!timePattern.test(hoursFrom) || !timePattern.test(hoursTo)) {
		throw new TransportValidationError('Invalid hours format')
	}

	return {
		hoursFrom,
		hoursTo,
		buffer: readIntInRange(body, 'buffer', { min: 0, max: 180, message: 'Invalid buffer' }),
		notice: readIntInRange(body, 'notice', { min: 0, max: 720, message: 'Invalid notice' }),
		capacity: readIntInRange(body, 'capacity', { min: 1, max: 50, message: 'Invalid capacity' })
	}
}

export function parseAdminProgramMutationInput(input: unknown): AdminProgramMutationInput {
	const body = asJsonObject(input)
	const action = readEnum(body, 'action', ['delete', 'toggle', 'upsert'] as const, 'Unknown action')
	const slug = readRequiredString(body, 'slug', { trim: true, maxLength: 64, message: 'Invalid program slug' })
	if (!isValidProgramSlug(slug)) throw new TransportValidationError('Invalid program slug')

	if (action === 'delete') {
		return { action, slug }
	}

	if (action === 'toggle') {
		return {
			action,
			slug,
			enabled: readBoolean(body, 'enabled')
		}
	}

	const program: AdminProgramUpsertInput = {
		slug,
		label: readRequiredString(body, 'label', { maxLength: 40 }),
		activityName: readRequiredString(body, 'activityName', { maxLength: 80 }),
		pageTitle: readRequiredString(body, 'pageTitle', { maxLength: 120 }),
		eyebrow: readRequiredString(body, 'eyebrow', { maxLength: 60 }),
		heroTitleLine1: readRequiredString(body, 'heroTitleLine1', { maxLength: 80 }),
		heroTitleLine2: readOptionalString(body, 'heroTitleLine2', { maxLength: 80 }),
		heroSubtitle: readRequiredString(body, 'heroSubtitle', { maxLength: 180 }),
		description: readRequiredString(body, 'description', { maxLength: 180 }),
		icon: readRequiredString(body, 'icon', { maxLength: 16 }),
		eyebrowClass: readOptionalString(body, 'eyebrowClass', { maxLength: 64 }),
		glowClass: readOptionalString(body, 'glowClass', { maxLength: 64 }),
		formGlowClass: readOptionalString(body, 'formGlowClass', { maxLength: 64 }),
		serviceStatusNote: readOptionalString(body, 'serviceStatusNote', { maxLength: 120 }),
		enabled: readBoolean(body, 'enabled', true),
		sortOrder: readIntInRange(body, 'sortOrder', { min: -1000, max: 1000, defaultValue: 0 })
	}
	return { action, program }
}

export function parseAdminCreateEventsBatchInput(input: unknown): AdminCreateEventsBatchInput {
	const body = asJsonObject(input)
	const startsAt = readRequiredString(body, 'startsAt', { trim: true, maxLength: 64 })
	const endsAt = readRequiredString(body, 'endsAt', { trim: true, maxLength: 64 })
	const startsMs = Date.parse(startsAt)
	const endsMs = Date.parse(endsAt)
	if (!Number.isFinite(startsMs) || !Number.isFinite(endsMs) || endsMs <= startsMs) {
		throw new TransportValidationError('Invalid event times')
	}

	return {
		activitySlug: readRequiredString(body, 'activitySlug', { trim: true, maxLength: 64 }),
		title: readRequiredString(body, 'title', { maxLength: 80 }),
		startsAt,
		endsAt,
		capacity: readIntInRange(body, 'capacity', { min: 1, max: 50, message: 'Invalid event input' }),
		repeatWeeks: readIntInRange(body, 'repeatWeeks', { min: 0, max: 52, defaultValue: 0 }),
		costCents: readIntInRange(body, 'costCents', { min: 0, max: 200000, defaultValue: 0, message: 'Invalid cost' }),
		currency: (readOptionalString(body, 'currency', { maxLength: 8 }) ?? 'USD').toUpperCase(),
		paymentProvider: readOptionalString(body, 'paymentProvider', { maxLength: 32 })?.toLowerCase() ?? null,
		paymentHandle: readOptionalString(body, 'paymentHandle', { maxLength: 80 }),
		paymentNoteTemplate: readOptionalString(body, 'paymentNoteTemplate', { maxLength: 120 }),
		location: readOptionalString(body, 'location', { maxLength: 120 }),
		note: readOptionalString(body, 'note', { maxLength: 300 })
	}
}

export function parseAdminEventUpdateInput(input: unknown): AdminEventUpdateInput {
	const body = asJsonObject(input)
	const action = readEnum(body, 'action', ['capacity', 'attendance', 'memory'] as const, 'Unknown action')
	if (action === 'capacity') {
		return { action, capacity: readIntInRange(body, 'capacity', { min: 1, max: 50, message: 'Invalid capacity' }) }
	}
	if (action === 'attendance') {
		return {
			action,
			userId: readRequiredString(body, 'userId', { trim: true, maxLength: 128, message: 'Invalid attendance input' }),
			attendanceStatus: readEnum(body, 'attendanceStatus', ['unknown', 'attended', 'flaked'] as const, 'Invalid attendance input')
		}
	}
	return {
		action,
		recapText: readOptionalString(body, 'recapText', { maxLength: 400 }),
		heroImageUrl: readOptionalString(body, 'heroImageUrl', { maxLength: 240 })
	}
}

export function parseAdminSyncQueueActionInput(input: unknown): AdminSyncQueueActionInput {
	const body = input == null ? {} : asJsonObject(input)
	const actionRaw = typeof body['action'] === 'string' ? body['action'] : 'process'
	if (actionRaw !== 'process' && actionRaw !== 'retry_dead_letters' && actionRaw !== 'purge_dead_letters') {
		throw new TransportValidationError('Invalid action')
	}
	return {
		action: actionRaw,
		limit: readIntInRange(body, 'limit', { min: 1, max: 50, defaultValue: 10 })
	}
}

export function parseSyncQueueProcessLimitInput(input: unknown) {
	const body = input == null ? {} : asJsonObject(input)
	return readIntInRange(body, 'limit', { min: 1, max: 50, defaultValue: 10 })
}

export function parseAdminUserProgramAccessInput(input: unknown): AdminUserProgramAccessInput {
	const body = asJsonObject(input)
	const raw = body['access']
	if (!Array.isArray(raw)) throw new TransportValidationError('Invalid access payload')

	const access = raw.map((entry) => {
		const row = asJsonObject(entry)
		const programSlug = readRequiredString(row, 'programSlug', { trim: true, maxLength: 64 })
		if (!isValidProgramSlug(programSlug)) {
			throw new TransportValidationError('Invalid program slug')
		}
		return {
			programSlug,
			allowed: readBoolean(row, 'allowed')
		}
	})
	return { access }
}

export function parseAdminPaymentDefaultsInput(input: unknown): AdminPaymentDefaultsInput {
	const body = asJsonObject(input)
	return {
		provider: readOptionalString(body, 'provider', { maxLength: 32 })?.toLowerCase() ?? null,
		handle: readOptionalString(body, 'handle', { maxLength: 80 }) ?? null
	}
}
