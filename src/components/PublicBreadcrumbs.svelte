<script lang="ts">
	type BreadcrumbItem = {
		label: string
		href?: string
	}

	type Props = {
		items: BreadcrumbItem[]
		className?: string
	}

	const { items, className = '' }: Props = $props()
</script>

{#if items.length}
	<nav class={`public-breadcrumbs ${className}`.trim()} aria-label="Breadcrumbs">
		<ol class="public-breadcrumbs__list">
			{#each items as item, index}
				<li class="public-breadcrumbs__item">
					{#if item.href && index < items.length - 1}
						<a href={item.href} class="public-breadcrumbs__link">{item.label}</a>
					{:else}
						<span class="public-breadcrumbs__current" aria-current="page">{item.label}</span>
					{/if}
					{#if index < items.length - 1}
						<span class="public-breadcrumbs__sep" aria-hidden="true">/</span>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}

<style lang="scss">
	.public-breadcrumbs {
		margin: 1rem auto 1rem;
	}

	.public-breadcrumbs__list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.public-breadcrumbs__item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
	}

	.public-breadcrumbs__link,
	.public-breadcrumbs__current {
		font-family: var(--font-sans);
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		line-height: 1.2;
	}

	.public-breadcrumbs__link {
		color: var(--muted);
		text-decoration: none;
		transition: color 0.15s ease;

		&:hover {
			color: var(--text);
		}
	}

	.public-breadcrumbs__current {
		color: var(--text);
	}

	.public-breadcrumbs__sep {
		color: var(--muted);
		opacity: 0.7;
	}
</style>
