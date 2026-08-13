export interface BlogMessages {
	untitledPost: string
	missingExcerpt: string
	defaultAuthor: string
}

export interface BlogConfig {
	name: string
	description: string
	basePath: string
	canonicalOrigin?: string
	defaultLanguage: string
	supportedLanguages: string[]
	pageSize: number
	relatedPostsLimit: number
	wordsPerMinute: number
	feedPath: string
	feedLimit: number
	messages: BlogMessages
}

export type BlogConfigInput = Partial<Omit<BlogConfig, 'messages'>> & {
	messages?: Partial<BlogMessages>
}

const defaultMessages: BlogMessages = {
	untitledPost: 'Untitled post',
	missingExcerpt: 'No description available',
	defaultAuthor: 'Editorial team'
}

export function normalizeBlogPath(path: string): string {
	const trimmed = path.trim()
	if (!trimmed || trimmed === '/') {
		return ''
	}

	return `/${ trimmed.replace(/^\/+|\/+$/g, '') }`
}

export function createBlogConfig(input: BlogConfigInput = {}): BlogConfig {
	const basePath = normalizeBlogPath(input.basePath ?? '/blog')
	const feedPath = normalizeBlogPath(input.feedPath ?? `${ basePath }/rss.xml`) || '/rss.xml'
	const defaultLanguage = input.defaultLanguage?.trim() || 'en'
	const supportedLanguages = [ ...new Set(input.supportedLanguages ?? [ defaultLanguage ]) ]

	if (!supportedLanguages.includes(defaultLanguage)) {
		supportedLanguages.unshift(defaultLanguage)
	}

	return {
		name: input.name?.trim() || 'Blog',
		description: input.description?.trim() || '',
		basePath,
		...(input.canonicalOrigin ? { canonicalOrigin: input.canonicalOrigin.replace(/\/+$/, '') } : {}),
		defaultLanguage,
		supportedLanguages,
		pageSize: Math.max(1, Math.floor(input.pageSize ?? 12)),
		relatedPostsLimit: Math.max(0, Math.floor(input.relatedPostsLimit ?? 4)),
		wordsPerMinute: Math.max(1, Math.floor(input.wordsPerMinute ?? 220)),
		feedPath,
		feedLimit: Math.max(1, Math.floor(input.feedLimit ?? 20)),
		messages: { ...defaultMessages, ...input.messages }
	}
}
