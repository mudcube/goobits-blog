<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import { getActivityColor, getActivityIcon } from '@calendar/ui/shared'
	import { formatEventDayLabel } from '@calendar/ui/shared'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import { getAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
	import { withAdminRoute } from '@calendar/ui/config'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const mockMode = $derived(isAdminMockMode($page.url))
	const adminMockCatalog = getAdminMockCatalog()
	const programsSource = $derived((mockMode ? adminMockCatalog.programs : dashboard.programs))
	const eventsSource = $derived((mockMode ? adminMockCatalog.dashboardEvents : dashboard.events))
	const recentEventsSource = $derived((mockMode ? adminMockCatalog.dashboardRecentEvents : dashboard.recentEvents))

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	$effect(() => {
		if (!authed || mockMode) return
		dashboard.loadPrograms()
		dashboard.loadEvents()
	})

	function dayLabel(iso: string) {
		return formatEventDayLabel(iso)
	}

	function eventRoute(ev: { id?: number | string | null; activitySlug?: string | null }) {
		const idNum = Number(ev.id)
		if (Number.isFinite(idNum) && idNum > 0) {
			return withAdminRoute(`events/detail/${idNum}/`)
		}
		if (ev.activitySlug) return withAdminRoute(`events/program/${ev.activitySlug}/`)
		return withAdminRoute('events/')
	}

	function timeLabel(iso: string) {
		const date = new Date(iso)
		const minutes = date.getMinutes()
		if (minutes === 0) {
			return date.toLocaleTimeString(undefined, { hour: 'numeric' })
		}
		return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
	}

	function isPast(iso: string) {
		return new Date(iso).getTime() < Date.now()
	}

	function initialsFor(participant: { name?: string | null; displayName?: string | null } | undefined, index: number) {
		const raw = participant?.displayName || participant?.name
		if (!raw) return `#${index + 1}`
		const parts = raw.trim().split(/\s+/).filter(Boolean)
		const first = parts[0]?.charAt(0) ?? ''
		const second = parts[1]?.charAt(0) ?? ''
		return `${first}${second}`.toUpperCase() || raw.slice(0, 2).toUpperCase()
	}
</script>

{#if authed}
	<div class="social-events admin-content">
		<AdminPageHero
			eyebrow="Programs"
			title="Events"
			subtitle="Manage program pages & upcoming sessions."
		/>

		<h4>ACTIVITY PAGES ({programsSource.length})</h4>
		<AdminMetaCards
			items={programsSource.map((program) => ({
				id: String(program.slug),
				label: program.label,
				detail: program.enabled ? 'Live' : 'Draft',
				dotColor: getActivityColor(program.label, program.slug),
				dotIcon: getActivityIcon(program.label, program.slug),
				onClick: () => goto(hrefWithMock(withAdminRoute(`events/program/${program.slug}/`))),
				ariaLabel: `Open ${program.label}`,
			}))}
			emptyText="No activity pages yet."
		/>

		<h4>UPCOMING</h4>
		{#if !mockMode && dashboard.eventsLoading}
			<p class="social-events__meta">Loading events...</p>
		{:else}
			<AdminMetaCards
				items={eventsSource.map((ev) => {
					const past = isPast(ev.startsAt)
					const spotsLeft = Math.max(ev.capacity - ev.seatsTaken, 0)
					return {
						id: String(ev.id),
						label: ev.title,
						detail: `${dayLabel(ev.startsAt)} · ${ev.activityLabel} · ${past ? 'finished' : `${spotsLeft} spots left`}`,
						dotColor: getActivityColor(ev.activityLabel, ev.activitySlug || undefined),
						dotIcon: getActivityIcon(ev.activityLabel, ev.activitySlug || undefined),
						dimmed: past,
						onClick: () => goto(hrefWithMock(eventRoute(ev))),
						ariaLabel: `Open ${ev.title}`,
						_event: ev,
					}
				})}
				emptyText="No upcoming events."
			>
				{#snippet right(item)}
					{@const ev = item._event}
					<div class="social-events__time">{timeLabel(ev.startsAt)}</div>
					<div class="social-events__people">
						<span class="social-events__avatar social-events__avatar--you" title="You">You</span>
						{#each (ev.participants || []).slice(0, 3) as participant, i (i)}
							<span class="social-events__avatar" title={participant.displayName || participant.name || ''}>{initialsFor(participant, i)}</span>
						{/each}
						<span class="social-events__count">
							{ev.seatsTaken}{isPast(ev.startsAt) ? '' : ''}
						</span>
					</div>
				{/snippet}
			</AdminMetaCards>
		{/if}

		<h4>PAST</h4>
		<AdminMetaCards
			items={recentEventsSource.slice(0, 8).map((recent) => ({
				id: String(recent.id || recent.title),
				label: recent.title,
				detail: `${dayLabel(recent.startsAt)} · ${recent.seatsTaken} went`,
				dotColor: getActivityColor(recent.activityLabel, recent.activitySlug),
				dotIcon: getActivityIcon(recent.activityLabel, recent.activitySlug),
			}))}
			emptyText="No past events yet."
		/>
	</div>
{/if}

<style>
	.social-events {
		display: grid;
		gap: 1rem;
	}

	.social-events__time {
		font-size: 0.78rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		white-space: nowrap;
	}

	.social-events__people {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	:global(.social-events__avatar) {
		width: 1.3rem;
		height: 1.3rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		font-size: 0.48rem;
		font-weight: 700;
		background: color-mix(in srgb, var(--text) 8%, transparent);
		color: color-mix(in srgb, var(--text) 65%, transparent);
		flex-shrink: 0;
	}

	:global(.social-events__avatar--you) {
		background: color-mix(in srgb, var(--admin-accent) 20%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
	}

	:global(.social-events__count) {
		margin-left: 0.25rem;
		font-size: 0.68rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 45%, transparent);
	}

	.social-events__meta {
		margin: 0;
		font-size: 0.84rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

</style>
