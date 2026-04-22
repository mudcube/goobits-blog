<script lang="ts">
	import { PageShell, ShowcaseCard, ShowcaseCTA, ShowcaseGrid, ShowcaseHero } from '@miko/ui'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import type { ShowcaseCollectionPageProps } from './config'

	const {
		path,
		seoTitle,
		description,
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

		<ShowcaseGrid
			title={gridTitle}
			kicker={gridKicker}
			filterLabel={gridFilterLabel}
		>
			{#each entries as entry, idx}
				<ShowcaseCard
					href={entry.href}
					image={entry.image}
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
		--showcase-surface: color-mix(in srgb, var(--bg) 94%, #312e81 6%);
		--showcase-surface-low: color-mix(in srgb, var(--bg) 88%, #312e81 12%);
		--showcase-surface-high: color-mix(in srgb, var(--card-bg) 76%, #4338ca 24%);
		--showcase-surface-highest: color-mix(in srgb, var(--card-bg) 64%, #7c3aed 36%);
		--showcase-surface-bright: color-mix(in srgb, var(--card-bg) 56%, #22d3ee 44%);
		--showcase-text: var(--text);
		--showcase-muted: var(--muted);
		--showcase-primary: #8b5cf6;
		--showcase-primary-dim: #4f46e5;
		--showcase-secondary: #22d3ee;
		--showcase-secondary-on-container: #67e8f9;
		--showcase-tertiary: #f59e0b;
		--showcase-tertiary-on-container: #402100;
		--showcase-outline-variant: color-mix(in srgb, var(--border) 68%, transparent);
		--showcase-glow-primary: rgba(139, 92, 246, 0.18);
		--showcase-glow-secondary: rgba(34, 211, 238, 0.08);
		--showcase-hero-shadow: rgba(6, 14, 32, 0.24);
		--showcase-chip-border: rgba(99, 102, 241, 0.32);
		--showcase-chip-bg: rgba(26, 35, 74, 0.3);
		--showcase-chip-border-hover: rgba(34, 211, 238, 0.5);
		--showcase-chip-bg-hover: rgba(34, 211, 238, 0.12);
		--showcase-chip-text-hover: var(--showcase-secondary);
		--showcase-chip-icon-bg: rgba(139, 92, 246, 0.22);
		--showcase-filter-border: rgba(99, 102, 241, 0.24);
		--showcase-filter-bg: var(--showcase-surface-high);
		--showcase-badge-border: rgba(34, 211, 238, 0.22);
		--showcase-badge-bg: rgba(4, 28, 36, 0.58);
		--showcase-badge-text: var(--showcase-secondary-on-container);
		--showcase-badge-warm-border: rgba(245, 158, 11, 0.24);
		--showcase-badge-warm-bg: rgba(245, 158, 11, 0.4);
		--showcase-badge-warm-text: var(--showcase-tertiary-on-container);
		--showcase-play-border: rgba(139, 92, 246, 0.4);
		--showcase-play-bg: rgba(139, 92, 246, 0.2);
		--showcase-play-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
		--showcase-card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.44);
		--showcase-cta-border: rgba(56, 71, 109, 0.12);
		--showcase-cta-bg: rgba(23, 43, 84, 0.34);
		--showcase-cta-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.32);
		--showcase-cta-glow-primary: rgba(139, 92, 246, 0.12);
		--showcase-cta-glow-secondary: rgba(34, 211, 238, 0.06);
		--showcase-cta-link-shadow: 0 0 40px -5px rgba(139, 92, 246, 0.42);
		--showcase-cta-link-shadow-hover: 0 0 60px -5px rgba(139, 92, 246, 0.6);
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

	:global(.ui-page-shell.showcase-page--collection .showcase-card__art img) {
		opacity: 0.98;
		filter: saturate(0.92) contrast(1.02);
	}

	:global(.ui-page-shell.showcase-page--collection .showcase-card:hover .showcase-card__art img) {
		opacity: 1;
		filter: saturate(1) contrast(1.04);
	}
</style>
