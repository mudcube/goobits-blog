<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '../routing/auth'
	import { getCalendarUiConfig } from '../config'
	import { formatAdminDate, getAdminTabHref, isAdminTabId } from '../admin/shared/admin'
	import { createAdminDashboardController } from '../admin/dashboard/admin-dashboard-controller.svelte'
	import { createAdminMembersController } from '../admin/members/admin-members.svelte'
	import AdminLoginCard from '../admin/auth/AdminLoginCard.svelte'
	import AdminSidebar from './AdminSidebar.svelte'
	import AdminDashboardPanel from '../admin/dashboard/AdminDashboardPanel.svelte'
	import AdminCalendarPanel from '../admin/availability/AdminCalendarPanel.svelte'
	import AdminProgramsPanel from '../admin/programs/AdminProgramsPanel.svelte'
	import AdminEventsPanel from '../admin/events/AdminEventsPanel.svelte'
	import AdminMembersPanel from '../admin/members/AdminMembersPanel.svelte'
	import AdminIntegrationsPanel from '../admin/integrations/google/AdminIntegrationsPanel.svelte'
	import AdminToast from './AdminToast.svelte'

	let { data, form, initialTab = 'dashboard' } = $props()
	const calendarConfig = getCalendarUiConfig()

	let tab = $state('dashboard')
	let authed = $derived(!!data.user)

	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const members = createAdminMembersController({ onUnauthorized: handleUnauthorizedSessionError })

	function setTab(nextTab) {
		tab = nextTab
		const href = getAdminTabHref(nextTab)
		if ($page.url.pathname !== href) {
			goto(href, { replaceState: true, keepFocus: true, noScroll: true })
		}
	}

	$effect(() => {
		if (isAdminTabId(initialTab) && tab !== initialTab) {
			tab = initialTab
		} else if (!isAdminTabId(initialTab) && tab !== 'dashboard') {
			tab = 'dashboard'
		}
	})

	$effect(() => {
		if (authed) {
			dashboard.loadStatus()
			dashboard.loadBookings()
			dashboard.loadPaymentDefaults()
		}
	})

	$effect(() => {
		if (tab === 'people') {
			members.load()
		}
	})

	$effect(() => {
		if (tab === 'programs') {
			dashboard.loadPrograms()
		}
	})

	$effect(() => {
		if (tab === 'events') {
			dashboard.loadPrograms()
			dashboard.loadEvents()
		}
	})
</script>

<svelte:head>
	<title>Admin | {calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

{#if !authed}
	<AdminLoginCard {form} />
{:else}
	<div class="admin-page">
		<AdminSidebar {tab} onSelect={setTab} />

		<main class="admin-page__main">
			{#if tab === 'dashboard'}
				<AdminDashboardPanel {dashboard} />
			{/if}

			{#if tab === 'rules'}
				<AdminCalendarPanel {dashboard} />
			{/if}

			{#if tab === 'people'}
				<AdminMembersPanel {members} formatDate={formatAdminDate} />
			{/if}

			{#if tab === 'programs'}
				<AdminProgramsPanel {dashboard} />
			{/if}

			{#if tab === 'events'}
				<AdminEventsPanel {dashboard} />
			{/if}

			{#if tab === 'connections'}
				<AdminIntegrationsPanel {dashboard} />
			{/if}
		</main>
	</div>

	{#if dashboard.saved}
		<AdminToast />
	{/if}
{/if}
