<script>
	import '../app.scss'
	import '@goobits/themes/themes/bundle.css'
	import { Mail } from '@lucide/svelte'
	import { ThemeProvider } from '@goobits/themes/svelte'
	import { themeConfig } from '$lib/app/config/theme.js'
	import { page } from '$app/stores'
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { Topbar, FooterNav } from '@goobits/ui'
	import ReleaseTargetSwitcher from '$lib/app/release/ReleaseTargetSwitcher.svelte'
	import {
		footerBrand,
		footerElsewhereItems,
		footerLegalItems,
		footerPrimaryItems,
		footerSupplementalPrimaryItems,
		getHeaderNavItems,
		headerUtilityLink
	} from '$lib/app/shell/nav'
	import { enableLayoutShiftDebug } from '$lib/client/debug/layoutShift'

	const { data, children } = $props()

	const showSitemapVisibilityToggle = $derived(
		$page.url.pathname.startsWith('/sitemap') && Boolean($page.data.canViewInternalRoutes)
	)
	const topbarItems = $derived(getHeaderNavItems(data.activeStage))

	onMount(() => {
		if (!browser) return
		const url = new URL(window.location.href)
		if (url.searchParams.has('debugLayoutShift')) enableLayoutShiftDebug()
	})
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="MIKO.ART Journal"
		href="/journal/rss.xml"
	/>
</svelte:head>

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
	<div class="code-theme">
		<a href="#main-content" class="layout-skip-link">Skip to main content</a>
		<Topbar
			items={topbarItems}
			currentPath={$page.url.pathname}
			logoSrc="/media/brand/logo.svg"
			logoAlt="MIKO.ART"
		>
			{#snippet utility()}
				<a
					href={headerUtilityLink.href}
					class="layout-header__utility-link"
					class:layout-header__utility-link--active={$page.url.pathname.startsWith('/contact')}
					aria-label={headerUtilityLink.label}
					title={headerUtilityLink.label}
				>
					<Mail size={24} strokeWidth={1.9} aria-hidden="true" />
				</a>
			{/snippet}
		</Topbar>

		<main id="main-content">
			{@render children()}
		</main>

		<FooterNav
			brandName={footerBrand.name}
			brandHref={footerBrand.href}
			tagline={footerBrand.tagline}
			copyrightLabel={footerBrand.copyrightLabel}
			primaryItems={footerPrimaryItems}
			supplementalPrimaryItems={footerSupplementalPrimaryItems}
			elsewhereItems={footerElsewhereItems}
			legalItems={footerLegalItems}
		/>

		{#if data.showVersionSwitcher}
			<ReleaseTargetSwitcher
				activeStage={data.activeStage}
				activeTarget={data.activeTarget}
				activeVisibility={$page.data.activeVisibility}
				showVisibilityToggle={showSitemapVisibilityToggle}
			/>
		{/if}
	</div>
</ThemeProvider>

<style>
	.layout-skip-link {
		position: absolute;
		left: -9999px;
		top: auto;
		width: 1px;
		height: 1px;
		overflow: hidden;
		z-index: 10000;
		padding: 0.75rem 1.25rem;
		background: var(--bg, #fff);
		color: var(--text, #000);
		font-weight: 600;
		font-size: 0.875rem;
		text-decoration: none;
		border-radius: 0 0 0.5rem 0;
	}

	.layout-skip-link:focus {
		position: fixed;
		left: 0;
		top: 0;
		width: auto;
		height: auto;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	:global(.layout-header__utility-link) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		padding: 0.15rem;
		color: var(--header-nav-color, var(--color-white));
		line-height: 1;
		text-decoration: none;
		vertical-align: middle;
		transition:
			color 0.22s ease,
			transform 0.22s ease;
	}

	:global(.layout-header__utility-link svg) {
		display: block;
		flex-shrink: 0;
	}

	:global(.layout-header__utility-link:hover) {
		color: var(--header-nav-accent, var(--color-white));
		transform: translateY(-1px);
	}

	:global(.layout-header__utility-link--active) {
		color: var(--header-nav-accent, var(--color-white));
	}

	@media (max-width: 50em) {
		:global(.layout-header__utility-link) {
			width: 44px;
			height: 44px;
			padding: 0;
			border: 1px solid color-mix(in srgb, var(--color-white) 14%, transparent);
			border-radius: var(--radius-pill);
			background: color-mix(in srgb, var(--color-white) 5%, transparent);
		}

		:global(.layout-header__utility-link:hover),
		:global(.layout-header__utility-link--active) {
			border-color: color-mix(in srgb, var(--header-nav-accent, var(--color-white)) 36%, transparent);
			background: color-mix(in srgb, var(--header-nav-accent, var(--color-white)) 10%, transparent);
		}
	}
</style>
