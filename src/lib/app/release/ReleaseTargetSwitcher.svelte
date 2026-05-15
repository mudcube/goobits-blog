<script lang="ts">
	import { goto } from '$app/navigation'
	import { ReleaseTargetSwitcher as PackageSwitcher } from '@goobits/visibility-mode/ui'
	import type { ReleaseStage } from '@goobits/visibility-mode'
	import type { Target } from '$lib/app/target'
	import type { HumanSitemapVisibility } from '@goobits/sitemap/core'

	type Props = {
		activeStage: ReleaseStage
		activeTarget: Target
		activeVisibility?: HumanSitemapVisibility
		showVisibilityToggle?: boolean
	}

	const {
		activeStage,
		activeTarget,
		activeVisibility = 'public',
		showVisibilityToggle = false
	}: Props = $props()

	const visibilityOptions = [
		{ value: 'public', label: 'Public' },
		{ value: 'internal', label: 'Internal' }
	]

	async function setVisibility(visibility: HumanSitemapVisibility) {
		if (typeof window === 'undefined') return
		const nextUrl = new URL(window.location.href)
		if (visibility === 'internal') {
			nextUrl.searchParams.set('visibility', 'internal')
		} else {
			nextUrl.searchParams.delete('visibility')
		}
		await goto(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
			invalidateAll: true
		})
	}
</script>

<PackageSwitcher {activeStage} {activeTarget}>
	{#snippet extraRows({ Row })}
		{#if showVisibilityToggle}
			{@render Row(
				'Visibility',
				visibilityOptions,
				activeVisibility,
				(value: string) => void setVisibility(value as HumanSitemapVisibility),
				'Sitemap visibility'
			)}
		{/if}
	{/snippet}
</PackageSwitcher>
