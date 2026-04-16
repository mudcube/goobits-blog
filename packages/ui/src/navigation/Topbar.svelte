<script lang="ts">
	import { Mail } from '@lucide/svelte'
	import type { NavItem } from '../types/nav'

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
		return href.startsWith('/schedule') || href.startsWith('/admin')
	}

	function isSeparator(item: NavItem) {
		return item.href === ''
	}

	const utilityItems: NavItem[] = [{ href: '/contact?from=topbar', label: 'Contact', matchPrefix: true }]
</script>

<header class="layout-header">
	<div class="layout-header__inner">
		<div class="layout-header__logo">
			<a href="/" class="layout-header__logo-link">
				<img src="/media/brand/logo.svg" alt="logo" class="layout-header__logo-image" />
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
		<div class="layout-header__utilities" aria-label="Quick actions">
			{#each utilityItems as item}
				<a
					href={item.href}
					class="layout-header__utility-link"
					class:layout-header__utility-link--active={isActive(item)}
					aria-label={item.label}
					title={item.label}
					data-sveltekit-preload-data={shouldDisablePrefetch(item.href) ? 'off' : undefined}
					data-sveltekit-preload-code={shouldDisablePrefetch(item.href) ? 'off' : undefined}
				>
					<Mail size={24} strokeWidth={1.9} aria-hidden="true" />
				</a>
			{/each}
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

	.layout-header__utilities {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		margin-left: 1.5rem;
	}

	.layout-header__utility-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.15rem;
		color: var(--header-nav-color, var(--color-white));
		text-decoration: none;
		transition:
			color 0.22s ease,
			transform 0.22s ease;
	}

	.layout-header__utility-link:hover {
		color: var(--header-nav-accent, var(--color-white));
		transform: translateY(-1px);
	}

	.layout-header__utility-link--active {
		color: var(--header-nav-accent, var(--color-white));
	}
</style>
