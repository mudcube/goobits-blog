<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left'
	import type { Snippet } from 'svelte'

	import type { BlogConfig } from '../config/blogConfig.js'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'
	import type { BlogPost as BlogPostModel } from '../core/blogPost.js'
	import { getCanonicalBlogUrl, slugify } from '../core/blogUrls.js'
	import type { RelatedPostResult } from '../core/resolveRelatedPosts.js'
	import BlogCard from './BlogCard.svelte'
	import BlogProse from './BlogProse.svelte'
	import Breadcrumbs from './Breadcrumbs.svelte'
	import SocialShare from './SocialShare.svelte'
	import TagCategoryList from './TagCategoryList.svelte'
	import './blogTheme.css'

	type ShareNetwork = 'email' | 'facebook' | 'x'

	interface Props {
		post: BlogPostModel
		config: BlogConfig
		relatedPosts?: Array<BlogPostModel | RelatedPostResult>
		shareNetworks?: ShareNetwork[]
		messages?: BlogUiMessagesInput
		locale?: string
		children?: Snippet
		class?: string
	}

	const {
		post,
		config,
		relatedPosts = [],
		shareNetworks = [],
		messages: messageInput = {},
		locale = post.lang || config.defaultLanguage,
		children,
		class: className = ''
	}: Props = $props()

	const messages = $derived(createBlogUiMessages(messageInput))
	const image = $derived(post.image ?? (post.coverImage ? { src: post.coverImage, alt: post.title } : null))
	const canonicalUrl = $derived(getCanonicalBlogUrl(post.urlPath, config) ?? post.urlPath)
	const related = $derived(relatedPosts.map(item => 'post' in item ? item.post : item))
	const breadcrumbItems = $derived([
		{ label: config.name, href: config.basePath || '/' },
		...(post.categories[0]
			? [{
				label: post.categories[0],
				href: `${ config.basePath }/category/${ slugify(post.categories[0]) }`
			}]
			: []),
		{ label: post.title || messages.untitledPost }
	])
</script>

<article class={['blog-post', className].filter(Boolean).join(' ')}>
	<Breadcrumbs items={breadcrumbItems} />
	<header class="blog-post__header">
		{#if post.categories.length > 0}
			<TagCategoryList items={post.categories} type="categories" basePath={config.basePath} />
		{/if}
		<h1>{post.title || messages.untitledPost}</h1>
		{#if post.excerpt}<p class="blog-post__lede">{post.excerpt}</p>{/if}
		<div class="blog-post__meta">
			<time datetime={post.date}>{new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(post.date))}</time>
			<span>{messages.minuteRead(post.readTimeMinutes)}</span>
			{#if post.author?.name}<span>{post.author.name}</span>{/if}
		</div>
	</header>

	{#if image}
		<figure class="blog-post__hero">
			<img
				src={image.src}
				alt={image.alt}
				width={image.width}
				height={image.height}
				decoding="async"
				fetchpriority="high"
			/>
		</figure>
	{/if}

	<BlogProse>{@render children?.()}</BlogProse>

	<footer class="blog-post__footer">
		{#if post.tags.length > 0}<TagCategoryList items={post.tags} basePath={config.basePath} />{/if}
		<SocialShare url={canonicalUrl} title={post.title} text={post.excerpt} networks={shareNetworks} messages={messageInput} />
		<a class="blog-post__back" href={config.basePath || '/'}><ArrowLeft size={16} aria-hidden="true" /> {messages.backToBlog}</a>
	</footer>

	{#if related.length > 0}
		<section class="blog-related" aria-labelledby="blog-related-title">
			<h2 id="blog-related-title">{messages.relatedPosts}</h2>
			<div class="blog-related__grid">
				{#each related as relatedPost (relatedPost.id)}
					<BlogCard post={relatedPost} basePath={config.basePath} compact messages={messageInput} {locale} />
				{/each}
			</div>
		</section>
	{/if}
</article>
