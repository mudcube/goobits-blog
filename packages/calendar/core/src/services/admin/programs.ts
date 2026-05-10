import type { CalendarActivityConfig } from '../../config/activities.ts'
import { isValidProgramSlug, type CalendarProgramSlug } from '../../config/programs.ts'
import type { D1DatabaseLike } from '../../storage/d1.ts'
import { getCalendarConfig } from '../../config/calendar.ts'
import { TransportValidationError } from '../../transport/errors.ts'

export type CalendarProgramState = CalendarActivityConfig & {
	enabled: boolean
	sortOrder: number
}

type ProgramRow = {
	slug: string
	label: string
	activity_name: string
	page_title: string
	eyebrow: string
	hero_title_line_1: string
	hero_title_line_2: string | null
	hero_subtitle: string
	description: string
	icon: string
	eyebrow_class: string | null
	glow_class: string | null
	form_glow_class: string | null
	service_status_note: string | null
	enabled: number
	sort_order: number
}

function toProgram(row: ProgramRow): CalendarProgramState {
	const calendarBase = getCalendarConfig().routes.calendarBase
	const titleLines = row.hero_title_line_2
		? [row.hero_title_line_1, row.hero_title_line_2] as [string, string]
		: [row.hero_title_line_1] as [string]

	const base: CalendarProgramState = {
		slug: row.slug,
		href: `${calendarBase}/${row.slug}`,
		label: row.label,
		activityName: row.activity_name,
		pageTitle: row.page_title,
		eyebrow: row.eyebrow,
		heroTitleLines: titleLines,
		heroSubtitle: row.hero_subtitle,
		description: row.description,
		icon: row.icon,
		enabled: row.enabled !== 0,
		sortOrder: row.sort_order ?? 0
	}
	if (row.eyebrow_class) base.eyebrowClass = row.eyebrow_class
	if (row.glow_class) base.glowClass = row.glow_class
	if (row.form_glow_class) base.formGlowClass = row.form_glow_class
	if (row.service_status_note) base.serviceStatusNote = row.service_status_note
	return base
}

async function listProgramRows(db: D1DatabaseLike) {
	const result = await db.prepare(
		`SELECT slug, label, activity_name, page_title, eyebrow, hero_title_line_1, hero_title_line_2,
		        hero_subtitle, description, icon, eyebrow_class, glow_class, form_glow_class,
		        service_status_note, enabled, sort_order
		 FROM calendar_programs
		 ORDER BY sort_order ASC, label ASC`
	).all<ProgramRow>()
	return result?.results ?? []
}

export async function getCalendarPrograms(db: D1DatabaseLike): Promise<CalendarProgramState[]> {
	const rows = await listProgramRows(db)
	return rows.map(toProgram)
}

export async function getEnabledCalendarPrograms(db: D1DatabaseLike): Promise<CalendarActivityConfig[]> {
	const programs = await getCalendarPrograms(db)
	return programs.filter((program) => program.enabled)
}

export async function isCalendarProgramEnabled(db: D1DatabaseLike, slug: CalendarProgramSlug) {
	const row = await db.prepare(
		`SELECT enabled FROM calendar_programs WHERE slug = ? LIMIT 1`
	).bind(slug).first<{ enabled: number }>()
	return row?.enabled !== 0
}

export async function setCalendarProgramEnabled(db: D1DatabaseLike, slug: CalendarProgramSlug, enabled: boolean) {
	await db.prepare(
		`UPDATE calendar_programs SET enabled = ?, updated_at = unixepoch() WHERE slug = ?`
	).bind(enabled ? 1 : 0, slug).run()
}

export async function getCalendarProgramBySlug(db: D1DatabaseLike, slug: string, options: { includeDisabled?: boolean } = {}) {
	const row = await db.prepare(
		`SELECT slug, label, activity_name, page_title, eyebrow, hero_title_line_1, hero_title_line_2,
		        hero_subtitle, description, icon, eyebrow_class, glow_class, form_glow_class,
		        service_status_note, enabled, sort_order
		 FROM calendar_programs
		 WHERE slug = ?
		 LIMIT 1`
	).bind(slug).first<ProgramRow>()
	if (!row) return null
	if (!options.includeDisabled && row.enabled === 0) return null
	return toProgram(row)
}

