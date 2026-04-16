<script lang="ts">
	import { PageShell, ShowcaseCard, ShowcaseCTA, ShowcaseGrid, ShowcaseHero } from '@miko/ui'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import { labsCatalog } from '@src/domains/labs/catalog'

	const description =
		'Browse playful web experiments, prototypes, and creative coding labs from Miko Meow.'

	const labImageByHref: Record<string, string> = {
		'/labs/color-galaxy/': '/media/labs/color-galaxy-card.png',
		'/labs/js1k/BreathingGalaxies.html': '/journal/2010/08/what-can-1kb-of-javascript-do/images/BreathingGalaxies.jpeg',
		'/labs/js1k/Daltonize.html': '/journal/2011/10/color-accessibility-on-digital-displays/images/hero.png',
		'/labs/js1k/MicroSketchpad.html': '/journal/2010/08/what-can-1kb-of-javascript-do/images/MicroSketchpad.jpeg',
		'/labs/js1k/SpectrumDJ.html': '/journal/2010/08/what-can-1kb-of-javascript-do/images/SpectrumDJ.jpeg',
		'/labs/midi-js/': '/journal/2012/02/midi-js/images/hero.png',
		'/labs/sketch-js/': '/media/labs/sketch-js-card.png',
		'/labs/sketchpad-1.0/': '/media/labs/sketchpad-v1-card.webp',
		'/labs/thumbnailer/': '/journal/2011/11/batch-thumbnail-generator/images/hero.png',
		'/labs/zen-bg/': '/media/labs/zen-bg-card.webp'
	}

	function getLabImage(href: string) {
		return labImageByHref[href] || '/media/page-icons/labs-flask.png'
	}

	function getLabMeta(href: string) {
		if (href.includes('/js1k/')) return 'JS1K'
		if (href.includes('midi')) return 'Audio Tool'
		if (href.includes('sketch')) return 'Sketch Tool'
		if (href.includes('thumbnail')) return 'Utility'
		return 'Experiment'
	}

	function formatBadgeDate(date?: string) {
		if (!date) return ''
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric'
		})
	}

	const labEntries: Array<{
		href: string
		title: string
		vibe: string
		date?: string
		image: string
		meta: string
		badge: string
		badgeTone: 'cool' | 'warm'
	}> = labsCatalog.map((item) => ({
		...item,
		image: getLabImage(item.href),
		meta: getLabMeta(item.href),
		badge: formatBadgeDate(item.date),
		badgeTone: item.date ? 'cool' : 'warm'
	}))
</script>

<Seo
	title="Creative Coding Labs"
	{description}
	path="/labs/"
	image="/media/page-icons/labs-flask.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: '/labs/',
			title: 'Creative Coding Labs',
			description,
			type: 'CollectionPage'
		})
	]}
/>

<PageShell className="showcase-page showcase-page--labs">
	<div class="showcase-page__inner">
		<ShowcaseHero
			eyebrow="Labs"
			title="Experiments, tools, and"
			titleAccent="browser curiosities"
			icon="/media/page-icons/labs-flask.png"
			iconAlt="Labs flask icon"
			intro="A cabinet of playful browser sketches, tiny creative tools, old prototypes, and odd technical artifacts from different eras of the web."
			signalLabel="Lab Archive No. 010"
		/>

		<ShowcaseGrid
			title="Experiment Index"
			kicker="Small tools, visual sketches, audio toys, and browser-side experiments"
			filterLabel="View // Browser Labs"
		>
			{#each labEntries as entry, idx}
				<ShowcaseCard
					href={entry.href}
					image={entry.image}
					alt={entry.title}
					badge={entry.badge}
					badgeTone="cool"
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
			title="Want a custom"
			titleAccent="creative tool?"
			copy="Interactive prototypes, visual experiments, educational tools, or browser-native ideas built to fit a project."
			href="/contact?from=labs&topic=creative_tooling"
			linkLabel="Start a Conversation"
		/>
	</div>
</PageShell>

<style lang="scss">
	:global(.ui-page-shell.showcase-page--labs) {
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

	:global(.ui-page-shell.showcase-page--labs .showcase-hero__copy) {
		max-width: 40rem;
	}

	:global(.ui-page-shell.showcase-page--labs .showcase-hero__title) {
		max-width: var(--hero-max-width);
	}

	:global(.ui-page-shell.showcase-page--labs .showcase-hero__intro) {
		max-width: 42rem;
		color: color-mix(in srgb, var(--showcase-muted) 84%, var(--showcase-text));
	}

	:global(.ui-page-shell.showcase-page--labs .showcase-hero__title-icon) {
		width: clamp(2.15rem, 4.5vw, 2.9rem);
		height: clamp(2.15rem, 4.5vw, 2.9rem);
		filter: drop-shadow(0 0 24px rgba(139, 92, 246, 0.22));
	}

	:global(.ui-page-shell.showcase-page--labs .showcase-grid__items) {
		grid-template-columns: repeat(3, minmax(0, var(--project-card-width)));
	}

	:global(.ui-page-shell.showcase-page--labs .showcase-card__art img) {
		opacity: 0.98;
		filter: saturate(0.92) contrast(1.02);
	}

	:global(.ui-page-shell.showcase-page--labs .showcase-card:hover .showcase-card__art img) {
		opacity: 1;
		filter: saturate(1) contrast(1.04);
	}
</style>
