import type { PageServerLoad } from './$types'
import { getDevEntries } from '@src/domains/dev/catalog.server'

export const load: PageServerLoad = async () => {
	return {
		items: getDevEntries()
	}
}
