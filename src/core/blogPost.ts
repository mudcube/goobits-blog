export interface BlogAuthor {
	name: string
	avatar?: string
	url?: string
}

export interface BlogImage {
	src: string
	alt: string
	width?: number
	height?: number
}

export interface BlogPostTranslation {
	title?: string
	excerpt?: string
	categories?: string[]
	tags?: string[]
}

export type BlogPostStatus = 'published' | 'draft'

export interface BlogPost {
	id: string
	slug: string
	title: string
	date: string
	excerpt: string
	categories: string[]
	tags: string[]
	featured: boolean
	lang: string
	status: BlogPostStatus
	urlPath: string
	readTimeMinutes: number
	aliases: string[]
	links: string[]
	relatedPostIds: string[]
	updated?: string
	author?: BlogAuthor
	image?: BlogImage
	thumbnail?: BlogImage
	coverImage?: string
	content?: string
	sourcePath?: string
	translations?: Record<string, BlogPostTranslation>
}

export interface BlogPostMetadataInput {
	title?: unknown
	date?: unknown
	slug?: unknown
	categories?: unknown
	category?: unknown
	featured?: unknown
	excerpt?: unknown
	author?: unknown
	image?: unknown
	thumbnail?: unknown
	coverImage?: unknown
	readTime?: unknown
	updated?: unknown
	i18n?: unknown
	draft?: unknown
	tags?: unknown
	aliases?: unknown
	links?: unknown
	relatedPosts?: unknown
}

export type BlogPostReference = string | Pick<BlogPost, 'id'>
