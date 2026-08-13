/**
 * Default message strings for @goobits/blog
 * These are used as fallbacks when no translation is provided
 */

/** Message function that takes a number and returns a formatted string */
export type NumberMessageFn = (n: number) => string

/** Message function that takes two numbers and returns a formatted string */
export type TwoNumberMessageFn = (a: number, b: number) => string

/** Message function that takes a string and returns a formatted string */
export type StringMessageFn = (s: string) => string

/** Message function that takes two strings and returns a formatted string */
export type TwoStringMessageFn = (a: string, b: string) => string

/** Type for the defaultMessages object */
export interface DefaultMessages {
	// Common Messages
	readMore: string
	loading: string
	author: string
	tags: string
	relatedPosts: string
	backToBlog: string
	linkCopied: string
	copyLink: string
	sharePost: string
	minRead: NumberMessageFn
	itemCount: NumberMessageFn

	// Blog Post Page
	untitledPost: string
	by: string
	publishedOn: string
	shareTitle: string
	shareSubtitle: string
	shareFacebook: string
	shareTwitter: string
	shareCopyLink: string

	// Categories
	uncategorized: string
	moreTags: string
	moreCategories: string
	exploreArticles: StringMessageFn

	// Sidebar
	categories: string
	subscribe: string
	subscribeRSS: string

	// Newsletter
	newsletterTitle: string
	newsletterDescription: string
	newsletterSubscribe: string
	emailPlaceholder: string

	// Pagination
	previousPage: string
	nextPage: string
	page: NumberMessageFn
	pageOf: TwoNumberMessageFn
	noMorePosts: string
	loadMore: string

	// SEO
	homePageTitle: TwoStringMessageFn
	homePageDescription: TwoStringMessageFn
	categoryPageTitle: TwoStringMessageFn
	categoryPageDescription: TwoStringMessageFn
	tagPageTitle: TwoStringMessageFn
	tagPageDescription: TwoStringMessageFn

	// Placeholders
	noPosts: string
	noPostsInCategory: string
	noPostsWithTag: string
	searchNoResults: string

	// Errors
	loadingError: string
	notFound: string

	// Language Switcher
	switchLanguage: string
	currentLanguage: string

	// Breadcrumbs
	home: string

	// Social Share specific
	shareOnFacebook: string
	shareOnTwitter: string
	shareOnLinkedIn: string
	shareViaEmail: string

	// Post metadata
	publishDate: string
	updateDate: string
	readTime: string

	// Search
	searchPosts: string
	searchPlaceholder: string
	searchResults: NumberMessageFn

	// Archive
	archive: string
	archiveByMonth: string
	archiveByYear: string

	// Comments (if used)
	comments: string
	addComment: string
	noComments: string

	// Footer
	copyright: TwoStringMessageFn

	// Accessibility
	skipToContent: string
	menuToggle: string
	closeMenu: string
	expandMenu: string

	// Dates
	today: string
	yesterday: string
	daysAgo: NumberMessageFn
	monthsAgo: NumberMessageFn
	yearsAgo: NumberMessageFn
}

export const defaultMessages: DefaultMessages = {
	// Common Messages
	readMore: 'Read more',
	loading: 'Loading...',
	author: 'Author',
	tags: 'Tags',
	relatedPosts: 'Related Posts',
	backToBlog: 'Back to Blog',
	linkCopied: 'Link copied to clipboard',
	copyLink: 'Copy link',
	sharePost: 'Share this post',
	minRead: (minutes: number): string => `${ minutes } min read`,
	itemCount: (count: number): string => `${ count } items`,

	// Blog Post Page
	untitledPost: 'Untitled Post',
	by: 'by',
	publishedOn: 'Published on',
	shareTitle: 'Share this article',
	shareSubtitle: 'If you found this article helpful, share it with your network',
	shareFacebook: 'Share on Facebook',
	shareTwitter: 'Share on Twitter',
	shareCopyLink: 'Copy Link',

	// Categories
	uncategorized: 'Uncategorized',
	moreTags: 'More tags',
	moreCategories: 'More categories',
	exploreArticles: (tag: string): string => `Explore articles tagged with "${ tag }"`,

	// Sidebar
	categories: 'Categories',
	subscribe: 'Subscribe',
	subscribeRSS: 'Subscribe to RSS',

	// Newsletter
	newsletterTitle: 'Subscribe to our Newsletter',
	newsletterDescription: 'Get the latest posts delivered right to your inbox',
	newsletterSubscribe: 'Subscribe',
	emailPlaceholder: 'Enter your email',

	// Pagination
	previousPage: 'Previous',
	nextPage: 'Next',
	page: (pageNumber: number): string => `Page ${ pageNumber }`,
	pageOf: (current: number, total: number): string => `Page ${ current } of ${ total }`,
	noMorePosts: 'No more posts to load',
	loadMore: 'Load more posts',

	// SEO
	homePageTitle: (blogName: string, blogDescription: string): string => `${ blogName } - ${ blogDescription }`,
	homePageDescription: (blogDescription: string, blogName: string): string => `${ blogDescription }. Read the latest posts from ${ blogName }.`,
	categoryPageTitle: (category: string, blogName: string): string => `${ category } - ${ blogName }`,
	categoryPageDescription: (category: string, blogName: string): string => `Browse all ${ category } posts on ${ blogName }. Find the latest articles and insights.`,
	tagPageTitle: (tag: string, blogName: string): string => `${ tag } - ${ blogName }`,
	tagPageDescription: (tag: string, blogName: string): string => `Explore all posts tagged with ${ tag } on ${ blogName }.`,

	// Placeholders
	noPosts: 'No posts available',
	noPostsInCategory: 'No posts in this category',
	noPostsWithTag: 'No posts with this tag',
	searchNoResults: 'No results found',

	// Errors
	loadingError: 'Error loading content',
	notFound: 'Content not found',

	// Language Switcher
	switchLanguage: 'Switch language',
	currentLanguage: 'Current language',

	// Breadcrumbs
	home: 'Home',

	// Social Share specific
	shareOnFacebook: 'Share on Facebook',
	shareOnTwitter: 'Share on Twitter',
	shareOnLinkedIn: 'Share on LinkedIn',
	shareViaEmail: 'Share via Email',

	// Post metadata
	publishDate: 'Published',
	updateDate: 'Updated',
	readTime: 'Read time',

	// Search
	searchPosts: 'Search posts',
	searchPlaceholder: 'Search...',
	searchResults: (count: number): string => `${ count } results found`,

	// Archive
	archive: 'Archive',
	archiveByMonth: 'Posts by Month',
	archiveByYear: 'Posts by Year',

	// Comments (if used)
	comments: 'Comments',
	addComment: 'Add a comment',
	noComments: 'No comments yet',

	// Footer
	copyright: (year: string, siteName: string): string => `© ${ year } ${ siteName }. All rights reserved.`,

	// Accessibility
	skipToContent: 'Skip to content',
	menuToggle: 'Toggle menu',
	closeMenu: 'Close menu',
	expandMenu: 'Expand menu',

	// Dates
	today: 'Today',
	yesterday: 'Yesterday',
	daysAgo: (days: number): string => `${ days } days ago`,
	monthsAgo: (months: number): string => `${ months } months ago`,
	yearsAgo: (years: number): string => `${ years } years ago`
}