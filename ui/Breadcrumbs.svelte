<script>
	/**
	 * A breadcrumb navigation component that shows the user's current location within the site hierarchy
	 *
	 * @typedef {Object} BreadcrumbItem
	 * @property {string} href - The URL for the breadcrumb item
	 * @property {string} label - The display text for the breadcrumb item
	 *
	 * @typedef {Object} Props
	 * @property {BreadcrumbItem[]} [items] - Array of breadcrumb items
	 * @property {string} [current] - The current page name (final breadcrumb)
	 * @property {boolean} [showHome] - Whether to show the Home link at the beginning
	 * @property {boolean} [firstItemIsCurrent] - When true, the first item is treated as current
	 */

	import { createMessageGetter } from '@goobits/blog/utils/index.js'
	import { defaultMessages, blogConfig } from '@goobits/blog/config/index.js'

	// Get the configured blog URI
	const blogUri = blogConfig.uri || '/blog'

	// Component Props
	let {
		items = [],
		current = '',
		showHome = true,
		firstItemIsCurrent = false,
		messages = {}
	} = $props()

	// Create message getter
	const getMessage = createMessageGetter({ ...defaultMessages, ...messages })
</script>

<div class="breadcrumbs">
	{#if showHome}
		<a href="/" class="breadcrumbs__link">{getMessage('home', 'Home')}</a>
		<span class="breadcrumbs__separator">/</span>
	{/if}

	<!-- Add a Blog link for tags and categories, but not for the blog homepage -->
	{#if !items.some(item => item.href === blogUri) && items.length > 0}
		<a href={blogUri} class="breadcrumbs__link">{getMessage('blog', 'Blog')}</a>
		<span class="breadcrumbs__separator">/</span>
	{/if}

	{#if firstItemIsCurrent && items.length > 0}
		<!-- First item is current -->
		<span class="breadcrumbs__current">{items[0].label}</span>
	{:else}
		<!-- Normal breadcrumb rendering -->
		{#if items.length > 0}
			{#each items as item, index (item.href)}
				{#if index > 0}
					<span class="breadcrumbs__separator">/</span>
				{/if}
				<a
						href={item.href.startsWith('/') ? item.href : `/${item.href}`}
						class="breadcrumbs__link"
				>
					{item.label}
				</a>
			{/each}

			{#if current}
				<span class="breadcrumbs__separator">/</span>
				<span class="breadcrumbs__current">{current}</span>
			{/if}
		{:else if current}
			<!-- Only current item, no intermediate breadcrumbs -->
			<span class="breadcrumbs__current">{current}</span>
		{/if}
	{/if}
</div>

<style lang="scss">
	@use 'variables' as *;

	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: $spacing-small;
		margin-bottom: $spacing-large;
		font-size: $font-size-small;

		&__link {
			color: var(--color-text-muted);

			&:hover {
				color: var(--amber-700);
			}
		}

		&__separator {
			color: var(--color-text-muted);
		}

		&__current {
			color: var(--amber-700);
			font-weight: $font-weight-medium;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 200px;
		}
	}
</style>