<script lang="ts">
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import {
		AdminCalendarPanel,
		AdminProgramsPanel,
		AdminIntegrationsPanel
	} from '@calendar/ui'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)

	$effect(() => {
		if (!authed) return
		dashboard.loadStatus()
		dashboard.loadPaymentDefaults()
		dashboard.loadPrograms()
	})
</script>

{#if authed}
	<AdminCalendarPanel {dashboard} />
	<div class="admin-config__divider" aria-hidden="true"></div>
	<AdminProgramsPanel {dashboard} />
	<div class="admin-config__divider" aria-hidden="true"></div>
	<AdminIntegrationsPanel {dashboard} />
{/if}

<style>
	.admin-config__divider {
		height: 1px;
		margin: 1rem 0;
		background: color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
	}
</style>
