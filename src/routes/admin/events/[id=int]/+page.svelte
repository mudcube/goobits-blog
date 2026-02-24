<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import { Users } from '@lucide/svelte'
	import { ArrowUpRight } from '@lucide/svelte'
	import AdminPageHero from '@components/Admin/AdminPageHero.svelte'
	import AdminCrewMemberCard from '@components/Admin/AdminCrewMemberCard.svelte'
	import AdminMetaCards from '@components/Admin/AdminMetaCards.svelte'
	import { isAdminMockMode, withAdminMock } from '$lib/admin/mock/mock-mode'
	import { mockDashboardEvents, mockDashboardRecentEvents } from '$lib/admin/mock/admin-mock-data'
	import { adminEventDetailBreadcrumb } from '$lib/admin/breadcrumbs'

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
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null
	const mockEvent = $derived.by(() => {
		if (!mockMode || !Number.isFinite(eventId) || eventId <= 0) return null
		return [...mockDashboardEvents, ...mockDashboardRecentEvents].find((event) => event.id === eventId) || null
	})
	const detail = $derived.by(() => {
		if (mockMode) {
			if (!mockEvent) return null
			return {
				event: {
					id: mockEvent.id,
					activitySlug: mockEvent.activitySlug,
					activityLabel: mockEvent.activityLabel,
					title: mockEvent.title,
					startsAt: mockEvent.startsAt,
					endsAt: mockEvent.endsAt,
					capacity: mockEvent.capacity,
					waitlistCount: mockEvent.waitlistCount || 0,
					recapText: mockEvent.recapText || '',
					heroImageUrl: mockEvent.heroImageUrl || null
				},
				attendees: (mockEvent.participants || []).map((participant, idx) => ({
					entryId: idx + 1,
					userId: participant.userId,
					name: participant.name,
					email: null,
					status: 'joined' as const,
					waitlistPosition: null as number | null,
					attendanceStatus: idx % 2 === 0 ? 'attended' as const : 'unknown' as const
				})),
				weather: null as { summary: string; temperatureF: number } | null
			}
		}
		return dashboard.selectedEventDetail
	})
	const activityLabel = $derived(detail?.event.activityLabel || '')
	const activitySlug = $derived(detail?.event.activitySlug || '')
	const joinedCount = $derived.by(() => detail ? detail.attendees.filter((attendee) => attendee.status === 'joined').length : 0)
	const openSpots = $derived.by(() => detail ? Math.max(0, detail.event.capacity - joinedCount) : 0)
	const eventEnded = $derived.by(() => {
		if (!detail) return false
		const end = new Date(detail.event.endsAt).getTime()
		return Number.isFinite(end) && end <= Date.now()
	})

	function flash(message: string, isError = false) {
		toast = message
		toastError = isError
		if (toastTimer) clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toast = ''
			toastError = false
		}, 2400)
	}

	function formatEventRange(startsAt: string, endsAt: string) {
		const start = new Date(startsAt)
		const end = new Date(endsAt)
		const sameDay = start.toDateString() === end.toDateString()
		const dayLabel = start.toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		})
		const startTime = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
		const endTime = end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
		if (sameDay) return `${dayLabel} at ${startTime} – ${endTime}`
		const endLabel = end.toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		})
		return `${dayLabel} at ${startTime} – ${endLabel} at ${endTime}`
	}

	function formatDayLabel(iso: string) {
		return new Date(iso).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
		})
	}

	function formatTimeOnly(iso: string) {
		return new Date(iso).toLocaleTimeString(undefined, {
			hour: 'numeric',
			minute: '2-digit'
		})
	}

	function formatDuration(startsAt: string, endsAt: string) {
		const startMs = new Date(startsAt).getTime()
		const endMs = new Date(endsAt).getTime()
		if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return '—'
		const minutes = Math.round((endMs - startMs) / 60000)
		if (minutes < 60) return `${minutes} min`
		const hours = Math.floor(minutes / 60)
		const rem = minutes % 60
		return rem === 0 ? `${hours} hr${hours === 1 ? '' : 's'}` : `${hours}h ${rem}m`
	}

	function attendeeInitials(name: string) {
		const parts = name.split(/\s+/).filter(Boolean)
		const first = parts[0]?.[0] || ''
		const second = parts[1]?.[0] || (parts[0]?.[1] || 'X')
		return `${first}${second}`.toUpperCase()
	}

	function crewMemberHref(userId: string) {
		return hrefWithMock(`/admin/crew/${userId}/`)
	}

	function attendeeBadge(attendee: { status: string; waitlistPosition: number | null; attendanceStatus: string }) {
		if (attendee.status === 'waitlist' || attendee.waitlistPosition) return 'Waitlist'
		if (!eventEnded) return 'Joined'
		if (attendee.attendanceStatus === 'attended') return 'Attended'
		if (attendee.attendanceStatus === 'flaked') return 'Flaked'
		return 'Joined'
	}

	function attendeeDetail(attendee: { status: string; waitlistPosition: number | null; attendanceStatus: string }) {
		if (attendee.status === 'waitlist' || attendee.waitlistPosition) {
			return attendee.waitlistPosition ? `Position #${attendee.waitlistPosition}` : 'Pending opening'
		}
		if (!eventEnded) return 'Booking confirmed'
		if (attendee.attendanceStatus === 'attended') return 'Marked attended'
		if (attendee.attendanceStatus === 'flaked') return 'Marked no-show'
		return 'Booking confirmed'
	}

	function openEditor() {
		if (!detail) return
		void goto(hrefWithMock(`/admin/events/${detail.event.activitySlug || 'events'}/`))
	}

	async function cancelEvent() {
		if (!detail) return
		if (!confirm('Cancel this event? This action cannot be undone.')) return
		if (mockMode) {
			flash('Mock mode: cancel skipped')
			return
		}
		await dashboard.deleteEvent(detail.event.id)
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		void goto(hrefWithMock('/admin/events/'))
	}

	function handleEditRequest() {
		openEditor()
	}

	function handleCancelRequest() {
		void cancelEvent()
	}

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

	$effect(() => {
		window.addEventListener('admin-event-detail-edit', handleEditRequest)
		window.addEventListener('admin-event-detail-cancel', handleCancelRequest)
		return () => {
			window.removeEventListener('admin-event-detail-edit', handleEditRequest)
			window.removeEventListener('admin-event-detail-cancel', handleCancelRequest)
		}
	})

	$effect(() => {
		const label = detail?.event.title?.trim() || null
		adminEventDetailBreadcrumb.set(label)
		return () => adminEventDetailBreadcrumb.set(null)
	})
