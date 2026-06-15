<script lang="ts">
	import type { Snippet } from 'svelte'

	type ShowcaseGridProps = {
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
	}: ShowcaseGridProps = $props()
</script>

<section class={`showcase-grid ${className}`.trim()}>
	<div class="showcase-grid__head">
		<div>
			<h2 class="showcase-grid__title">{title}</h2>
			{#if kicker}
				<p class="showcase-grid__kicker">{kicker}</p>
			{/if}
		</div>
		{#if filterLabel}
			<span class="showcase-grid__filter">{filterLabel}</span>
		{/if}
	</div>

	<div class="showcase-grid__items">
		{@render children?.()}
	</div>
</section>

<style>
	.showcase-grid {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
		position: relative;
		isolation: isolate;
		padding: var(--space-12) 0;
	}

	.showcase-grid__head,
	.showcase-grid__items {
		position: relative;
		z-index: 1;
		grid-column: 2;
	}

	.showcase-grid::before {
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

	.showcase-grid__head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-6);
		margin-bottom: var(--space-10);
	}

	.showcase-grid__title {
		margin: 0 0 var(--space-2);
		color: var(--showcase-text);
		font-family: var(--font-serif);
		font-size: clamp(1.45rem, 2.8vw, 1.75rem);
		font-weight: 400;
		letter-spacing: -0.015em;
		line-height: 1.18;
	}

	.showcase-grid__kicker,
	.showcase-grid__filter {
		margin: 0;
		color: var(--showcase-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.showcase-grid__filter {
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

	.showcase-grid__items {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
		gap: var(--space-8);
	}

	@media (max-width: 768px) {
		.showcase-grid {
			padding-top: var(--space-12);
			padding-bottom: var(--space-12);
		}

		.showcase-grid__head {
			align-items: stretch;
			flex-direction: column;
		}
	}
</style>
