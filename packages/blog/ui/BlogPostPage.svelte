<script>
	import './BlogPostPage.scss'
	import SocialShare from './SocialShare.svelte'
	import TagCategoryList from './TagCategoryList.svelte'
	import { blogConfig, defaultMessages } from '@goobits/blog/config/index.js'
	import { Calendar, Clock, Share2, ChevronLeft } from '@lucide/svelte'
	import { createLogger } from '@goobits/blog/utils/logger.js'
	import {
		formatDate as utilFormatDate,
		slugify,
		getCoverImageUrl,
		getAuthorAvatarUrl,
		getEmojiFromTitle,
		getSimilarPosts,
		createMessageGetter
	} from '@goobits/blog/utils/index.js'

	const logger = createLogger('BlogPostPage')

	const { data, messages = {}, locale = 'en' } = $props()
	const getMessage = $derived.by(() => createMessageGetter({ ...defaultMessages, ...messages }))

	/**
	 * Safely retrieves the read time for the current post.
	 * @returns {number} The read time in minutes, or a default value.
	 */
	function getReadTime() {
		try {
			return post?.metadata?.fm?.readTime || 5
		} catch (error) {
			logger.error('Error accessing readTime:', error)
			return 5
		}
	}

	/**
	 * Gets the formatted date for the current post using the Paraglide locale.
	 * Falls back to a utility formatter on error.
	 * @returns {string} The formatted date string.
	 */
	function getFormattedDate() {
		try {
			return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' })
				.format(new Date(post?.date || Date.now()))
		} catch (error) {
			logger.error('Error formatting date with Intl:', error)
			return utilFormatDate(post?.date || new Date())
		}
	}

	/**
	 * Generates a URL for a blog category or tag.
	 * @param {string} value - The category or tag name.
	 * @param {string} type - The type of link ('category' or 'tag').
	 * @returns {string} The generated URL.
	 */
	function getLink(value, type) {
		return `${ blogConfig.uri || '/blog' }/${ type }/${ slugify(value) }`
	}

	/**
	 * Safely retrieves the primary category for the current post.
	 * @returns {string} The primary category name, or an empty string.
	 */
	function getPrimaryCategory() {
		try {
			return post?.metadata?.fm?.category || ''
		} catch (error) {
			logger.error('Error accessing category:', error)
			return ''
		}
	}

		const post = $derived(data.post ?? null)
		const postContentComponent = $derived(data.postContent || null)
		let copySuccess = $state(false)

	/**
	 * Copies the current page URL to the clipboard.
	 * @returns {Promise<void>}
	 */
	async function copyLink() {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(window.location.href)
				copySuccess = true
				setTimeout(() => {
					copySuccess = false
				}, 2000)
			} catch (err) {
				logger.error('Failed to copy URL:', err)
			}
		}
	}

		const isPostPage = $derived(data.pageType === 'post' && !!post)
		const readTime = $derived.by(() => (isPostPage ? getReadTime() : undefined))
		const formattedDate = $derived.by(() => (isPostPage ? getFormattedDate() : undefined))
		const postTitle = $derived(post?.metadata?.fm?.title)
		const coverImage = $derived.by(() => (post ? getCoverImageUrl(post) : undefined))
		const authorAvatar = $derived.by(() => (post ? getAuthorAvatarUrl(post) : undefined))
		const primaryCategory = $derived.by(() => (isPostPage ? getPrimaryCategory() : undefined))
		const titleEmoji = $derived.by(() => (
			post ? getEmojiFromTitle(post.metadata.fm.title || '', '🐝') : undefined
		))
		const currentPostId = $derived(post?.path)
		const currentCategory = $derived(post?.metadata?.fm?.category || (post?.metadata?.fm?.categories?.[0] || null))
		const currentTags = $derived(post?.metadata?.fm?.tags || [])
		const similarPosts = $derived.by(() => (
			isPostPage && Array.isArray(data.allPosts)
				? getSimilarPosts(data.allPosts, currentPostId, currentCategory, currentTags, 3)
				: []
		))

		/**
		 * Gets the cover image URL for a related post.
	 * @param {object} post - The related post object.
	 * @returns {string} The cover image URL or an empty string.
	 */
	function getRelatedPostImage(post) {
		return getCoverImageUrl(post, '') // Fallback to empty string if no image
	}
</script>

