import type { PageServerLoad } from './$types'
import { getDevDirectoryItems } from '$lib/app/dev/dev-directory.server'

export const load: PageServerLoad = async () => {
	return {
		items: getDevDirectoryItems()
	}
}
