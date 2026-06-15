<script lang="ts">
	import type { Snippet } from 'svelte'

	type ShowcaseListProps = {
		title: string
		kicker?: string
		filterLabel?: string
		className?: string
		children?: Snippet
	}

	const {
		title,
		kicker = '',
		filterLabel = '',
		className = '',
		children
	}: ShowcaseListProps = $props()
</script>

<section class={`showcase-list ${className}`.trim()}>
	<div class="showcase-list__head">
		<div>
			<h2 class="showcase-list__title">{title}</h2>
			{#if kicker}
				<p class="showcase-list__kicker">{kicker}</p>
			{/if}
		</div>
		{#if filterLabel}
			<span class="showcase-list__filter">{filterLabel}</span>
		{/if}
	</div>

	<div class="showcase-list__table" role="table" aria-label={title}>
		<div class="showcase-list__thead" role="row">
			<span role="columnheader">Route</span>
			<span role="columnheader">Type</span>
			<span role="columnheader">Notes</span>
		</div>
		<div class="showcase-list__tbody" role="rowgroup">
			{@render children?.()}
		</div>
	</div>
</section>

<style>
	.showcase-list {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
		position: relative;
		isolation: isolate;
		padding: var(--space-12) 0;
	}

	.showcase-list__head,
	.showcase-list__table {
		position: relative;
		z-index: 1;
		grid-column: 2;
	}

	.showcase-list::before {
		position: absolute;
		inset: 0 auto 0 50%;
		z-index: -1;
		width: 100vw;
		transform: translateX(-50%);
		content: '';
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--showcase-surface-low) 94%, var(--showcase-surface)) 0%,
				color-mix(in srgb, var(--showcase-surface-low) 88%, var(--showcase-surface-high)) 100%
			);
		pointer-events: none;
	}

	.showcase-list__head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-6);
		margin-bottom: var(--space-10);
	}

	.showcase-list__title {
		margin: 0 0 var(--space-2);
		color: var(--showcase-text);
		font-family: var(--font-serif);
		font-size: clamp(1.45rem, 2.8vw, 1.75rem);
		font-weight: 400;
		letter-spacing: -0.015em;
		line-height: 1.18;
	}

	.showcase-list__kicker,
	.showcase-list__filter {
		margin: 0;
		color: var(--showcase-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.showcase-list__filter {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		padding: 0 var(--space-4);
		border: var(--border-width) solid var(--showcase-filter-border, rgba(101, 117, 158, 0.2));
		border-radius: var(--radius-md);
		background: var(--showcase-filter-bg, var(--showcase-surface-high));
		color: var(--showcase-text);
		white-space: nowrap;
	}

	.showcase-list__table {
		border: 1px solid var(--showcase-outline-variant);
		border-radius: calc(var(--radius-xl) + var(--radius-sm));
		background: color-mix(in srgb, var(--showcase-surface-high) 66%, transparent);
		box-shadow: var(--showcase-card-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.44));
		overflow: hidden;
	}

	.showcase-list__thead {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(10rem, 0.55fr) minmax(0, 1fr);
		gap: var(--space-4);
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid color-mix(in srgb, var(--showcase-outline-variant) 82%, transparent);
		background: color-mix(in srgb, var(--showcase-surface-highest) 38%, transparent);
		color: var(--showcase-muted);
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.showcase-list__tbody {
		display: grid;
	}

	@media (max-width: 768px) {
		.showcase-list {
			padding-top: var(--space-12);
			padding-bottom: var(--space-12);
		}

		.showcase-list__head {
			align-items: stretch;
			flex-direction: column;
		}

		.showcase-list__thead {
			display: none;
		}
	}
</style>
