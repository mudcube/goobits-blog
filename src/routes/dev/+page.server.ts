import type { PageServerLoad } from './$types'
import { getDevDirectoryItems } from '$lib/server/dev-directory'

export const load: PageServerLoad = async () => {
	return {
		items: getDevDirectoryItems()
	}
}