</script>

{#if authed}
	<div class="admin-event-detail admin-content">
		{#if toast}
			<div class="admin-ui-toast admin-event-detail__toast" class:admin-ui-toast--error={toastError} role="status">
				{#if !toastError}✓ {/if}{toast}
			</div>
		{/if}
		{#if loading}
			<p class="admin-event-detail__loading">Loading event detail...</p>
		{:else if detail}
			<div class="admin-event-detail__header">
				<AdminPageHero
					eyebrow={activityLabel || 'Event'}
					title={detail.event.title}
					subtitle={formatEventRange(detail.event.startsAt, detail.event.endsAt)}
				/>
				<div class="admin-event-detail__capacity"><strong>{joinedCount}</strong> of {detail.event.capacity} spots filled</div>
			</div>

			<section class="admin-event-detail__section">
				<div class="admin-event-detail__section-label">Details</div>
				<div class="admin-event-detail__detail-grid">
					<div class="admin-event-detail__detail-card">
						<div class="admin-event-detail__detail-label">Date</div>
						<div class="admin-event-detail__detail-value">{formatDayLabel(detail.event.startsAt)}</div>
					</div>
					<div class="admin-event-detail__detail-card">
						<div class="admin-event-detail__detail-label">Time</div>
						<div class="admin-event-detail__detail-value">{formatTimeOnly(detail.event.startsAt)}</div>
					</div>
					<div class="admin-event-detail__detail-card">
						<div class="admin-event-detail__detail-label">Duration</div>
						<div class="admin-event-detail__detail-value">{formatDuration(detail.event.startsAt, detail.event.endsAt)}</div>
					</div>
				</div>
			</section>

			<section class="admin-event-detail__section">
				<div class="admin-event-detail__section-label">Description</div>
				{#if detail.event.recapText && detail.event.recapText.trim()}
					<p class="admin-event-detail__description">{detail.event.recapText}</p>
				{:else}
					<p class="admin-event-detail__description-empty">No description added yet</p>
				{/if}
			</section>

			<section class="admin-event-detail__section">
				<div class="admin-event-detail__attendee-header">
					<div class="admin-event-detail__section-label">Attendees</div>
				</div>
				{#if detail.attendees.length === 0}
					<p class="admin-event-detail__loading">No attendees yet.</p>
				{:else}
					<ul class="admin-event-detail__attendee-list">
						{#each detail.attendees as attendee}
							<li class="admin-event-detail__attendee-item">
								<AdminCrewMemberCard
									name={attendee.name || attendee.email || attendee.userId}
									initials={attendeeInitials(attendee.name || attendee.email || attendee.userId)}
									badge={attendeeBadge(attendee)}
									detail={attendeeDetail(attendee)}
									href={crewMemberHref(attendee.userId)}
								/>
							</li>
						{/each}
					</ul>
				{/if}
				{#if openSpots > 0}
					<AdminMetaCards
						items={[
							{
								id: 'open-spots',
								label: `${openSpots} spot${openSpots === 1 ? '' : 's'} open`,
								detail: '',
								icon: Users
							}
						]}
						singleLine={true}
					/>
				{/if}
			</section>

			<a class="admin-event-detail__editor-link" href={hrefWithMock(`/admin/events/${activitySlug || 'events'}/`)}>
				<ArrowUpRight size={14} strokeWidth={2} />
				Open {activityLabel || 'Program'} program page
			</a>
		{:else}
			<p class="admin-event-detail__loading">Event not found.</p>
		{/if}
	</div>
{/if}

<style>
	.admin-event-detail {
		display: grid;
		gap: 1rem;
	}

	.admin-event-detail__loading {
		margin: 0;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.admin-event-detail__header {
		display: grid;
		gap: 0.2rem;
	}

	.admin-event-detail__capacity {
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		margin-top: -0.1rem;
	}

	.admin-event-detail__capacity strong {
		color: var(--text);
		font-weight: 650;
	}

	.admin-event-detail__section {
		display: grid;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}

	.admin-event-detail__header + .admin-event-detail__section {
		padding-top: 0.2rem;
		border-top: none;
	}

	.admin-event-detail__section-label {
		margin: 0;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 46%, transparent);
	}

	.admin-event-detail__detail-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.admin-event-detail__detail-card {
		padding: 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid color-mix(in srgb, var(--text) 9%, transparent);
		background: var(--bg);
	}

	.admin-event-detail__detail-label {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 50%, transparent);
		margin-bottom: 0.2rem;
	}

	.admin-event-detail__detail-value {
		font-size: 0.8125rem;
		font-weight: 620;
		color: var(--text);
	}

	.admin-event-detail__description {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.admin-event-detail__description-empty {
		margin: 0;
		font-size: 0.8125rem;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 40%, transparent);
	}

	.admin-event-detail__attendee-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.admin-event-detail__attendee-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.35rem;
	}

	.admin-event-detail__attendee-item {
		list-style: none;
	}

	.admin-event-detail__editor-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		width: fit-content;
		font-size: 0.75rem;
		font-weight: 600;
		text-decoration: none;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		margin-top: 0.25rem;
	}

	.admin-event-detail__editor-link:hover {
		color: var(--text);
	}

	.admin-event-detail__toast {
		bottom: 1rem;
		z-index: 130;
	}

	@media (max-width: 760px) {
		.admin-event-detail__detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
