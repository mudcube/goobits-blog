import { getCalendarActivityList, type CalendarActivityConfig, upsertCalendarProgram } from '@calendar/core'
import type { D1DatabaseLike } from '@calendar/kit'

function toProgramInput(program: CalendarActivityConfig, sortOrder: number) {
	return {
		slug: program.slug,
		label: program.label,
		activityName: program.activityName,
		pageTitle: program.pageTitle,
		eyebrow: program.eyebrow,
		heroTitleLine1: program.heroTitleLines[0],
		heroTitleLine2: program.heroTitleLines.length > 1 ? (program.heroTitleLines[1] ?? null) : null,
		heroSubtitle: program.heroSubtitle,
		description: program.description,
		icon: program.icon,
		eyebrowClass: program.eyebrowClass ?? null,
		glowClass: program.glowClass ?? null,
		formGlowClass: program.formGlowClass ?? null,
		serviceStatusNote: program.serviceStatusNote ?? null,
		enabled: true,
		sortOrder
	}
}

export async function ensureCalendarProgramCatalog(db: D1DatabaseLike) {
	const row = await db.prepare(`SELECT COUNT(*) as count FROM calendar_programs`).first<{ count: number | string }>()
	const count = Number(row?.count ?? 0)
	if (count > 0) return

	for (const [index, program] of getCalendarActivityList().entries()) {
		await upsertCalendarProgram(db, toProgramInput(program, (index + 1) * 10))
	}
}
