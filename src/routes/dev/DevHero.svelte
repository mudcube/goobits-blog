<script lang="ts">
	import { Hero } from '@miko/ui'

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
		versions = []
	}: {
		title: string
		subtitle: string
		breadcrumbItems?: BreadcrumbItem[]
		versions?: VersionItem[]
	} = $props()

	const eyebrow = $derived(breadcrumbItems.map((item) => item.label).join(' / '))
</script>

<Hero
	{eyebrow}
	{title}
	icon="/media/page-icons/labs-flask.png"
	iconAlt="Flask"
	{subtitle}
	compact
	className="dev-hero"
>
	<div class="dev-hero__meta">
		{#if versions.length}
			<nav class="dev-hero__versions" aria-label={`${title} versions`}>
				{#each versions as version}
					<a href={version.href} aria-current={version.current ? 'page' : undefined}>
						{version.label}
					</a>
				{/each}
			</nav>
		{/if}
	</div>
</Hero>

<style>
	:global(.dev-hero.ui-hero) {
		margin-bottom: var(--space-6);
	}

	.dev-hero__meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 0.85rem;
		margin-top: 1rem;
		padding-top: 0.85rem;
		border-top: 1px solid color-mix(in srgb, var(--border) 32%, transparent);
	}

	.dev-hero__versions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
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

	@media (min-width: 760px) {
		.dev-hero__meta {
			justify-content: flex-end;
		}
	}
</style>
