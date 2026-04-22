<script lang="ts">
	import { Breadcrumbs, Hero } from '@miko/ui'
	import type { Snippet } from 'svelte'

	type BreadcrumbItem = {
		label: string
		href?: string
	}

	type VersionItem = {
		label: string
		href: string
		current?: boolean
	}

	let {
		title,
		subtitle,
		breadcrumbItems = [],
		versions = [],
		toolbar
	}: {
		title: string
		subtitle: string
		breadcrumbItems?: BreadcrumbItem[]
		versions?: VersionItem[]
		toolbar?: Snippet
	} = $props()
</script>

<Hero
	{title}
	icon="/media/page-icons/labs-flask.png"
	iconAlt="Flask"
	{subtitle}
	compact
	className="dev-hero"
>
	<Breadcrumbs items={breadcrumbItems} className="dev-hero__breadcrumbs" />
	{#if versions.length}
		<nav class="dev-hero__versions" aria-label={`${title} versions`}>
			{#each versions as version}
				<a href={version.href} aria-current={version.current ? 'page' : undefined}>
					{version.label}
				</a>
			{/each}
		</nav>
	{/if}
	{#if toolbar}
		<div class="dev-hero__toolbar">
			{@render toolbar()}
		</div>
	{/if}
</Hero>

<style>
	:global(.dev-hero.ui-hero) {
		margin-bottom: var(--space-6);
	}

	:global(.dev-hero.ui-hero .dev-hero__breadcrumbs.ui-breadcrumbs) {
		order: -2;
		margin: 0 0 0.85rem;
	}

	.dev-hero__versions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
		padding-top: 0.85rem;
		border-top: 1px solid color-mix(in srgb, var(--border) 32%, transparent);
	}

	.dev-hero__versions a {
		font-size: 0.72rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 45%, transparent);
		text-decoration: none;
		padding: 0.2rem 0.5rem;
		border-radius: 0.3rem;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
	}

	.dev-hero__versions a:hover {
		color: var(--text);
		border-color: color-mix(in srgb, var(--text) 25%, transparent);
	}

	.dev-hero__versions a[aria-current="page"] {
		color: #a78bfa;
		border-color: color-mix(in srgb, #a78bfa 30%, transparent);
		background: color-mix(in srgb, #a78bfa 6%, transparent);
	}

	.dev-hero__toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 0.75rem;
	}
</style>