<div class="goo__post-content">
	<article>
			{#if primaryCategory}
				<div class="goo__category-container">
					<a href={getLink(primaryCategory, 'category')} class="goo__primary-category">
						{primaryCategory}
					</a>
				</div>
			{/if}

			<h1 class="goo__post-title">
					{post.metadata.fm.title}
			</h1>

			<div class="goo__post-meta">
				<div class="goo__post-meta-item goo__post-meta-date">
					<Calendar class="goo__post-meta-icon" />
					<span>{getMessage('publishedOn', 'Published on')}: {formattedDate}</span>
				</div>

				<div class="goo__post-meta-item goo__post-meta-readtime">
					<Clock class="goo__post-meta-icon" />
					<span>{getMessage('minRead', `${readTime} min read`, readTime)}</span>
				</div>

				<button
					onclick={copyLink}
					class="goo__post-meta-item goo__post-meta-share"
					title={getMessage('shareCopyLink', 'Copy Link')}
				>
					<Share2 class="goo__post-meta-icon" />
					<span>{copySuccess ? getMessage('linkCopied', 'Link copied to clipboard') : getMessage('sharePost', 'Share this post')}</span>
				</button>
			</div>

				{#if post.metadata.fm.image?.src}
					<div class="goo__featured-image">
						<img
							src={coverImage}
							alt={post.metadata.fm.image?.alt || post.metadata.fm.title || "Post image"}
						class="goo__image"
						loading="lazy"
						decoding="async"
					/>
				</div>
			{:else}
				<div class="goo__featured-image--placeholder">
					<span class="goo__featured-emoji">{titleEmoji}</span>
				</div>
			{/if}

			<div class="goo__author-section">
				<div class="goo__author-avatar">
					<img
							src={authorAvatar}
							alt={post.metadata.fm.author?.name || blogConfig.name}
						width={50}
						height={50}
						loading="lazy"
						class="goo__author-avatar-img"
					/>
				</div>
				<div>
					<p class="goo__author-name">{post.metadata.fm.author?.name || blogConfig.name}</p>
					<p class="goo__author-role">{getMessage('author', 'Author')}</p>
				</div>
			</div>

			<div class="goo__article-content">
				{#if postContentComponent}
					{@const SvelteComponent = postContentComponent}
					<article class="goo__content">
						<SvelteComponent />
					</article>
				{:else if data.pageType === 'post'}
					<p class="goo__error-message">{getMessage('loadingError', 'Error loading content')}</p>
				{/if}
			</div>

			{#if post.metadata.fm.tags?.length}
				<div class="goo__post-tags">
					<h3 class="goo__post-tags-heading">{getMessage('tags', 'Tags')}:</h3>
					<TagCategoryList
						items={post.metadata.fm.tags}
						showHashtag={true}
						variant="default"
						gap="medium"
						messages={messages}
					/>
				</div>
			{/if}

			<SocialShare
				url={typeof window !== 'undefined' ? window.location.href : ''}
				title={postTitle}
				messages={messages}
			/>

			{#if similarPosts && similarPosts.length > 0}
				<div class="goo__related-posts">
					<h2 class="goo__related-posts-heading">{getMessage('relatedPosts', 'Related Posts')}</h2>
					<div class="goo__related-posts-list">
						{#each similarPosts as post (post.urlPath)}
							<div class="goo__related-post">
								<a href={`${blogConfig.uri || '/blog'}${post.urlPath}`} class="goo__related-post-image-container">
									{#if post.metadata?.fm?.image?.src}
										<img
											src={getRelatedPostImage(post)}
											alt={post.metadata.fm.image.alt || post.metadata.fm.title}
											class="goo__image"
											loading="lazy"
										/>
									{:else}
										<div class="goo__related-post-placeholder">
											<span class="goo__related-post-emoji">{getEmojiFromTitle(post.metadata.fm.title)}</span>
										</div>
									{/if}
								</a>
								<div class="goo__related-post-content">
									{#if post.metadata?.fm?.categories?.[0] || post.metadata?.fm?.category}
										<a href={getLink(post.metadata.fm.categories?.[0] || post.metadata.fm.category, 'category')} class="goo__related-category">
											{post.metadata.fm.categories?.[0] || post.metadata.fm.category}
										</a>
									{/if}

									<a href={`${blogConfig.uri || '/blog'}${post.urlPath}`} class="goo__related-post-title-link">
										<h3 class="goo__related-post-title">{post.metadata?.fm?.title || getMessage('untitledPost', 'Untitled Post')}</h3>
									</a>

									<p class="goo__related-post-excerpt">{post.metadata?.fm?.excerpt || ""}</p>

									<div class="goo__related-post-meta">
										<span>{new Intl.DateTimeFormat(locale, {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										}).format(new Date(post.date))}</span>
										<span>•</span>
										<span>{getMessage('minRead', `${post.metadata?.fm?.readTime || 5} min read`, post.metadata?.fm?.readTime || 5)}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div class="goo__back-link-container">
				<a href={blogConfig.uri || '/blog'} class="goo__back-link">
					<ChevronLeft class="goo__back-link-icon" />
					{getMessage('backToBlog', 'Back to Blog')}
				</a>
			</div>
	</article>
</div>
