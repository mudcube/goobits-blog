import { initBlogConfig, type BlogConfig } from '@goobits/blog/config'

let initialized = false

const journalBlogConfig = {
	name: 'Miko Journal',
	appName: 'Miko',
	description: 'Ideas, process, and notes from Miko.',
	uri: '/journal',
	posts: {
		contentBasePath: '/static/journal',
		urlBasePath: ''
	},
	images: {
		defaults: {
			authorAvatar: '/media/brand/miko.jpg',
			coverImage: '/media/page-icons/journal-journaling.png'
		}
	},
	pagination: {
		postsPerPage: 50,
		postsPerBatch: 50
	}
} as unknown as Partial<BlogConfig>

export function ensureJournalBlogConfig() {
	if (initialized) return

	initBlogConfig(journalBlogConfig, {
		getBlogPostFiles: () => import.meta.glob('/static/journal/**/index.md'),
		loadCategoryDescriptions: async () => ({})
	})

	initialized = true
}

ensureJournalBlogConfig()
