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
	const authorAvatar = $derived(post ? getAuthorAvatarUrl(post, '') : '')
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
	<article class="miko-blog__entry">
		<header class="miko-blog__entry-header">
			<a class="miko-blog__back-link" href={blogConfig.uri}>Back to archive</a>

			{#if categories.length > 0}
				<div class="miko-blog__entry-categories">
					{#each categories as category}
						<a class="miko-blog__entry-category" href={taxonomyHref('category', category)}>{category}</a>
					{/each}
				</div>
			{/if}

			<h1 class="miko-blog__entry-title">{post.metadata?.fm?.title || 'Untitled entry'}</h1>

			<div class="miko-blog__entry-meta">
				<span>{formatDate(post.date)}</span>
				<span>{post.metadata?.fm?.readTime || 5} min read</span>
				{#if post.metadata?.fm?.author?.name}
					<span>{post.metadata.fm.author.name}</span>
				{/if}
			</div>

			{#if coverImage}
				<div class="miko-blog__entry-hero">
					<img
						class="miko-blog__entry-image"
						src={coverImage}
						alt={post.metadata?.fm?.image?.alt || post.metadata?.fm?.title || 'Journal cover image'}
						loading="eager"
						decoding="async"
					/>
				</div>
			{/if}

			{#if authorAvatar || post.metadata?.fm?.author?.name}
				<div class="miko-blog__entry-author">
					{#if authorAvatar}
						<img
							class="miko-blog__entry-author-avatar"
							src={authorAvatar}
							alt={post.metadata?.fm?.author?.name || blogConfig.appName || blogConfig.name}
							width="56"
							height="56"
							loading="lazy"
						/>
					{/if}

					<div>
						<p class="miko-blog__entry-author-name">{post.metadata?.fm?.author?.name || blogConfig.appName || blogConfig.name}</p>
						<p class="miko-blog__entry-author-role">Journal author</p>
					</div>
				</div>
			{/if}
		</header>

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

		<footer class="miko-blog__entry-footer">
			{#if tags.length > 0}
				<section class="miko-blog__entry-tags">
					<h2>Tags</h2>
					<ul>
						{#each tags as tag}
							<li>
								<a href={taxonomyHref('tag', tag)}>#{tag}</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if relatedPosts.length > 0}
				<section class="miko-blog__related">
					<h2>Related entries</h2>
					<div class="miko-blog__related-grid">
						{#each relatedPosts as relatedPost (relatedPost.urlPath)}
							<a class="miko-blog__related-card" href={postHref(relatedPost)}>
								<span class="miko-blog__related-date">{formatDate(relatedPost.date)}</span>
								<strong>{relatedPost.metadata?.fm?.title || 'Untitled entry'}</strong>
								<span>{relatedPost.metadata?.fm?.excerpt || 'Open entry'}</span>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		</footer>
	</article>
{/if}
