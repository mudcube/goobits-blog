/**
 * Secure deep merge utility for safely merging configuration objects
 * Prevents prototype pollution and property traversal attacks
 */

import { createLogger } from '../utils/logger.js'

const logger = createLogger('SecureDeepMerge')

/** Type for a plain object with string keys */
export type PlainObject = Record<string, unknown>

/**
 * Type guard to check if a value is a plain object
 */
function isPlainObject(value: unknown): value is PlainObject {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Checks if a key is safe to use in object merging/access
 * Prevents __proto__, constructor, and other dangerous property names
 *
 * @param key - Object key to check
 * @returns True if safe, false if potentially dangerous
 */
export function isSafeKey(key: string): boolean {
	// List of known dangerous property names
	const dangerousKeys: readonly string[] = [
		'__proto__',
		'constructor',
		'prototype'
	]

	return typeof key === 'string' && !dangerousKeys.includes(key)
}

/**
 * Secure deep merge that prevents prototype pollution
 *
 * @param target - Target object
 * @param source - Source object to merge in
 * @returns Merged object with only safe keys
 */
export function secureDeepMerge(target: PlainObject, source: unknown): PlainObject {
	// Create a new object to avoid mutating the target
	const result: PlainObject = { ...target }

	// Only merge if source is an object
	if (isPlainObject(source)) {
		// Iterate using Object.keys to only access own properties
		Object.keys(source).forEach(key => {
			// Skip potentially dangerous keys
			if (!isSafeKey(key)) {
				logger.warn(`Skipping potentially unsafe key: ${ key }`)
				return
			}

			const sourceValue: unknown = source[key]
			const targetValue: unknown = result[key]

			// If property is an object, recursively merge
			if (isPlainObject(sourceValue)) {
				const targetObj: PlainObject = isPlainObject(targetValue) ? targetValue : {}
				result[key] = secureDeepMerge(targetObj, sourceValue)
			} else {
				// For primitive values or arrays, just copy
				result[key] = sourceValue
			}
		})
	}

	return result
}

export default secureDeepMerge