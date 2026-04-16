<script lang="ts">
	import { page } from '$app/stores'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import AdminProgramEditor from '@calendar/ui/admin/programs/editor/AdminProgramEditor.svelte'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'

	const { data } = $props<{ data: { user: unknown | null; slug: string } }>()
	const dashboard = createAdminDashboardController({
		onUnauthorized: handleUnauthorizedSessionError
	})
	const authed = $derived(!!data.user)
	const slug = $derived(data.slug)
	const mockMode = $derived($page.url.searchParams.get('mock') === '1')
	const eventsHref = $derived(mockMode ? '/schedule/admin/events/?mock=1' : '/schedule/admin/events/')
</script>

<AdminProgramEditor {dashboard} {authed} {slug} {mockMode} {eventsHref} />
