<script lang="ts">
	import { PageShell, ShowcaseCard, ShowcaseCTA, ShowcaseGrid, ShowcaseHero, ShowcaseList } from '@miko/ui'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import type { ShowcaseCollectionPageProps } from './config'
	import ShowcaseCollectionListRow from './ShowcaseCollectionListRow.svelte'

	const {
		path,
		seoTitle,
		description,
		layout = 'grid',
		eyebrow,
		title,
		titleAccent,
		icon,
		iconAlt,
		intro,
		signalLabel,
		gridTitle,
		gridKicker,
		gridFilterLabel,
		entries,
		ctaTitle,
		ctaTitleAccent,
		ctaCopy,
		ctaHref,
		ctaLinkLabel
	}: ShowcaseCollectionPageProps = $props()
</script>

<Seo
	title={seoTitle}
	{description}
	{path}
	image={icon}
	jsonLd={[
		buildWebPageJsonLd({
			path,
			title: seoTitle,
			description,
			type: 'CollectionPage'
		})
	]}
/>

<PageShell className="showcase-page showcase-page--collection">
	<div class="showcase-page__inner">
		<ShowcaseHero
			{eyebrow}
			{title}
			{titleAccent}
			{icon}
			{iconAlt}
			intro={intro}
			{signalLabel}
		/>

		{#if layout === 'list'}
			<ShowcaseList
				title={gridTitle}
				kicker={gridKicker}
				filterLabel={gridFilterLabel}
			>
				{#each entries as entry}
					<ShowcaseCollectionListRow {entry} />
				{/each}
			</ShowcaseList>
		{:else}
			<ShowcaseGrid
				title={gridTitle}
				kicker={gridKicker}
				filterLabel={gridFilterLabel}
			>
				{#each entries as entry, idx}
					<ShowcaseCard
						href={entry.href}
						image={entry.image}
						imageWebp={entry.imageWebp}
						alt={entry.title}
						badge={entry.badge ?? ''}
						badgeTone={entry.badgeTone ?? 'cool'}
						title={entry.title}
						meta={entry.meta}
						description={entry.vibe}
						playLabel="Open"
						loading={idx < 3 ? 'eager' : 'lazy'}
						fetchpriority={idx < 3 ? 'high' : 'auto'}
					/>
				{/each}
			</ShowcaseGrid>
		{/if}

		<ShowcaseCTA
			title={ctaTitle}
			titleAccent={ctaTitleAccent}
			copy={ctaCopy}
			href={ctaHref}
			linkLabel={ctaLinkLabel}
		/>
	</div>
</PageShell>

<style lang="scss">
	:global(.ui-page-shell.showcase-page--collection) {
		--showcase-surface: var(--bg);
		--showcase-surface-low: var(--bg);
		--showcase-surface-high: var(--card-bg);
		--showcase-surface-highest: var(--card-bg);
		--showcase-surface-bright: var(--card-bg);
		--showcase-text: var(--text);
		--showcase-muted: color-mix(in srgb, var(--muted) 92%, var(--text));
		--showcase-primary: #7a6a9b;
		--showcase-primary-dim: #5a4d78;
		--showcase-secondary: #8a7aaa;
		--showcase-secondary-on-container: #b8a8d8;
		--showcase-tertiary: #c4956a;
		--showcase-tertiary-on-container: #3d2810;
		--showcase-outline-variant: color-mix(in srgb, var(--border) 72%, transparent);
		--showcase-glow-primary: rgba(122, 106, 155, 0.1);
		--showcase-glow-secondary: rgba(138, 122, 170, 0.05);
		--showcase-hero-shadow: transparent;
		--showcase-chip-border: color-mix(in srgb, var(--border) 60%, transparent);
		--showcase-chip-bg: color-mix(in srgb, var(--card-bg) 80%, transparent);
		--showcase-chip-border-hover: color-mix(in srgb, var(--border) 90%, transparent);
		--showcase-chip-bg-hover: color-mix(in srgb, var(--card-bg) 90%, transparent);
		--showcase-chip-text-hover: var(--text);
		--showcase-chip-icon-bg: color-mix(in srgb, var(--card-bg) 60%, transparent);
		--showcase-filter-border: color-mix(in srgb, var(--border) 50%, transparent);
		--showcase-filter-bg: var(--card-bg);
		--showcase-badge-border: color-mix(in srgb, var(--brand-primary) 34%, var(--border));
		--showcase-badge-bg: color-mix(in srgb, var(--brand-primary) 14%, var(--card-bg));
		--showcase-badge-text: var(--brand-primary);
		--showcase-badge-warm-border: color-mix(in srgb, var(--brand-primary) 40%, var(--border));
		--showcase-badge-warm-bg: color-mix(in srgb, var(--brand-primary) 18%, var(--card-bg));
		--showcase-badge-warm-text: var(--brand-primary);
		--showcase-play-border: color-mix(in srgb, var(--border) 60%, transparent);
		--showcase-play-bg: color-mix(in srgb, var(--card-bg) 60%, transparent);
		--showcase-play-shadow: none;
		--showcase-card-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.2);
		--showcase-cta-border: color-mix(in srgb, var(--border) 40%, transparent);
		--showcase-cta-bg: color-mix(in srgb, var(--card-bg) 60%, transparent);
		--showcase-cta-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.15);
		--showcase-cta-glow-primary: rgba(122, 106, 155, 0.08);
		--showcase-cta-glow-secondary: rgba(138, 122, 170, 0.04);
		--showcase-cta-link-shadow: 0 0 20px -5px rgba(122, 106, 155, 0.3);
		--showcase-cta-link-shadow-hover: 0 0 30px -5px rgba(122, 106, 155, 0.45);
		--showcase-link-text: #000;
		width: 100%;
		overflow: hidden;
		background: transparent;
		color: var(--showcase-text);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	:global(.ui-page-shell.showcase-page--collection .showcase-hero__copy) {
		max-width: 40rem;
	}

	:global(.ui-page-shell.showcase-page--collection .showcase-hero__title) {
		max-width: var(--hero-max-width);
	}

	:global(.ui-page-shell.showcase-page--collection .showcase-hero__intro) {
		max-width: 42rem;
		color: color-mix(in srgb, var(--showcase-muted) 84%, var(--showcase-text));
	}

	:global(.ui-page-shell.showcase-page--collection .showcase-hero__title-icon) {
		width: clamp(2.15rem, 4.5vw, 2.9rem);
		height: clamp(2.15rem, 4.5vw, 2.9rem);
		filter: drop-shadow(0 0 24px rgba(139, 92, 246, 0.22));
	}

	:global(.ui-page-shell.showcase-page--collection .showcase-grid__items) {
		grid-template-columns: repeat(3, minmax(0, var(--project-card-width)));
	}

	@media (max-width: 64em) {
		:global(.ui-page-shell.showcase-page--collection .showcase-grid__items) {
			grid-template-columns: repeat(2, minmax(0, var(--project-card-width)));
			justify-content: center;
		}
	}

	@media (max-width: 40em) {
		:global(.ui-page-shell.showcase-page--collection .showcase-grid__items) {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	:global(.ui-page-shell.showcase-page--collection .showcase-card__art img) {
		opacity: 0.98;
		filter: saturate(0.92) contrast(1.02);
	}

	:global(.ui-page-shell.showcase-page--collection .showcase-card:hover .showcase-card__art img) {
		opacity: 1;
		filter: saturate(1) contrast(1.04);
	}
</style>
