import { getJournalPosts } from '@miko/blog/server'

export const prerender = true
export const trailingSlash = 'always'

export async function load() {
	const posts = await getJournalPosts()
	return { posts }
}
