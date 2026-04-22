<script lang="ts">
	import { PageShell } from '@miko/ui'
	import type { Snippet } from 'svelte'
	import DevHero from '../DevHero.svelte'

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
		{#if toolbar}
			<DevHero
				title="Time Picker"
				subtitle="Drag a time window across the day with weather and daylight cues."
				breadcrumbItems={[
					{ label: 'Dev', href: '/dev/' },
					{ label: 'Schedule Time Picker', href: '/dev/schedule-time-picker/' },
					{ label: currentVersion }
				]}
				versions={versions.map((v) => ({
					label: v.label,
					href: `/dev/schedule-time-picker${v.slug}/`,
					current: currentVersion === v.label
				}))}
				{toolbar}
			/>
		{:else}
			<DevHero
				title="Time Picker"
				subtitle="Drag a time window across the day with weather and daylight cues."
				breadcrumbItems={[
					{ label: 'Dev', href: '/dev/' },
					{ label: 'Schedule Time Picker', href: '/dev/schedule-time-picker/' },
					{ label: currentVersion }
				]}
				versions={versions.map((v) => ({
					label: v.label,
					href: `/dev/schedule-time-picker${v.slug}/`,
					current: currentVersion === v.label
				}))}
			/>
		{/if}
		{@render children?.()}
	</div>
</PageShell>

<style>
	.tp-hero__inner { max-width: 30rem; margin: 0 auto; }
</style>
