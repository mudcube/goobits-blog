export interface BlogAuthor {
	name: string
	avatar?: string
	url?: string
}

/** Responsive image metadata consumed by Blog presentation components. */
export interface BlogImage {
	/** Fallback image URL used by clients without a matching responsive source. */
	src: string
	/** Accessible alternative text for the image. */
	alt: string
	/** Intrinsic image width in CSS pixels. */
	width?: number
	/** Intrinsic image height in CSS pixels. */
	height?: number
	/** Browser `sizes` expression describing the rendered image width. */
	sizes?: string
	/** Format-specific responsive source sets. */
	sources?: {
		avif?: string
		webp?: string
	}
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

export type BlogPostInput = Pick<BlogPost, 'id' | 'slug' | 'title' | 'urlPath'> &
	Partial<Omit<BlogPost, 'id' | 'slug' | 'title' | 'date' | 'urlPath'>> & {
		date: string | Date
		updated?: string | Date
	}

function cloneBlogImage(image: BlogImage): BlogImage {
	return {
		...image,
		...(image.sources ? { sources: { ...image.sources } } : {})
	}
}

function normalizeDate(value: string | Date, field: 'date' | 'updated'): string {
	const date = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(date.getTime())) {
		throw new TypeError(`Blog post ${field} must be a valid date`)
	}
	return date.toISOString()
}

export function createBlogPost(input: BlogPostInput): BlogPost {
	return {
		id: input.id,
		slug: input.slug,
		title: input.title,
		date: normalizeDate(input.date, 'date'),
		excerpt: input.excerpt ?? '',
		categories: [...(input.categories ?? [])],
		tags: [...(input.tags ?? [])],
		featured: input.featured ?? false,
		lang: input.lang ?? 'en',
		status: input.status ?? 'published',
		urlPath: input.urlPath,
		readTimeMinutes: Math.max(1, input.readTimeMinutes ?? 1),
		aliases: [...(input.aliases ?? [])],
		links: [...(input.links ?? [])],
		relatedPostIds: [...(input.relatedPostIds ?? [])],
		...(input.updated !== undefined ? { updated: normalizeDate(input.updated, 'updated') } : {}),
		...(input.author ? { author: { ...input.author } } : {}),
		...(input.image ? { image: cloneBlogImage(input.image) } : {}),
		...(input.thumbnail ? { thumbnail: cloneBlogImage(input.thumbnail) } : {}),
		...(input.coverImage ? { coverImage: input.coverImage } : {}),
		...(input.content !== undefined ? { content: input.content } : {}),
		...(input.sourcePath ? { sourcePath: input.sourcePath } : {}),
		...(input.translations
			? {
					translations: Object.fromEntries(
						Object.entries(input.translations).map(([language, translation]) => [
							language,
							{
								...translation,
								...(translation.categories ? { categories: [...translation.categories] } : {}),
								...(translation.tags ? { tags: [...translation.tags] } : {})
							}
						])
					)
				}
			: {})
	}
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
