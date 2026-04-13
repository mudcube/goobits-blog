<script>
	import MetadataValues from './MetadataValues.svelte'
	import { formatJournalLabel } from '../viewmodel'

	let {
		posts = [],
		category = '',
		showBackButton = true
	} = $props()
</script>

{#if showBackButton}
	<nav class="journal-results__breadcrumbs" aria-label="Breadcrumb">
		<a href="/">Home</a>
		<span>/</span>
		<a href="/journal">Journal</a>
		<span>/</span>
		<span>{formatJournalLabel(category)}</span>
	</nav>
{/if}

<div class="journal-results">
	<h1>{formatJournalLabel(category)}</h1>
	{#each posts as post}
		<article>
			<h2>
				<a href={`/${post.urlPath}`}>{post.metadata.fm.title}</a>
				<time>{new Date(post.date).toLocaleDateString('en-US', {
					month: 'numeric',
					day: 'numeric',
					year: 'numeric'
				})}</time>
			</h2>
			<div style="display: flex">
				{#if post.metadata.fm.categories}
					<MetadataValues values={post.metadata.fm.categories} type="category" />
				{/if}
				{#if post.metadata.fm.tags}
					<MetadataValues values={post.metadata.fm.tags} type="tag" />
				{/if}
			</div>
		</article>
	{/each}
</div>

<style lang="scss">
	.journal-results {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.journal-results__breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-bottom: 1rem;
		font-family: var(--font-sans);
		font-size: 0.8rem;
		color: var(--muted);

		a {
			color: inherit;
			text-decoration: none;
		}

		a:hover {
			color: var(--text);
		}
	}

	article {
		margin-bottom: 3rem;
		font-family: var(--font-serif);
	}

	h1 {
		font-family: var(--font-display);
		font-size: 3rem;
		line-height: 3rem;
		background: var(--shadow-panel);
		border-radius: 1rem;
		padding: 1rem 2rem;
		font-weight: 500;
		margin: 0 0 2rem;
		text-align: left;
		display: flex;
	}

	h2 {
		font-weight: 400;
		font-size: 2rem;
		margin: 0;
		text-align: left;
		font-family: var(--font-display);

		a {
			display: block;
			text-decoration: none;
		}

		a:hover {
			text-decoration: underline;
		}
	}

	time {
		font-family: var(--font-serif);
		font-size: 1rem;
		color: var(--muted);
	}
</style>
