<script lang="ts">
	import type { Snippet } from 'svelte'
	import { galleryLightbox } from './actions/galleryLightbox.js'

	type BlogProseProps = {
		class?: string
		children?: Snippet
	}

	const { class: className = '', children }: BlogProseProps = $props()
</script>

<div class={`blog-prose ${className}`.trim()} use:galleryLightbox>
	{@render children?.()}
</div>

<style>
	/**
	 * BlogProse is a prose wrapper that auto-upgrades runs of image-only
	 * paragraphs into a responsive gallery grid via CSS `:has()`. Clicks are
	 * intercepted by the galleryLightbox Svelte action which dispatches
	 * `gallery:open` events for a BlogLightbox instance to pick up.
	 *
	 * CSS custom properties (override from the host theme):
	 *   --blog-gallery-min-tile   minimum tile width  (default 220px)
	 *   --blog-gallery-gap        gap between tiles   (default 0.75rem)
	 *   --blog-gallery-radius     tile border radius  (default 8px)
	 *   --blog-gallery-border     tile border color   (default #3a3f4a)
	 *   --blog-gallery-surface    tile background     (default #1c202a)
	 *   --blog-gallery-shadow     tile shadow         (default 0 10px 30px -16px rgba(0,0,0,0.5))
	 */

	.blog-prose {
		--blog-gallery-min-tile: 220px;
		--blog-gallery-gap: 0.75rem;
		--blog-gallery-radius: 8px;
		--blog-gallery-border: #3a3f4a;
		--blog-gallery-surface: #1c202a;
		--blog-gallery-shadow: 0 10px 30px -16px rgba(0, 0, 0, 0.5);

		display: grid;
		grid-template-columns: repeat(
			auto-fill,
			minmax(var(--blog-gallery-min-tile), 1fr)
		);
		gap: var(--blog-gallery-gap);
		align-items: start;
	}

	/**
	 * Default: every direct child spans the full row so text content
	 * (paragraphs, headings, lists, blockquotes, code blocks) behaves as a
	 * normal block-flow document.
	 */
	.blog-prose > :global(*) {
		grid-column: 1 / -1;
		min-width: 0;
	}

	/**
	 * Image-only paragraphs (marked by the action with data-blog-gallery-tile,
	 * with a :has() fallback for browsers without JS / before hydration)
	 * become grid cells. Both selectors must target the same element so the
	 * CSS grid works independently of the action.
	 */
	.blog-prose > :global(p[data-blog-gallery-tile]),
	.blog-prose > :global(p:has(> a:only-child > img:only-child)),
	.blog-prose > :global(p:has(> a:only-child > picture:only-child > img)),
	.blog-prose > :global(p:has(> picture:only-child > img)),
	.blog-prose > :global(p:has(> img:only-child)) {
		grid-column: auto;
		margin: 0;
		padding: 0;
		overflow: hidden;
		border: 1px solid var(--blog-gallery-border);
		border-radius: var(--blog-gallery-radius);
		background: var(--blog-gallery-surface);
		box-shadow: var(--blog-gallery-shadow);
		transition:
			transform 0.35s ease,
			border-color 0.35s ease,
			box-shadow 0.35s ease;
	}

	.blog-prose > :global(p[data-blog-gallery-tile] a),
	.blog-prose > :global(p:has(> a:only-child > img:only-child) a),
	.blog-prose > :global(p:has(> a:only-child > picture:only-child > img) a),
	.blog-prose > :global(p[data-blog-gallery-tile] picture),
	.blog-prose > :global(p:has(> a:only-child > picture:only-child > img) picture),
	.blog-prose > :global(p:has(> picture:only-child > img) picture) {
		display: block;
		width: 100%;
	}

	.blog-prose > :global(p[data-blog-gallery-tile] img),
	.blog-prose > :global(p:has(> a:only-child > img:only-child) img),
	.blog-prose > :global(p:has(> a:only-child > picture:only-child > img) img),
	.blog-prose > :global(p:has(> picture:only-child > img) img),
	.blog-prose > :global(p:has(> img:only-child) img) {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
		transition: transform 0.5s ease;
	}

	.blog-prose > :global(p.blog-gallery__tile) {
		cursor: zoom-in;
	}

	.blog-prose > :global(p[data-blog-gallery-tile]:hover) {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--blog-gallery-border) 50%, transparent);
	}

	.blog-prose > :global(p[data-blog-gallery-tile]:hover img) {
		transform: scale(1.04);
	}

	/**
	 * Accessibility: keyboard focus on the anchor inside the tile. The
	 * `:focus-visible` ring sits on the wrapping <p> so it matches the tile
	 * bounds rather than the anchor's inline box.
	 */
	.blog-prose > :global(p[data-blog-gallery-tile]:focus-visible),
	.blog-prose > :global(p[data-blog-gallery-tile]:has(a:focus-visible)) {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	@media (max-width: 30em) {
		.blog-prose {
			--blog-gallery-min-tile: 140px;
			--blog-gallery-gap: 0.5rem;
		}
	}
</style>
