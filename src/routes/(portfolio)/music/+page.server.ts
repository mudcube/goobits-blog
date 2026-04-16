import { getJournalPosts } from '$lib/blog/server'
import type { JournalPost } from '$lib/blog/viewmodel'
import type { MusicPostEntry } from '@src/domains/music/viewmodel'

export async function load() {
	const posts = await getJournalPosts()

	const musicPosts: MusicPostEntry[] = posts
		.filter((post: JournalPost) => {
			const categories = post?.metadata?.fm?.categories
			if (!Array.isArray(categories)) return false
			return categories.some(category => String(category).toLowerCase() === 'music')
		})
		.slice(0, 12)
		.map((post: JournalPost) => ({
			title: String(post?.metadata?.fm?.title || post.slug),
			urlPath: String(post.urlPath),
			date: post.date.toISOString()
		}))

	return {
		musicPosts
	}
}
