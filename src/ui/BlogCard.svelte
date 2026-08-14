<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right'
	import './blogTheme.css'

	import type { BlogPost } from '../core/blogPost.js'
	import { slugify } from '../core/blogUrls.js'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'

	interface Props {
		post: BlogPost
		basePath?: string
		compact?: boolean
		hideImage?: boolean
		currentTag?: string
		messages?: BlogUiMessagesInput
		locale?: string
		class?: string
	}

	const {
		post,
		basePath = '/blog',
		compact = false,
		hideImage = false,
		currentTag = '',
		messages: messageInput = {},
		locale = 'en',
		class: className = ''
	}: Props = $props()

	const messages = $derived(createBlogUiMessages(messageInput))
	const image = $derived(post.thumbnail ?? post.image ?? (post.coverImage ? { src: post.coverImage, alt: post.title } : null))
	const category = $derived(post.categories[0] ?? '')
	const tags = $derived(post.tags.filter(tag => tag !== currentTag))
	const classes = $derived([ 'blog-card', compact ? 'blog-card--compact' : '', className ].filter(Boolean).join(' '))
</script>

<article class={classes}>
	{#if !hideImage && image}
		<a class="blog-card__media" href={post.urlPath} aria-label={post.title || messages.untitledPost}>
			<img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
		</a>
	{/if}
	<div class="blog-card__body">
		{#if category}
			<a class="blog-card__category" href={`${ basePath }/category/${ slugify(category) }`}>{category}</a>
		{/if}
		<h2 class="blog-card__title"><a href={post.urlPath}>{post.title || messages.untitledPost}</a></h2>
		<div class="blog-card__meta">
			<time datetime={post.date}>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(post.date))}</time>
			<span>{messages.minuteRead(post.readTimeMinutes)}</span>
			{#if post.author?.name}<span>{post.author.name}</span>{/if}
		</div>
		{#if post.excerpt}<p class="blog-card__excerpt">{post.excerpt}</p>{/if}
		{#if tags.length > 0}
			<ul class="blog-card__tags" aria-label="Tags">
				{#each tags as tag (tag)}
					<li><a href={`${ basePath }/tag/${ slugify(tag) }`}>#{tag}</a></li>
				{/each}
			</ul>
		{/if}
		<a class="blog-card__more" href={post.urlPath}>{messages.readMore}<ArrowRight size={16} aria-hidden="true" /></a>
	</div>
</article>
