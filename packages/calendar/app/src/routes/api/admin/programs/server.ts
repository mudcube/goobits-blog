import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { deleteCalendarProgram, getCalendarPrograms, parseAdminProgramMutationInput, TransportValidationError, upsertCalendarProgram } from '@calendar/core'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiError, apiOk, apiValidationError } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.programs.list', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const env = await buildEnv(event.platform)

		const programs = await getCalendarPrograms(env.DB)
		return apiOk({ programs })
	})
}

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.programs.mutate', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard

		const env = await buildEnv(event.platform)

		const input = parseAdminProgramMutationInput(await event.request.json().catch(() => null))

		if (input.action === 'delete') {
			const slug = input.slug
			await deleteCalendarProgram(env.DB, slug)
			logAdminEvent(event, 'program_delete', { slug })
			return apiOk({})
		}

		if (input.action === 'toggle') {
			const slug = input.slug
			const existing = await getCalendarPrograms(env.DB)
			const target = existing.find((program) => program.slug === slug)
			if (!target) {
				return apiError('Program not found', { status: 404 })
			}
			await upsertCalendarProgram(env.DB, {
				slug: target.slug,
				label: target.label,
				activityName: target.activityName,
				pageTitle: target.pageTitle,
				eyebrow: target.eyebrow,
				heroTitleLine1: target.heroTitleLines[0],
				heroTitleLine2: target.heroTitleLines.length > 1 ? (target.heroTitleLines[1] ?? null) : null,
				heroSubtitle: target.heroSubtitle,
				description: target.description,
				icon: target.icon,
				eyebrowClass: target.eyebrowClass ?? null,
				glowClass: target.glowClass ?? null,
				formGlowClass: target.formGlowClass ?? null,
				serviceStatusNote: target.serviceStatusNote ?? null,
				enabled: input.enabled,
				sortOrder: target.sortOrder
			})
			logAdminEvent(event, 'program_toggle', { slug, enabled: input.enabled })
			return apiOk({})
		}

		const program = input.program

		await upsertCalendarProgram(env.DB, {
			...program
		})
		logAdminEvent(event, 'program_upsert', { slug: program.slug, enabled: program.enabled })
		return apiOk({})
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
