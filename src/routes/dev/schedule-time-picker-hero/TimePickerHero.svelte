<script lang="ts">
	import { Hero, PageShell } from '@miko/ui'
	import type { Snippet } from 'svelte'
	import DevBreadcrumb from '../DevBreadcrumb.svelte'

	let {
		currentVersion = '',
		children,
		toolbar
	}: {
		currentVersion?: string
		children?: Snippet
		toolbar?: Snippet
	} = $props()

	const versions = [
		{ slug: '', label: 'v1' },
		{ slug: '-v2', label: 'v2' },
		{ slug: '-v3', label: 'v3' },
		{ slug: '-v4', label: 'v4' },
		{ slug: '-v5', label: 'v5' },
	]
</script>

<PageShell className="tp-hero">
	<div class="tp-hero__inner">
		<DevBreadcrumb />
		<Hero eyebrow="Dev" title="Time Picker" icon="/media/page-icons/labs-flask.png" iconAlt="Flask" subtitle="Drag a time window across the day with weather and daylight cues." compact />
		<div class="tp-hero__toolbar">
			<nav class="tp-hero__versions">
				{#each versions as v}
					<a href="/dev/schedule-time-picker{v.slug}/" aria-current={currentVersion === v.label ? 'page' : undefined}>{v.label}</a>
				{/each}
			</nav>
			{#if toolbar}{@render toolbar()}{/if}
		</div>
		{@render children?.()}
	</div>
</PageShell>

<style>
	.tp-hero__inner { max-width: 30rem; margin: 0 auto; }
	.tp-hero__toolbar { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
	.tp-hero__versions { display: flex; gap: 0.5rem; }
	.tp-hero__versions a { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); text-decoration: none; padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); }
	.tp-hero__versions a:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.tp-hero__versions a[aria-current="page"] { color: #a78bfa; border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, transparent); }
</style>
