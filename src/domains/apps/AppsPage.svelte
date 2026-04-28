<script lang="ts">
	import { PageShell } from '@miko/ui'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import { appsCollection, appsDescription, getAppImage, getAppMeta } from './catalog'

	const heroImage = getAppImage(appsCollection[0]?.id ?? 'sketchpad')
</script>

<Seo
	title="Apps, Tools & Interactive Software"
	description={appsDescription}
	path="/"
	image={heroImage}
	jsonLd={[
		buildWebPageJsonLd({
			path: '/',
			title: 'Apps, Tools & Interactive Software',
			description: appsDescription,
			type: 'CollectionPage'
		})
	]}
/>

<PageShell className="apps-page">
	<div class="apps-page">
		<section class="apps-page__hero" aria-labelledby="apps-page-title">
			<div class="apps-page__hero-copy">
				<p class="apps-page__eyebrow">Apps</p>
				<h1 id="apps-page-title" class="apps-page__title">
					Playful tools, creative apps, and
					<span>
						interactive software
						<span class="apps-page__title-icon-wrap">
							<img
								src="/media/page-icons/holidays-party.png"
								alt="Apps illustration"
								class="apps-page__title-icon"
								loading="eager"
								decoding="async"
							/>
						</span>
					</span>
				</h1>
				<p class="apps-page__intro">
					Apps crafted for making, learning, and play. Browser-native tools for drawing, music, color, mindfulness, and generative art.
				</p>
			</div>

			<div class="apps-page__signal">
				<div class="apps-page__signal-line"></div>
				<span>Software Collection</span>
			</div>
		</section>

		<section class="apps-page__collection" aria-labelledby="apps-collection-title">
			<div class="apps-page__collection-head">
				<div>
					<h2 id="apps-collection-title" class="apps-page__section-title">Collection</h2>
					<p class="apps-page__section-kicker">Creative software for drawing, music, mindfulness, color, and generative art</p>
				</div>
			</div>

			<div class="apps-page__grid">
				{#each appsCollection as app, idx}
					<a href={app.url} class="apps-page__card">
						<div class="apps-page__card-art">
							<img
								src={getAppImage(app.id)}
								alt={`${app.title} preview`}
								loading={idx < 2 ? 'eager' : 'lazy'}
								decoding="async"
							/>
							<div class="apps-page__card-shade"></div>
							<span class="apps-page__badge">{getAppMeta(app.id).accent}</span>
						</div>
						<div class="apps-page__card-copy">
							<p class="apps-page__card-label">{getAppMeta(app.id).label}</p>
							<h3>{app.title}</h3>
							<p>{app.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<section class="apps-page__inquiry" aria-labelledby="apps-inquiry-title">
			<div class="apps-page__inquiry-panel">
				<div class="apps-page__inquiry-copy">
					<h2 id="apps-inquiry-title">Need a custom <span>interactive tool?</span></h2>
					<p>Creative software for education, design systems, musical exploration, and playful digital experiences.</p>
				</div>
				<a href="/contact?from=apps&topic=software" class="apps-page__inquiry-link">Start a Conversation</a>
			</div>
		</section>
	</div>
</PageShell>

<style lang="scss">
	:global(.ui-page-shell.apps-page) {
		grid-template-columns: minmax(0, 1fr);
		padding-top: var(--page-shell-space-top);
		padding-bottom: 0;
		background: transparent;
		color: var(--text);
	}

	:global(.ui-page-shell.apps-page > *) {
		grid-column: 1;
	}

	:global(body:has(.ui-page-shell.apps-page) .layout-footer) {
		margin-top: 0;
	}

	.apps-page {
		--apps-surface: color-mix(in srgb, var(--bg) 94%, var(--brand-primary) 6%);
		--apps-surface-low: color-mix(in srgb, var(--bg) 88%, var(--brand-primary) 12%);
		--apps-surface-container: color-mix(in srgb, var(--panel-bg) 84%, var(--brand-primary) 16%);
		--apps-surface-high: color-mix(in srgb, var(--card-bg) 78%, var(--brand-primary) 22%);
		--apps-surface-highest: color-mix(in srgb, var(--card-bg) 64%, var(--brand-primary) 36%);
		--apps-surface-bright: color-mix(in srgb, var(--card-bg) 58%, var(--brand-primary) 42%);
		--apps-text: var(--text);
		--apps-muted: var(--muted);
		--apps-primary: #ac8aff;
		--apps-primary-dim: #8455ef;
		--apps-secondary: #4cd7f6;
		--apps-outline-variant: color-mix(in srgb, var(--border) 68%, transparent);
		width: 100%;
		overflow: hidden;
		background: transparent;
		color: var(--apps-text);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.apps-page__hero,
	.apps-page__collection,
	.apps-page__inquiry {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
	}

	.apps-page__hero {
		align-content: center;
		padding: var(--space-8) 0;
		background:
			radial-gradient(circle at 78% 18%, rgba(172, 138, 255, 0.14) 0%, rgba(172, 138, 255, 0) 36%),
			radial-gradient(circle at 18% 6%, rgba(76, 215, 246, 0.08) 0%, rgba(76, 215, 246, 0) 28%),
			linear-gradient(
				180deg,
				rgba(6, 14, 32, 0.28) 0%,
				color-mix(in srgb, var(--apps-surface-low) 84%, transparent) 42%,
				color-mix(in srgb, var(--apps-surface-low) 92%, transparent) 100%
			),
			transparent;
	}

	.apps-page__hero > *,
	.apps-page__collection > *,
	.apps-page__inquiry > * {
		grid-column: 2;
	}

	.apps-page__hero-copy {
		max-width: 48rem;
	}

	.apps-page__eyebrow,
	.apps-page__section-kicker {
		margin: 0 0 var(--hero-eyebrow-margin-bottom);
		color: var(--apps-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.apps-page__title {
		max-width: 52rem;
		margin: 0 0 var(--hero-title-margin-bottom);
		color: var(--apps-text);
		font-family: var(--font-serif);
		font-size: clamp(2rem, 4.7vw, 3.25rem);
		font-weight: 400;
		letter-spacing: -0.024em;
		line-height: 1.14;
		text-wrap: balance;

		span {
			color: var(--apps-primary);
			font-style: italic;
		}
	}

	.apps-page__title-icon-wrap {
		display: inline-block;
		margin-left: 0.3em;
		white-space: nowrap;
	}

	.apps-page__title-icon {
		width: clamp(2rem, 4vw, 2.6rem);
		height: clamp(2rem, 4vw, 2.6rem);
		object-fit: contain;
		vertical-align: -0.18em;
		filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.22));
	}

	.apps-page__intro {
		max-width: 56ch;
		margin: 0;
		color: var(--apps-muted);
		font-size: var(--font-size-lg);
		line-height: 1.7;
		text-wrap: pretty;
	}

	.apps-page__signal {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-top: var(--space-12);
		color: var(--apps-secondary);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.apps-page__signal-line {
		width: 6rem;
		height: 1px;
		background: var(--apps-outline-variant);
	}

	.apps-page__section-title,
	.apps-page__card-copy h3,
	.apps-page__inquiry-copy h2 {
		font-family: var(--font-serif);
		font-weight: 400;
		letter-spacing: -0.02em;
		color: var(--apps-text);
	}

	.apps-page__inquiry-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 3.5rem;
		padding: 0 2.4rem;
		border-radius: var(--radius-md);
		background: linear-gradient(90deg, var(--apps-primary), var(--apps-primary-dim));
		box-shadow: 0 0 40px -5px rgba(172, 138, 255, 0.35);
		color: #000;
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			box-shadow 0.3s ease,
			transform 0.3s ease;
	}

	.apps-page__inquiry-link:hover {
		box-shadow: 0 0 60px -5px rgba(172, 138, 255, 0.55);
		transform: translateY(-1px);
	}

	.apps-page__collection {
		padding: var(--space-11) 0 var(--space-10);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--apps-surface-container) 88%, var(--apps-surface-low)) 0%,
				color-mix(in srgb, var(--apps-surface-high) 88%, var(--apps-surface)) 100%
			);
	}

	.apps-page__collection-head {
		margin-bottom: var(--space-10);
	}

	.apps-page__section-title {
		margin: 0 0 var(--space-2);
		font-size: clamp(1.45rem, 2.8vw, 1.75rem);
		line-height: 1.18;
	}

	.apps-page__grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, var(--project-card-width)));
		justify-content: space-between;
		gap: var(--space-8);
	}

	.apps-page__card {
		display: flex;
		flex-direction: column;
		color: var(--apps-text);
		text-decoration: none;

		&:hover {
			.apps-page__card-art img {
				transform: scale(1.06);
			}
		}
	}

	.apps-page__card-art {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border-radius: var(--radius-md);
		background:
			linear-gradient(180deg, var(--apps-surface-bright) 0%, var(--apps-surface-highest) 100%);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);

		img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.7s ease;
		}
	}

	.apps-page__card-shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
		opacity: 0.58;
	}

	.apps-page__badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.3rem 0.8rem;
		border: var(--border-width) solid rgba(76, 215, 246, 0.22);
		border-radius: var(--radius-md);
		background: rgba(0, 42, 51, 0.6);
		color: var(--apps-secondary);
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		backdrop-filter: blur(12px);
	}

	.apps-page__card-copy {
		margin-top: var(--space-5);
	}

	.apps-page__card-label {
		margin: 0 0 var(--space-2);
		color: var(--apps-secondary);
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.apps-page__card-copy h3 {
		margin: 0 0 var(--space-3);
		font-size: clamp(1.35rem, 2.4vw, 1.7rem);
		line-height: 1.14;
	}

	.apps-page__card-copy > p:last-child {
		margin: 0;
		color: var(--apps-muted);
		font-size: var(--font-size-sm);
		line-height: 1.65;
	}

	.apps-page__inquiry {
		padding: var(--space-9) 0;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--apps-surface-high) 82%, var(--apps-surface-low)) 0%,
				var(--apps-surface) 100%
			);
	}

	.apps-page__inquiry-panel {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-10);
		overflow: hidden;
		padding: var(--space-10);
		border: var(--border-width) solid rgba(56, 71, 109, 0.1);
		border-radius: var(--radius-lg);
		background: rgba(23, 43, 84, 0.38);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);

		&::before,
		&::after {
			position: absolute;
			width: 24rem;
			height: 24rem;
			border-radius: 999px;
			content: '';
			filter: blur(100px);
			pointer-events: none;
		}

		&::before {
			top: 0;
			right: 0;
			background: rgba(172, 138, 255, 0.12);
			transform: translate(50%, -50%);
		}

		&::after {
			bottom: 0;
			left: 0;
			background: rgba(76, 215, 246, 0.06);
			transform: translate(-50%, 50%);
		}
	}

	.apps-page__inquiry-copy,
	.apps-page__inquiry-link {
		position: relative;
		z-index: 1;
	}

	.apps-page__inquiry-copy h2 {
		margin: 0 0 var(--space-5);
		font-size: clamp(1.45rem, 2.8vw, 1.75rem);
		line-height: 1.18;

		span {
			color: var(--apps-secondary);
			font-style: italic;
		}
	}

	.apps-page__inquiry-copy p {
		max-width: 34rem;
		margin: 0;
		color: var(--apps-muted);
		font-size: var(--font-size-base);
		line-height: 1.6;
	}

	@media (max-width: 1024px) {
		.apps-page__grid {
			grid-template-columns: repeat(2, minmax(0, var(--project-card-width)));
			justify-content: center;
		}
	}

	@media (max-width: 768px) {
		:global(.ui-page-shell.apps-page) {
			padding-top: var(--page-shell-space-top-mobile);
		}

		.apps-page__hero {
			padding-top: var(--space-7);
		}

		.apps-page__inquiry-panel {
			padding: var(--space-8);
		}

		.apps-page__inquiry-panel {
			align-items: stretch;
			flex-direction: column;
		}
	}

	@media (max-width: 640px) {
		.apps-page__grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
