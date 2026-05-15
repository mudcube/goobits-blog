import { dev } from '$app/environment'
import { loadBlogIndex } from '@goobits/blog/core'
import type { ServerLoad } from '@sveltejs/kit'
import { ensureJournalBlogConfig } from '$lib/blog/config'
import { getActiveReleaseStage, isLocalPreviewHost } from '$lib/app/release'

ensureJournalBlogConfig()

export const prerender = false

export const load: ServerLoad = async ({ cookies, url, locals }) => {
	const enablePreview = dev && isLocalPreviewHost(url.hostname)
	const stage = getActiveReleaseStage({ cookies, enablePreview })
	const lang = (locals as { paraglideLocale?: string })?.paraglideLocale || 'en'

	return await loadBlogIndex(lang, null, {
		initialLoad: true,
		includeDrafts: stage === 'preview'
	})
}
