<script>
	/**
	 * PostList Component
	 *
	 * Displays a collection of blog posts with configurable layouts, pagination, and filtering.
	 *
	 * Features:
	 * - Multiple layout options: grid, list, and featured (with highlighted first post)
	 * - Configurable column count for grid layouts
	 * - Built-in pagination system with adaptive display for many pages
	 * - Content visibility options (hide images, excerpts, metadata)
	 * - Context-aware filtering by tags or categories
	 * - Empty state handling with internationalized messages
	 *
	 * Layouts:
	 * - 'grid': Regular grid of posts with configurable columns (1-4)
	 * - 'list': Vertical list of posts, suitable for mobile or sidebar
	 * - 'featured': Highlights the first post, shows 4 secondary posts, then grid layout
	 *
	 * @component
	 */
	import './PostList.scss'
	import BlogCard from './BlogCard.svelte'
	import { ClassNames, bemClasses, propertyModifier, createMessageGetter } from '@goobits/blog/utils/index.js'
	import { defaultMessages } from '@goobits/blog/config/index.js'

	/**
	 * @typedef {Object} PostListProps
	 * @property {Array} posts - Array of processed posts to display
	 * @property {boolean} [isCompact] - Whether to display in compact mode
	 * @property {boolean} [hideImages] - Whether to hide all post images
	 * @property {boolean} [hideExcerpts] - Whether to hide all post excerpts
	 * @property {boolean} [hideAuthors] - Whether to hide all post authors
	 * @property {boolean} [hideDates] - Whether to hide all post dates
	 * @property {boolean} [hideReadTimes] - Whether to hide all post read times
	 * @property {string} [layout] - Layout type (grid, list, featured)
	 * @property {number} [columns] - Number of columns in grid layout
	 * @property {string} [imageRatio] - Default aspect ratio for images
	 * @type {PostListProps}
	 */
	let {
		posts = [],
		// Visibility options
		hideImages = false,
		hideExcerpts = false,
		hideAuthors = false,
		hideDates = false,
		hideReadTimes = false,
		// Layout options
		layout = 'grid', // 'grid', 'list', 'featured'
		columns = 1, // Default to 1 column, can be set to 1-4
		// Blog card options
		isCompact = false,
		imageRatio = 'landscape',
		// Pagination
		postsPerPage = 0, // 0 = show all
		currentPage = 1,
		showPagination = false,
		// Misc
		className = '',
		maxTags = 3,
		currentTag = '',
		currentCategory = '',
		type = 'tags', // 'tags' or 'categories'
		messages = {}
	} = $props()

	// Create message getter
	const getMessage = createMessageGetter({ ...defaultMessages, ...messages })

	// Define state variables
	let visiblePosts = $state(posts)
	let totalPages = $state(1)

	// Calculate what posts to display based on pagination
	$effect(() => {
		if (postsPerPage > 0 && posts.length > postsPerPage) {
			const startIndex = (currentPage - 1) * postsPerPage
			visiblePosts = posts.slice(startIndex, startIndex + postsPerPage)
			totalPages = Math.ceil(posts.length / postsPerPage)
		} else {
			visiblePosts = posts
			totalPages = 1
		}
	})

	// Helper to create an array of page numbers for pagination
	const getPageNumbers = $derived.by(() => {
		// Simple case: 7 or fewer pages
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1)
		}

		// Complex case: more than 7 pages, need to limit displayed pages
		const pages = []

		// Always include first and last page
		pages.push(1)

		// If current page is close to start
		if (currentPage <= 4) {
			pages.push(2, 3, 4, 5, '...', totalPages)
		}
		// If current page is close to end
		else if (currentPage >= totalPages - 3) {
			pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
		}
		// If current page is in the middle
		else {
			pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
		}

		return pages
	})

	const getColumnClass = $derived.by(() => {
		if (columns > 0 && columns <= 4) return propertyModifier('goo__post-list-grid', 'columns', columns)
		return propertyModifier('goo__post-list-grid', 'columns', 1) // Ensure we always have a class that enforces single column
	})
</script>

