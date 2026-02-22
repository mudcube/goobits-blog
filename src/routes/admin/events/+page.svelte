<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import AdminPageHero from '@components/Admin/AdminPageHero.svelte'
	import AdminChevronRowCard from '@components/Admin/AdminChevronRowCard.svelte'
	import { getAdminActivityEmoji } from '$lib/admin/activity-display'
	import { formatAdminDayLabel, formatAdminTimeLabel } from '$lib/admin/date-format'
	import { isAdminMockMode, withAdminMock } from '$lib/admin/mock/mock-mode'
	import { mockDashboardEvents, mockDashboardRecentEvents, mockPrograms } from '$lib/admin/mock/admin-mock-data'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const mockMode = $derived(isAdminMockMode($page.url))
	const programsSource = $derived((mockMode ? mockPrograms : dashboard.programs))
	const eventsSource = $derived((mockMode ? mockDashboardEvents : dashboard.events))
	const recentEventsSource = $derived((mockMode ? mockDashboardRecentEvents : dashboard.recentEvents))

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	$effect(() => {
		if (!authed || mockMode) return
		dashboard.loadPrograms()
		dashboard.loadEvents()
	})

	function emojiForActivity(label: string, slug?: string) {
		return getAdminActivityEmoji(label, slug)
	}

	function dayLabel(iso: string) {
		return formatAdminDayLabel(iso)
	}

	function timeLabel(iso: string) {
		return formatAdminTimeLabel(iso)
	}

	function compactTimeLabel(iso: string) {
		return timeLabel(iso).replace(/\s+/g, '').toLowerCase()
	}

	function eventRoute(ev: { id?: number | string | null; activitySlug?: string | null }) {
		const idNum = Number(ev.id)
		if (Number.isFinite(idNum) && idNum > 0) {
			return `/admin/events/${idNum}`
		}
		if (ev.activitySlug) return `/admin/events/${ev.activitySlug}/`
		return '/admin/events/'
	}
</script>

{#if authed}
	<div class="social-events admin-content">
		<AdminPageHero
			eyebrow="Programs"
			title="Events"
			subtitle="Manage program pages & upcoming sessions."
		/>

		<h4>ACTIVITY PAGES</h4>
			<div class="social-events__program-grid">
			{#each programsSource as program}
				<button
					type="button"
					class="social-events__program-card admin-ui-card admin-ui-card--interactive"
					onclick={() => goto(hrefWithMock(`/admin/events/${program.slug}/`))}
				>
					<div class="social-events__program-icon">{program.icon || emojiForActivity(program.label, program.slug)}</div>
					<div class="social-events__program-label">{program.label}</div>
					<div class="social-events__program-status">
						<span class:social-events__dot--live={program.enabled} class="social-events__dot"></span>
						{program.enabled ? 'Live' : 'Draft'}
					</div>
				</button>
			{/each}
		</div>

		<h4>UPCOMING</h4>
		{#if !mockMode && dashboard.eventsLoading}
			<p class="social-events__meta">Loading events...</p>
		{:else if eventsSource.length === 0}
			<p class="social-events__meta">No upcoming events.</p>
		{:else}
			<div class="social-events__upcoming-grid">
				{#each eventsSource as ev}
					<button type="button" class="social-events__upcoming-card admin-ui-card admin-ui-card--interactive" onclick={() => goto(hrefWithMock(eventRoute(ev)))}>
						<div class="social-events__upcoming-top">
							<span class="social-events__event-emoji">{emojiForActivity(ev.activityLabel, ev.activitySlug)}</span>
							<div class="social-events__event-title">{ev.title}</div>
						</div>
						<div class="social-events__upcoming-meta">
							<div class="social-events__event-sub">{dayLabel(ev.startsAt)} · {compactTimeLabel(ev.startsAt)}</div>
							<div>
								<span class:social-events__event-cap--full={ev.seatsTaken >= ev.capacity || ev.waitlistCount > 0} class="social-events__event-cap">
									<span>{ev.seatsTaken}</span><span class="social-events__event-cap-sep">/</span><span>{ev.capacity}</span>
								</span>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}

		<h4>PAST</h4>
		<div class="social-events__past-list">
			{#if recentEventsSource.length === 0}
				<div class="social-events__past-row social-events__past-row--empty admin-ui-card">
					<div class="social-events__meta">Past adventures will show up here soon.</div>
				</div>
			{:else}
				{#each recentEventsSource.slice(0, 8) as recent}
					<AdminChevronRowCard compact={true} onclick={() => goto(hrefWithMock(eventRoute(recent)))} ariaLabel={`Open ${recent.title}`}>
						{#snippet start()}
							<span class="social-events__past-emoji">{emojiForActivity(recent.activityLabel, recent.activitySlug)}</span>
						{/snippet}
						<div>
							<div class="social-events__past-title">{recent.title}</div>
							<div class="social-events__event-sub">{dayLabel(recent.startsAt)} · {recent.seatsTaken} went</div>
						</div>
					</AdminChevronRowCard>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<style>
	.social-events {
		display: grid;
		gap: 1rem;
	}

	.social-events__program-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.social-events__program-card {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		text-align: left;
	}

	.social-events__program-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.social-events__program-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text);
	}

	.social-events__program-status {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.6875rem;
		color: var(--text-3);
	}

	.social-events__dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 42%, transparent);
	}

	.social-events__dot--live {
		background: var(--status-success-text);
	}

	.social-events__upcoming-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.social-events__upcoming-card {
		padding: 0.875rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.625rem;
		text-align: left;
	}

	.social-events__upcoming-top {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		width: 100%;
		text-align: left;
	}

	.social-events__upcoming-meta {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		flex-wrap: wrap;
		width: 100%;
		text-align: left;
	}

	.social-events__event-emoji {
		font-size: 1.25rem;
		line-height: 1;
	}

	.social-events__event-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text);
	}

	.social-events__event-sub {
		font-size: 0.74rem;
		line-height: 1;
		color: color-mix(in srgb, var(--text) 64%, transparent);
		margin-top: 0.1rem;
	}

	.social-events__event-cap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.625rem;
		font-weight: 500;
		line-height: 1;
		padding: 0.15rem 0.4rem;
		border-radius: 0.3rem;
		background: color-mix(in srgb, var(--accent-color-purple) 10%, transparent);
		color: var(--accent-color-purple-strong);
	}

	.social-events__event-cap-sep {
		opacity: 0.55;
		padding: 0 1px;
	}

	.social-events__event-cap--full {
		background: color-mix(in srgb, var(--status-error-text) 10%, transparent);
		color: var(--status-error-text);
	}

	.social-events__past-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.social-events__past-row--empty {
		justify-content: flex-start;
	}

	.social-events__past-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 78%, transparent);
	}

	.social-events__past-emoji {
		font-size: 1rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.social-events__meta {
		margin: 0;
		font-size: 0.84rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	@media (max-width: 720px) {
		.social-events__program-grid,
		.social-events__upcoming-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
