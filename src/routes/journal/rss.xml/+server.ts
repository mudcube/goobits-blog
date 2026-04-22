import { createRSSFeedHandler } from '@goobits/blog/core'
import { ensureJournalBlogConfig } from '$lib/blog/config'

export const prerender = true

ensureJournalBlogConfig()

export const GET = createRSSFeedHandler({
	feedPath: '/journal/rss.xml'
})
