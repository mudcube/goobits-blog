<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right'
	import './blogTheme.css'

	import { createBlogConfig, type BlogConfig } from '../config/blogConfig.js'
	import type { BlogPost } from '../core/blogPost.js'
	import { createBlogUrlResolver, slugify, type BlogUrlResolverInput } from '../core/blogUrls.js'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'
	import BlogImage from './BlogImage.svelte'
	import Byline from './elements/Byline.svelte'

	interface Props {
		post: BlogPost
		config?: BlogConfig
		basePath?: string
		compact?: boolean
		hideImage?: boolean
		currentTag?: string
		messages?: BlogUiMessagesInput
		urlResolver?: BlogUrlResolverInput
		locale?: string
		priority?: boolean
		class?: string
	}

	const {
		post,
		config,
		basePath = '/blog',
		compact = false,
		hideImage = false,
		currentTag = '',
		messages: messageInput = {},
		urlResolver: urlResolverInput = {},
		locale = 'en',
		priority = false,
		class: className = ''
	}: Props = $props()

	const messages = $derived(createBlogUiMessages(messageInput))
	const urlResolver = $derived(createBlogUrlResolver(urlResolverInput))
	const image = $derived(
		post.thumbnail ??
			post.image ??
			(post.coverImage ? { src: post.coverImage, alt: post.title } : null)
	)
	const category = $derived(post.categories[0] ?? '')
	const tags = $derived(post.tags.filter((tag) => tag !== currentTag))
	const cardConfig = $derived(config ?? createBlogConfig({ basePath }))
	const postUrl = $derived(urlResolver.post(post, cardConfig))
	const classes = $derived(
		['blog-card', compact ? 'blog-card--compact' : '', className].filter(Boolean).join(' ')
	)
</script>

<article class={classes}>
	{#if !hideImage && image}
		<a class="blog-card__media" href={postUrl} aria-label={post.title || messages.untitledPost}>
			<BlogImage
				{image}
				sizes={image.sizes ?? '(max-width: 47.99rem) calc(100vw - 3rem), 22rem'}
				loading={priority ? 'eager' : 'lazy'}
				fetchpriority={priority ? 'high' : 'auto'}
			/>
		</a>
	{/if}
	<div class="blog-card__body">
		{#if category}
			<a
				class="blog-card__category"
				href={urlResolver.taxonomy('category', slugify(category), cardConfig)}>{category}</a
			>
		{/if}
		<h2 class="blog-card__title"><a href={postUrl}>{post.title || messages.untitledPost}</a></h2>
		<div class="blog-card__meta">
			<time datetime={post.date}
				>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
					new Date(post.date)
				)}</time
			>
			<span>{messages.minuteRead(post.readTimeMinutes)}</span>
			{#if post.author}<Byline
					author={post.author}
					href={urlResolver.author(post.author, cardConfig)}
					layout="inline"
				/>{/if}
		</div>
		{#if post.excerpt}<p class="blog-card__excerpt">{post.excerpt}</p>{/if}
		{#if tags.length > 0}
			<ul class="blog-card__tags" aria-label={messages.tags}>
				{#each tags as tag (tag)}
					<li><a href={urlResolver.taxonomy('tag', slugify(tag), cardConfig)}>#{tag}</a></li>
				{/each}
			</ul>
		{/if}
		<a class="blog-card__more" href={postUrl}
			>{messages.readMore}<ArrowRight size={16} aria-hidden="true" /></a
		>
	</div>
</article>
