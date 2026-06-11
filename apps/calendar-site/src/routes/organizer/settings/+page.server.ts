import { fail, redirect } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv, getCalendarUserId } from '@calendar/kit'
import {
	canManageCalendarTenant,
	createCalendarTenantInvite,
	ensureCalendarCreatorTenant,
	listCalendarTenantInvites,
	listCalendarTenantMembers,
	updateCalendarTenantSettings,
	type CalendarTenantRole
} from '@calendar/core/tenants'
import type { Actions, PageServerLoad } from './$types'

async function loadOrganizerSettings(event: RequestEvent) {
	const userId = getCalendarUserId(event)
	if (!userId) throw redirect(303, `/login?redirect=${encodeURIComponent('/organizer/settings')}`)

	const env = await buildEnv(event.platform)
	const tenant = await ensureCalendarCreatorTenant(env.DB, { userId })
	if (!(await canManageCalendarTenant(env.DB, { tenantId: tenant.id, userId }))) {
		throw redirect(303, '/organizer')
	}

	const [members, invites] = await Promise.all([
		listCalendarTenantMembers(env.DB, { tenantId: tenant.id }),
		listCalendarTenantInvites(env.DB, { tenantId: tenant.id })
	])
	return { env, userId, tenant, members, invites }
}

export const load: PageServerLoad = async (event) => {
	const { tenant, members, invites } = await loadOrganizerSettings(event)
	return { tenant, members, invites }
}

function readTenantRole(value: FormDataEntryValue | null): CalendarTenantRole {
	return value === 'owner' || value === 'admin' || value === 'member' ? value : 'member'
}

export const actions: Actions = {
	updateTenant: async (event) => {
		const { env, tenant } = await loadOrganizerSettings(event)
		const form = await event.request.formData()
		const result = await updateCalendarTenantSettings(env.DB, {
			tenantId: tenant.id,
			name: String(form.get('name') || ''),
			slug: String(form.get('slug') || '')
		})
		if (!result.ok) {
			return fail(400, {
				intent: 'tenant',
				error: result.reason === 'slug_taken' ? 'That slug is already taken.' : 'Enter a name and slug.'
			})
		}
		return { intent: 'tenant', success: true }
	},

	inviteCollaborator: async (event) => {
		const { env, tenant, userId } = await loadOrganizerSettings(event)
		const form = await event.request.formData()
		const result = await createCalendarTenantInvite(env.DB, {
			tenantId: tenant.id,
			email: String(form.get('email') || ''),
			role: readTenantRole(form.get('role')),
			invitedByUserId: userId
		})
		if (!result.ok) {
			return fail(400, {
				intent: 'invite',
				error: 'Enter a valid collaborator email.'
			})
		}
		return { intent: 'invite', success: true }
	}
}
