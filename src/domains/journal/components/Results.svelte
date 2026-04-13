<script>
	import MetadataValues from '@src/domains/journal/components/MetadataValues.svelte'
	import { formatJournalLabel } from '@src/domains/journal/viewmodel'
	import PublicBreadcrumbs from '$lib/app/shell/PublicBreadcrumbs.svelte'

	/** @type {{ posts?: any[]; category?: string; showBackButton?: boolean; type?: 'category' | 'tag' }} */
	let {
		posts = [],
		category = '',
		showBackButton = true
	} = $props()

</script>

{#if showBackButton}
	<PublicBreadcrumbs
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Journal', href: '/journal' },
			{ label: formatJournalLabel(category) }
		]}
	/>
{/if}

<div class="journal-results">
    <h1>
        {formatJournalLabel(category)}
    </h1>
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
                    <MetadataValues values={post.metadata.fm.categories} type="category"/>
                {/if}
                {#if post.metadata.fm.tags}
                    <MetadataValues values={post.metadata.fm.tags} type="tag"/>
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
