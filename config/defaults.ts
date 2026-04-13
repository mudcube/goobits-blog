/**
 * Default configuration for @goobits/blog
 *
 * This provides all default settings that can be overridden by users
 */

/** Vite glob import function return type */
export type GlobImportFn = () => Promise<unknown>

/** Record of file paths to their dynamic import functions */
export type GlobImportRecord = Record<string, GlobImportFn>

/** Read time configuration */
export interface ReadTimeConfig {
	wordsPerMinute: number
	defaultTime: number
	minTimeForLongArticle: number
	minTimeForVeryLongArticle: number
	longArticleThreshold: number
	veryLongArticleThreshold: number
	headingsWeight: number
}

/** Posts configuration */
export interface PostsConfig {
	contentBasePath: string
	urlBasePath: string
	excerptLength: number
	relatedPostsCount: number
	recentPostsCount: number
	popularTagsCount: number
	popularCategoriesCount: number
	readTime: ReadTimeConfig
}

/** Page content configuration */
export interface PageContentConfig {
	homepageDescription: string
	endOfPostsMessage: string
	loadingMessage: string
	defaultCategoryDescription: string
	noCategoryPostsTitle: string
	noCategoryPostsMessage: string
	backToBlogText: string
	defaultTagDescription: string
	noTagPostsMessage: string
	uncategorizedText: string
	readMoreText: string
	relatedPostsTitle: string
	postedOnText: string
	byAuthorText: string
	defaultAuthorName: string
	newsletterSubscribeText: string
	newsletterDescription: string
	newsletterButtonText: string
	newsletterPlaceholderText: string
	emptyStateEmoji: string
	genericEmptyMessage: string
}

/** Image ratio configuration */
export interface ImageRatio {
	width: number
	height: number
}

/** Image ratios configuration */
export interface ImageRatios {
	square: ImageRatio
	wide: ImageRatio
	standard: ImageRatio
	tall: ImageRatio
}

/** Remote image configuration */
export interface RemoteImageConfig {
	domains: string[]
	prefixes: string[]
}

/** Image defaults configuration */
export interface ImageDefaultsConfig {
	coverImage: string
	authorAvatar: string
	blogPath: string
	authorsPath: string
}

/** Images configuration */
export interface ImagesConfig {
	defaultWidths: number[]
	defaultSizes: string
	defaultQuality: number
	defaultFormat: string
	defaultLoading: string
	defaultDecoding: string
	ratios: ImageRatios
	remote: RemoteImageConfig
	defaults: ImageDefaultsConfig
}

/** Pagination configuration */
export interface PaginationConfig {
	postsPerPage: number
	postsPerBatch: number
	infiniteScroll: boolean
	preloadNextPage: boolean
	enableCategories: boolean
	enableTags: boolean
	enableTimelines: boolean
	loadingDelay: number
	observerRootMargin: string
	observerThreshold: number
}

/** Social default messages */
export interface SocialDefaultMessages {
	twitter: string
	facebook: string
	linkedin: string
	email: string
}

/** Social configuration */
export interface SocialConfig {
	enabled: boolean
	platforms: string[]
	defaultMessages: SocialDefaultMessages
}

/** Theme colors configuration */
export interface ThemeColors {
	primary: string
	secondary: string
	accent: string
	background: string
	text: string
	muted: string
}

/** Theme spacing configuration */
export interface ThemeSpacing {
	small: string
	medium: string
	large: string
}

/** Theme border radius configuration */
export interface ThemeBorderRadius {
	small: string
	medium: string
	large: string
}

/** Theme card configuration */
export interface ThemeCard {
	shadow: string
	borderRadius: string
	padding: string
}

/** Theme configuration */
export interface ThemeConfig {
	colors: ThemeColors
	spacing: ThemeSpacing
	fontFamily: string
	borderRadius: ThemeBorderRadius
	card: ThemeCard
}

/** i18n configuration */
export interface I18nConfig {
	enabled: boolean
	supportedLanguages: string[]
	defaultLanguage: string
	includeLanguageInURL: boolean
	autoDetectLanguage: boolean
	languageDetectionOrder: string[]
	persistLanguageKey: string
}

/** Complete blog configuration type */
export interface BlogConfig {
	name: string
	description: string
	uri: string
	version: string
	lastUpdated: string
	posts: PostsConfig
	pageContent: PageContentConfig
	images: ImagesConfig
	pagination: PaginationConfig
	social: SocialConfig
	theme: ThemeConfig
	i18n: I18nConfig
	debug: boolean
}

/**
 * Get blog post files using import.meta.glob
 * @returns Object with file paths as keys and dynamic import functions as values
 */
export function getDefaultBlogPostFiles(): GlobImportRecord {
	// Default pattern for blog posts
	// Cast to GlobImportRecord since Vite's glob returns a compatible type
	return import.meta.glob('@blog/**/*.md') as GlobImportRecord
}

