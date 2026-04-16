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
		onNavigate?: () => void
	}

	const {
		items,
		currentPath,
		disablePrefetchPrefixes = [],
		onNavigate
	}: Props = $props()
</script>

<div id="site-mobile-menu" class="layout-header__mobile-menu">
	<nav class="layout-header__mobile-nav" aria-label="Mobile navigation">
		{#each items as item}
			{#if isTopbarSeparator(item)}
				<div class="layout-header__mobile-separator" aria-hidden="true">{item.label}</div>
			{:else}
				<a
					href={item.href}
					class="layout-header__mobile-link"
					class:layout-header__mobile-link--active={isTopbarItemActive(item, currentPath)}
					data-sveltekit-preload-data={shouldDisableTopbarPrefetch(item.href, disablePrefetchPrefixes) ? 'off' : undefined}
					data-sveltekit-preload-code={shouldDisableTopbarPrefetch(item.href, disablePrefetchPrefixes) ? 'off' : undefined}
					onclick={onNavigate}
				>
					{item.label}
				</a>
			{/if}
		{/each}
	</nav>
</div>
