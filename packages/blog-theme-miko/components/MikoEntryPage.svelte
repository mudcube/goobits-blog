<script>
	import {
		blogConfig,
		formatDate,
		getAuthorAvatarUrl,
		getCoverImageUrl,
		getSimilarPosts,
		slugify
	} from '@goobits/blog/core'

	const { data } = $props()

	const post = $derived(data.post ?? null)
	const postContentComponent = $derived(data.postContent || null)
	const allPosts = $derived(Array.isArray(data.allPosts) ? data.allPosts : [])
	const categories = $derived.by(() => {
		const categoryList = post?.metadata?.fm?.categories
		if (Array.isArray(categoryList) && categoryList.length > 0) {
			return categoryList
		}

		return post?.metadata?.fm?.category ? [ post.metadata.fm.category ] : []
	})
	const tags = $derived(post?.metadata?.fm?.tags || [])
	const coverImage = $derived(post ? getCoverImageUrl(post, '') : '')
	const coverAlt = $derived(post?.metadata?.fm?.image?.alt || post?.metadata?.fm?.title || 'Journal cover image')
	const authorAvatar = $derived(post ? getAuthorAvatarUrl(post, '') : '')
	const authorName = $derived(post?.metadata?.fm?.author?.name || blogConfig.appName || blogConfig.name)
	const readTime = $derived(post?.metadata?.fm?.readTime || 5)
	const primaryCategory = $derived(categories[0] || '')
	const title = $derived(post?.metadata?.fm?.title || 'Untitled entry')
	const excerpt = $derived(post?.metadata?.fm?.excerpt || '')
	const formattedDate = $derived(post ? formatDate(post.date) : '')

	const relatedPosts = $derived.by(() => {
		if (!post) { return [] }

		return getSimilarPosts(
			allPosts,
			post.path || '',
			post.metadata?.fm?.category || categories[0] || null,
			tags,
			3
		)
	})

	function taxonomyHref(type, item) {
		return `${blogConfig.uri}/${type}/${slugify(item)}`
	}

	function postHref(entry) {
		return `${blogConfig.uri}${entry.urlPath}`
	}
</script>

{#if post}
	<header class="miko-blog__entry-hero">
		<div class="miko-blog__entry-hero-inner">
			<nav class="miko-blog__breadcrumbs" aria-label="Breadcrumbs">
				<ol>
					<li>
						<a href={blogConfig.uri}>Journal</a>
						<span class="miko-blog__breadcrumbs-sep" aria-hidden="true">/</span>
					</li>
					{#if primaryCategory}
						<li>
							<a href={taxonomyHref('category', primaryCategory)}>{primaryCategory}</a>
							<span class="miko-blog__breadcrumbs-sep" aria-hidden="true">/</span>
						</li>
					{/if}
					<li>
						<span aria-current="page">{title}</span>
					</li>
				</ol>
			</nav>

			<p class="miko-blog__entry-eyebrow">
				<span>{formattedDate}</span>
				<span class="miko-blog__entry-eyebrow-dot" aria-hidden="true">·</span>
				<span>{readTime} min read</span>
			</p>

			<h1 class="miko-blog__entry-title">{title}</h1>

			{#if excerpt}
				<p class="miko-blog__entry-lede">{excerpt}</p>
			{/if}

			{#if authorName}
				<div class="miko-blog__entry-byline">
					{#if authorAvatar}
						<img
							class="miko-blog__entry-byline-avatar"
							src={authorAvatar}
							alt={authorName}
							width="44"
							height="44"
							loading="lazy"
						/>
					{/if}
					<div class="miko-blog__entry-byline-copy">
						<p class="miko-blog__entry-byline-name">{authorName}</p>
						<p class="miko-blog__entry-byline-role">Journal author</p>
					</div>
				</div>
			{/if}
		</div>

		{#if coverImage}
			<div class="miko-blog__entry-hero-image-wrap">
				<img
					class="miko-blog__entry-hero-image"
					src={coverImage}
					alt={coverAlt}
					loading="eager"
					fetchpriority="high"
					decoding="async"
				/>
			</div>
		{/if}
	</header>

	<section class="miko-blog__entry-body-section">
		<div class="miko-blog__entry-body">
			{#if postContentComponent}
				{@const SvelteComponent = postContentComponent}
				<div class="miko-blog__prose ui-prose">
					<SvelteComponent />
				</div>
			{:else}
				<p>Post content failed to load.</p>
			{/if}
		</div>
	</section>

	<section class="miko-blog__entry-footer-section">
		<div class="miko-blog__entry-footer">
			{#if tags.length > 0}
				<div class="miko-blog__entry-tags">
					<h2>Tags</h2>
					<ul>
						{#each tags as tag}
							<li>
								<a href={taxonomyHref('tag', tag)}>#{tag}</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if relatedPosts.length > 0}
				<div class="miko-blog__related">
					<h2>Related entries</h2>
					<div class="miko-blog__related-grid">
						{#each relatedPosts as relatedPost (relatedPost.urlPath)}
							<a class="miko-blog__related-card" href={postHref(relatedPost)}>
								<span class="miko-blog__related-date">{formatDate(relatedPost.date)}</span>
								<strong>{relatedPost.metadata?.fm?.title || 'Untitled entry'}</strong>
								<span class="miko-blog__related-excerpt">{relatedPost.metadata?.fm?.excerpt || 'Open entry'}</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</section>
{/if}
