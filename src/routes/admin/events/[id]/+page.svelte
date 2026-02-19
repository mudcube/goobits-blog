<script lang="ts">
	import { goto } from '$app/navigation'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import { AdminEventDetailSheet } from '@calendar/ui'

	const { data } = $props<{ data: { user: unknown | null; eventId: string } }>()

	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const eventId = $derived(Number(data.eventId))

	let loading = $state(false)
	let attemptedLoad = $state(false)

	$effect(() => {
		if (!authed || !Number.isFinite(eventId) || eventId <= 0) return
		attemptedLoad = true
		loading = true
		void dashboard.openEventDetail(eventId).finally(() => {
			loading = false
		})
	})

	$effect(() => {
		if (!authed || !attemptedLoad || loading) return
		if (!dashboard.selectedEventDetail) {
			goto('/admin', { replaceState: true })
		}
	})
</script>

{#if authed}
	<div class="admin-event-detail">
		<a class="admin-event-detail__back" href="/admin">Back to Home</a>
		{#if loading}
			<p class="admin-event-detail__loading">Loading event detail...</p>
		{:else if dashboard.selectedEventDetail}
			<AdminEventDetailSheet {dashboard} detail={dashboard.selectedEventDetail} />
		{:else}
			<p class="admin-event-detail__loading">Event not found.</p>
		{/if}
	</div>
{/if}

<style>
	.admin-event-detail {
		display: grid;
		gap: 0.75rem;
	}

	.admin-event-detail__back {
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
		color: #4338ca;
	}

	.admin-event-detail__loading {
		margin: 0;
		color: #64748b;
	}
</style>
