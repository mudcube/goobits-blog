<script lang="ts">
	import type { NavItem } from './types/nav'
	import ThemeSelect from './ThemeSelect.svelte'

	type TopbarProps = {
		items: NavItem[]
		currentPath: string
	}

	const { items, currentPath }: TopbarProps = $props()

	function normalizePath(path: string) {
		if (!path || path === '/') return '/'
		return path.endsWith('/') ? path.slice(0, -1) : path
	}

	function isActive(item: NavItem) {
		const path = normalizePath(currentPath)
		const href = normalizePath(item.href)
		if (href === '/') return path === '/'
		if (item.matchPrefix) return path === href || path.startsWith(`${href}/`)
		return path === href
	}

	function shouldDisablePrefetch(href: string) {
		// Calendar/Admin pages load large route-level styling; avoid "hover prefetch" injecting it on other pages.
		return href.startsWith('/calendar') || href.startsWith('/admin')
	}

	function isSeparator(item: NavItem) {
		return item.href === ''
	}
</script>

<header class="layout-header">
	<div class="layout-header__inner">
		<div class="layout-header__left">
			<div class="layout-header__logo">
				<a href="/" class="layout-header__logo-link">
					<img src="/media/logo.svg" alt="logo" class="layout-header__logo-image" />
				</a>
			</div>
			<nav class="layout-header__nav">
				{#each items as item}
					{#if isSeparator(item)}
						<span class="layout-header__nav-separator" aria-hidden="true">{item.label}</span>
					{:else}
						<a
							href={item.href}
							class="layout-header__nav-link"
							class:layout-header__nav-link--active={isActive(item)}
							data-sveltekit-preload-data={shouldDisablePrefetch(item.href) ? 'off' : undefined}
							data-sveltekit-preload-code={shouldDisablePrefetch(item.href) ? 'off' : undefined}
						>
							{item.label}
						</a>
					{/if}
				{/each}
			</nav>
		</div>
		<div class="layout-header__theme">
			<ThemeSelect />
		</div>
	</div>
</header>

<style>
	.layout-header__nav-separator {
		display: inline-flex;
		align-items: center;
		padding: 0 0.2rem;
		opacity: 0.6;
		user-select: none;
	}
</style>
