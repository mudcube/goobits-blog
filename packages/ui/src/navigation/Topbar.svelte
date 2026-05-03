<script lang="ts">
	import { Menu, X } from '@lucide/svelte'
	import type { Snippet } from 'svelte'
	import type { NavItem } from '../types/nav'
	import TopbarDesktopNav from './topbar/TopbarDesktopNav.svelte'
	import TopbarMobileMenu from './topbar/TopbarMobileMenu.svelte'

	type TopbarProps = {
		items: NavItem[]
		currentPath: string
		logoSrc?: string
		logoAlt?: string
		logoHref?: string
		disablePrefetchPrefixes?: string[]
		utility?: Snippet
	}

	const {
		items,
		currentPath,
		logoSrc,
		logoAlt = 'Home',
		logoHref = '/',
		disablePrefetchPrefixes = [],
		utility
	}: TopbarProps = $props()
	let mobileMenuOpen = $state(false)
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen
	}

	function closeMobileMenu() {
		mobileMenuOpen = false
	}

	$effect(() => {
		void currentPath
		mobileMenuOpen = false
	})
</script>

<header class="layout-header">
	<div class="layout-header__inner">
		<div class="layout-header__logo">
			<a href={logoHref} class="layout-header__logo-link" aria-label="{logoAlt} — Home">
				{#if logoSrc}
					<img src={logoSrc} alt={logoAlt} width="335" height="120" class="layout-header__logo-image" />
				{:else}
					<span class="layout-header__logo-fallback">{logoAlt}</span>
				{/if}
			</a>
		</div>
		<TopbarDesktopNav {items} {currentPath} {disablePrefetchPrefixes} />
		<div class="layout-header__utilities" aria-label="Quick actions">
			{@render utility?.()}
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

	{#if mobileMenuOpen}
		<TopbarMobileMenu {items} {currentPath} {disablePrefetchPrefixes} onNavigate={closeMobileMenu} />
	{/if}
</header>

<style>
	.layout-header__logo-fallback {
		display: inline-flex;
		align-items: center;
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-white);
	}

	:global(.layout-header__nav-separator) {
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

	.layout-header__menu-button {
		display: none;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: var(--radius-pill);
		background: rgba(255, 255, 255, 0.05);
		color: var(--header-nav-color, var(--color-white));
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
	}

	.layout-header__menu-button:hover {
		border-color: rgba(255, 255, 255, 0.36);
		color: var(--header-nav-accent, var(--color-white));
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
	}

	:global(.layout-header__mobile-menu) {
		grid-column: 1 / -1;
		padding-top: 0.85rem;
	}

	:global(.layout-header__mobile-nav) {
		display: grid;
		gap: 0.5rem;
		padding: 0.85rem;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 1rem;
		background:
			linear-gradient(180deg, rgba(6, 14, 32, 0.92) 0%, rgba(6, 14, 32, 0.82) 100%);
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
	}

	:global(.layout-header__mobile-separator) {
		padding: 0.35rem 0.4rem 0.1rem;
		color: rgba(255, 255, 255, 0.52);
		font-size: 0.7rem;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	:global(.layout-header__mobile-link) {
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
		background: rgba(255, 255, 255, 0.03);
	}

	:global(.layout-header__mobile-link:hover),
	:global(.layout-header__mobile-link--active) {
		border-color: rgba(255, 255, 255, 0.36);
		color: var(--header-nav-accent, var(--color-white));
		background: rgba(255, 255, 255, 0.1);
	}

	@media (max-width: 50em) {
		.layout-header__utilities {
			display: inline-flex;
			justify-content: flex-end;
			margin-left: auto;
			gap: 0.45rem;
		}

		.layout-header__menu-button {
			display: inline-flex;
		}
	}
</style>
