import { getJournalPosts } from '@src/domains/journal/server/posts'

export const prerender = true
export const trailingSlash = 'always'

export async function load() {
	const posts = await getJournalPosts()
	return { posts }
}
