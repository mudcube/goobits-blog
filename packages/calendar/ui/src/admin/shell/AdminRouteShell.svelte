<script lang="ts">
	import '@calendar/theme/admin.scss'
	import './admin-route-shell.scss'
	import { page } from '$app/stores'
	import { getCalendarUiConfig } from '../../config'
	import { isAdminMockMode, withAdminMock } from '../mock/mock-mode'
	import ShellNav from '../../primitives/CalendarShellNav.svelte'
	import AdminProfileMenu from './components/AdminProfileMenu.svelte'
	import AdminRouteBreadcrumbs from './components/AdminRouteBreadcrumbs.svelte'
	import AdminRouteActions from './components/AdminRouteActions.svelte'
	import AdminRouteSidebar from './components/AdminRouteSidebar.svelte'
	import { getAdminRoute } from './route'
	import { adminEventDetailBreadcrumb } from './state'

	type AdminUser = { name?: string | null; email?: string | null } | null

	const { user, children } = $props<{
		user: AdminUser
		children: () => unknown
	}>()

	const calendarConfig = getCalendarUiConfig()
	const mockMode = $derived(isAdminMockMode($page.url))

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	const routeInfo = $derived(
		getAdminRoute($page.url.pathname, {
			detailLabel: $adminEventDetailBreadcrumb,
			hrefWithMock
		})
	)
</script>

<svelte:head>
	<title>{routeInfo.title} | {calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

<div class="social-admin">
	<ShellNav
		homeHref="/"
		showLogo={true}
		logoSrc="/media/brand/logo.svg"
		logoAlt={calendarConfig.brand.siteName}
	>
		{#snippet left()}
			<AdminRouteBreadcrumbs items={routeInfo.breadcrumbs} />
		{/snippet}
		{#snippet right()}
			<div class="social-admin__breadcrumbs-actions-group">
				<AdminRouteActions
					actions={routeInfo.actions}
					{hrefWithMock}
					programSlug={routeInfo.programSlug}
				/>
				{#if user}
					<AdminProfileMenu {user} />
				{/if}
			</div>
		{/snippet}
	</ShellNav>

	<AdminRouteSidebar
		currentPath={$page.url.pathname}
		currentSection={routeInfo.currentSection}
		{hrefWithMock}
	/>

	<main class="social-admin__main">
		{@render children()}
	</main>
</div>
