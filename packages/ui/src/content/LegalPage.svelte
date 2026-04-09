<script lang="ts">
	import type { Snippet } from 'svelte'
	import Hero from './Hero.svelte'
	import PageShell from '../layout/PageShell.svelte'
	import Prose from './Prose.svelte'

	type LegalPageProps = {
		title: string
		subtitle: string
		icon?: string
		updatedAt: string
		className?: string
		showNotice?: boolean
		children?: Snippet
	}

	const {
		title,
		subtitle,
		icon = '',
		updatedAt,
		className = '',
		showNotice = false,
		children
	}: LegalPageProps = $props()
</script>

<PageShell className={`legal__shell ${className}`.trim()}>
	<div class="legal__hero-shell">
		<Hero eyebrow="Legal" title={title} subtitle={subtitle} icon={icon} />
	</div>

	<Prose className="legal__page legal">
		<p class="legal__updated">Last updated {updatedAt}</p>
		{@render children?.()}
		{#if showNotice}
			<p class="legal__notice">This page is informational and is not legal advice.</p>
		{/if}
	</Prose>
</PageShell>

<style>
	.legal__hero-shell {
		width: 100%;
	}
</style>
