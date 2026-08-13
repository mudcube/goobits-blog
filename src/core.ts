// Non-UI exports for server, config, utilities, and i18n consumers.
export * from './utils/blogUtils.js'
export * from './utils/breadcrumbUtils.js'
export * from './utils/classUtils.js'
export * from './utils/readTimeUtils.js'
export * from './utils/formatLabel.js'
export * from './utils/messages.js'
export * from './utils/logger.js'
export * from './utils/errorHandler.js'

export * from './config.js'
export { default as blogConfig } from './config.js'

export * from './i18n/index.js'

export {
	createBlogIndexHandler,
	createBlogSlugHandler,
	createRSSFeedHandler,
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

export {
	loadBlogIndex,
	loadCategory,
	loadTag,
	loadPost,
	generateBlogEntries,
	type LoadBlogIndexOptions,
	type BlogIndexData,
	type TagData,
	type PostPageData,
	type HttpError,
	type BlogEntry,
	type CategoryData as CategoryPageData
} from './handlers/routeUtils.js'

export {
	createBlogPageLoad,
	type BlogPageLoadOptions,
	type PostData,
	type ServerLoadData,
	type ClientLoadResult,
	type ClientLoadParams,
	type LoadPostContentParams,
	type Logger as ClientLogger
} from './handlers/clientLoad.js'
