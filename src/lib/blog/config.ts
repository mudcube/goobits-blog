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
	},
	ownedDomains: [
		'miko.art',
		'sketch.io',
		'sketchpad.com',
		'colorpiano.com',
		'colorsphere.app',
		'sandart.app',
		'zendala.app',
		'beheremeow.app'
	]
// Cast: BlogConfig's nested types (PostsConfig, PaginationConfig, etc.) are
// declared as required, but initBlogConfig accepts deeply-partial overrides.
// Until the blog package exposes a DeepPartial<BlogConfig>, this site-level
// override needs the cast.
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
