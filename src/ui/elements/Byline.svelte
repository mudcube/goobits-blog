<script lang="ts">
	import type { BlogAuthor } from '../../core/blogPost.js'

	const {
		author,
		name = '',
		preface = '',
		href,
		layout = 'signature'
	}: {
		author?: BlogAuthor
		name?: string
		preface?: string
		href?: string | null
		layout?: 'inline' | 'signature'
	} = $props()

	const displayName = $derived(author?.name ?? name)
	const authorHref = $derived(href === undefined ? author?.url : href)
</script>

<span class:byline--inline={layout === 'inline'} class="byline">
	{#if preface}
		<span class="byline__preface">{preface}</span>
	{/if}
	{#if author?.avatar}
		<img class="byline__avatar" src={author.avatar} alt="" loading="lazy" decoding="async" />
	{/if}
	{#if displayName}
		{#if authorHref}
			<a class="byline__name" href={authorHref}>{displayName}</a>
		{:else}
			<span class="byline__name">{displayName}</span>
		{/if}
	{/if}
</span>

<style>
	.byline {
		margin: 2.5rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		align-items: flex-start;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.byline--inline {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 0.35rem;
		margin: 0;
		font-style: normal;
	}

	.byline__avatar {
		display: block;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		object-fit: cover;
	}

	.byline__preface,
	.byline__name {
		font-size: 0.95em;
		line-height: 1.5;
	}

	.byline__name {
		color: inherit;
	}
</style>
