<script lang="ts">
	import { PageShell, ShowcaseCard, ShowcaseCTA, ShowcaseGrid, ShowcaseHero } from '@goobits/ui'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import { artWorks, artWorkTypes } from './content'

	const description =
		'Selected visual experiments, product concepts, merch ideas, packaging designs, and interactive art by Miko Meow.'
</script>

<Seo
	title="Art, Product Concepts & Visual Experiments"
	{description}
	path="/art/"
	image="/media/page-icons/art-rainbow-imagination.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: '/art/',
			title: 'Art, Product Concepts & Visual Experiments',
			description,
			type: 'CollectionPage'
		})
	]}
/>

<PageShell className="showcase-page showcase-page--portfolio showcase-page--art">
	<div class="showcase-page__inner">
		<ShowcaseHero
			eyebrow="Art"
			title="Product concepts, merch, and"
			titleAccent="visual experiments"
			titleAccentNewLine
			icon="/media/page-icons/art-rainbow-imagination.png"
			iconAlt="Art rainbow icon"
			intro="A working gallery of t-shirt concepts, Portland Ketchup experiments, packaging designs, and other product-ready visuals."
			signalLabel="Studio Board No. 019"
			chips={artWorkTypes}
		/>

		<ShowcaseGrid title="Selected Works" kicker="Objects, visuals, and playful product directions" filterLabel="View // Mixed Media">
			{#each artWorks as work, idx}
				<ShowcaseCard
					href="/contact?from=art&topic=commissions_exhibits"
					image={work.image}
					alt={work.title}
					badge={work.badge}
					badgeTone={idx % 2 === 0 ? 'warm' : 'cool'}
					title={work.title}
					meta={work.category}
					description={work.note}
					playLabel="View"
					loading="lazy"
					fetchpriority="auto"
				/>
			{/each}
		</ShowcaseGrid>

		<ShowcaseCTA
			title="Need a custom"
			titleAccent="visual system?"
			copy="Custom visual work, installations, product concepts, or exhibition collaborations."
			href="/contact?from=art&topic=commissions_exhibits"
			linkLabel="Get in Touch"
		/>
	</div>
</PageShell>

<style lang="scss">
	:global(.ui-page-shell.showcase-page--art) {
		--showcase-surface-highest: color-mix(in srgb, var(--card-bg) 64%, #8b5cf6 36%);
		--showcase-glow-primary: rgba(172, 138, 255, 0.16);
		--showcase-glow-secondary: rgba(76, 215, 246, 0.08);
		--showcase-hero-shadow: rgba(6, 14, 32, 0.22);
		--showcase-chip-border: rgba(101, 117, 158, 0.28);
		--showcase-chip-bg: rgba(23, 43, 84, 0.28);
		--showcase-chip-border-hover: rgba(76, 215, 246, 0.5);
		--showcase-chip-bg-hover: rgba(76, 215, 246, 0.12);
		--showcase-chip-text-hover: var(--showcase-secondary);
		--showcase-chip-icon-bg: rgba(172, 138, 255, 0.18);
		--showcase-filter-border: rgba(101, 117, 158, 0.2);
		--showcase-filter-bg: var(--showcase-surface-high);
		--showcase-badge-border: rgba(76, 215, 246, 0.2);
		--showcase-badge-bg: rgba(0, 42, 51, 0.56);
		--showcase-badge-text: var(--showcase-secondary-on-container);
		--showcase-badge-warm-border: rgba(254, 166, 25, 0.2);
		--showcase-badge-warm-bg: rgba(254, 166, 25, 0.38);
		--showcase-badge-warm-text: var(--showcase-tertiary-on-container);
		--showcase-play-border: rgba(172, 138, 255, 0.4);
		--showcase-play-bg: rgba(172, 138, 255, 0.22);
		--showcase-play-shadow: 0 0 30px rgba(172, 138, 255, 0.4);
		--showcase-card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
		--showcase-cta-border: rgba(56, 71, 109, 0.1);
		--showcase-cta-bg: rgba(23, 43, 84, 0.36);
		--showcase-cta-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
		--showcase-cta-glow-primary: rgba(172, 138, 255, 0.12);
		--showcase-cta-glow-secondary: rgba(76, 215, 246, 0.06);
		--showcase-cta-link-shadow: 0 0 40px -5px rgba(172, 138, 255, 0.4);
		--showcase-cta-link-shadow-hover: 0 0 60px -5px rgba(172, 138, 255, 0.6);
		--showcase-link-text: #000;
	}
</style>
