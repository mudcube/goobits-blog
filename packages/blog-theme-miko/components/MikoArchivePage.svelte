<script>
	import { ShowcaseHero } from '@miko/ui'
	import { blogConfig, getAllCategories, slugify } from '@goobits/blog/core'
	import MikoArchiveRow from './MikoArchiveRow.svelte'
	import { formatLabel } from '../utils/formatLabel.ts'

	const { data } = $props()

	const posts = $derived(Array.isArray(data.posts) ? data.posts : [])
	const allPosts = $derived(Array.isArray(data.allPosts) ? data.allPosts : posts)
	const categories = $derived(getAllCategories(allPosts, 8))
	const currentCategory = $derived(data.currentCategory || '')
	const currentTag = $derived(data.currentTag || '')

	const pageTitle = $derived.by(() => {
		if (data.pageType === 'category') { return formatLabel(data.category) || 'Category' }
		if (data.pageType === 'tag') { return `#${formatLabel(data.tag) || 'Tag'}` }
		return 'Insights, artifacts, and'
	})
	const titleAccent = $derived.by(() => {
		if (data.pageType === 'category') { return '' }
		if (data.pageType === 'tag') { return '' }
		return 'creative breakthroughs'
	})
	const eyebrow = $derived.by(() => {
		if (data.pageType === 'category') { return 'Category Archive' }
		if (data.pageType === 'tag') { return 'Tag Archive' }
		return 'Journal Archive'
	})
	const description = $derived.by(() => {
		if (data.pageType === 'category' && data.categoryDescription) { return data.categoryDescription }
		if (data.pageType === 'tag' && data.tag) { return `Entries grouped under the ${data.tag} thread.` }
		return blogConfig.description || 'A chronological mapping of digital synthesis and sensory explorations.'
	})
	const signalLabel = $derived(`Archive No. ${String(posts.length).padStart(3, '0')}`)

	const chips = $derived.by(() => {
		if (!categories.length) { return [] }
		const base = [
			{ href: blogConfig.uri, label: 'All' },
			...categories.map(c => ({
				href: `${blogConfig.uri}/category/${slugify(c)}`,
				label: formatLabel(c)
			}))
		]
		return base
	})
</script>

<ShowcaseHero
	{eyebrow}
	title={pageTitle}
	{titleAccent}
	intro={description}
	{signalLabel}
	{chips}
/>

<section class="miko-blog__collection">
	<div class="miko-blog__collection-inner">
		<header class="miko-blog__toolbar">
			<div class="miko-blog__toolbar-head">
				<h2 class="miko-blog__toolbar-title">The Archive</h2>
				<p class="miko-blog__toolbar-kicker">
					Showing {posts.length} recorded synthesis {posts.length === 1 ? 'log' : 'logs'}
					{#if currentCategory}— filtered by {formatLabel(currentCategory)}{:else if currentTag}— filtered by #{formatLabel(currentTag)}{/if}
				</p>
			</div>
		</header>

		{#if posts.length > 0}
			<div class="miko-blog__table" role="table" aria-label="Journal entries">
				<div class="miko-blog__thead" role="row">
					<span role="columnheader">Timestamp</span>
					<span role="columnheader">Entry Detail</span>
					<span role="columnheader">Taxonomy</span>
					<span class="miko-blog__th--end" role="columnheader">Link</span>
				</div>
				<div class="miko-blog__tbody" role="rowgroup">
					{#each posts as post (post.urlPath)}
						<MikoArchiveRow {post} />
					{/each}
				</div>
			</div>
		{:else}
			<div class="miko-blog__empty">
				<h2>No entries found</h2>
				<p>This archive view does not have any posts yet.</p>
			</div>
		{/if}

		<div class="miko-blog__discover" aria-hidden="true">
			<span>Archive complete</span>
			<div class="miko-blog__discover-line"></div>
		</div>
	</div>
</section>
