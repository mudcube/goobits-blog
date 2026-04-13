/**
 * Blog i18n utilities
 */

import { createMessageGetter, getMergedMessages } from '../utils/messages.js'
import {
	handleBlogI18n,
	loadWithBlogI18n,
	layoutLoadWithBlogI18n
} from './hooks.js'

// Re-export types for consumers
export type {
	I18nHandler,
	LoadFunction,
	I18nLoadResult
} from './hooks.js'

// Re-export i18n config type from the config module
export type { I18nConfig } from '../config/defaults.js'

export {
	createMessageGetter,
	getMergedMessages,
	handleBlogI18n,
	loadWithBlogI18n,
	layoutLoadWithBlogI18n
}
