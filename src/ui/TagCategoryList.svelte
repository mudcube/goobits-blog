<script lang="ts">
	import './blogTheme.css'

	import { createBlogConfig, type BlogConfig } from '../config/blogConfig.js'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'
	import { createBlogUrlResolver, slugify, type BlogUrlResolverInput } from '../core/blogUrls.js'

	interface Props {
		items?: string[]
		type?: 'tags' | 'categories'
		config?: BlogConfig
		basePath?: string
		activeItem?: string
		maxDisplay?: number
		showHashtag?: boolean
		messages?: BlogUiMessagesInput
		urlResolver?: BlogUrlResolverInput
		class?: string
	}

	const {
		items = [],
		type = 'tags',
		config,
		basePath = '/blog',
		activeItem = '',
		maxDisplay = Number.MAX_SAFE_INTEGER,
		showHashtag = type === 'tags',
		messages: messageInput = {},
		urlResolver: urlResolverInput = {},
		class: className = ''
	}: Props = $props()

	const route = $derived(type === 'tags' ? 'tag' : 'category')
	const messages = $derived(createBlogUiMessages(messageInput))
	const urlResolver = $derived(createBlogUrlResolver(urlResolverInput))
	const taxonomyConfig = $derived(config ?? createBlogConfig({ basePath }))
	const label = $derived(type === 'tags' ? messages.tags : messages.categories)
</script>

{#if items.length > 0}
	<ul class={['blog-taxonomy-list', className].filter(Boolean).join(' ')} aria-label={label}>
		{#each items.slice(0, maxDisplay) as item (item)}
			<li>
				<a
					href={urlResolver.taxonomy(route, slugify(item), taxonomyConfig)}
					aria-current={slugify(item) === slugify(activeItem) ? 'page' : undefined}
				>{showHashtag ? '#' : ''}{item}</a>
			</li>
		{/each}
		{#if items.length > maxDisplay}<li aria-label={messages.moreItems(items.length - maxDisplay)}>+{items.length - maxDisplay}</li>{/if}
	</ul>
{/if}
