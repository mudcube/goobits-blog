<script lang="ts">
	import { ArrowRight, Check, ClipboardCheck, Compass, Rocket } from '@lucide/svelte'
	import { PageShell } from '@goobits/ui'
	import { Seo, buildPersonJsonLd, buildWebPageJsonLd } from '$lib/app/seo'

	const description =
		'Product and technical advisory for founders and small teams who need senior help getting software products unstuck.'

	const goodFits = [
		"You're a founder deciding what to build next",
		'Your app is close to launch but stuck',
		"You're hiring developers or an agency",
		'Your product works, but feels messy',
		'You need a practical AI or tooling strategy',
		'You want a senior technical review before spending more'
	]

	const offers = [
		{
			title: 'Founder Sanity Check',
			icon: Compass,
			detail: '90 minutes plus written notes for product direction, roadmap, architecture, hiring, or "am I thinking about this correctly?" decisions.',
			price: 'Starts at $750'
		},
		{
			title: 'Product & Tech Triage',
			icon: ClipboardCheck,
			detail: 'A focused review of your product, UX, roadmap, codebase, and technical risks with a ranked action plan.',
			price: 'Starts at $2,500'
		},
		{
			title: 'Launch Rescue',
			icon: Rocket,
			detail: 'For teams close to shipping but stuck in scope, polish, bugs, product uncertainty, or implementation tradeoffs.',
			price: 'Starts at $5,000'
		}
	]

	const outcomes = [
		'A blunt, useful read on what matters',
		'A ranked list of risks, fixes, and next steps',
		'Product, design, engineering, and business judgment together',
		'Written recommendations you can act on',
		'Optional follow-up implementation or review'
	]
</script>

<Seo
	title="Product & Technical Advisory"
	{description}
	path="/advisory/"
	image="/media/brand/miko.jpg"
	jsonLd={[
		buildPersonJsonLd(),
		buildWebPageJsonLd({
			path: '/advisory/',
			title: 'Product & Technical Advisory',
			description,
			type: 'WebPage'
		})
	]}
/>

