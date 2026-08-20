import { createBlogEngine, type BlogEngine } from '../../src/core/createBlogEngine.js'
import {
	createMarkdownContentSource,
	type MarkdownImportRecord
} from '../../src/markdown/createMarkdownContentSource.js'

export const markdownContent: Record<string, string> = {
	'/content/2024/03/flat.md':
		'# Flat\n\nA public article with enough words to create an excerpt. [Nested](/journal/2024/04/nested).',
	'/content/2024/04/nested/index.md':
		'# Nested\n\n![Cover](/nested.jpg) A nested article about Svelte and music.',
	'/content/2024/05/draft.md': '# Draft\n\nThis must stay private.'
}

export const markdownFiles: MarkdownImportRecord = {
	'/content/2024/03/flat.md': () =>
		Promise.resolve({
			metadata: {
				title: 'Flat & Friendly',
				date: '2024-03-10',
				category: 'Engineering',
				tags: ['Svelte', 'Music'],
				aliases: ['/journal/old-flat'],
				i18n: { es: { title: 'Plano y amable', excerpt: 'Una entrada publica.' } }
			}
		}),
	'/content/2024/04/nested/index.md': () =>
		Promise.resolve({
			metadata: {
				title: 'Nested Post',
				date: '2024-04-12',
				categories: ['Engineering'],
				tags: ['Svelte'],
				relatedPosts: ['content/2024/03/flat']
			}
		}),
	'/content/2024/05/draft.md': () =>
		Promise.resolve({
			metadata: {
				title: 'Private Draft',
				date: '2024-05-01',
				draft: true,
				category: 'Notes'
			}
		})
}

export function createFixtureEngine(): BlogEngine {
	const contentSource = createMarkdownContentSource({
		files: markdownFiles,
		basePath: '/journal',
		readContent: (filePath) => Promise.resolve(markdownContent[filePath] ?? ''),
		resolveSourcePath: (filePath) => filePath.replace('/content/', '@journal/')
	})

	return createBlogEngine({
		config: {
			name: 'Journal',
			description: 'Fixture feed',
			basePath: '/journal',
			canonicalOrigin: 'https://example.com',
			pageSize: 1
		},
		contentSource
	})
}
