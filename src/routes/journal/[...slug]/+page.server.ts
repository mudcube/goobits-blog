import { dev } from '$app/environment'
import { error, type ServerLoad } from '@sveltejs/kit'
import { loadBlogIndex, loadCategory, loadTag, loadPost } from '@goobits/blog/core'
import { ensureJournalBlogConfig } from '$lib/blog/config'
import { getActiveReleaseStage } from '$lib/app/release'
import { isLocalPreviewHost } from '$lib/app/is-local-preview-host'

ensureJournalBlogConfig()

export const prerender = false
export const trailingSlash = 'always'

const ASSET_EXT_RE = /\.(css|scss|js|ts|jsx|tsx|png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|eot|mp3|mp4|pdf)$/i

export const load: ServerLoad = async ({ params, cookies, url, locals }) => {
	const enablePreview = dev && isLocalPreviewHost(url.hostname)
	const stage = getActiveReleaseStage({ cookies, enablePreview })
	const includeDrafts = stage === 'preview'
	const lang = (locals as { paraglideLocale?: string })?.paraglideLocale || 'en'

	const slug = params['slug']
	const normalizedSlug = slug ? slug.replace(/\/$/, '') : ''

	if (ASSET_EXT_RE.test(normalizedSlug)) {
		throw error(404, 'Not a blog route')
	}

	if (!normalizedSlug) {
		return await loadBlogIndex(lang, null, { includeDrafts })
	}

	if (normalizedSlug.startsWith('category/')) {
		return await loadCategory(normalizedSlug.replace('category/', ''), lang, null, { includeDrafts })
	}

	if (normalizedSlug.startsWith('tag/')) {
		return await loadTag(normalizedSlug.replace('tag/', ''), lang, null, { includeDrafts })
	}

	const postMatch = normalizedSlug.match(/^(\d{4})\/(\d{2})\/(.+)$/)
	if (postMatch) {
		const [, year, month, postSlug] = postMatch
		if (year && month && postSlug) {
			return await loadPost(year, month, postSlug, lang, null, { includeDrafts })
		}
	}

	throw error(404, 'Blog page not found')
}
