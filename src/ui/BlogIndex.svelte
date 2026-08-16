<script lang="ts">
	import { GooButton } from '@goobits/goo/button'
	import { GooInput } from '@goobits/goo/input'
	import { GooSelect } from '@goobits/goo/select'
	import { GooSpinner } from '@goobits/goo/spinner'
	import { onDestroy, untrack } from 'svelte'
	import './blogTheme.css'

	import type { BlogConfig } from '../config/blogConfig.js'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'
	import type { BlogPost } from '../core/blogPost.js'
	import type { BlogPostPage, BlogSort } from '../core/blogQuery.js'
	import type { BlogTaxonomyTerm } from '../core/blogTaxonomy.js'
	import { createBlogUrlResolver, type BlogUrlResolverInput } from '../core/blogUrls.js'
	import BlogCard from './BlogCard.svelte'
	import { createBlogFilterNavigation, type BlogFilterNavigate } from './blogFilters.js'

	type PaginationMode = 'pages' | 'load-more' | 'infinite'

	interface Props {
		posts: BlogPost[]
		config: BlogConfig
		categories?: BlogTaxonomyTerm[]
		tags?: BlogTaxonomyTerm[]
		totalPosts?: number
		page?: number
		pageSize?: number
		hasMorePosts?: boolean
		pageType?: 'index' | 'category' | 'tag'
		term?: string
		search?: string
		sort?: BlogSort
		paginationMode?: PaginationMode
		loadPage?: (_page: number) => Promise<BlogPostPage>
		pageHref?: (_page: number) => string
		messages?: BlogUiMessagesInput
		urlResolver?: BlogUrlResolverInput
		locale?: string
		class?: string
		navigate?: BlogFilterNavigate
	}

	const {
		posts,
		config,
		categories = [],
		tags = [],
		totalPosts = posts.length,
		page = 1,
		pageSize = config.pageSize,
		hasMorePosts = false,
		pageType = 'index',
		term = '',
		search = '',
		sort = 'newest',
		paginationMode = 'pages',
		loadPage,
		pageHref,
		messages: messageInput = {},
		urlResolver: urlResolverInput = {},
		locale = config.defaultLanguage,
		class: className = '',
		navigate
	}: Props = $props()

	const messages = $derived(createBlogUiMessages(messageInput))
	const urlResolver = $derived(createBlogUrlResolver(urlResolverInput))
	const totalPages = $derived(Math.max(1, Math.ceil(totalPosts / pageSize)))
	const title = $derived(pageType === 'index' ? config.name : term)
	let appendedPosts = $state<BlogPost[]>([])
	let loadedPage = $state<number | null>(null)
	let loadedHasMore = $state<boolean | null>(null)
	let loading = $state(false)
	let searchValue = $state(untrack(() => search))
	let sortValue = $state<BlogSort>(untrack(() => sort))
	const visiblePosts = $derived([ ...posts, ...appendedPosts ])
	const currentPage = $derived(loadedPage ?? page)
	const canLoadMore = $derived(loadedHasMore ?? hasMorePosts)
	const sortOptions = $derived({
		newest: messages.sortNewest,
		oldest: messages.sortOldest,
		title: messages.sortTitle
	})
	const navigateAdapter = untrack(() => navigate)
	const filterNavigation = createBlogFilterNavigation(navigateAdapter ? { navigate: navigateAdapter } : {})

	function getPageHref(pageNumber: number): string {
		if (pageHref) {return pageHref(pageNumber)}
		const params = [ `page=${ encodeURIComponent(String(pageNumber)) }` ]
		if (search) {params.push(`q=${ encodeURIComponent(search) }`)}
		if (sort !== 'newest') {params.push(`sort=${ encodeURIComponent(sort) }`)}
		return `?${ params.join('&') }`
	}

	$effect(() => {
		posts
		appendedPosts = []
		loadedPage = null
		loadedHasMore = null
	})

	$effect(() => {
		searchValue = search
		sortValue = sort
	})

	onDestroy(filterNavigation.cancel)

	function scheduleSearch(value: string): void {
		searchValue = value
		filterNavigation.scheduleSearch({ search: value, sort: sortValue })
	}

	function handleSort(value: string): void {
		sortValue = value as BlogSort
		void filterNavigation.apply({ search: searchValue, sort: sortValue })
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault()
		void filterNavigation.apply({ search: searchValue, sort: sortValue })
	}

	async function loadNextPage(): Promise<void> {
		if (!loadPage || loading || !canLoadMore) {return}
		loading = true
		try {
			const nextPage = await loadPage(currentPage + 1)
			const knownIds = new Set(visiblePosts.map(post => post.id))
			appendedPosts = [ ...appendedPosts, ...nextPage.posts.filter(post => !knownIds.has(post.id)) ]
			loadedPage = nextPage.page
			loadedHasMore = nextPage.hasNextPage
		} finally {
			loading = false
		}
	}

	function observeInfinite(node: HTMLElement): { destroy: () => void } {
		if (paginationMode !== 'infinite' || !loadPage || typeof IntersectionObserver === 'undefined') {
			return { destroy: () => {} }
		}
		const observer = new IntersectionObserver(entries => {
			if (entries.some(entry => entry.isIntersecting)) {void loadNextPage()}
		}, { rootMargin: '240px' })
		observer.observe(node)
		return { destroy: () => observer.disconnect() }
	}
