import { createAdminSectionLoad } from '@calendar/app/routes/admin/_section.server'
import { actions as parentActions } from '@calendar/app/routes/admin/page.server'

export const actions = parentActions
export const load = createAdminSectionLoad('people')
