import { createBlogIndexHandler } from '@goobits/blog/core'
import { ensureJournalBlogConfig } from '$lib/blog/config'

ensureJournalBlogConfig()

export const { load, prerender } = createBlogIndexHandler()
