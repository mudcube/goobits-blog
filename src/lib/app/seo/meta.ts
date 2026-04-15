export const SITE_ORIGIN = 'https://miko.art'
export const SITE_NAME = 'MIKO.ART'
export const SITE_AUTHOR = 'Miko Meow'
export const SITE_DEFAULT_IMAGE = '/media/miko.jpg'
export const SITE_DESCRIPTION =
	'Creative software, design tools, music experiments, and process notes from Miko Meow.'

/**
 * Canonical one-sentence entity description. Used everywhere LLMs and AI
 * retrieval systems cross-reference "what is Miko" — Person JSON-LD,
 * llms.txt blockquote, and the about-page lead. Keep it ~160 chars and
 * name the flagship products so entity linking stays consistent.
 */
export const SITE_ENTITY_DESCRIPTION =
	'Miko Meow is a creative developer, designer, and musician making browser-native apps, drawing tools, and sound experiments — creator of Sketchpad, Color Piano, and ColRD.'

export type JsonLdNode = Record<string, unknown>

export function hasFileExtension(path: string) {
	const lastSegment = path.split('/').pop() ?? ''
	return /\.[a-z0-9]+$/i.test(lastSegment)
}

export function normalizeSitePath(path = '/') {
	const [pathname] = path.split(/[?#]/)
	const normalized = pathname?.startsWith('/') ? pathname : `/${pathname || ''}`
	if (normalized === '/') return '/'
	if (hasFileExtension(normalized)) return normalized
	return normalized.endsWith('/') ? normalized : `${normalized}/`
}

export function toAbsoluteSiteUrl(path = '/') {
	if (/^https?:\/\//i.test(path)) return path
	return `${SITE_ORIGIN}${normalizeSitePath(path)}`
}

export function toAbsoluteAssetUrl(path = SITE_DEFAULT_IMAGE) {
	if (/^https?:\/\//i.test(path)) return path
	const normalized = path.startsWith('/') ? path : `/${path}`
	return `${SITE_ORIGIN}${normalized}`
}

export function toPageTitle(title: string) {
	return title.includes(SITE_NAME) ? title : `${title} - ${SITE_NAME}`
}

export function serializeJsonLd(value: JsonLdNode) {
	return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function formatSeoLabel(value: string) {
	const preferredLabels: Record<string, string> = {
		api: 'API',
		css: 'CSS',
		css3: 'CSS3',
		html: 'HTML',
		html5: 'HTML5',
		io: 'IO',
		javascript: 'JavaScript',
		midi: 'MIDI',
		ui: 'UI',
		ux: 'UX',
		webgl: 'WebGL'
	}

	return value
		.split('-')
		.filter(Boolean)
		.map(word => preferredLabels[word.toLowerCase()] ?? word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

export function toPlainTextExcerpt(value: string, maxLength = 155) {
	const text = value
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

	if (text.length <= maxLength) return text
	const truncated = text.slice(0, maxLength + 1)
	const lastSpace = truncated.lastIndexOf(' ')
	return `${truncated.slice(0, lastSpace > 80 ? lastSpace : maxLength).trim()}...`
}

export function buildPersonJsonLd(): JsonLdNode {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: SITE_AUTHOR,
		url: SITE_ORIGIN,
		image: toAbsoluteAssetUrl(SITE_DEFAULT_IMAGE),
		description: SITE_ENTITY_DESCRIPTION,
		jobTitle: 'Creative developer, designer, and musician',
		worksFor: {
			'@type': 'Organization',
			name: 'Sketch.IO',
			url: 'https://sketch.io'
		},
		knowsAbout: [
			'Creative coding',
			'Design tools',
			'Educational software',
			'Interactive installations',
			'Music applications'
		]
	}
}

export function buildWebsiteJsonLd(): JsonLdNode {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: SITE_ORIGIN,
		description: SITE_DESCRIPTION,
		author: {
			'@type': 'Person',
			name: SITE_AUTHOR,
			url: SITE_ORIGIN
		}
	}
}

export function buildWebPageJsonLd({
	path,
	title,
	description,
	type = 'WebPage'
}: {
	path: string
	title: string
	description: string
	type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ProfilePage'
}): JsonLdNode {
	return {
		'@context': 'https://schema.org',
		'@type': type,
		name: title,
		headline: title,
		description,
		url: toAbsoluteSiteUrl(path),
		isPartOf: {
			'@type': 'WebSite',
			name: SITE_NAME,
			url: SITE_ORIGIN
		},
		author: {
			'@type': 'Person',
			name: SITE_AUTHOR,
			url: SITE_ORIGIN
		}
	}
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdNode {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: toAbsoluteSiteUrl(item.path)
		}))
	}
}

export function buildArticleJsonLd({
	path,
	title,
	description,
	datePublished,
	dateModified,
	image
}: {
	path: string
	title: string
	description: string
	datePublished: string
	dateModified?: string
	image?: string
}): JsonLdNode {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: title,
		description,
		url: toAbsoluteSiteUrl(path),
		datePublished,
		dateModified: dateModified ?? datePublished,
		image: toAbsoluteAssetUrl(image ?? SITE_DEFAULT_IMAGE),
		author: {
			'@type': 'Person',
			name: SITE_AUTHOR,
			url: SITE_ORIGIN
		},
		publisher: {
			'@type': 'Organization',
			name: SITE_NAME,
			url: SITE_ORIGIN,
			logo: {
				'@type': 'ImageObject',
				url: toAbsoluteAssetUrl('/favicon.png')
			}
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': toAbsoluteSiteUrl(path)
		}
	}
}