/**
 * Default blog configuration
 * Users can override any part of this configuration
 */
export const defaultBlogConfig: BlogConfig = {
	// --- Basic Information ---
	name: 'Blog',
	description: 'Our Blog',
	uri: '/blog',

	// --- Versioning ---
	version: '1.2.0',
	lastUpdated: '2026-02-05',

	// --- Content & Structure ---
	posts: {
		contentBasePath: '@blog',
		urlBasePath: '/blog',
		excerptLength: 160,
		relatedPostsCount: 3,
		recentPostsCount: 5,
		popularTagsCount: 10,
		popularCategoriesCount: 5,
		readTime: {
			wordsPerMinute: 225,
			defaultTime: 3,
			minTimeForLongArticle: 5,
			minTimeForVeryLongArticle: 10,
			longArticleThreshold: 20000,
			veryLongArticleThreshold: 50000,
			headingsWeight: 5
		}
	},

	// --- Page Content ---
	pageContent: {
		homepageDescription: 'Insights, stories, and updates from our team',
		endOfPostsMessage: 'You\'ve reached the end of posts',
		loadingMessage: 'Loading...',
		defaultCategoryDescription: 'Explore our collection of articles in the "{category}" category.',
		noCategoryPostsTitle: 'No Posts Found',
		noCategoryPostsMessage: 'We couldn\'t find any posts in the "{category}" category.',
		backToBlogText: 'Back to Blog',
		defaultTagDescription: 'Articles tagged with "{tag}"',
		noTagPostsMessage: 'We couldn\'t find any posts with the tag "{tag}".',
		uncategorizedText: 'Uncategorized',
		readMoreText: 'Read more',
		relatedPostsTitle: 'You might also enjoy',
		postedOnText: 'Posted on',
		byAuthorText: 'by',
		defaultAuthorName: 'Author',
		newsletterSubscribeText: 'Subscribe',
		newsletterDescription: 'Get the latest updates delivered to your inbox',
		newsletterButtonText: 'Subscribe',
		newsletterPlaceholderText: 'Your email address',
		emptyStateEmoji: '📄',
		genericEmptyMessage: 'No content found'
	},

	// --- Image Handling ---
	images: {
		defaultWidths: [ 400, 800, 1200 ],
		defaultSizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
		defaultQuality: 80,
		defaultFormat: 'webp',
		defaultLoading: 'lazy',
		defaultDecoding: 'async',
		ratios: {
			square: { width: 1, height: 1 },
			wide: { width: 16, height: 9 },
			standard: { width: 4, height: 3 },
			tall: { width: 3, height: 4 }
		},
		remote: {
			domains: [
				'images.unsplash.com',
				'res.cloudinary.com',
				's3.amazonaws.com',
				's3.eu-west-1.amazonaws.com'
			],
			prefixes: [ 'https://cdn.', 'https://images.', 'https://medusa-public-images.', 'http://localhost', '/products/' ]
		},
		defaults: {
			coverImage: '/images/default-cover.jpg',
			authorAvatar: '/images/default-avatar.jpg',
			blogPath: '@content/Blog',
			authorsPath: '/images/authors'
		}
	},

	// --- Pagination ---
	pagination: {
		postsPerPage: 10,
		postsPerBatch: 6,
		infiniteScroll: true,
		preloadNextPage: true,
		enableCategories: true,
		enableTags: true,
		enableTimelines: true,
		loadingDelay: 500,
		observerRootMargin: '100px',
		observerThreshold: 0.1
	},

	// --- Social Sharing ---
	social: {
		enabled: true,
		platforms: [ 'twitter', 'facebook', 'linkedin', 'email' ],
		defaultMessages: {
			twitter: 'Check out this article: {title} {url}',
			facebook: '{title} - {description}',
			linkedin: 'I found this article interesting: {title}',
			email: 'I thought you might enjoy this: {title}'
		}
	},

	// --- Theme ---
	theme: {
		colors: {
			primary: '#f59e0b',
			secondary: '#22c55e',
			accent: '#3b82f6',
			background: '#ffffff',
			text: '#1f2937',
			muted: '#6b7280'
		},
		spacing: {
			small: '0.5rem',
			medium: '1rem',
			large: '2rem'
		},
		fontFamily: 'system-ui, -apple-system, sans-serif',
		borderRadius: {
			small: '0.25rem',
			medium: '0.5rem',
			large: '1rem'
		},
		card: {
			shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
			borderRadius: '0.5rem',
			padding: '1.5rem'
		}
	},

	// --- i18n ---
	i18n: {
		enabled: false,
		supportedLanguages: [ 'en' ],
		defaultLanguage: 'en',
		includeLanguageInURL: false,
		autoDetectLanguage: false,
		languageDetectionOrder: [ 'url', 'sessionStorage', 'browser' ],
		persistLanguageKey: 'blog-lang'
	},

	// --- Debug ---
	debug: false
}