<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import { AdminEventDetailSheet } from '@calendar/ui'
	import { isAdminMockMode, withAdminMock } from '$lib/admin/mock/mock-mode'

	const { data } = $props<{ data: { user: unknown | null; eventId: string } }>()

	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const eventId = $derived(Number(data.eventId))
	const mockMode = $derived(isAdminMockMode($page.url))

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	let loading = $state(false)
	let attemptedLoad = $state(false)

	$effect(() => {
		if (!authed || !mockMode) return
		void goto(hrefWithMock('/admin/events/'), { replaceState: true })
	})

	$effect(() => {
		if (!authed || mockMode || !Number.isFinite(eventId) || eventId <= 0) return
		attemptedLoad = true
		loading = true
		void dashboard.openEventDetail(eventId).finally(() => {
			loading = false
		})
	})

	$effect(() => {
		if (!authed || mockMode || !attemptedLoad || loading) return
		if (!dashboard.selectedEventDetail) {
			goto(hrefWithMock('/admin/'), { replaceState: true })
		}
	})
</script>

{#if authed}
	<div class="admin-event-detail admin-content">
		<a class="admin-event-detail__back" href={hrefWithMock('/admin/events/')}>Back to Events</a>
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
		display: inline-flex;
		align-items: center;
		width: fit-content;
		font-size: 0.9rem;
		font-weight: 600;
		padding: 0.32rem 0.6rem;
		border-radius: var(--admin-control-radius);
		text-decoration: none;
		color: var(--text);
	}
	.admin-event-detail__back:hover {
		background: var(--admin-control-bg);
	}

	.admin-event-detail__loading {
		margin: 0;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}
</style>
