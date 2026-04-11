<script lang="ts">
	import type { Snippet } from 'svelte'

	type HeroProps = {
		eyebrow?: string
		title?: string
		titleLines?: string[]
		subtitle?: string
		icon?: string
		iconAlt?: string
		iconSize?: string
		className?: string
		heroClass?: string
		glowClass?: string
		eyebrowClass?: string
		titleClass?: string
		subtitleClass?: string
		children?: Snippet
		compact?: boolean
	}

	const {
		eyebrow = '',
		title = '',
		titleLines = [],
		subtitle = '',
		icon = '',
		iconAlt = '',
		// Only override --hero-icon-size when explicitly provided.
		// A default of `var(--hero-icon-size)` would create a self-referential var when assigned inline.
		iconSize = '',
		className = '',
		heroClass = '',
		glowClass = '',
		eyebrowClass = '',
		titleClass = '',
		subtitleClass = '',
		children,
		compact = false
	}: HeroProps = $props()

	function splitTail(input: string) {
		const text = input.trimEnd()
		const parts = text.match(/^(.*\s)(\S+)$/)
		if (!parts) return { head: '', tail: text }
		return { head: parts[1], tail: parts[2] }
	}
</script>

<section class={`ui-hero ${compact ? 'ui-hero--compact' : ''} ${className} ${heroClass}`.trim()}>
	<div class={`ui-hero__glow ${glowClass}`.trim()} aria-hidden="true"></div>
	{#if eyebrow}
		<p class={`ui-hero__eyebrow ${eyebrowClass}`.trim()}>{eyebrow}</p>
	{/if}
	{#if titleLines.length > 0}
		<h1 class={`ui-hero__title ${titleClass}`.trim()}>
			{#each titleLines as line, index}
				{@const lineParts = splitTail(line)}
				{#if icon && index === titleLines.length - 1}
					{lineParts.head}<span class="ui-hero__tail">{lineParts.tail}<span class="ui-hero__icon-wrap"
							><img
								src={icon}
								class="ui-hero__icon"
								alt={iconAlt}
								loading="eager"
								fetchpriority="high"
								decoding="async"
								style={`${iconSize ? `--hero-icon-size: ${iconSize};` : ''} width: var(--hero-icon-size); height: var(--hero-icon-size);`}
							/></span
						></span
					>
				{:else}
					{line.trimEnd()}
				{/if}
				{#if index < titleLines.length - 1}<br />{/if}
			{/each}
		</h1>
	{:else if title}
		<h1 class={`ui-hero__title ${titleClass}`.trim()}>
			{#if icon}
				<span class="ui-hero__title-text">{splitTail(title).head}</span><span class="ui-hero__tail"
					>{splitTail(title).tail}<span class="ui-hero__icon-wrap"
							><img
								src={icon}
								class="ui-hero__icon"
								alt={iconAlt}
								loading="eager"
								fetchpriority="high"
								decoding="async"
								style={`${iconSize ? `--hero-icon-size: ${iconSize};` : ''} width: var(--hero-icon-size); height: var(--hero-icon-size);`}
							/></span
						></span
				>
			{:else}
				<span class="ui-hero__title-text">{title.trimEnd()}</span>
			{/if}
		</h1>
	{/if}
	{#if subtitle}
		<p class={`ui-hero__subtitle ${subtitleClass}`.trim()}>{subtitle}</p>
	{/if}
	{@render children?.()}
</section>

<style>
	.ui-hero {
		display: flex;
		flex-direction: column;
		position: relative;
		isolation: isolate;
		max-width: var(--hero-max-width);
		margin: 0 0 var(--hero-margin-bottom);
		padding-top: var(--hero-padding-top, var(--space-8));
		padding-bottom: var(--hero-padding-bottom, var(--space-8));
	}

	.ui-hero::before {
		position: absolute;
		inset: 0 auto 0 50%;
		z-index: -2;
		width: 100vw;
		transform: translateX(-50%);
		content: '';
		background:
			radial-gradient(circle at 78% 18%, rgba(172, 138, 255, 0.14) 0%, rgba(172, 138, 255, 0) 36%),
			radial-gradient(circle at 18% 6%, rgba(76, 215, 246, 0.08) 0%, rgba(76, 215, 246, 0) 28%),
			linear-gradient(
				180deg,
				rgba(6, 14, 32, 0.18) 0%,
				color-mix(in srgb, var(--panel-bg) 12%, transparent) 42%,
				transparent 100%
			);
		pointer-events: none;
	}

	.ui-hero__glow {
		position: absolute;
		inset: 0 auto auto 50%;
		z-index: -1;
		width: 100vw;
		height: 100%;
		transform: translateX(-50%);
		background:
			radial-gradient(circle at 82% 0, rgba(172, 138, 255, 0.16) 0%, rgba(172, 138, 255, 0) 22rem),
			radial-gradient(circle at 16% 0, rgba(76, 215, 246, 0.08) 0%, rgba(76, 215, 246, 0) 18rem);
		pointer-events: none;
	}

	.ui-hero > :global(*) {
		position: relative;
		z-index: 1;
	}

	.ui-hero--compact {
		margin-bottom: var(--space-6);
		padding-bottom: var(--space-6);
	}

	.ui-hero__eyebrow {
		margin: 0 0 var(--hero-eyebrow-margin-bottom);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--muted);
	}

	.ui-hero__title {
		margin: 0 0 var(--hero-title-margin-bottom);
		font-family: var(--font-serif);
		font-size: clamp(2rem, 4.7vw, 3.25rem);
		line-height: 1.14;
		font-weight: 400;
		letter-spacing: -0.024em;
		color: var(--text);
		text-wrap: balance;
	}

	.ui-hero__subtitle {
		margin: 0;
		font-size: var(--font-size-lg);
		line-height: 1.7;
		color: var(--muted);
		max-width: var(--hero-subtitle-max-width);
		text-wrap: pretty;
	}

	.ui-hero__icon-wrap {
		display: inline-block;
		white-space: nowrap;
		margin-left: 0.25em;
	}

	.ui-hero__tail {
		white-space: nowrap;
	}

	.ui-hero__icon {
		width: var(--hero-icon-size);
		height: var(--hero-icon-size);
		display: inline-block;
		vertical-align: var(--hero-icon-offset-y, -0.12em);
		object-fit: contain;
	}

	@media (max-width: 760px) {
		.ui-hero {
			margin-bottom: var(--space-8);
			padding-top: var(--hero-padding-top-mobile, var(--space-7));
			padding-bottom: var(--hero-padding-bottom-mobile, var(--space-7));
		}
	}
</style>
