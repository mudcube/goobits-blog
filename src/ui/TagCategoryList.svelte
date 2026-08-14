<script lang="ts">
	import './blogTheme.css'

	import { slugify } from '../core/blogUrls.js'

	interface Props {
		items?: string[]
		type?: 'tags' | 'categories'
		basePath?: string
		activeItem?: string
		maxDisplay?: number
		showHashtag?: boolean
		class?: string
	}

	const {
		items = [],
		type = 'tags',
		basePath = '/blog',
		activeItem = '',
		maxDisplay = Number.MAX_SAFE_INTEGER,
		showHashtag = type === 'tags',
		class: className = ''
	}: Props = $props()

	const route = $derived(type === 'tags' ? 'tag' : 'category')
</script>

{#if items.length > 0}
	<ul class={['blog-taxonomy-list', className].filter(Boolean).join(' ')} aria-label={type}>
		{#each items.slice(0, maxDisplay) as item (item)}
			<li>
				<a
					href={`${ basePath }/${ route }/${ slugify(item) }`}
					aria-current={slugify(item) === slugify(activeItem) ? 'page' : undefined}
				>{showHashtag ? '#' : ''}{item}</a>
			</li>
		{/each}
		{#if items.length > maxDisplay}<li aria-label={`${ items.length - maxDisplay } more`}>+{items.length - maxDisplay}</li>{/if}
	</ul>
{/if}