<PageShell className="advisory-page">
	<section class="advisory-page__hero" aria-labelledby="advisory-title">
		<div class="advisory-page__hero-copy">
			<p class="advisory-page__eyebrow">Product & Technical Advisory</p>
			<h1 id="advisory-title">Get your product unstuck.</h1>
			<p class="advisory-page__lead">
				Short, senior help for founders and small teams building software, creative tools, educational products, and interactive experiences.
			</p>
			<p class="advisory-page__intro">
				I help you figure out what to build, what to cut, what is risky, and what to do next before you waste months or real money.
			</p>
			<a class="advisory-page__primary-link" href="/contact?from=advisory&topic=intake">
				Tell me what's stuck
				<ArrowRight size={18} strokeWidth={2.3} aria-hidden="true" />
			</a>
		</div>
		<figure class="advisory-page__portrait">
			<img
				src="/media/brand/miko.jpg"
				alt="Portrait of Miko"
				width="320"
				height="320"
				loading="eager"
				decoding="async"
				fetchpriority="high"
			/>
		</figure>
	</section>

	<section class="advisory-page__section advisory-page__section--fits" aria-labelledby="advisory-fits-title">
		<p class="advisory-page__section-label">Good Fits</p>
		<h2 id="advisory-fits-title">Useful when product, code, team, and business decisions are tangled together.</h2>
		<div class="advisory-page__fit-grid">
			{#each goodFits as fit}
				<div class="advisory-page__fit-item">
					<Check size={18} strokeWidth={2.4} color="#166b44" style="margin-top: 0.1rem" aria-hidden="true" />
					<span>{fit}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="advisory-page__section" aria-labelledby="advisory-offers-title">
		<div class="advisory-page__section-head">
			<p class="advisory-page__section-label">Ways I Can Help</p>
			<h2 id="advisory-offers-title">Small, fixed-scope engagements with clear next steps.</h2>
		</div>
		<div class="advisory-page__offer-grid">
			{#each offers as offer}
				<article class="advisory-page__offer">
					<svelte:component this={offer.icon} size={22} strokeWidth={2.1} color="#166b44" aria-hidden="true" />
					<h3>{offer.title}</h3>
					<p>{offer.detail}</p>
					<strong>{offer.price}</strong>
				</article>
			{/each}
		</div>
	</section>

	<section class="advisory-page__section advisory-page__section--split" aria-labelledby="advisory-outcomes-title">
		<div>
			<p class="advisory-page__section-label">What You Get</p>
			<h2 id="advisory-outcomes-title">Clarity, judgment, and momentum.</h2>
		</div>
		<ul class="advisory-page__outcomes">
			{#each outcomes as outcome}
				<li>{outcome}</li>
			{/each}
		</ul>
	</section>

	<section class="advisory-page__section advisory-page__section--proof" aria-labelledby="advisory-proof-title">
		<p class="advisory-page__section-label">Why Me</p>
		<h2 id="advisory-proof-title">Thirty years building software, creative tools, educational products, and founder-led companies.</h2>
		<div class="advisory-page__proof-grid">
			<p>Founder & CTO of Sketch.IO, creators of Sketchpad.</p>
			<p>Co-founder of Portlandia Foods, acquired 2023.</p>
			<p>Co-founder of Lyrics Freak, acquired 2010.</p>
			<p>Selected work with Google, Art Gallery of Ontario, Dubai Union Metro, Los Alamos National Laboratory, ABCya, and Travel Portland.</p>
		</div>
	</section>

	<section class="advisory-page__section advisory-page__pricing" aria-labelledby="advisory-pricing-title">
		<div>
			<p class="advisory-page__section-label">Pricing</p>
			<h2 id="advisory-pricing-title">Most engagements are short and fixed-scope.</h2>
		</div>
		<div class="advisory-page__pricing-copy">
			<p>Advisory sessions start at $750.</p>
			<p>Product and technical triage starts at $2,500.</p>
			<p>Launch rescue and deeper reviews are scoped after a short intro.</p>
			<p>Limited hourly advisory is available at $250/hr with a 3-hour minimum.</p>
		</div>
		<a class="advisory-page__secondary-link" href="/contact?from=advisory&topic=intake">
			Tell me what's stuck
			<ArrowRight size={18} strokeWidth={2.3} aria-hidden="true" />
		</a>
	</section>
</PageShell>

<style lang="scss">
	:global(.ui-page-shell.advisory-page) {
		grid-template-columns: minmax(0, 1fr);
		padding-top: var(--page-shell-space-top);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	:global(.ui-page-shell.advisory-page > *) {
		grid-column: 1;
	}

	.advisory-page__hero,
	.advisory-page__section {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
	}

	.advisory-page__hero > *,
	.advisory-page__section > * {
		grid-column: 2;
	}

	.advisory-page__hero {
		grid-template-rows: auto;
		padding: var(--space-9) 0 var(--space-12);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--panel-bg) 70%, transparent) 0%, transparent 82%),
			transparent;
	}

	.advisory-page__hero > :global(*) {
		grid-row: 1;
	}

	.advisory-page__hero-copy {
		max-width: 42rem;
		align-self: center;
		z-index: 1;
	}

	.advisory-page__eyebrow,
	.advisory-page__section-label {
		margin: 0 0 var(--space-3);
		color: var(--text-tertiary, var(--muted));
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.advisory-page__hero h1,
	.advisory-page__section h2 {
		margin: 0;
		color: var(--text);
		font-family: var(--font-serif);
		font-weight: 400;
		letter-spacing: -0.02em;
		line-height: 1.14;
		text-wrap: balance;
	}

	.advisory-page__hero h1 {
		max-width: 12ch;
		font-size: clamp(2.4rem, 7vw, 4.8rem);
	}

	.advisory-page__section h2 {
		max-width: 38rem;
		font-size: clamp(1.55rem, 3.5vw, 2.2rem);
	}

	.advisory-page__lead,
	.advisory-page__intro {
		max-width: 39rem;
		margin: var(--space-6) 0 0;
		color: var(--muted);
		font-size: var(--font-size-lg);
		line-height: 1.65;
		text-wrap: pretty;
	}

	.advisory-page__intro {
		margin-top: var(--space-4);
		font-size: var(--font-size-base);
	}

	.advisory-page__primary-link,
	.advisory-page__secondary-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-height: 44px;
		margin-top: var(--space-7);
		padding: 0 var(--space-5);
		border: var(--border-width) solid color-mix(in srgb, var(--text) 72%, transparent);
		border-radius: 999px;
		background: var(--text);
		color: var(--bg);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.advisory-page__primary-link:hover,
	.advisory-page__secondary-link:hover {
		transform: translateY(-1px);
	}

	.advisory-page__portrait {
		justify-self: end;
		align-self: center;
		width: min(22rem, 34vw);
		margin: 0;
		opacity: 0.92;
	}

	.advisory-page__portrait img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1;
		border-radius: 50%;
		object-fit: cover;
		transform: scaleX(-1);
	}

	.advisory-page__section {
		padding: var(--space-12) 0;
		border-top: var(--border-width) solid color-mix(in srgb, var(--border) 70%, transparent);
	}

	.advisory-page__section-head {
		display: grid;
		gap: var(--space-3);
	}

	.advisory-page__fit-grid,
	.advisory-page__offer-grid,
	.advisory-page__proof-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-4);
		margin-top: var(--space-8);
	}

	.advisory-page__fit-item {
		display: grid;
		grid-template-columns: 1.25rem minmax(0, 1fr);
		gap: var(--space-3);
		align-items: start;
		padding: var(--space-4) 0;
		border-top: var(--border-width) solid color-mix(in srgb, var(--border) 64%, transparent);
		color: var(--muted);
		font-size: var(--font-size-sm);
		line-height: 1.55;
	}

	.advisory-page__offer {
		display: flex;
		min-height: 18rem;
		flex-direction: column;
		padding: var(--space-5);
		border: var(--border-width) solid color-mix(in srgb, var(--border) 76%, transparent);
		border-radius: 8px;
		background: color-mix(in srgb, var(--card-bg) 84%, transparent);
	}

	.advisory-page__offer h3 {
		margin: var(--space-5) 0 var(--space-3);
		color: var(--text);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0;
		line-height: 1.25;
	}

	.advisory-page__offer p,
	.advisory-page__proof-grid p,
	.advisory-page__pricing-copy p {
		margin: 0;
		color: var(--muted);
		font-size: var(--font-size-sm);
		line-height: 1.65;
	}

	.advisory-page__offer strong {
		margin-top: auto;
		padding-top: var(--space-5);
		color: var(--text);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
	}

	.advisory-page__section--split,
	.advisory-page__pricing {
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, calc(var(--max-width) * 0.44))
			minmax(var(--space-8), calc(var(--max-width) * 0.08))
			minmax(0, calc(var(--max-width) * 0.48))
			minmax(var(--layout-inline-gutter), 1fr);
	}

	.advisory-page__section--split > :first-child,
	.advisory-page__pricing > :first-child {
		grid-column: 2;
	}

	.advisory-page__outcomes,
	.advisory-page__pricing-copy {
		grid-column: 4;
	}

	.advisory-page__outcomes {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.advisory-page__outcomes li {
		padding-bottom: var(--space-3);
		border-bottom: var(--border-width) solid color-mix(in srgb, var(--border) 62%, transparent);
		color: var(--muted);
		font-size: var(--font-size-sm);
		line-height: 1.55;
	}

	.advisory-page__proof-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.advisory-page__proof-grid p {
		padding-top: var(--space-4);
		border-top: var(--border-width) solid color-mix(in srgb, var(--border) 64%, transparent);
	}

	.advisory-page__pricing-copy {
		display: grid;
		gap: var(--space-3);
	}

	.advisory-page__secondary-link {
		grid-column: 4;
		justify-self: start;
		background: transparent;
		color: var(--text);
	}

	@media (max-width: 64em) {
		.advisory-page__fit-grid,
		.advisory-page__offer-grid {
			grid-template-columns: 1fr;
		}

		.advisory-page__offer {
			min-height: 0;
		}
	}

	@media (max-width: 48em) {
		.advisory-page__hero {
			padding-top: var(--space-6);
		}

		.advisory-page__hero > :global(*) {
			grid-row: auto;
		}

		.advisory-page__portrait {
			justify-self: start;
			width: 8rem;
			margin-top: var(--space-8);
		}

		.advisory-page__section--split,
		.advisory-page__pricing {
			grid-template-columns:
				minmax(var(--layout-inline-gutter), 1fr)
				minmax(0, var(--max-width))
				minmax(var(--layout-inline-gutter), 1fr);
		}

		.advisory-page__section--split > :first-child,
		.advisory-page__pricing > :first-child,
		.advisory-page__outcomes,
		.advisory-page__pricing-copy,
		.advisory-page__secondary-link {
			grid-column: 2;
		}

		.advisory-page__outcomes,
		.advisory-page__pricing-copy {
			margin-top: var(--space-7);
		}

		.advisory-page__proof-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
