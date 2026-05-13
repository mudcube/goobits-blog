<script lang="ts">
	import type { Snippet } from 'svelte'
	import ShowcaseHero from '../showcase/ShowcaseHero.svelte'
	import PageShell from '../layout/PageShell.svelte'
	import Prose from './Prose.svelte'

	type LegalPageProps = {
		title: string
		titleAccent?: string
		accentColor?: string
		subtitle: string
		icon?: string
		updatedAt: string
		className?: string
		showNotice?: boolean
		children?: Snippet
	}

	const {
		title,
		titleAccent = '',
		accentColor = '',
		subtitle,
		icon = '',
		updatedAt,
		className = '',
		showNotice = false,
		children
	}: LegalPageProps = $props()
</script>

<PageShell className={`legal__shell showcase-page ${className}`.trim()}>
	<div class="showcase-page__inner legal__inner" style={`--legal-accent-color:${accentColor || '#c87b36'};`}>
		<ShowcaseHero
			eyebrow="Legal"
			title={title}
			titleAccent={titleAccent}
			icon={icon}
			iconAlt={`${title} icon`}
			intro={subtitle}
			signalLabel={`Updated ${updatedAt}`}
			className="legal__hero"
		/>

		<Prose className="legal__page legal">
			{@render children?.()}
			{#if showNotice}
				<p class="legal__notice">This page is informational and is not legal advice.</p>
			{/if}
		</Prose>
	</div>
</PageShell>

<style>
	:global(.legal__shell) {
		--showcase-surface: color-mix(in srgb, var(--bg) 96%, #7a8ca5 4%);
		--showcase-surface-low: color-mix(in srgb, var(--bg) 92%, #7a8ca5 8%);
		--showcase-surface-high: color-mix(in srgb, var(--card-bg) 84%, #7a8ca5 16%);
		--showcase-surface-highest: color-mix(in srgb, var(--card-bg) 76%, #e7d7b1 24%);
		--showcase-surface-bright: color-mix(in srgb, var(--card-bg) 70%, #e7d7b1 30%);
		--showcase-text: var(--text);
		--showcase-muted: color-mix(in srgb, var(--muted) 92%, var(--text));
		--showcase-primary: #c87b36;
		--showcase-primary-dim: #8a5525;
		--showcase-secondary: #7a8ca5;
		--showcase-outline-variant: color-mix(in srgb, var(--border) 72%, transparent);
		--showcase-glow-primary: rgba(200, 123, 54, 0.08);
		--showcase-glow-secondary: rgba(122, 140, 165, 0.06);
		--showcase-hero-shadow: rgba(18, 14, 10, 0.06);
		width: 100%;
	}

	:global(.legal__hero) {
		--showcase-primary: var(--legal-accent-color, #c87b36);
	}

	:global(.legal__page) {
		width: 100%;
		justify-self: center;
	}
</style>