</script>

<section class={['blog-index', className].filter(Boolean).join(' ')} aria-labelledby="blog-index-title">
	<header class="blog-index__header">
		<h1 id="blog-index-title">{title}</h1>
		{#if pageType === 'index' && config.description}<p>{config.description}</p>{/if}
		{#if categories.length > 0 || tags.length > 0}
			<nav class="blog-index__discovery" aria-label={messages.blogTopics}>
				{#each categories as category (category.slug)}
					<a href={urlResolver.taxonomy('category', category.slug, config)}>{category.name} <span>{category.count}</span></a>
				{/each}
				{#each tags as tag (tag.slug)}
					<a href={urlResolver.taxonomy('tag', tag.slug, config)}>#{tag.name} <span>{tag.count}</span></a>
				{/each}
			</nav>
		{/if}
		<form class="blog-index__filters" method="GET" aria-label={messages.searchAndSort} onsubmit={handleSubmit}>
			<div class="blog-index__search">
				<GooInput
					type="search"
					name="q"
					value={searchValue}
					oninput={scheduleSearch}
					ariaLabel={messages.searchPlaceholder}
					placeholder={messages.searchPlaceholder}
				/>
				<GooButton type="submit" label={messages.search} />
			</div>
			<GooSelect name="sort" value={sortValue} options={sortOptions} ariaLabel={messages.sort} onchange={handleSort} />
		</form>
	</header>

	{#if visiblePosts.length > 0}
		<div class="blog-index__grid">
			{#each visiblePosts as post (post.id)}
				<BlogCard {post} {config} currentTag={pageType === 'tag' ? term : ''} messages={messageInput} urlResolver={urlResolverInput} {locale} />
			{/each}
		</div>
	{:else}
		<p class="blog-index__empty">{messages.noPosts}</p>
	{/if}

	{#if paginationMode === 'pages' && totalPages > 1}
		<nav class="blog-index__pagination" aria-label={messages.blogPages}>
			{#if currentPage > 1}<a href={getPageHref(currentPage - 1)} rel="prev">{messages.previousPage}</a>{/if}
			<span>{messages.pageStatus(currentPage, totalPages)}</span>
			{#if currentPage < totalPages}<a href={getPageHref(currentPage + 1)} rel="next">{messages.nextPage}</a>{/if}
		</nav>
	{:else if canLoadMore}
		<div class="blog-index__more" use:observeInfinite>
			{#if loadPage}
				<GooButton onclick={() => void loadNextPage()} disabled={loading} aria-busy={loading}>
					{#if loading}<GooSpinner size={18} label={messages.loading} />{/if}
					<span>{loading ? messages.loading : messages.loadMore}</span>
				</GooButton>
			{:else}
				<a href={getPageHref(currentPage + 1)} rel="next">{messages.loadMore}</a>
			{/if}
		</div>
	{/if}
</section>
