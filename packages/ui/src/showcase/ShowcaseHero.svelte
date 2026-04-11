<script lang="ts">
	import type { Component, Snippet } from 'svelte'

	type ShowcaseChip = {
		href: string
		label: string
		icon?: string | Component
	}

	type ShowcaseHeroProps = {
		eyebrow: string
		title: string
		titleAccent?: string
		icon?: string
		iconAlt?: string
		intro: string
		signalLabel?: string
		chips?: ShowcaseChip[]
		className?: string
		children?: Snippet
	}

	const {
		eyebrow,
		title,
		titleAccent = '',
		icon = '',
		iconAlt = '',
		intro,
		signalLabel = '',
		chips = [],
		className = '',
		children
	}: ShowcaseHeroProps = $props()
</script>

<section class={`showcase-hero ${className}`.trim()}>
	<div class="showcase-hero__copy">
		<p class="showcase-hero__eyebrow">{eyebrow}</p>
		<h1 class="showcase-hero__title">
			{title}
			{#if titleAccent}
				<span>
					{titleAccent}
					{#if icon}
						<span class="showcase-hero__title-icon-wrap"
							><img
								src={icon}
								alt={iconAlt}
								class="showcase-hero__title-icon"
								loading="eager"
								fetchpriority="high"
								decoding="async"
							/></span
						>
					{/if}
				</span>
			{/if}
		</h1>
		<p class="showcase-hero__intro">{intro}</p>
	</div>

	{#if signalLabel}
		<div class="showcase-hero__signal">
			<div class="showcase-hero__signal-line"></div>
			<span>{signalLabel}</span>
		</div>
	{/if}

	{#if chips.length}
		<div class="showcase-hero__chips" aria-label={`${eyebrow} links`}>
				{#each chips as chip}
					<a href={chip.href} class="showcase-hero__chip">
						{#if chip.icon}
							<span class="showcase-hero__chip-icon" aria-hidden="true">
								{#if typeof chip.icon === 'string'}
									{chip.icon}
								{:else}
									<chip.icon size={14} strokeWidth={2.2} />
								{/if}
							</span>
						{/if}
						{chip.label}
					</a>
				{/each}
		</div>
	{/if}

	{@render children?.()}
</section>

<style>
	.showcase-hero {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
		position: relative;
		isolation: isolate;
		align-content: center;
		padding: var(--space-8) 0;
	}

	.showcase-hero > * {
		position: relative;
		z-index: 1;
		grid-column: 2;
	}

	.showcase-hero::before {
		position: absolute;
		inset: 0 auto 0 50%;
		z-index: -1;
		width: 100vw;
		transform: translateX(-50%);
		content: '';
		background:
			radial-gradient(circle at 78% 18%, var(--showcase-glow-primary, rgba(172, 138, 255, 0.14)) 0%, rgba(172, 138, 255, 0) 36%),
			radial-gradient(circle at 18% 6%, var(--showcase-glow-secondary, rgba(76, 215, 246, 0.08)) 0%, rgba(76, 215, 246, 0) 28%),
			linear-gradient(
				180deg,
				var(--showcase-hero-shadow, rgba(6, 14, 32, 0.28)) 0%,
				color-mix(in srgb, var(--showcase-surface-low) 84%, transparent) 42%,
				color-mix(in srgb, var(--showcase-surface-low) 92%, transparent) 100%
			),
			transparent;
		pointer-events: none;
	}

	.showcase-hero__copy {
		max-width: var(--hero-max-width);
	}

	.showcase-hero__eyebrow {
		margin: 0 0 var(--hero-eyebrow-margin-bottom);
		color: var(--showcase-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.showcase-hero__title {
		max-width: var(--hero-max-width);
		margin: 0 0 var(--hero-title-margin-bottom);
		color: var(--showcase-text);
		font-family: var(--font-serif);
		font-size: clamp(2rem, 4.7vw, 3.25rem);
		font-weight: 400;
		letter-spacing: -0.024em;
		line-height: 1.14;
		text-wrap: balance;
	}

	.showcase-hero__title span {
		color: var(--showcase-primary);
		font-style: italic;
	}

	.showcase-hero__title-icon-wrap {
		display: inline-block;
		margin-left: 0.25em;
		white-space: nowrap;
	}

	.showcase-hero__title-icon {
		display: inline-block;
		width: clamp(2rem, 4.2vw, 2.6rem);
		height: clamp(2rem, 4.2vw, 2.6rem);
		object-fit: contain;
		vertical-align: -0.12em;
	}

	.showcase-hero__intro {
		max-width: var(--hero-subtitle-max-width);
		margin: 0;
		color: var(--showcase-muted);
		font-size: var(--font-size-lg);
		letter-spacing: 0;
		line-height: 1.7;
		text-wrap: pretty;
	}

	.showcase-hero__signal {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-top: var(--space-12);
		color: var(--showcase-secondary);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.showcase-hero__signal-line {
		width: 6rem;
		height: 1px;
		background: var(--showcase-outline-variant);
	}

	.showcase-hero__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}

	.showcase-hero__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 2.6rem;
		padding: 0 var(--space-4) 0 var(--space-3);
		border: var(--border-width) solid var(--showcase-chip-border, rgba(101, 117, 158, 0.28));
		border-radius: var(--radius-md);
		background: var(--showcase-chip-bg, rgba(23, 43, 84, 0.3));
		backdrop-filter: blur(12px);
		color: var(--showcase-text);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		text-decoration: none;
		transition:
			background 0.3s ease,
			border-color 0.3s ease,
			color 0.3s ease,
			transform 0.3s ease;
	}

	.showcase-hero__chip:hover {
		border-color: var(--showcase-chip-border-hover, rgba(76, 215, 246, 0.5));
		background: var(--showcase-chip-bg-hover, rgba(76, 215, 246, 0.12));
		color: var(--showcase-chip-text-hover, var(--showcase-secondary));
		transform: translateY(-2px);
	}

	.showcase-hero__chip-icon {
		display: inline-grid;
		place-items: center;
		min-width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--radius-pill);
		background: var(--showcase-chip-icon-bg, rgba(172, 138, 255, 0.18));
		color: var(--showcase-text);
		font-size: 0.65rem;
		line-height: 1;
	}

	@media (max-width: 768px) {
		.showcase-hero {
			padding-top: var(--space-7);
			padding-bottom: var(--space-8);
		}

		.showcase-hero__chips {
			gap: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.showcase-hero__signal {
			align-items: flex-start;
			flex-direction: column;
		}

		.showcase-hero__chip {
			width: 100%;
			justify-content: center;
		}
	}
</style>
