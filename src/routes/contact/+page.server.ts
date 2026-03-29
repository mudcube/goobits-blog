import { dev } from '$app/environment'
import type { PageServerLoad } from './$types'
import { mergeRuntimeEnv } from '$lib/server/runtime'

export const prerender = false

export const load: PageServerLoad = async ({ url, platform }) => {
	const env = mergeRuntimeEnv(platform?.env)
	const localWidgetEnabled = env['TURNSTILE_ENABLE_LOCALHOST'] === 'true'
	const turnstileSiteKey = dev && !localWidgetEnabled ? '' : env['PUBLIC_TURNSTILE_SITE_KEY'] || ''

	return {
		contextFrom: url.searchParams.get('from')?.trim() || '',
		contextTopic: url.searchParams.get('topic')?.trim() || '',
		turnstileSiteKey
	}
}
