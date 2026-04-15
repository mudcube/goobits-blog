<script lang="ts">
	import type { Snippet } from 'svelte'

	type ShowcaseSectionProps = {
		title: string
		kicker?: string
		filterLabel?: string
		className?: string
		toolbar?: Snippet
		children?: Snippet
	}

	const {
		title,
		kicker = '',
		filterLabel = '',
		className = '',
		toolbar,
		children
	}: ShowcaseSectionProps = $props()
</script>

<section class={`showcase-section ${className}`.trim()}>
	<div class="showcase-section__head">
		<div>
			<h2 class="showcase-section__title">{title}</h2>
			{#if kicker}
				<p class="showcase-section__kicker">{kicker}</p>
			{/if}
		</div>
		{#if filterLabel}
			<span class="showcase-section__filter">{filterLabel}</span>
		{/if}
	</div>

	{#if toolbar}
		<div class="showcase-section__toolbar">
			{@render toolbar()}
		</div>
	{/if}

	<div class="showcase-section__body">
		{@render children?.()}
	</div>
</section>

<style>
	.showcase-section {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
		position: relative;
		isolation: isolate;
		padding: var(--space-12) 0;
	}

	.showcase-section__head,
	.showcase-section__toolbar,
	.showcase-section__body {
		position: relative;
		z-index: 1;
		grid-column: 2;
	}

	.showcase-section::before {
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

	.showcase-section__head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-6);
		margin-bottom: var(--space-6);
	}

	.showcase-section__title {
		margin: 0 0 var(--space-2);
		color: var(--showcase-text);
		font-family: var(--font-serif);
		font-size: clamp(1.45rem, 2.8vw, 1.75rem);
		font-weight: 400;
		letter-spacing: -0.015em;
		line-height: 1.18;
	}

	.showcase-section__kicker,
	.showcase-section__filter {
		margin: 0;
		color: var(--showcase-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.showcase-section__filter {
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

	.showcase-section__toolbar {
		margin-bottom: var(--space-6);
	}

	.showcase-section__body {
		display: grid;
		gap: var(--space-4);
	}

	@media (max-width: 768px) {
		.showcase-section {
			padding-top: var(--space-10);
			padding-bottom: var(--space-10);
		}

		.showcase-section__head {
			align-items: stretch;
			flex-direction: column;
		}
	}
</style>
