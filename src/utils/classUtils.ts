/**
 * Utility functions for standardizing class composition with BEM methodology
 * Includes standard component class names and helper functions for BEM class generation.
 */

// BEM options interface
export interface BemClassesOptions {
	modifiers?: string[]
	elements?: string[]
	elementModifiers?: Record<string, string[]>
	className?: string
}

// Boolean conditions for dynamic classes
export interface DynamicClassConditions {
	[key: string]: boolean
}

/**
 * Creates a standardized BEM class string from components
 *
 * @param block - The BEM block name (should start with 'goo__')
 * @param options - Options for class generation
 * @returns Formatted class string with proper BEM naming
 * @throws TypeError If block is not a string
 */
export function bemClasses(block: string, options: BemClassesOptions = {}): string {
	if (typeof block !== 'string') {
		throw new TypeError('Block name must be a string')
	}

	const { modifiers = [], elements = [], elementModifiers = {}, className = '' } = options

	// Start with the base block class
	const classes: string[] = [ block ]

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
 * @param block - Base BEM block name
 * @param conditions - Conditions that determine which modifiers to apply
 * @param className - Additional classes to append
 * @returns Formatted class string with modifiers applied based on conditions
 * @throws TypeError If block is not a string
 */
export function dynamicClasses(block: string, conditions: DynamicClassConditions = {}, className = ''): string {
	if (typeof block !== 'string') {
		throw new TypeError('Block name must be a string')
	}

	const modifiers = Object.entries(conditions)
		.filter(([ _, value ]) => value)
		.map(([ key ]) => key)

	return bemClasses(block, { modifiers, className })
}

/**
 * Creates a dynamic modifier class for a specific property value
 *
 * @param block - Base BEM block name
 * @param property - Property name to use as modifier prefix
 * @param value - Property value to use as modifier suffix
 * @returns Formatted modifier class in BEM syntax
 * @throws TypeError If block or property is not a string
 */
export function propertyModifier(block: string, property: string, value: string | number): string {
	if (typeof block !== 'string' || typeof property !== 'string') {
		throw new TypeError('Block and property must be strings')
	}

	// Handle falsy values (including null/undefined passed via type assertions in tests)
	if (value === '' || value === 0 || value === null || value === undefined) { return '' }
	return `${ block }--${ property }-${ value }`
}

/**
 * Standard class names for blog components using BEM naming convention with goo__ namespace
 */
export const ClassNames: Readonly<Record<string, string>> = {
	blogCard: 'goo__card',
	postList: 'goo__post-list',
	tags: 'goo__tags',
	categories: 'goo__categories',
	optimizedImage: 'goo__image',
	newsletter: 'goo__newsletter',
	sidebar: 'goo__sidebar',
	langSwitcher: 'goo__lang-switcher'
} as const
