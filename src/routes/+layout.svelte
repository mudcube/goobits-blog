<script>
	import '../app.scss'
	import '@goobits/themes/themes/bundle.css'
	import { ThemeProvider } from '@goobits/themes/svelte'
	import { themeConfig } from '$lib/app/config/theme.js'
	import { page } from '$app/stores'
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { Topbar, FooterNav } from '@miko/ui'
	import { getCalendarConfig } from '@calendar/core'
	import DevReleaseSwitcher from '$lib/app/release/DevReleaseSwitcher.svelte'
	import { footerElsewhereItems, footerLegalItems, footerPrimaryItems, getHeaderNavItems } from '$lib/app/shell/nav'
	import { enableLayoutShiftDebug } from '$lib/client/debug/layoutShift'

	const { data, children } = $props()
	const calendarConfig = getCalendarConfig()

	const isCalendarRoute = $derived(
		$page.url.pathname.startsWith(calendarConfig.routes.calendarBase) ||
			$page.url.pathname.startsWith(calendarConfig.routes.adminBase)
	)
	const topbarItems = $derived(getHeaderNavItems(data.activeStage))

	onMount(() => {
		if (!browser) return
		const url = new URL(window.location.href)
		if (url.searchParams.has('debugLayoutShift')) enableLayoutShiftDebug()
	})
</script>

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
	<div class="code-theme">
		{#if isCalendarRoute}
			{@render children()}
		{:else}
			<Topbar items={topbarItems} currentPath={$page.url.pathname} />

			<main>
				{@render children()}
			</main>

			<FooterNav
				primaryItems={footerPrimaryItems}
				elsewhereItems={footerElsewhereItems}
				legalItems={footerLegalItems}
			/>

			{#if data.showVersionSwitcher}
				<DevReleaseSwitcher activeStage={data.activeStage} activeSurface={data.activeSurface} />
			{/if}
		{/if}
	</div>
</ThemeProvider>
