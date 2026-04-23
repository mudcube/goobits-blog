<script lang="ts">
	import type { ShowcaseCollectionEntry } from './types'

	let { entry }: { entry: ShowcaseCollectionEntry } = $props()
</script>

<a href={entry.href} class="showcase-collection-row" role="row">
	<span class="showcase-collection-row__title" role="cell">
		<span class="showcase-collection-row__title-text">{entry.title}</span>
		<span class="showcase-collection-row__path">{entry.href}</span>
	</span>
	<span class="showcase-collection-row__meta" role="cell">{entry.meta}</span>
	<span class="showcase-collection-row__vibe" role="cell">
		{entry.vibe}
		{#if entry.badge}
			<span class={`showcase-collection-row__badge ${entry.badgeTone === 'warm' ? 'showcase-collection-row__badge--warm' : ''}`}>
				{entry.badge}
			</span>
		{/if}
	</span>
</a>

<style>
	.showcase-collection-row {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(10rem, 0.55fr) minmax(0, 1fr);
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-5) var(--space-6);
		border-top: 1px solid color-mix(in srgb, var(--showcase-outline-variant) 72%, transparent);
		color: var(--showcase-text);
		text-decoration: none;
		transition:
			background-color 0.2s ease,
			transform 0.2s ease;
	}

	.showcase-collection-row:hover {
		background: color-mix(in srgb, var(--showcase-surface-highest) 16%, transparent);
	}

	.showcase-collection-row:focus-visible {
		outline: 2px solid var(--showcase-secondary);
		outline-offset: -2px;
		background: color-mix(in srgb, var(--showcase-surface-highest) 18%, transparent);
	}

	.showcase-collection-row__title,
	.showcase-collection-row__meta,
	.showcase-collection-row__vibe {
		display: grid;
		gap: var(--space-1);
		min-width: 0;
	}

	.showcase-collection-row__title-text {
		font-family: var(--font-serif);
		font-size: clamp(1.05rem, 2vw, 1.25rem);
		line-height: 1.22;
	}

	.showcase-collection-row__path,
	.showcase-collection-row__meta {
		color: var(--showcase-muted);
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.showcase-collection-row__path {
		overflow-wrap: anywhere;
	}

	.showcase-collection-row__vibe {
		color: color-mix(in srgb, var(--showcase-muted) 84%, var(--showcase-text));
		font-size: var(--font-size-sm);
		line-height: 1.55;
	}

	.showcase-collection-row__badge {
		display: inline-flex;
		align-items: center;
		width: fit-content;
		margin-top: var(--space-2);
		padding: 0.25rem 0.7rem;
		border: var(--border-width) solid var(--showcase-badge-border, rgba(76, 215, 246, 0.2));
		border-radius: var(--radius-pill);
		background: var(--showcase-badge-bg, rgba(0, 42, 51, 0.6));
		color: var(--showcase-badge-text, var(--showcase-secondary-on-container));
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.showcase-collection-row__badge--warm {
		border-color: var(--showcase-badge-warm-border, rgba(254, 166, 25, 0.2));
		background: var(--showcase-badge-warm-bg, rgba(254, 166, 25, 0.4));
		color: var(--showcase-badge-warm-text, var(--showcase-tertiary-on-container));
	}

	@media (max-width: 768px) {
		.showcase-collection-row {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--space-3);
		}

		.showcase-collection-row__meta {
			order: 2;
		}

		.showcase-collection-row__vibe {
			order: 3;
		}
	}
</style>
