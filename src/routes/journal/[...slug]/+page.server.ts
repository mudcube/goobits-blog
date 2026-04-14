import { createBlogSlugHandler } from '@goobits/blog/core'
import { ensureJournalBlogConfig } from '$lib/blog/config'

ensureJournalBlogConfig()

export const { load, entries, prerender, trailingSlash } = createBlogSlugHandler()
