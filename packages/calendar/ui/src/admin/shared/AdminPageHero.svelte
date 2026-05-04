<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		eyebrow = '',
		title = '',
		subtitle = '',
		actions
	}: {
		eyebrow?: string
		title?: string
		subtitle?: string
		actions?: Snippet
	} = $props()
</script>

<section class="admin-page-hero" data-testid="admin-page-hero">
	<div class="admin-page-hero__content">
		{#if eyebrow}
			<p class="admin-page-hero__eyebrow">{eyebrow}</p>
		{/if}
		<h1 class="admin-page-hero__title" data-testid="admin-page-hero-title">{title}</h1>
		{#if subtitle}
			<p class="admin-page-hero__subtitle">{subtitle}</p>
		{/if}
	</div>
	<div class="admin-page-hero__actions">
		{@render actions?.()}
	</div>
</section>

<style>
	.admin-page-hero {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		margin: 0 0 0.9rem;
	}

	.admin-page-hero__content {
		min-width: 0;
	}

	.admin-page-hero__eyebrow {
		margin: 0 0 0.25rem;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.71rem;
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 48%, transparent);
	}

	.admin-page-hero__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.7rem, 2.8vw, 2.35rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1.08;
		color: var(--text);
	}

	.admin-page-hero__subtitle {
		margin: 0.5rem 0 0;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.9rem;
		font-weight: 400;
		font-style: italic;
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 64%, transparent);
	}

	.admin-page-hero__actions {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	@media (max-width: 720px) {
		.admin-page-hero {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.55rem;
		}
	}
</style>
