// Main exports for @goobits/blog package
export { default as BlogCard } from './ui/BlogCard.svelte'
export { default as BlogLayout } from './ui/BlogLayout.svelte'
export { default as BlogListPage } from './ui/BlogListPage.svelte'
export { default as BlogPostPage } from './ui/BlogPostPage.svelte'
export { default as BlogSEO } from './ui/BlogSEO.svelte'
export { default as Breadcrumbs } from './ui/Breadcrumbs.svelte'
export { default as LanguageSwitcher } from './ui/LanguageSwitcher.svelte'
export { default as Newsletter } from './ui/Newsletter.svelte'
export { default as PostList } from './ui/PostList.svelte'
export { default as Sidebar } from './ui/Sidebar.svelte'
export { default as SocialShare } from './ui/SocialShare.svelte'
export { default as TagCategoryList } from './ui/TagCategoryList.svelte'
export { default as BlogRouter } from './ui/BlogRouter.svelte'

// Export utilities (canonical source for PostMetadata, ProcessedPost, CategoryData)
export * from './utils/blogUtils.js'
export * from './utils/breadcrumbUtils.js'
export * from './utils/classUtils.js'
export * from './utils/readTimeUtils.js'
export * from './utils/messages.js'

// Export config (canonical source for BlogConfig)
export * from './config.js'
export { default as blogConfig } from './config.js'

// Export internationalization
export * from './i18n/index.js'

// Export route handlers with explicit exports to avoid type conflicts
// Conflicting types (BlogConfig, PostMetadata, ProcessedPost, CategoryData) are
// exported from their canonical sources above (config.js and utils/blogUtils.js)
export {
	// Handler factory functions
	createBlogIndexHandler,
	createBlogSlugHandler,
	createRSSFeedHandler,
	// Handler types
	type Locals,
	type RouteParams,
	type ServerLoadEvent,
	type RequestEvent,
	type GetLanguageFunction,
	type ErrorHandler,
	type BlogIndexHandlerOptions,
	type BlogIndexHandler,
	type BlogSlugHandlerOptions,
	type BlogSlugHandler,
	type RSSFeedHandlerOptions
} from './handlers/index.js'

// Export route utilities (excluding types that conflict with blogUtils/config)
export {
	// Route loading functions
	loadBlogIndex,
	loadCategory,
	loadTag,
	loadPost,
	generateBlogEntries,
	// Non-conflicting types
	type LoadBlogIndexOptions,
	type BlogIndexData,
	type TagData,
	type PostPageData,
	type HttpError,
	type BlogEntry,
	// Rename handlers' CategoryData to avoid conflict with blogUtils' CategoryData
	// (handlers' version is page data, blogUtils' version is category metadata)
	type CategoryData as CategoryPageData
} from './handlers/routeUtils.js'

// Export client-side load utilities
export {
	createBlogPageLoad,
	type BlogPageLoadOptions,
	type PostData,
	type ServerLoadData,
	type ClientLoadResult,
	type ClientLoadParams,
	// Rename to avoid potential conflict with utils/logger.js Logger
	type Logger as ClientLogger
} from './handlers/clientLoad.js'