<script lang="ts">
	import '@calendar/theme/admin.scss'
	import './admin-route-shell.scss'
	import { page } from '$app/stores'
	import { Settings as SettingsIcon } from '@lucide/svelte'
	import { getCalendarUiConfig } from '../../config'
	import { isAdminMockMode, withAdminMock } from '../mock/mock-mode'
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
	const adminBase = calendarConfig.routes.adminBase
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
			<div class="social-admin__breadcrumbs-actions-group">
				<AdminRouteActions
					actions={routeInfo.actions}
					{hrefWithMock}
					programSlug={routeInfo.programSlug}
				/>
				<a
					class="social-admin__topbar-icon"
					class:social-admin__topbar-icon--active={routeInfo.currentSection === 'settings'}
					href={hrefWithMock(`${adminBase}/settings/`)}
					aria-label="Settings"
					aria-current={routeInfo.currentSection === 'settings' ? 'page' : undefined}
				>
					<SettingsIcon size={16} strokeWidth={1.8} />
				</a>
				{#if user}
					<AdminProfileMenu {user} />
				{/if}
			</div>
		</div>
	</nav>

	<AdminRouteSidebar
		currentPath={$page.url.pathname}
		currentSection={routeInfo.currentSection}
		{hrefWithMock}
	/>

	<main class="social-admin__main">
		{@render children()}
	</main>
</div>
