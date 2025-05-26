/**
 * Default message strings for @goobits/blog
 * These are used as fallbacks when no translation is provided
 */

export const defaultMessages = {
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
	minRead: (minutes) => `${ minutes } min read`,
	itemCount: (count) => `${ count } items`,

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
	exploreArticles: (tag) => `Explore articles tagged with "${ tag }"`,

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
	page: (number) => `Page ${ number }`,
	pageOf: (current, total) => `Page ${ current } of ${ total }`,
	noMorePosts: 'No more posts to load',
	loadMore: 'Load more posts',

	// SEO
	homePageTitle: (blogName, blogDescription) => `${ blogName } - ${ blogDescription }`,
	homePageDescription: (blogDescription, blogName) => `${ blogDescription }. Read the latest posts from ${ blogName }.`,
	categoryPageTitle: (category, blogName) => `${ category } - ${ blogName }`,
	categoryPageDescription: (category, blogName) => `Browse all ${ category } posts on ${ blogName }. Find the latest articles and insights.`,
	tagPageTitle: (tag, blogName) => `${ tag } - ${ blogName }`,
	tagPageDescription: (tag, blogName) => `Explore all posts tagged with ${ tag } on ${ blogName }.`,

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
	searchResults: (count) => `${ count } results found`,

	// Archive
	archive: 'Archive',
	archiveByMonth: 'Posts by Month',
	archiveByYear: 'Posts by Year',

	// Comments (if used)
	comments: 'Comments',
	addComment: 'Add a comment',
	noComments: 'No comments yet',

	// Footer
	copyright: (year, siteName) => `© ${ year } ${ siteName }. All rights reserved.`,

	// Accessibility
	skipToContent: 'Skip to content',
	menuToggle: 'Toggle menu',
	closeMenu: 'Close menu',
	expandMenu: 'Expand menu',

	// Dates
	today: 'Today',
	yesterday: 'Yesterday',
	daysAgo: (days) => `${ days } days ago`,
	monthsAgo: (months) => `${ months } months ago`,
	yearsAgo: (years) => `${ years } years ago`
}