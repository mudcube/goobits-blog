<script>
	import { blogConfig, formatDate, getCoverImageUrl, slugify } from '@goobits/blog/core'
	import { formatLabel } from '../utils/formatLabel.ts'

	const { post } = $props()

	const postUrl = $derived(`${blogConfig.uri}${post.urlPath}`)
	const coverImage = $derived(getCoverImageUrl(post, ''))
	const categories = $derived(post.metadata?.fm?.categories || [])
	const primaryCategory = $derived(post.metadata?.fm?.category || categories[0] || '')
	const tags = $derived(post.metadata?.fm?.tags || [])
	const readTime = $derived(post.metadata?.fm?.readTime || 5)
	const title = $derived(post.metadata?.fm?.title || 'Untitled entry')
	const excerpt = $derived(post.metadata?.fm?.excerpt || '')
	const thumbAlt = $derived(post.metadata?.fm?.image?.alt || title || 'Journal cover image')
</script>

<article class="miko-blog__row">
	<div class="miko-blog__cell miko-blog__cell--date">
		<div class="miko-blog__row-date-day">{formatDate(post.date)}</div>
		<div class="miko-blog__row-date-meta">{readTime} min read</div>
	</div>

	<div class="miko-blog__cell miko-blog__cell--detail">
		{#if coverImage}
			<div class="miko-blog__row-thumb-wrap" aria-hidden="true">
				<img
					class="miko-blog__row-thumb"
					src={coverImage}
					alt={thumbAlt}
					loading="lazy"
					decoding="async"
				/>
			</div>
		{/if}
		<div class="miko-blog__row-copy">
			<h3 class="miko-blog__row-title">
				<a class="miko-blog__row-link" href={postUrl}>{title}</a>
			</h3>
			{#if excerpt}
				<p class="miko-blog__row-excerpt">{excerpt}</p>
			{/if}
		</div>
	</div>

	<div class="miko-blog__cell miko-blog__cell--tax">
		<div class="miko-blog__row-pills">
			{#if primaryCategory}
				<a
					class="miko-blog__row-pill miko-blog__row-pill--accent"
					href={`${blogConfig.uri}/category/${slugify(primaryCategory)}`}
				>
					{formatLabel(primaryCategory)}
				</a>
			{/if}
			{#each tags.slice(0, 2) as tag}
				<a
					class="miko-blog__row-pill"
					href={`${blogConfig.uri}/tag/${slugify(tag)}`}
				>
					{formatLabel(tag)}
				</a>
			{/each}
		</div>
	</div>

	<div class="miko-blog__cell miko-blog__cell--arrow" aria-hidden="true">
		<span class="miko-blog__row-arrow">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="7" y1="17" x2="17" y2="7"></line>
				<polyline points="7 7 17 7 17 17"></polyline>
			</svg>
		</span>
	</div>
</article>
