<script lang="ts">
	import { Mail, Menu, X } from '@lucide/svelte'
	import { onMount } from 'svelte'
	import type { NavItem } from '../types/nav'

	type TopbarProps = {
		items: NavItem[]
		currentPath: string
	}

	const { items, currentPath }: TopbarProps = $props()
	let mobileMenuOpen = $state(false)
	let compactMode = $state(false)
	let headerInner: HTMLDivElement | null = null
	let headerLogo: HTMLDivElement | null = null
	let headerUtilities: HTMLDivElement | null = null
	let navMeasure: HTMLDivElement | null = null

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

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen
	}

	function closeMobileMenu() {
		mobileMenuOpen = false
	}

	const utilityItems: NavItem[] = [{ href: '/contact?from=topbar', label: 'Contact', matchPrefix: true }]

	function updateCompactMode() {
		if (!headerInner || !headerLogo || !headerUtilities || !navMeasure) return

		const innerWidth = headerInner.clientWidth
		const logoWidth = headerLogo.offsetWidth
		const utilitiesWidth = headerUtilities.offsetWidth
		const navWidth = navMeasure.scrollWidth
		const columnGap = 32
		const menuWidth = 38
		const requiredWidth = logoWidth + navWidth + utilitiesWidth + menuWidth + columnGap * 3

		compactMode = requiredWidth > innerWidth
	}

	$effect(() => {
		void currentPath
		mobileMenuOpen = false
	})

	$effect(() => {
		if (!compactMode) {
			mobileMenuOpen = false
		}
	})

	onMount(() => {
		updateCompactMode()

		const resizeObserver = typeof ResizeObserver === 'undefined'
			? null
			: new ResizeObserver(() => {
				updateCompactMode()
			})

		if (resizeObserver) {
			if (headerInner) resizeObserver.observe(headerInner)
			if (headerLogo) resizeObserver.observe(headerLogo)
			if (headerUtilities) resizeObserver.observe(headerUtilities)
			if (navMeasure) resizeObserver.observe(navMeasure)
		}

		window.addEventListener('resize', updateCompactMode)

		return () => {
			resizeObserver?.disconnect()
			window.removeEventListener('resize', updateCompactMode)
		}
	})
</script>

<header class:layout-header--compact={compactMode} class="layout-header">
	<div class="layout-header__inner" bind:this={headerInner}>
		<div class="layout-header__logo" bind:this={headerLogo}>
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
		<div class="layout-header__utilities" aria-label="Quick actions" bind:this={headerUtilities}>
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

		<button
			type="button"
			class="layout-header__menu-button"
			aria-expanded={mobileMenuOpen}
			aria-controls="site-mobile-menu"
			aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
			onclick={toggleMobileMenu}
		>
			{#if mobileMenuOpen}
				<X size={22} strokeWidth={2.1} aria-hidden="true" />
			{:else}
				<Menu size={22} strokeWidth={2.1} aria-hidden="true" />
			{/if}
		</button>
	</div>

	<div class="layout-header__nav-measure" bind:this={navMeasure} aria-hidden="true">
		{#each items as item}
			{#if isSeparator(item)}
				<span class="layout-header__nav-separator">{item.label}</span>
			{:else}
				<span class="layout-header__nav-link">{item.label}</span>
			{/if}
		{/each}
	</div>

	{#if mobileMenuOpen}
		<div id="site-mobile-menu" class="layout-header__mobile-menu">
			<nav class="layout-header__mobile-nav" aria-label="Mobile navigation">
				{#each items as item}
					{#if isSeparator(item)}
						<div class="layout-header__mobile-separator" aria-hidden="true">{item.label}</div>
					{:else}
						<a
							href={item.href}
							class="layout-header__mobile-link"
							class:layout-header__mobile-link--active={isActive(item)}
							data-sveltekit-preload-data={shouldDisablePrefetch(item.href) ? 'off' : undefined}
							data-sveltekit-preload-code={shouldDisablePrefetch(item.href) ? 'off' : undefined}
							onclick={closeMobileMenu}
						>
							{item.label}
						</a>
					{/if}
				{/each}
			</nav>
		</div>
	{/if}
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

	.layout-header__nav-measure {
		position: absolute;
		left: -9999px;
		top: 0;
		display: inline-flex;
		align-items: center;
		gap: 2.5rem;
		visibility: hidden;
		pointer-events: none;
		white-space: nowrap;
	}

	.layout-header__menu-button {
		display: none;
		align-items: center;
		justify-content: center;
		width: 2.35rem;
		height: 2.35rem;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--color-white) 14%, transparent);
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, var(--color-white) 5%, transparent);
		color: var(--header-nav-color, var(--color-white));
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
	}

	.layout-header__menu-button:hover {
		border-color: color-mix(in srgb, var(--header-nav-accent, var(--color-white)) 36%, transparent);
		color: var(--header-nav-accent, var(--color-white));
		background: color-mix(in srgb, var(--header-nav-accent, var(--color-white)) 10%, transparent);
		transform: translateY(-1px);
	}

	.layout-header__mobile-menu {
		grid-column: 1 / -1;
		padding-top: 0.85rem;
	}

	.layout-header__mobile-nav {
		display: grid;
		gap: 0.5rem;
		padding: 0.85rem;
		border: 1px solid color-mix(in srgb, var(--color-white) 14%, transparent);
		border-radius: 1rem;
		background:
			linear-gradient(180deg, rgba(6, 14, 32, 0.92) 0%, rgba(6, 14, 32, 0.82) 100%);
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
	}

	.layout-header__mobile-separator {
		padding: 0.35rem 0.4rem 0.1rem;
		color: color-mix(in srgb, var(--color-white) 52%, transparent);
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.layout-header__mobile-link {
		display: flex;
		align-items: center;
		min-height: 2.8rem;
		padding: 0.7rem 0.85rem;
		border: 1px solid transparent;
		border-radius: 0.9rem;
		color: var(--header-nav-color, var(--color-white));
		font-family: var(--font-serif);
		font-size: 1rem;
		line-height: 1.3;
		text-decoration: none;
		background: color-mix(in srgb, var(--color-white) 3%, transparent);
	}

	.layout-header__mobile-link:hover,
	.layout-header__mobile-link--active {
		border-color: color-mix(in srgb, var(--header-nav-accent, var(--color-white)) 36%, transparent);
		color: var(--header-nav-accent, var(--color-white));
		background: color-mix(in srgb, var(--header-nav-accent, var(--color-white)) 10%, transparent);
	}

	.layout-header--compact .layout-header__nav {
		display: none;
	}

	.layout-header--compact .layout-header__utilities {
		display: inline-flex;
		margin-left: auto;
		gap: 0.45rem;
	}

	.layout-header--compact .layout-header__utility-link {
		width: 2.35rem;
		height: 2.35rem;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--color-white) 14%, transparent);
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, var(--color-white) 5%, transparent);
	}

	.layout-header--compact .layout-header__utility-link:hover,
	.layout-header--compact .layout-header__utility-link--active {
		border-color: color-mix(in srgb, var(--header-nav-accent, var(--color-white)) 36%, transparent);
		background: color-mix(in srgb, var(--header-nav-accent, var(--color-white)) 10%, transparent);
	}

	.layout-header--compact .layout-header__menu-button {
		display: inline-flex;
	}

	@media (max-width: 43.75em) {
		.layout-header__utilities {
			margin-left: 1.5rem;
		}
	}
</style>
