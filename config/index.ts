/**
 * Configuration system for @goobits/blog
 *
 * Provides a flexible configuration that merges user config with defaults
 */

import { defaultBlogConfig, getDefaultBlogPostFiles } from './defaults.js'
import type { BlogConfig, GlobImportRecord } from './defaults.js'
import { secureDeepMerge } from './secureDeepMerge.js'
import { createLogger } from '../utils/logger.js'
export { defaultMessages } from './defaultMessages.js'
export type { BlogConfig, GlobImportRecord } from './defaults.js'

const logger = createLogger('Config')

/** Function type for getting blog post files */
export type GetBlogPostFilesFn = () => GlobImportRecord

/** Options for initializing blog config */
export interface InitBlogConfigOptions {
	getBlogPostFiles?: GetBlogPostFilesFn
}

/** Custom functions store type */
interface CustomFunctions {
	getBlogPostFiles: GetBlogPostFilesFn | null
}

// Store for the current configuration
let currentConfig: BlogConfig | null = null

// Store for custom functions that can't be serialized
const customFunctions: CustomFunctions = {
	getBlogPostFiles: null
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