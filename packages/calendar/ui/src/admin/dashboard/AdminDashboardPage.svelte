<script lang="ts">
import { goto } from '$app/navigation'
import { page } from '$app/stores'
import { withAdminRoute } from '@calendar/ui/config'
import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
import { AdminEventDetailSheet, AdminLoginCard } from '@calendar/ui'
import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
import AdminDashboardContent from '@calendar/ui/admin/dashboard/AdminDashboardContent.svelte'
import AdminLoadingText from '@calendar/ui/admin/shared/AdminLoadingText.svelte'
import { getAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
import { untrack } from 'svelte'

	const { data, form } = $props<{
		data: {
			user: unknown | null
			currentUser?: { email?: string | null } | null
			isAdmin?: boolean
			canBootstrapAdmin?: boolean
			loginUrl?: string
			bootstrap?: unknown
		}
		form: unknown
	}>()
const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
untrack(() => {
	if (data.bootstrap) dashboard.bootstrap(data.bootstrap as never)
})
const authed = $derived(data.isAdmin === true && !!data.user)
const isMobile = $derived(typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches)
const mockMode = $derived($page.url.searchParams.get('mock') === '1')
const adminMockCatalog = getAdminMockCatalog()

	let openedDetailId = $state<number | null>(null)

	$effect(() => {
		if (!authed || mockMode) return
		// loadStatus is heavy (OAuth refresh checks); still client-fetched
		dashboard.loadStatus()
		dashboard.loadBookings()
		// programs + events + paymentDefaults bootstrapped via data.bootstrap
		if (!data.bootstrap) {
			dashboard.loadPaymentDefaults()
			dashboard.loadPrograms()
			dashboard.loadEvents()
		}
	})

	function openEventDetail(eventId: number) {
		const detailHref = withAdminRoute(`events/detail/${eventId}/`)
		if (mockMode) {
			void goto(`${detailHref}?mock=1`)
			return
		}
		if (isMobile) {
			goto(detailHref)
			return
		}
		openedDetailId = eventId
		void dashboard.openEventDetail(eventId)
	}

	function closeEventDetail() {
		openedDetailId = null
		dashboard.closeEventDetail()
	}

	function todayTitle() {
		return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
	}
</script>

{#if !authed}
	<AdminLoginCard
		{form}
		loginUrl={data.loginUrl}
		currentUser={data.currentUser}
		canBootstrapAdmin={data.canBootstrapAdmin === true}
	/>
{:else}
	<div class="social-home admin-content">
		<div class="social-home__main" data-testid="admin-dashboard-main">
			<AdminPageHero
				eyebrow="Overview"
				title={todayTitle()}
				subtitle=""
			/>

			{#if !mockMode && !dashboard.eventsLoaded}
				<AdminLoadingText text="Loading dashboard…" />
			{:else}
				<AdminDashboardContent
					events={mockMode ? adminMockCatalog.dashboardEvents : dashboard.events}
					recentEvents={mockMode ? adminMockCatalog.dashboardRecentEvents : dashboard.recentEvents}
					{mockMode}
					onOpenEvent={openEventDetail}
				/>
			{/if}
		</div>

		{#if !mockMode && !isMobile && openedDetailId && dashboard.selectedEventDetail}
			<div
				class="social-home__detail-scrim admin-ui-overlay admin-ui-overlay--end"
				role="button"
				tabindex="0"
				aria-label="Close event detail"
				onclick={closeEventDetail}
				onkeydown={(event) => { if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); closeEventDetail() } }}
			>
				<div
					class="social-home__detail-sheet"
					role="dialog"
					tabindex="-1"
					aria-label="Event detail"
					onclick={(event) => event.stopPropagation()}
					onkeydown={(event) => event.key === 'Escape' && closeEventDetail()}
				>
					<button type="button" class="social-home__back" onclick={closeEventDetail}>← Back</button>
					<AdminEventDetailSheet {dashboard} detail={dashboard.selectedEventDetail} />
					<div class="social-home__detail-actions">
						<button
							type="button"
							class="admin-ui-btn"
							onclick={() =>
								dashboard.selectedEventDetail &&
								goto(withAdminRoute(`events/detail/${dashboard.selectedEventDetail.event.id}/`))}
						>
							Edit Event
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.social-home {
		position: relative;
	}

	.social-home__main {
		display: grid;
		gap: 0.75rem;
	}


	.social-home__detail-scrim {
		z-index: 100;
	}

	.social-home__detail-sheet {
		width: 420px;
		max-width: min(420px, 96vw);
		background: var(--bg);
		padding: 1rem;
		overflow: auto;
		animation: social-home-sheet-in 200ms ease-out;
	}

	.social-home__back {
		background: none;
		border: none;
		color: var(--text);
		font-weight: 600;
		padding: 0;
		cursor: pointer;
		margin-bottom: 0.75rem;
	}

	.social-home__detail-actions {
		margin-top: 0.75rem;
	}

	@keyframes social-home-sheet-in {
		from {
			transform: translateX(24px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
