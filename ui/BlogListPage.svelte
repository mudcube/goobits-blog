<script>
	import './BlogListPage.scss'
	import PostList from './PostList.svelte'
	import Sidebar from './Sidebar.svelte'
	import { blogConfig, defaultMessages } from '@goobits/blog/config'
	import { createMessageGetter } from '@goobits/blog/utils'
	import { onMount } from 'svelte'
	import { slugify } from '@goobits/blog/utils'

	let { data, messages = {}, locale = 'en' } = $props()
	
	// Create message getter
	const getMessage = createMessageGetter({ ...defaultMessages, ...messages })

	const POSTS_PER_BATCH = blogConfig.pagination.postsPerBatch

	// State for infinite scroll
	let allPosts = $state([...data.posts]) // Start with SSR posts
	let isLoading = $state(false)
	let currentPage = $state(1) // Track current page for API calls
	let hasMorePosts = $state(data.hasMorePosts !== false) // Use server data or default to true

	// Use allPosts as the visible posts (no more slicing)
	let visiblePosts = $derived(allPosts)

	// Initialize posts from server data
	$effect(() => {
		if (data.posts && data.posts.length > 0) {
			allPosts = [...data.posts]
			hasMorePosts = data.hasMorePosts !== false
		}
	})

	let loadingElement = $state(null)
	let observer = $state(null)

	/**
	 * Loads the next batch of posts from the API for infinite scrolling.
	 */
	async function loadMorePosts() {
		if (isLoading || !hasMorePosts) return

		isLoading = true
		try {
			const nextPage = currentPage + 1
			const params = new URLSearchParams({
				page: nextPage.toString(),
				limit: POSTS_PER_BATCH.toString(),
				lang: data.lang || locale || 'en'
			})

			// Add category/tag filters if present
			if (data.pageType === 'category' && data.category) {
				params.set('category', data.category)
			}
			if (data.pageType === 'tag' && data.tag) {
				params.set('tag', data.tag)
			}

			const response = await fetch(`/api/blog/posts?${params}`)
			if (!response.ok) {
				throw new Error(`Failed to fetch posts: ${response.statusText}`)
			}

			const result = await response.json()
			if (result.posts && result.posts.length > 0) {
				allPosts = [...allPosts, ...result.posts]
				currentPage = nextPage
				hasMorePosts = result.pagination.hasNextPage
			} else {
				hasMorePosts = false
			}
		} catch (error) {
			console.error('Error loading more posts:', error)
			hasMorePosts = false
		} finally {
			isLoading = false
		}
	}

	/**
	 * Formats a number based on the provided locale.
	 * @param {number} value - The number to format.
	 * @returns {string} The formatted number string.
	 */
	function formatNumber(value) {
		return new Intl.NumberFormat(locale).format(value)
	}

	/**
	 * Generates a URL for a blog category or tag.
	 * @param {string} value - The category or tag name.
	 * @param {string} type - The type of link ('category' or 'tag').
	 * @returns {string} The generated URL.
	 */
	function getLink(value, type) {
		return `${ blogConfig.uri }/${ type }/${ slugify(value) }`
	}

	onMount(() => {
		// Only set up infinite scroll if there might be more posts
		if (hasMorePosts) {
			observer = new IntersectionObserver((entries) => {
				const entry = entries[0]
				if (entry.isIntersecting && hasMorePosts && !isLoading) {
					loadMorePosts()
				}
			}, {
				rootMargin: blogConfig.pagination.observerRootMargin,
				threshold: blogConfig.pagination.observerThreshold
			})

			if (loadingElement) {
				observer.observe(loadingElement)
			} else {
				console.warn('Loading element not available to observe for infinite scroll.')
			}
		}

		return () => {
			if (observer && loadingElement) {
				observer.unobserve(loadingElement)
				observer.disconnect()
			}
		}
	})
</script>

<div class="goo__layout">
	<div class="goo__main">
		<div class="goo__header">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="goo__header-icon">
				<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
			</svg>
			<h1>
				{#if data.pageType === 'index'}
					{blogConfig.name}
				{:else if data.pageType === 'category'}
					{data.category}
				{:else if data.pageType === 'tag'}
					#{data.tag}
				{/if}
			</h1>
		</div>

		{#if data.pageType === 'index'}
			<p class="goo__description">{blogConfig.pageContent.homepageDescription}</p>
		{:else if data.pageType === 'category' && data.categoryDescription}
			<p class="goo__description">{data.categoryDescription}</p>
		{:else if data.pageType === 'tag'}
			<p class="goo__description">{getMessage('exploreArticles', `Explore articles tagged with "${data.tag || 'keyword'}"`, data.tag || 'keyword')}</p>
		{/if}

		<PostList
			posts={visiblePosts}
			currentTag={data.currentTag || ""}
			{messages}
			{locale}
		/>

		{#if data.posts && data.posts.length > 0}
			<div class="goo__posts-info">
				{getMessage('itemCount', `${visiblePosts.length} items`, visiblePosts.length)}
			</div>
		{/if}

		<div class="goo__pagination" bind:this={loadingElement}>
			{#if hasMorePosts}
				<div class="goo__pagination-controls">
					{#if isLoading}
						<div class="goo__loading-indicator">
							<svg class="goo__spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="goo__spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="goo__spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span>{getMessage('loading', 'Loading...')}</span>
						</div>
					{/if}
				</div>
			{:else if data.posts && data.posts.length > 0 && visiblePosts.length >= data.posts.length && visiblePosts.length > POSTS_PER_BATCH}
				<div class="goo__pagination-controls">
					<span class="goo__end-message">
						{getMessage('noMorePosts', 'No more posts to load')}
					</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="goo__sidebar">
		<Sidebar
			posts={data.allPosts}
			activeTag={data.currentTag || ""}
			activeCategory={data.currentCategory || ""}
			{messages}
			{locale}
		/>
	</div>
</div>

