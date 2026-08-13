/**
 * Message utility for i18n support in @goobits/blog
 * Provides a flexible way to handle messages from any i18n library
 */

import { defaultMessages, type DefaultMessages } from '../config/defaultMessages.js'

// Use console for logging within the package
const logger = console

// Message value type - can be a string, a function, or a nested object
export type MessageValue = string | ((...args: unknown[]) => string) | Record<string, string | ((...args: unknown[]) => string)>

// Messages object type
export interface MessagesObject {
	[key: string]: MessageValue
}

// Message getter function type
export type MessageGetter = (key: string, fallback?: string, ...args: unknown[]) => string | MessageValue

/**
 * Creates a message getter function that handles both string and function messages
 *
 * @param messages - Object containing message strings or functions
 * @returns A function that retrieves messages with fallback support
 * @throws TypeError If messages is not an object
 */
export function createMessageGetter(messages: MessagesObject = {}): MessageGetter {
	if (messages !== null && typeof messages === 'object') {
		return (key: string, fallback?: string, ...args: unknown[]): string | MessageValue => {
			// Validate key to prevent prototype pollution
			if (typeof key !== 'string' || key === '__proto__' || key === 'constructor') {
				logger.warn('[BlogMessages] Invalid message key:', key)
				return fallback || 'INVALID_KEY'
			}

			// First check user messages
			const userMsg = messages[key]
			if (userMsg !== undefined) {
				if (typeof userMsg === 'function') {
					try {
						return userMsg(...args)
					} catch {
						// Log minimal error info to avoid leaking sensitive data
						logger.warn(`[BlogMessages] Error calling message function for key: ${ key }`)
						return fallback || key
					}
				}
				return userMsg
			}

			// Then check default messages
			const defaultMsgs = defaultMessages as unknown as MessagesObject
			const defaultMsg = defaultMsgs[key]
			if (defaultMsg !== undefined) {
				if (typeof defaultMsg === 'function') {
					try {
						return defaultMsg(...args)
					} catch {
						// Log minimal error info to avoid leaking sensitive data
						logger.warn(`[BlogMessages] Error calling default message function for key: ${ key }`)
						return fallback || key
					}
				}
				// For nested objects like categories
				if (typeof defaultMsg === 'object' && !Array.isArray(defaultMsg)) {
					const nestedKey = args[0]
					// Validate nested key to prevent prototype pollution
					if (typeof nestedKey === 'string' &&
						nestedKey !== '__proto__' &&
						nestedKey !== 'constructor') {
						const nestedValue = (defaultMsg as Record<string, MessageValue>)[nestedKey]
						if (nestedValue !== undefined) {
							return nestedValue
						}
					}
				}
				return defaultMsg
			}

			// Finally use fallback or key
			return fallback || key
		}
	}

	throw new TypeError('Messages must be an object')
}

/**
 * Merges user-provided messages with default messages
 *
 * @param userMessages - User-provided messages to override defaults
 * @returns Complete messages object with defaults and user overrides
 * @throws TypeError If userMessages is not an object
 */
export function getMergedMessages(userMessages: Partial<DefaultMessages> = {}): DefaultMessages {
	if (userMessages !== null && typeof userMessages === 'object') {
		return {
			...defaultMessages,
			...userMessages
		}
	}

	throw new TypeError('User messages must be an object')
}
