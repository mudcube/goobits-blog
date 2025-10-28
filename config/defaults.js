/**
 * Default configuration for @goobits/blog
 *
 * This provides all default settings that can be overridden by users
 */

/**
 * Get blog post files using import.meta.glob
 * @returns {Object} Object with file paths as keys and dynamic import functions as values
 */
export function getDefaultBlogPostFiles() {
	// Default pattern for blog posts
	return import.meta.glob('@blog/**/*.md')
}

/**
 * Default blog configuration
 * Users can override any part of this configuration
 */
export const defaultBlogConfig = {
	// --- Basic Information ---
	name: 'Blog',
	description: 'Our Blog',
	uri: '/blog',

	// --- Versioning ---
	version: '1.2.0',
	lastUpdated: '2025-05-17',

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
			prefixes: [ 'https://cdn.', 'https://images.', 'https://medusa-public-images.' ]
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