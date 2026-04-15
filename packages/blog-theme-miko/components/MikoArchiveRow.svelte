<script>
	import { blogConfig, formatDate, getCoverImageUrl, slugify } from '@goobits/blog/core'

	const { post } = $props()

	const postUrl = $derived(`${blogConfig.uri}${post.urlPath}`)
	const coverImage = $derived(getCoverImageUrl(post, ''))
	const categories = $derived(post.metadata?.fm?.categories || [])
	const primaryCategory = $derived(post.metadata?.fm?.category || categories[0] || '')
	const tags = $derived(post.metadata?.fm?.tags || [])
</script>

<article class="miko-blog__row">
	<div class="miko-blog__row-date">
		<div class="miko-blog__row-date-day">{formatDate(post.date)}</div>
	</div>

	<div class="miko-blog__row-main">
		{#if coverImage}
			<a class="miko-blog__row-thumb-link" href={postUrl} aria-hidden="true" tabindex="-1">
				<img
					class="miko-blog__row-thumb"
					src={coverImage}
					alt={post.metadata?.fm?.image?.alt || post.metadata?.fm?.title || 'Journal cover image'}
					loading="lazy"
					decoding="async"
				/>
			</a>
		{/if}

		<div class="miko-blog__row-copy">
			{#if primaryCategory}
				<a class="miko-blog__row-category" href={`${blogConfig.uri}/category/${slugify(primaryCategory)}`}>
					{primaryCategory}
				</a>
			{/if}

			<h2 class="miko-blog__row-title">
				<a href={postUrl}>{post.metadata?.fm?.title || 'Untitled entry'}</a>
			</h2>

			{#if post.metadata?.fm?.excerpt}
				<p class="miko-blog__row-excerpt">{post.metadata.fm.excerpt}</p>
			{/if}

			{#if tags.length > 0}
				<ul class="miko-blog__row-tags" aria-label="Entry tags">
					{#each tags.slice(0, 4) as tag}
						<li>
							<a href={`${blogConfig.uri}/tag/${slugify(tag)}`}>#{tag}</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class="miko-blog__row-link">
		<a href={postUrl} aria-label={`Open ${post.metadata?.fm?.title || 'journal entry'}`}>View</a>
	</div>
</article>
