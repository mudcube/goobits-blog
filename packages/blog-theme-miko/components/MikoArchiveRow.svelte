<script>
	import { blogConfig, formatDate, getCoverImageUrl, getPostUrl, slugify } from '@goobits/blog/core'
	import { getJournalImageVariants } from '../utils/journalImageVariants.ts'
	import { formatLabel } from '../utils/formatLabel.ts'

	const { post } = $props()

	const postUrl = $derived(getPostUrl(post))
	const coverImage = $derived(getCoverImageUrl(post, ''))
	const coverVariants = $derived(getJournalImageVariants(coverImage))
	const categories = $derived(post.metadata?.fm?.categories || [])
	const primaryCategory = $derived(post.metadata?.fm?.category || categories[0] || '')
	const tags = $derived(post.metadata?.fm?.tags || [])
	const readTime = $derived(post.metadata?.fm?.readTime || 5)
	const title = $derived(post.metadata?.fm?.title || 'Untitled entry')
	const excerpt = $derived(post.metadata?.fm?.excerpt || '')
	const thumbAlt = $derived(post.metadata?.fm?.image?.alt || title || 'Journal cover image')
</script>

<div class="miko-blog__row" role="row">
	<div class="miko-blog__cell miko-blog__cell--date" role="cell">
		<div class="miko-blog__row-date-day">{formatDate(post.date)}</div>
		<div class="miko-blog__row-date-meta">{readTime} min read</div>
	</div>

	<div class="miko-blog__cell miko-blog__cell--detail" role="cell">
		{#if coverImage}
			<div class="miko-blog__row-thumb-wrap" aria-hidden="true">
				{#if coverVariants}
					<picture>
						{#if coverVariants.avif}
							<source
								type={coverVariants.avif.type}
								srcset={coverVariants.avif.srcset}
								sizes="160px"
							/>
						{/if}
						{#if coverVariants.webp}
							<source
								type={coverVariants.webp.type}
								srcset={coverVariants.webp.srcset}
								sizes="160px"
							/>
						{/if}
						<img
							class="miko-blog__row-thumb"
							src={coverVariants.fallbackSrc}
							alt={thumbAlt}
							loading="lazy"
							decoding="async"
						/>
					</picture>
				{:else}
					<img
						class="miko-blog__row-thumb"
						src={coverImage}
						alt={thumbAlt}
						loading="lazy"
						decoding="async"
					/>
				{/if}
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

	<div class="miko-blog__cell miko-blog__cell--tax" role="cell">
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

	<div class="miko-blog__cell miko-blog__cell--arrow" role="cell" aria-hidden="true">
		<span class="miko-blog__row-arrow">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="7" y1="17" x2="17" y2="7"></line>
				<polyline points="7 7 17 7 17 17"></polyline>
			</svg>
		</span>
	</div>
</div>
