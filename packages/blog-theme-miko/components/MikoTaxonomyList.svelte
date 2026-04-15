<script>
	import { blogConfig, slugify } from '@goobits/blog/core'

	const {
		title,
		items = [],
		type = 'tag',
		currentItem = '',
		showHashtag = false
	} = $props()

	function itemHref(item) {
		return `${blogConfig.uri}/${type}/${slugify(item)}`
	}

	function isActive(item) {
		return slugify(item) === slugify(currentItem || '')
	}
</script>

<section class="miko-blog__taxonomy">
	<h2 class="miko-blog__taxonomy-title">{title}</h2>

	{#if items.length > 0}
		<ul class="miko-blog__taxonomy-list">
			{#each items as item}
				<li>
					<a
						class:miko-blog__taxonomy-link--active={isActive(item)}
						class="miko-blog__taxonomy-link"
						href={itemHref(item)}
					>
						{#if showHashtag}#{/if}{item}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="miko-blog__taxonomy-empty">No entries yet.</p>
	{/if}
</section>
