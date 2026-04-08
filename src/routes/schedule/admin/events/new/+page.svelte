<script lang="ts">
	import { page } from '$app/stores'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import AdminNewEventEditor from '@calendar/ui/admin/events/editor/AdminNewEventEditor.svelte'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({
		onUnauthorized: handleUnauthorizedSessionError
	})
	const authed = $derived(!!data.user)
	const mockMode = $derived(isAdminMockMode($page.url))

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}
</script>

<AdminNewEventEditor {dashboard} {authed} {mockMode} {hrefWithMock} />
