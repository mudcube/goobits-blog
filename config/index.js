/**
 * Configuration system for @goobits/blog
 *
 * Provides a flexible configuration that merges user config with defaults
 */

import { defaultBlogConfig, getDefaultBlogPostFiles } from './defaults.js'
export { defaultMessages } from './defaultMessages.js'

// Store for the current configuration
let currentConfig = null

// Store for custom functions that can't be serialized
const customFunctions = {
	getBlogPostFiles: null
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object to merge in
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
	const result = { ...target }

	for (const key in source) {
		if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
			result[key] = deepMerge(result[key] || {}, source[key])
		} else {
			result[key] = source[key]
		}
	}

	return result
}

/**
 * Initialize blog configuration with user overrides
 * This should be called once at app startup
 *
 * @param {Object} userConfig - User configuration overrides
 * @param {Object} options - Optional functions that can't be serialized
 * @param {Function} [options.getBlogPostFiles] - Custom glob function for blog posts
 * @returns {Object} Merged configuration
 */
export function initBlogConfig(userConfig = {}, options = {}) {
	// Store functions separately
	if (options.getBlogPostFiles) {
		customFunctions.getBlogPostFiles = options.getBlogPostFiles
	}

	// Merge configuration (excluding functions)
	currentConfig = deepMerge(defaultBlogConfig, userConfig)
	return currentConfig
}

/**
 * Get the current blog configuration
 * Returns default config if not initialized
 *
 * @returns {Object} Current blog configuration
 */
export function getBlogConfig() {
	if (!currentConfig) {
		console.warn('@goobits/blog: Config not initialized, using defaults. Call initBlogConfig() at app startup.')
		currentConfig = { ...defaultBlogConfig }
	}
	return currentConfig
}

/**
 * Get blog version information
 * @returns {{version: string, lastUpdated: string, versionString: string}}
 */
export function getBlogVersion() {
	const config = getBlogConfig()
	return {
		version: config.version,
		lastUpdated: config.lastUpdated,
		versionString: `Blog Framework v${ config.version } (${ config.lastUpdated })`
	}
}

/**
 * Get blog post files using the configured pattern or default
 * @returns {Object} Object with file paths as keys and dynamic import functions as values
 */
export function getBlogPostFiles() {
	// Use custom function if provided during initialization
	if (customFunctions.getBlogPostFiles) {
		return customFunctions.getBlogPostFiles()
	}

	// Use default glob pattern
	return getDefaultBlogPostFiles()
}

// Export a proxy to the current config for backward compatibility
export const blogConfig = new Proxy({}, {
	get(target, prop) {
		const config = getBlogConfig()
		return config[prop]
	},
	set(target, prop, value) {
		console.warn('@goobits/blog: Direct config modification is not recommended. Use initBlogConfig() instead.')
		const config = getBlogConfig()
		config[prop] = value
		return true
	}
})