<div class={bemClasses(ClassNames.postList, { modifiers: [`layout-${layout}`], className })}>
	{#if layout === 'featured' && posts.length > 0}
		<!-- Featured layout with first post highlighted -->
		<div class="goo__post-list-featured-layout">
			<div class="goo__post-list-featured-post">
				<BlogCard
						post={posts[0]}
						isHighlighted={true}
						hideImage={hideImages}
						hideExcerpt={hideExcerpts}
						hideAuthor={hideAuthors}
						hideDate={hideDates}
						hideReadTime={hideReadTimes}
						imageRatio={imageRatio}
						maxTags={maxTags}
						currentTag={type === 'tags' ? currentTag : ''}
						currentCategory={type === 'categories' ? currentCategory : ''}
						messages={messages}
				/>
			</div>

			<div class="goo__post-list-secondary-posts">
				{#each visiblePosts.slice(1, 5) as post}
					<BlogCard
							post={post}
							isCompact={true}
							hideImage={hideImages}
							hideExcerpt={true}
							hideAuthor={hideAuthors}
							hideDate={hideDates}
							hideReadTime={hideReadTimes}
							maxTags={maxTags}
							currentTag={type === 'tags' ? currentTag : ''}
							currentCategory={type === 'categories' ? currentCategory : ''}
							messages={messages}
					/>
				{/each}
			</div>
		</div>

		<!-- Remaining posts in grid -->
		{#if visiblePosts.length > 5}
			<div class={bemClasses('goo__post-list-grid', { className: getColumnClass })}>
				{#each visiblePosts.slice(5) as post}
					<BlogCard
							post={post}
							isCompact={isCompact}
							hideImage={hideImages}
							hideExcerpt={hideExcerpts}
							hideAuthor={hideAuthors}
							hideDate={hideDates}
							hideReadTime={hideReadTimes}
							imageRatio={imageRatio}
							maxTags={maxTags}
							currentTag={type === 'tags' ? currentTag : ''}
							currentCategory={type === 'categories' ? currentCategory : ''}
							messages={messages}
					/>
				{/each}
			</div>
		{/if}
	{:else if layout === 'grid'}
		<!-- Grid layout -->
		<div class={bemClasses('goo__post-list-grid', { className: getColumnClass })}>
			{#each visiblePosts as post}
				<BlogCard
						post={post}
						isCompact={isCompact}
						hideImage={hideImages}
						hideExcerpt={hideExcerpts}
						hideAuthor={hideAuthors}
						hideDate={hideDates}
						hideReadTime={hideReadTimes}
						imageRatio={imageRatio}
						maxTags={maxTags}
						currentTag={type === 'tags' ? currentTag : ''}
						currentCategory={type === 'categories' ? currentCategory : ''}
						messages={messages}
				/>
			{/each}
		</div>
	{:else}
		<!-- List layout (default) -->
		<div class="goo__post-list-list">
			{#each visiblePosts as post}
				<BlogCard
						post={post}
						isCompact={isCompact}
						hideImage={hideImages}
						hideExcerpt={hideExcerpts}
						hideAuthor={hideAuthors}
						hideDate={hideDates}
						hideReadTime={hideReadTimes}
						imageRatio={imageRatio}
						maxTags={maxTags}
						currentTag={type === 'tags' ? currentTag : ''}
						currentCategory={type === 'categories' ? currentCategory : ''}
						messages={messages}
				/>
			{/each}
		</div>
	{/if}

	<!-- Pagination -->
	{#if showPagination && totalPages > 1}
		<nav class="goo__post-list-pagination" aria-label="Blog pagination">
			<button
					class="goo__post-list-pagination-prev"
					disabled={currentPage === 1}
					aria-label={getMessage('paginationPrevious', 'Previous')}
					onclick={() => currentPage > 1 && (currentPage--)}
			>
				&larr;
			</button>

			<div class="goo__post-list-pagination-numbers">
				{#each getPageNumbers as page}
					{#if page === '...'}
						<span class="goo__post-list-pagination-ellipsis">...</span>
					{:else}
						<button
								class={bemClasses('goo__post-list-pagination-number', { modifiers: page === currentPage ? ['state-current'] : [] })}
								aria-label={getMessage('paginationPage', `Page ${page}`, page)}
								aria-current={page === currentPage ? 'page' : undefined}
								onclick={() => (currentPage = page)}
						>
							{page}
						</button>
					{/if}
				{/each}
			</div>

			<button
					class="goo__post-list-pagination-next"
					disabled={currentPage === totalPages}
					aria-label={getMessage('paginationNext', 'Next')}
					onclick={() => currentPage < totalPages && (currentPage++)}
			>
				&rarr;
			</button>
		</nav>
	{/if}

	<!-- Empty state -->
	{#if posts.length === 0}
		<div class="goo__post-list-empty-state">
			<p>{getMessage('emptySearchResults', 'No posts found.')}</p>
		</div>
	{/if}
</div>

