import { redirect } from '@sveltejs/kit'
import { actions as parentActions } from '@calendar/app/routes/admin/page.server'
import { withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
import { withAdminRoute } from '@calendar/ui/config'
import type { PageServerLoad } from './$types'

export const actions = parentActions

export const load: PageServerLoad = async ({ url }) => {
	const mockMode = url.searchParams.get('mock') === '1'
	throw redirect(308, withAdminMock(withAdminRoute('events/program/new/'), mockMode))
}
