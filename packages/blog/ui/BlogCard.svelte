<script>
	/**
	 * BlogCard Component
	 * 
	 * Displays a blog post card with configurable appearance, including featured image,
	 * title, excerpt, author info, publication date, read time, and taxonomies (tags/categories).
	 * 
	 * Features:
	 * - Compact and highlighted display modes
	 * - Customizable content visibility (image, excerpt, metadata)
	 * - Handling for missing images with emoji placeholders
	 * - Current tag/category context awareness
	 * - Internationalization support via messages prop
	 * 
	 * @component
	 */
	import './BlogCard.scss'
	import TagsCategories from './TagCategoryList.svelte'
	import { bemClasses, ClassNames, createMessageGetter, getEmojiFromTitle, getPostImageData, getPostCategories, getBlogUrl } from '@goobits/blog/utils/index.js'
	import { blogConfig, defaultMessages } from '@goobits/blog/config/index.js'

	/**
	 * @typedef {Object} BlogCardProps
 * @property {Object} post - The processed post data  
 * @property {boolean} [isCompact] - Whether to display the card in compact mode
 * @property {boolean} [isHighlighted] - Whether the card should be highlighted
 * @property {boolean} [hideImage] - Whether to hide the post image
 * @property {boolean} [hideExcerpt] - Whether to hide the post excerpt
 * @property {boolean} [hideAuthor] - Whether to hide the post author
 * @property {boolean} [hideDate] - Whether to hide the post date
 * @property {boolean} [hideReadTime] - Whether to hide the post read time
 * @property {string} [imageRatio] - Aspect ratio of the image
 * @property {string} [className] - Additional CSS class name
 * @type {BlogCardProps}
	 */
	const {
		post,
		isCompact = false,
		isHighlighted = false,
		hideImage = false,
		hideExcerpt = false,
		hideAuthor = false,
		hideDate = false,
		hideReadTime = false,
		imageRatio = 'landscape',
		className = '',
		currentTag = '',
			currentCategory: _currentCategory = '',
		messages = {},
		locale = 'en'
	} = $props()

	const getMessage = $derived.by(() => createMessageGetter({ ...defaultMessages, ...messages }))
	const imageData = $derived.by(() => getPostImageData(post))
	const emoji = $derived.by(() => (
		post?.metadata?.fm?.emoji ||
		getEmojiFromTitle(post?.metadata?.fm?.title, blogConfig.pageContent.emptyStateEmoji)
	))
	const categories = $derived.by(() => getPostCategories(post))
	const primaryCategory = $derived.by(() => (
		categories[0] || getMessage('uncategorized', 'Uncategorized')
	))
	const cardModifiers = $derived.by(() => {
		const modifiers = []
		if (isCompact) {modifiers.push('size-compact')}
		if (isHighlighted) {modifiers.push('highlighted')}
		return modifiers
	})
	const filteredTags = $derived.by(() => (
		currentTag && post?.metadata?.fm?.tags
			? post.metadata.fm.tags.filter(tag => tag !== currentTag)
			: post?.metadata?.fm?.tags || []
	))
	const defaultExcerpt = $derived.by(() => getMessage('noPosts', 'No posts available'))
	const readMoreText = $derived.by(() => getMessage('readMore', 'Read more'))
	const readTime = $derived.by(() => (
		post?.metadata?.fm?.readTime || blogConfig.posts.readTime.defaultTime
	))
</script>

<article class={bemClasses(ClassNames.blogCard, { modifiers: cardModifiers, className })}>
	<div class="goo__card-layout">
		{#if !hideImage}
			<div class="goo__card-image">
				<a href={getBlogUrl({ type: 'post', data: post })} class="goo__card-image-link">
					{#if imageData.src}
						<img
								src={imageData.src}
								alt={imageData.alt}
								data-ratio={imageRatio}
								loading="lazy"
								decoding="async"
								class="goo__card-image-element"
						/>
					{:else}
						<div class="goo__card-placeholder" data-theme-color="{blogConfig.theme.colors.primary}">
							<span class="goo__card-emoji">{emoji}</span>
						</div>
					{/if}
				</a>
			</div>
		{/if}

		<div class="goo__card-content">
			{#if primaryCategory && primaryCategory !== getMessage('uncategorized', 'Uncategorized')}
				<div class="goo__card-category-container">
					<span class="goo__card-category">
						<a href={getBlogUrl({ type: 'category', data: primaryCategory })} class="goo__card-category-link">
							{primaryCategory}
						</a>
					</span>
				</div>
			{/if}

			<h2 class="goo__card-title">
				<a href={getBlogUrl({ type: 'post', data: post })} class="goo__card-title-link">
					{post?.metadata?.fm?.title || getMessage('untitledPost', 'Untitled Post')}
				</a>
			</h2>

			<div class="goo__card-meta">
				{#if !hideDate}
					<time class="goo__card-date">{post?.date ? new Intl.DateTimeFormat(locale).format(new Date(post.date)) : ''}</time>
				{/if}

				{#if !hideReadTime}
					<span class="goo__card-read-time">
						{getMessage('minRead', `${readTime} min read`, readTime)}
					</span>
				{/if}

				{#if !hideAuthor && post?.metadata?.fm?.author?.name}
					<span class="goo__card-author">
						{getMessage('by', 'by')} {post?.metadata?.fm?.author?.name}
					</span>
				{/if}
			</div>

			{#if !hideExcerpt}
				<div class="goo__card-excerpt-wrapper">
					<p class="goo__card-excerpt">
						{post?.metadata?.fm?.excerpt || defaultExcerpt}
					</p>
				</div>
			{/if}

			{#if filteredTags.length > 0}
				<TagsCategories
						items={filteredTags}
						type="tags"
						variant="sidebar"
						showHashtag={true}
						gap={isCompact ? "small" : "medium"}
						className="goo__card-tags"
						{messages}
						{locale}
				/>
			{/if}

			<div class="goo__card-read-more">
				<a href={getBlogUrl({ type: 'post', data: post })} class="goo__card-read-more-link">
					{readMoreText}
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="goo__card-icon">
						<path d="M5 12h14"></path>
						<path d="m12 5 7 7-7 7"></path>
					</svg>
				</a>
			</div>
		</div>
	</div>
</article>
