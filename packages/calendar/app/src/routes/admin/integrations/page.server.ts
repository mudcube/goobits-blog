import { createAdminSectionLoad } from '../_section.server'

import { actions as parentActions } from '../page.server'
export const actions = parentActions
export const load = createAdminSectionLoad('integrations')
