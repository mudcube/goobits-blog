<script lang="ts">
	import '@calendar/theme/admin.scss'
	import './admin-route-shell.scss'
	import { page } from '$app/stores'
	import { CalendarDays, LogOut } from '@lucide/svelte'
	import { enhance } from '$app/forms'
	import { getCalendarUiConfig } from '../../config'
	import { isAdminMockMode, withAdminMock } from '../mock/mock-mode'
	import ProfileMenu from '../../shared/ProfileMenu.svelte'
	import ShellNav from '../../primitives/CalendarShellNav.svelte'
	import AdminRouteBreadcrumbs from './components/AdminRouteBreadcrumbs.svelte'
	import AdminRouteActions from './components/AdminRouteActions.svelte'
	import AdminRouteSidebar from './components/AdminRouteSidebar.svelte'
	import { getAdminRoute } from './route'
	import { adminDetailCrumbLabel } from './state'

	type AdminUser = { name?: string | null; email?: string | null } | null

	const { user, children } = $props<{
		user: AdminUser
		children: () => unknown
	}>()

	const calendarConfig = getCalendarUiConfig()
	const adminBase = calendarConfig.routes.adminBase
	const calendarBase = calendarConfig.routes.calendarBase
	const mockMode = $derived(isAdminMockMode($page.url))

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	const routeInfo = $derived(
		getAdminRoute($page.url.pathname, {
			detailLabel: $adminDetailCrumbLabel,
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
					<ProfileMenu {user} className="admin-profile-menu">
						{#snippet menu({ close })}
							<a class="profile-menu__item" role="menuitem" href={calendarBase} onclick={close}>
								<CalendarDays size={14} strokeWidth={1.8} /> Calendar
							</a>
							<form
								class="profile-menu__form"
								method="POST"
								action={`${adminBase}?/logout`}
								use:enhance={() => {
									close()
									return async ({ update }) => {
										await update()
									}
								}}
							>
								<button type="submit" class="profile-menu__item" role="menuitem">
									<LogOut size={14} strokeWidth={1.8} /> Log out
								</button>
							</form>
						{/snippet}
					</ProfileMenu>
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

<style>
	:global(.admin-profile-menu) {
		--profile-menu-bg: var(--admin-control-bg);
		--profile-menu-bg-hover: var(--admin-control-bg-hover);
		--profile-menu-border: var(--admin-control-border);
		--profile-menu-fg: var(--admin-control-fg);
		--profile-menu-panel-bg: var(--admin-card-bg);
		--profile-menu-panel-border: var(--admin-card-border);
	}
</style>
