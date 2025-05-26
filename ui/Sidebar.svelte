<script>
	/**
	 * Sidebar Component
	 *
	 * A blog sidebar component that provides navigation to categories and tags,
	 * RSS subscription, and newsletter signup. Dynamically adjusts display order
	 * based on the current page context and highlights active items.
	 *
	 * Features:
	 * - Displays popular categories and tags with active item highlighting
	 * - Context-aware ordering (shows relevant taxonomy first)
	 * - RSS feed subscription link
	 * - Newsletter signup form
	 * - URL-based active item detection with fallback to props
	 * - Fully internationalized labels via messages prop
	 * - Responsive design for various screen sizes
	 *
	 * @component
	 */
	import Newsletter from './Newsletter.svelte'
	import TagsCategories from './TagCategoryList.svelte'
	import { blogConfig, defaultMessages } from '@goobits/blog/config'
	import { getAllCategories, getAllTags, createMessageGetter } from '@goobits/blog/utils'
	import './Sidebar.scss'

	/**
	 * @typedef {Object} Props
	 * @property {Array} posts - Full array of blog posts to extract categories and tags from
	 * @property {string} [activeCategory=''] - Currently active category (for highlighting)
	 * @property {string} [activeTag=''] - Currently active tag (for highlighting)
	 * @property {number} [maxCategories] - Maximum number of categories to display
	 * @property {number} [maxTags] - Maximum number of tags to display
	 */

	/** @type {Props} */
	let {
		posts = [],
		activeCategory = '',
		activeTag = '',
		maxCategories = blogConfig.posts.popularCategoriesCount,
		maxTags = blogConfig.posts.popularTagsCount,
		messages = {},
		locale = 'en'
	} = $props()
	
	// Create message getter
	const getMessage = createMessageGetter({ ...defaultMessages, ...messages })

	// Extract categories and tags from posts
	const categories = getAllCategories(posts, maxCategories)
	const tags = getAllTags(posts, maxTags)

	// Use the active tag/category directly from props
	// No need for complex URL parsing since the server already provides the correct values
</script>

{#if activeTag}
	<!-- Popular tags first when viewing a tag page -->
	<h2 class="goo__sidebar-heading">{getMessage('tags', 'Tags')}</h2>
	<TagsCategories
			items={tags}
			currentItem={activeTag}
			type="tags"
			baseUrl={`${blogConfig.uri}/tag`}
			variant="sidebar"
			showHashtag={true}
			className="goo__sidebar-tags"
			{messages}
			{locale}
	/>

	<!-- Categories -->
	<h2 class="goo__sidebar-heading">{getMessage('categories', 'Categories')}</h2>
	<TagsCategories
			items={categories}
			currentItem={activeCategory}
			type="categories"
			baseUrl={`${blogConfig.uri}/category`}
			variant="sidebar"
			showHashtag={false}
			className="goo__sidebar-categories"
			{messages}
			{locale}
	/>
{:else}
	<!-- Categories first on other pages -->
	<h2 class="goo__sidebar-heading">{getMessage('categories', 'Categories')}</h2>
	<TagsCategories
			items={categories}
			currentItem={activeCategory}
			type="categories"
			baseUrl={`${blogConfig.uri}/category`}
			variant="sidebar"
			showHashtag={false}
			className="goo__sidebar-categories"
			{messages}
			{locale}
	/>

	<!-- Popular tags -->
	<h2 class="goo__sidebar-heading">{getMessage('tags', 'Tags')}</h2>
	<TagsCategories
			items={tags}
			currentItem={activeTag}
			type="tags"
			baseUrl={`${blogConfig.uri}/tag`}
			variant="sidebar"
			showHashtag={true}
			className="goo__sidebar-tags"
			{messages}
			{locale}
	/>
{/if}

<!-- RSS Feed Link -->
<div class="goo__sidebar-rss-container">
	<h2 class="goo__sidebar-heading" id="rss-heading">{getMessage('subscribe', 'Subscribe')}</h2>
	<a
			href={`${blogConfig.uri}/rss.xml`}
			class="goo__sidebar-rss-link"
			target="_blank"
			rel="noopener"
			aria-labelledby="rss-heading"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="goo__sidebar-rss-icon" aria-hidden="true">
			<path d="M4 11a9 9 0 0 1 9 9"></path>
			<path d="M4 4a16 16 0 0 1 16 16"></path>
			<circle cx="5" cy="19" r="1"></circle>
		</svg>
		{getMessage('subscribeRSS', 'Subscribe to RSS')}
	</a>
</div>

<!-- Newsletter Signup -->
<div class="goo__sidebar-newsletter-container">
	<Newsletter {messages} {locale} />
</div>