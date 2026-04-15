<script>
	import { blogConfig, getAllCategories, getAllTags } from '@goobits/blog/core'
	import MikoArchiveRow from './MikoArchiveRow.svelte'
	import MikoTaxonomyList from './MikoTaxonomyList.svelte'

	const { data } = $props()

	const posts = $derived(Array.isArray(data.posts) ? data.posts : [])
	const allPosts = $derived(Array.isArray(data.allPosts) ? data.allPosts : posts)
	const categories = $derived(getAllCategories(allPosts, 10))
	const tags = $derived(getAllTags(allPosts, 14))
	const title = $derived.by(() => {
		if (data.pageType === 'category') { return data.category || 'Category' }
		if (data.pageType === 'tag') { return `#${data.tag || 'Tag'}` }
		return blogConfig.name
	})
	const eyebrow = $derived.by(() => {
		if (data.pageType === 'category') { return 'Category Archive' }
		if (data.pageType === 'tag') { return 'Tag Archive' }
		return 'Journal Archive'
	})
	const description = $derived.by(() => {
		if (data.pageType === 'category' && data.categoryDescription) { return data.categoryDescription }
		if (data.pageType === 'tag' && data.tag) { return `Entries grouped under the ${data.tag} thread.` }
		return blogConfig.description
	})
</script>

<section class="miko-blog__archive">
	<div class="miko-blog__hero">
		<p class="miko-blog__eyebrow">{eyebrow}</p>
		<h1 class="miko-blog__title">{title}</h1>
		<p class="miko-blog__description">{description}</p>
		<p class="miko-blog__count">{posts.length} entries</p>
	</div>

	<div class="miko-blog__archive-layout">
		<div class="miko-blog__archive-main">
			{#if posts.length > 0}
				<div class="miko-blog__rows" role="list">
					{#each posts as post (post.urlPath)}
						<div role="listitem">
							<MikoArchiveRow {post} />
						</div>
					{/each}
				</div>
			{:else}
				<div class="miko-blog__empty">
					<h2>No entries found</h2>
					<p>This archive view does not have any posts yet.</p>
				</div>
			{/if}
		</div>

		<aside class="miko-blog__archive-sidebar">
			<MikoTaxonomyList
				title="Categories"
				items={categories}
				type="category"
				currentItem={data.currentCategory || ''}
			/>

			<MikoTaxonomyList
				title="Tags"
				items={tags}
				type="tag"
				currentItem={data.currentTag || ''}
				showHashtag={true}
			/>
		</aside>
	</div>
</section>
