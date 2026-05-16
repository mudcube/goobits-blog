import { initBlogConfig, type BlogConfig, type DeepPartial } from '@goobits/blog/config'

let initialized = false

const journalBlogConfig: DeepPartial<BlogConfig> = {
	name: 'Miko Journal',
	appName: 'Miko',
	description:
		'Notes on Sketchpad, Color Piano, MIDI.js, and creative coding — process, design, and code behind browser-native tools.',
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
}

export function ensureJournalBlogConfig() {
	if (initialized) return

	initBlogConfig(journalBlogConfig, {
		getBlogPostFiles: () => import.meta.glob('/static/journal/**/index.md'),
		loadCategoryDescriptions: async () => ({})
	})

	initialized = true
}

ensureJournalBlogConfig()
