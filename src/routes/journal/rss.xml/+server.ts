import { createRSSFeedHandler } from '@goobits/blog/core'
import { ensureJournalBlogConfig } from '$lib/blog/config'

ensureJournalBlogConfig()

export const GET = createRSSFeedHandler({
	feedPath: '/journal/rss.xml'
})
