/**
 * Configuration system for @goobits/blog
 *
 * Provides a flexible configuration that merges user config with defaults
 */

import { defaultBlogConfig, getDefaultBlogPostFiles } from './defaults.js'
import type { BlogConfig, GlobImportRecord } from './defaults.js'
import { secureDeepMerge } from './secureDeepMerge.js'
import { createLogger } from '../utils/logger.js'
import { loadCategoryDescriptions as loadDefaultCategoryDescriptions } from '../utils/categoryDescriptions.js'
export { defaultMessages } from './defaultMessages.js'
export type { BlogConfig, GlobImportRecord } from './defaults.js'

const logger = createLogger('Config')

/** Function type for getting blog post files */
export type GetBlogPostFilesFn = () => GlobImportRecord
/** Function type for building the posts API URL */
export type BuildPostsApiUrlFn = (
	params: URLSearchParams,
	context?: Record<string, unknown>
) => string
/** Function type for loading category descriptions from the host app */
export type LoadCategoryDescriptionsFn<TCategoryData = Record<string, unknown>> = (
	lang: string
) => Promise<Record<string, TCategoryData>>

/** Options for initializing blog config */
export interface InitBlogConfigOptions {
	getBlogPostFiles?: GetBlogPostFilesFn
	buildPostsApiUrl?: BuildPostsApiUrlFn
	loadCategoryDescriptions?: LoadCategoryDescriptionsFn
}

/** Custom functions store type */
interface CustomFunctions {
	getBlogPostFiles: GetBlogPostFilesFn | null
	buildPostsApiUrl: BuildPostsApiUrlFn | null
	loadCategoryDescriptions: LoadCategoryDescriptionsFn | null
}

// Store for the current configuration
let currentConfig: BlogConfig | null = null

// Store for custom functions that can't be serialized
const customFunctions: CustomFunctions = {
	getBlogPostFiles: null,
	buildPostsApiUrl: null,
	loadCategoryDescriptions: null
}

/**
 * Initialize blog configuration with user overrides
 * This should be called once at app startup
 *
 * @param userConfig - User configuration overrides
 * @param options - Optional functions that can't be serialized
 * @returns Merged configuration
 */
export function initBlogConfig(
	userConfig: Partial<BlogConfig> = {},
	options: InitBlogConfigOptions = {}
): BlogConfig {
	// Store functions separately
	if (options.getBlogPostFiles) {
		customFunctions.getBlogPostFiles = options.getBlogPostFiles
	}
	if (options.buildPostsApiUrl) {
		customFunctions.buildPostsApiUrl = options.buildPostsApiUrl
	}
	if (options.loadCategoryDescriptions) {
		customFunctions.loadCategoryDescriptions = options.loadCategoryDescriptions
	}

	// Merge configuration securely (excluding functions)
	currentConfig = secureDeepMerge(
		defaultBlogConfig as unknown as Record<string, unknown>,
		userConfig
	) as unknown as BlogConfig
	return currentConfig
}

/**
 * Get the current blog configuration
 * Returns default config if not initialized
 *
 * @returns Current blog configuration
 */
export function getBlogConfig(): BlogConfig {
	if (!currentConfig) {
		logger.warn('Config not initialized, using defaults. Call initBlogConfig() at app startup.')
		currentConfig = { ...defaultBlogConfig }
	}
	return currentConfig
}

/** Blog version information */
export interface BlogVersionInfo {
	version: string
	lastUpdated: string
	versionString: string
}

/**
 * Get blog version information
 * @returns Blog version information object
 */
export function getBlogVersion(): BlogVersionInfo {
	const config = getBlogConfig()
	return {
		version: config.version,
		lastUpdated: config.lastUpdated,
		versionString: `Blog Framework v${ config.version } (${ config.lastUpdated })`
	}
}

/**
 * Get blog post files using the configured pattern or default
 * @returns Object with file paths as keys and dynamic import functions as values
 */
export function getBlogPostFiles(): GlobImportRecord {
	// Use custom function if provided during initialization
	if (customFunctions.getBlogPostFiles) {
		return customFunctions.getBlogPostFiles()
	}

	// Use default glob pattern
	return getDefaultBlogPostFiles()
}

/**
 * Build the posts API URL used by infinite-scroll UIs.
 * Consumers can override this to support custom route mounts.
 */
export function buildPostsApiUrl(
	params: URLSearchParams,
	context: Record<string, unknown> = {}
): string {
	if (customFunctions.buildPostsApiUrl) {
		return customFunctions.buildPostsApiUrl(params, context)
	}

	const { postsApiPath } = getBlogConfig().pagination
	return `${ postsApiPath }?${ params.toString() }`
}

/**
 * Load category description metadata.
 * Consumers can override this to avoid package assumptions about content paths.
 */
export async function loadConfiguredCategoryDescriptions<TCategoryData = Record<string, unknown>>(
	lang: string
): Promise<Record<string, TCategoryData>> {
	if (customFunctions.loadCategoryDescriptions) {
		return await customFunctions.loadCategoryDescriptions(lang) as Record<string, TCategoryData>
	}

	return await loadDefaultCategoryDescriptions(lang) as Record<string, TCategoryData>
}

// Export a proxy to the current config for backward compatibility
export const blogConfig: BlogConfig = new Proxy({} as BlogConfig, {
	get(_target: BlogConfig, prop: string | symbol): unknown {
		const config = getBlogConfig()
		return config[prop as keyof BlogConfig]
	},
	set(_target: BlogConfig, prop: string | symbol, value: unknown): boolean {
		logger.warn('Direct config modification is not recommended. Use initBlogConfig() instead.')
		const config = getBlogConfig() as unknown as Record<string, unknown>
		config[prop as string] = value
		return true
	}
})
