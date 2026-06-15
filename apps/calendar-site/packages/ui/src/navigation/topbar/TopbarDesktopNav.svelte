<script lang="ts">
	import type { NavItem } from '../../types/nav'
	import {
		isTopbarItemActive,
		isTopbarSeparator,
		shouldDisableTopbarPrefetch
	} from './topbar-routing'

	type Props = {
		items: NavItem[]
		currentPath: string
		disablePrefetchPrefixes?: string[]
		measureOnly?: boolean
	}

	const {
		items,
		currentPath,
		disablePrefetchPrefixes = [],
		measureOnly = false
	}: Props = $props()
</script>

{#if measureOnly}
	{#each items as item}
		{#if isTopbarSeparator(item)}
			<span class="layout-header__nav-separator">{item.label}</span>
		{:else}
			<span class="layout-header__nav-link">{item.label}</span>
		{/if}
	{/each}
{:else}
	<nav class="layout-header__nav">
		{#each items as item}
			{#if isTopbarSeparator(item)}
				<span class="layout-header__nav-separator" aria-hidden="true">{item.label}</span>
			{:else}
				<a
					href={item.href}
					class="layout-header__nav-link"
					class:layout-header__nav-link--active={isTopbarItemActive(item, currentPath)}
					data-sveltekit-preload-data={shouldDisableTopbarPrefetch(item.href, disablePrefetchPrefixes) ? 'off' : undefined}
					data-sveltekit-preload-code={shouldDisableTopbarPrefetch(item.href, disablePrefetchPrefixes) ? 'off' : undefined}
				>
					{item.label}
				</a>
			{/if}
		{/each}
	</nav>
{/if}
