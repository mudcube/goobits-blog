<script>
	/**
	 * TagCategoryList Component
	 *
	 * A flexible component for displaying tags or categories as an interactive list
	 * with various style options, customizable appearance, and automatic highlighting
	 * of the active item based on the current route.
	 *
	 * Features:
	 * - Supports both tags and categories with automatic URL generation
	 * - Optional hashtag prefix for tags
	 * - Multiple style variants with different color schemes
	 * - Configurable gap sizes for different layouts
	 * - "Show more" functionality for long lists
	 * - Automatic highlighting of active/current item
	 * - Internationalized labels via messages prop
	 * - Full accessibility support with appropriate ARIA attributes
	 *
	 * @component
	 */
	import './TagCategoryList.scss'
	import { bemClasses, createMessageGetter } from '@goobits/blog/utils'
	import { blogConfig, defaultMessages } from '@goobits/blog/config'
	import { page } from '$app/stores'
	import { slugify } from '@goobits/blog/utils'

	/**
	 * @typedef {Object} Props
	 * @property {string[]} [items] - Array of tag/category strings to display
	 * @property {number} [maxDisplay] - Maximum number of items to display before showing "+X more"
	 * @property {boolean} [showHashtag] - Whether to show the hashtag symbol before item names (for tags)
	 * @property {string} [className] - Optional CSS class to add to the container
	 * @property {string} [gap] - Gap size between items (small, medium, large)
	 * @property {string} [activeItem] - The currently active item (for highlighting)
	 * @property {string} [currentItem] - Alternative property for the currently active item
	 * @property {'default' | 'amber' | 'green' | 'white'} [variant] - Style variant
	 * @property {'tags' | 'categories'} [type] - Type of items (tags or categories)
	 * @property {string} [baseUrl] - Base URL prefix for links
	 */

	/** @type {Props} */
	let {
		items = [],
		maxDisplay = Number.MAX_SAFE_INTEGER,
		showHashtag = false,
		className = '',
		gap = 'medium',
		activeItem = '',
		currentItem = '',
		messages = {},
		locale = 'en',
		variant = 'default',
		type = 'tags',
		baseUrl = ''
	} = $props()
	
	// Create message getter
	const getMessage = createMessageGetter({ ...defaultMessages, ...messages })

	// Determine the actual URL base path
	const urlBase = baseUrl || (type === 'categories' ? `${ blogConfig.uri }/category` : `${ blogConfig.uri }/tag`)

	// Use either activeItem or currentItem, with priority given to activeItem if both are provided
	let selectedItem = $state(activeItem || currentItem)

	// Track URL changes to update selected state
	$effect(() => {
		const urlPath = $page.url.pathname

		// Update the selected item based on URL path and type
		if ((type === 'tags' && urlPath.includes('/tag/')) ||
			(type === 'categories' && urlPath.includes('/category/'))) {
			selectedItem = activeItem || currentItem
		}
	})

	// Determine component class name based on type
	const componentClass = type === 'categories' ? 'categories' : 'tags'
</script>

{#if items?.length}
	<div class={bemClasses(`goo__${componentClass}`, {
    modifiers: [`spacing-${gap}`, `theme-${variant}`],
    className
  })}>
		{#each items.slice(0, maxDisplay) as item}
			<a
					href={`${urlBase}/${slugify(item)}`}
					class={bemClasses(`goo__${componentClass}-item`, {
          modifiers: item.toLowerCase() === selectedItem?.toLowerCase() ? ['state-active'] : []
        })}
					data-item={item}
					data-active={item.toLowerCase() === selectedItem?.toLowerCase() ? 'true' : 'false'}
					data-type={type}
					aria-current={item.toLowerCase() === selectedItem?.toLowerCase() ? 'page' : undefined}
			>
				{showHashtag ? `#${ item }` : item}
			</a>
		{/each}
		{#if items.length > maxDisplay}
      <span class={`goo__${componentClass}-more`} aria-label={`${items.length - maxDisplay} more ${type}`}>
        {type === 'tags'
			? `+${ items.length - maxDisplay } ${ getMessage('moreTags', 'more tags') }`
			: `+${ items.length - maxDisplay } ${ getMessage('moreCategories', 'more categories') }`
		}
      </span>
		{/if}
	</div>
{/if}