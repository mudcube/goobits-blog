<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '../routing/auth'
	import { formatAdminDate, getAdminTabHref, isAdminTabId } from '../features/admin/admin'
	import { createAdminDashboardController } from '../features/sync-queue/admin/admin-dashboard-controller.svelte'
	import { createAdminMembersController } from '../features/members/admin/admin-members.svelte'
	import AdminLoginCard from '../features/auth/admin/AdminLoginCard.svelte'
	import AdminSidebar from './AdminSidebar.svelte'
	import AdminDashboardPanel from '../features/sync-queue/admin/AdminDashboardPanel.svelte'
	import AdminCalendarPanel from '../features/availability/admin/AdminCalendarPanel.svelte'
	import AdminProgramsPanel from '../features/programs/admin/AdminProgramsPanel.svelte'
	import AdminEventsPanel from '../features/events/admin/AdminEventsPanel.svelte'
	import AdminMembersPanel from '../features/members/admin/AdminMembersPanel.svelte'
	import AdminIntegrationsPanel from '../features/integrations/google/admin/AdminIntegrationsPanel.svelte'
	import AdminToast from './AdminToast.svelte'

	let { data, form, initialTab = 'dash' } = $props()

	let tab = $state('dash')
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
		} else if (!isAdminTabId(initialTab) && tab !== 'dash') {
			tab = 'dash'
		}
	})

	$effect(() => {
		if (authed) {
			dashboard.loadStatus()
			dashboard.loadBookings()
		}
	})

	$effect(() => {
		if (tab === 'calendar-auth') {
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
	<title>Admin | Rainbow Gym | MIKO.ART</title>
</svelte:head>

{#if !authed}
	<AdminLoginCard {form} />
{:else}
	<div class="admin-page">
		<AdminSidebar {tab} onSelect={setTab} />

		<main class="admin-page__main">
			{#if tab === 'dash'}
				<AdminDashboardPanel {dashboard} />
			{/if}

			{#if tab === 'cal'}
				<AdminCalendarPanel {dashboard} />
			{/if}

			{#if tab === 'calendar-auth'}
				<AdminMembersPanel {members} formatDate={formatAdminDate} />
			{/if}

			{#if tab === 'programs'}
				<AdminProgramsPanel {dashboard} />
			{/if}

			{#if tab === 'events'}
				<AdminEventsPanel {dashboard} />
			{/if}

			{#if tab === 'integrations'}
				<AdminIntegrationsPanel {dashboard} />
			{/if}
		</main>
	</div>

	{#if dashboard.saved}
		<AdminToast />
	{/if}
{/if}
