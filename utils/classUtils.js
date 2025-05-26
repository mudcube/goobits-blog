/**
 * Utility functions for standardizing class composition with BEM methodology
 * Includes standard component class names and helper functions for BEM class generation.
 */

/**
 * Creates a standardized BEM class string from components
 *
 * @param {string} block - The BEM block name (should start with 'goo__')
 * @param {Object} [options] - Options for class generation
 * @param {string[]} [options.modifiers] - BEM modifiers to apply to the block
 * @param {string[]} [options.elements] - BEM elements to include
 * @param {Object<string, string[]>} [options.elementModifiers] - Modifiers for specific elements
 * @param {string} [options.className] - Additional classes to append
 * @returns {string} Formatted class string with proper BEM naming
 * @throws {TypeError} If block is not a string
 */
export function bemClasses(block, options = {}) {
	if (typeof block !== 'string') {
		throw new TypeError('Block name must be a string')
	}

	const { modifiers = [], elements = [], elementModifiers = {}, className = '' } = options

	// Start with the base block class
	const classes = [ block ]

	// Add block modifiers
	modifiers.forEach(modifier => {
		if (modifier) {
			classes.push(`${ block }--${ modifier }`)
		}
	})

	// Add elements
	elements.forEach(element => {
		if (element) {
			classes.push(`${ block }-${ element }`)
		}
	})

	// Add element modifiers
	Object.entries(elementModifiers).forEach(([ element, elementMods ]) => {
		if (element && Array.isArray(elementMods)) {
			elementMods.forEach(mod => {
				if (mod) {
					classes.push(`${ block }-${ element }--${ mod }`)
				}
			})
		}
	})

	// Add additional class name if provided
	if (className) {
		classes.push(className)
	}

	// Filter out any empty strings and join
	return classes.filter(Boolean).join(' ')
}

/**
 * Helper function to create a dynamic class with property-based modifiers
 *
 * @param {string} block - Base BEM block name
 * @param {Object<string, boolean>} [conditions] - Conditions that determine which modifiers to apply
 * @param {string} [className] - Additional classes to append
 * @returns {string} Formatted class string with modifiers applied based on conditions
 * @throws {TypeError} If block is not a string
 */
export function dynamicClasses(block, conditions = {}, className = '') {
	if (typeof block !== 'string') {
		throw new TypeError('Block name must be a string')
	}

	const modifiers = Object.entries(conditions)
		.filter(([ _, value ]) => Boolean(value))
		.map(([ key, _ ]) => key)

	return bemClasses(block, { modifiers, className })
}

/**
 * Creates a dynamic modifier class for a specific property value
 *
 * @param {string} block - Base BEM block name
 * @param {string} property - Property name to use as modifier prefix
 * @param {string|number} value - Property value to use as modifier suffix
 * @returns {string} Formatted modifier class in BEM syntax
 * @throws {TypeError} If block or property is not a string
 */
export function propertyModifier(block, property, value) {
	if (typeof block !== 'string' || typeof property !== 'string') {
		throw new TypeError('Block and property must be strings')
	}

	if (!value) return ''
	return `${ block }--${ property }-${ value }`
}

/**
 * Standard class names for blog components using BEM naming convention with goo__ namespace
 * @type {Object<string, string>}
 */
export const ClassNames = {
	blogCard: 'goo__card',
	postList: 'goo__post-list',
	tags: 'goo__tags',
	categories: 'goo__categories',
	optimizedImage: 'goo__image',
	newsletter: 'goo__newsletter',
	sidebar: 'goo__sidebar',
	langSwitcher: 'goo__lang-switcher'
}