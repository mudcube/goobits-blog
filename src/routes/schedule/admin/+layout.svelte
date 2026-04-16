<script lang="ts">
	import '@calendar/theme/admin.scss'
	import '$lib/app/schedule/admin/admin-shell.scss'
	import { page } from '$app/stores'
	import { getCalendarUiConfig } from '@calendar/ui/config'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import AdminBreadcrumbs from '$lib/app/schedule/admin/components/AdminBreadcrumbs.svelte'
	import AdminRouteActions from '$lib/app/schedule/admin/components/AdminRouteActions.svelte'
	import AdminSidebar from '$lib/app/schedule/admin/components/AdminSidebar.svelte'
	import { getAdminRoute } from '$lib/app/schedule/admin/route'
	import { adminEventDetailBreadcrumb } from '$lib/app/schedule/admin/state'

	const { data, children } = $props<{
		data: { user: unknown | null }
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
			<AdminBreadcrumbs items={routeInfo.breadcrumbs} />
			<AdminRouteActions
				actions={routeInfo.actions}
				{hrefWithMock}
				programSlug={routeInfo.programSlug}
			/>
		</div>
	</nav>

	<AdminSidebar
		currentPath={$page.url.pathname}
		currentSection={routeInfo.currentSection}
		{hrefWithMock}
		user={data.user}
	/>

	<main class="social-admin__main">
		{@render children()}
	</main>
</div>
