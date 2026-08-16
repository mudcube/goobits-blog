import { createMarkdownBlog } from '@goobits/blog/sveltekit'

const modules = import.meta.glob('/src/content/blog/**/index.md')
const rawContent = import.meta.glob<string>('/src/content/blog/**/index.md', {
	query: '?raw',
	import: 'default'
})

export const blog = createMarkdownBlog({
	config: {
		name: 'Journal',
		description: 'Notes from the studio',
		basePath: '/journal',
		canonicalOrigin: 'https://example.com'
	},
	modules,
	rawContent,
	getContext: event => ({
		allowDrafts: event.locals['preview'] === true
	})
})