export async function getEnabledCalendarProgramByActivityName(db: D1DatabaseLike, activityName: string) {
	const row = await db.prepare(
		`SELECT slug, enabled
		 FROM calendar_programs
		 WHERE activity_name = ?
		 LIMIT 1`
	).bind(activityName).first<{ slug: string; enabled: number }>()
	if (!row || row.enabled === 0) return null
	return row.slug
}

export type CalendarProgramInput = {
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

export async function upsertCalendarProgram(db: D1DatabaseLike, input: CalendarProgramInput) {
	if (!isValidProgramSlug(input.slug)) {
		throw new Error('Invalid program slug')
	}
	await db.prepare(
		`INSERT INTO calendar_programs (
		  slug, label, activity_name, page_title, eyebrow,
		  hero_title_line_1, hero_title_line_2, hero_subtitle, description, icon,
		  eyebrow_class, glow_class, form_glow_class, service_status_note, enabled, sort_order, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
		ON CONFLICT(slug) DO UPDATE SET
		  label = excluded.label,
		  activity_name = excluded.activity_name,
		  page_title = excluded.page_title,
		  eyebrow = excluded.eyebrow,
		  hero_title_line_1 = excluded.hero_title_line_1,
		  hero_title_line_2 = excluded.hero_title_line_2,
		  hero_subtitle = excluded.hero_subtitle,
		  description = excluded.description,
		  icon = excluded.icon,
		  eyebrow_class = excluded.eyebrow_class,
		  glow_class = excluded.glow_class,
		  form_glow_class = excluded.form_glow_class,
		  service_status_note = excluded.service_status_note,
		  enabled = excluded.enabled,
		  sort_order = excluded.sort_order,
		  updated_at = unixepoch()`
	).bind(
		input.slug,
		input.label,
		input.activityName,
		input.pageTitle,
		input.eyebrow,
		input.heroTitleLine1,
		input.heroTitleLine2,
		input.heroSubtitle,
		input.description,
		input.icon,
		input.eyebrowClass,
		input.glowClass,
		input.formGlowClass,
		input.serviceStatusNote,
		input.enabled ? 1 : 0,
		input.sortOrder
	).run()
}

/**
 * Refuses to delete a program that still has any events attached. Events
 * carry `activity_slug` as plain TEXT (no FK to calendar_programs.slug), so
 * deletion would silently orphan them. Cancelling/deleting the events first
 * is an explicit admin choice — not a side effect of removing the program.
 */
export async function deleteCalendarProgram(db: D1DatabaseLike, slug: string) {
	const eventCount = await db
		.prepare(
			`SELECT COUNT(*) AS n FROM calendar_events
			 WHERE activity_slug = ? AND status NOT IN ('cancelled', 'canceled')`
		)
		.bind(slug)
		.first<{ n: number }>()
	const n = eventCount?.n ?? 0
	if (n > 0) {
		throw new TransportValidationError(
			`Program has ${n} event${n === 1 ? '' : 's'}. Cancel them first, then delete the program.`,
			409
		)
	}
	await db.prepare(`DELETE FROM calendar_programs WHERE slug = ?`).bind(slug).run()
}

export async function reorderCalendarPrograms(
	db: D1DatabaseLike,
	orders: ReadonlyArray<{ slug: string; sortOrder: number }>
) {
	if (orders.length === 0) return
	for (const entry of orders) {
		if (!isValidProgramSlug(entry.slug)) throw new Error('Invalid program slug')
	}
	for (const entry of orders) {
		await db
			.prepare(
				`UPDATE calendar_programs
				 SET sort_order = ?, updated_at = unixepoch()
				 WHERE slug = ?`
			)
			.bind(entry.sortOrder, entry.slug)
			.run()
	}
}
