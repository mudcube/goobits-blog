<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left'
	import type { Snippet } from 'svelte'

	import type { BlogConfig } from '../config/blogConfig.js'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'
	import type { BlogPost as BlogPostModel } from '../core/blogPost.js'
	import {
		createBlogUrlResolver,
		getCanonicalBlogUrl,
		slugify,
		type BlogUrlResolverInput
	} from '../core/blogUrls.js'
	import type { RelatedPostResult } from '../core/resolveRelatedPosts.js'
	import BlogCard from './BlogCard.svelte'
	import BlogImage from './BlogImage.svelte'
	import BlogProse from './BlogProse.svelte'
	import Breadcrumbs from './Breadcrumbs.svelte'
	import SocialShare from './SocialShare.svelte'
	import TagCategoryList from './TagCategoryList.svelte'
	import Byline from './elements/Byline.svelte'
	import './blogTheme.css'

	type ShareNetwork = 'email' | 'facebook' | 'x'

	interface Props {
		post: BlogPostModel
		config: BlogConfig
		relatedPosts?: Array<BlogPostModel | RelatedPostResult>
		shareNetworks?: ShareNetwork[]
		messages?: BlogUiMessagesInput
		urlResolver?: BlogUrlResolverInput
		locale?: string
		children?: Snippet
		actions?: Snippet<[BlogPostModel]>
		afterContent?: Snippet<[BlogPostModel]>
		class?: string
	}

	const {
		post,
		config,
		relatedPosts = [],
		shareNetworks = [],
		messages: messageInput = {},
		urlResolver: urlResolverInput = {},
		locale = post.lang || config.defaultLanguage,
		children,
		actions,
		afterContent,
		class: className = ''
	}: Props = $props()

	const messages = $derived(createBlogUiMessages(messageInput))
	const urlResolver = $derived(createBlogUrlResolver(urlResolverInput))
	const image = $derived(
		post.image ?? (post.coverImage ? { src: post.coverImage, alt: post.title } : null)
	)
	const postUrl = $derived(urlResolver.post(post, config))
	const canonicalUrl = $derived(getCanonicalBlogUrl(postUrl, config) ?? postUrl)
	const related = $derived(relatedPosts.map((item) => ('post' in item ? item.post : item)))
	const breadcrumbItems = $derived([
		{ label: config.name, href: urlResolver.blog(config) },
		...(post.categories[0]
			? [
					{
						label: post.categories[0],
						href: urlResolver.taxonomy('category', slugify(post.categories[0]), config)
					}
				]
			: []),
		{ label: post.title || messages.untitledPost }
	])
</script>

<article class={['blog-post', className].filter(Boolean).join(' ')}>
	<Breadcrumbs items={breadcrumbItems} messages={messageInput} />
	<header class="blog-post__header">
		{#if post.categories.length > 0}
			<TagCategoryList
				items={post.categories}
				type="categories"
				{config}
				messages={messageInput}
				urlResolver={urlResolverInput}
			/>
		{/if}
		<h1>{post.title || messages.untitledPost}</h1>
		{#if post.excerpt}<p class="blog-post__lede">{post.excerpt}</p>{/if}
		<div class="blog-post__meta">
			<time datetime={post.date}
				>{new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
					new Date(post.date)
				)}</time
			>
			<span>{messages.minuteRead(post.readTimeMinutes)}</span>
			{#if post.author}<Byline
					author={post.author}
					href={urlResolver.author(post.author, config)}
					layout="inline"
				/>{/if}
		</div>
		{#if actions}<div class="blog-post__actions">{@render actions(post)}</div>{/if}
	</header>

	{#if image}
		<figure class="blog-post__hero">
			<BlogImage
				{image}
				sizes={image.sizes ?? '(max-width: 48rem) calc(100vw - 3rem), 52rem'}
				loading="eager"
				fetchpriority="high"
			/>
		</figure>
	{/if}

	<BlogProse>{@render children?.()}</BlogProse>
	{@render afterContent?.(post)}

	<footer class="blog-post__footer">
		{#if post.tags.length > 0}<TagCategoryList
				items={post.tags}
				{config}
				messages={messageInput}
				urlResolver={urlResolverInput}
			/>{/if}
		<SocialShare
			url={canonicalUrl}
			title={post.title}
			text={post.excerpt}
			networks={shareNetworks}
			messages={messageInput}
		/>
		<a class="blog-post__back" href={urlResolver.blog(config)}
			><ArrowLeft size={16} aria-hidden="true" /> {messages.backToBlog}</a
		>
	</footer>

	{#if related.length > 0}
		<section class="blog-related" aria-labelledby="blog-related-title">
			<h2 id="blog-related-title">{messages.relatedPosts}</h2>
			<div class="blog-related__grid">
				{#each related as relatedPost (relatedPost.id)}
					<BlogCard
						post={relatedPost}
						{config}
						compact
						messages={messageInput}
						urlResolver={urlResolverInput}
						{locale}
					/>
				{/each}
			</div>
		</section>
	{/if}
</article>
