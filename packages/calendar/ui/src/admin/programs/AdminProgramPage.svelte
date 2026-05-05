<script lang="ts">
	import { untrack } from 'svelte'
	import { page } from '$app/stores'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import AdminProgramEditor from '@calendar/ui/admin/programs/editor/AdminProgramEditor.svelte'
	import { withAdminRoute } from '@calendar/ui/config'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'

	const { user, slug, bootstrap = null } = $props<{ user: unknown | null; slug: string; bootstrap?: unknown }>()
	const dashboard = createAdminDashboardController({
		onUnauthorized: handleUnauthorizedSessionError
	})
	untrack(() => {
		if (bootstrap) dashboard.bootstrap(bootstrap as never)
	})
	const authed = $derived(!!user)
	const mockMode = $derived(isAdminMockMode($page.url))
	const eventsHref = $derived(withAdminMock(withAdminRoute('events/'), mockMode))
</script>

<AdminProgramEditor {dashboard} {authed} {slug} {mockMode} {eventsHref} />
