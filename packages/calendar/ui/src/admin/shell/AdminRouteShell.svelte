<script lang="ts">
	import '@calendar/theme/admin.scss'
	import './admin-route-shell.scss'
	import { page } from '$app/stores'
	import { getCalendarUiConfig } from '../../config'
	import { isAdminMockMode, withAdminMock } from '../mock/mock-mode'
	import AdminRouteBreadcrumbs from './components/AdminRouteBreadcrumbs.svelte'
	import AdminRouteActions from './components/AdminRouteActions.svelte'
	import AdminRouteSidebar from './components/AdminRouteSidebar.svelte'
	import { getAdminRoute } from './route'
	import { adminEventDetailBreadcrumb } from './state'

	const { user, children } = $props<{
		user: unknown | null
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
	<nav class="social-admin__breadcrumbs" aria-label="Breadcrumbs">
		<div class="social-admin__breadcrumbs-inner">
			<AdminRouteBreadcrumbs items={routeInfo.breadcrumbs} />
			<AdminRouteActions
				actions={routeInfo.actions}
				{hrefWithMock}
				programSlug={routeInfo.programSlug}
			/>
		</div>
	</nav>

	<AdminRouteSidebar
		currentPath={$page.url.pathname}
		currentSection={routeInfo.currentSection}
		{hrefWithMock}
		{user}
	/>

	<main class="social-admin__main">
		{@render children()}
	</main>
</div>
