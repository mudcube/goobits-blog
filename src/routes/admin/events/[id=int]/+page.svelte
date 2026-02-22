<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import { ArrowUpRight, Pencil, Trash2 } from '@lucide/svelte'
	import AdminActionButton from '@components/Admin/AdminActionButton.svelte'
	import AdminPageHero from '@components/Admin/AdminPageHero.svelte'
	import { getAdminActivityColor, getAdminActivityEmoji } from '$lib/admin/activity-display'
	import { isAdminMockMode, withAdminMock } from '$lib/admin/mock/mock-mode'
	import { mockDashboardEvents, mockDashboardRecentEvents } from '$lib/admin/mock/admin-mock-data'

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
	const activityEmoji = $derived(getAdminActivityEmoji(activityLabel, activitySlug))
	const activityColor = $derived(getAdminActivityColor(activityLabel, activitySlug))
	const joinedCount = $derived.by(() => detail ? detail.attendees.filter((attendee) => attendee.status === 'joined').length : 0)
	const openSpots = $derived.by(() => detail ? Math.max(0, detail.event.capacity - joinedCount) : 0)

	function flash(message: string, isError = false) {
		toast = message
		toastError = isError
		if (toastTimer) clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toast = ''
			toastError = false
		}, 2400)
	}

	function formatDateTime(iso: string) {
		return new Date(iso).toLocaleString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		})
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
					subtitle={`${formatDateTime(detail.event.startsAt)} – ${formatDateTime(detail.event.endsAt)}`}
				/>
				<div class="admin-event-detail__header-row">
					<div class="admin-event-detail__activity" style={`--event-color:${activityColor}`}>
						<span class="admin-event-detail__activity-emoji">{activityEmoji}</span>
						<span>{activityLabel || 'Activity'}</span>
					</div>
					<div class="admin-event-detail__capacity">
						<strong>{joinedCount}</strong> of {detail.event.capacity} spots filled
					</div>
				</div>
			</div>

			<div class="admin-event-detail__actions">
				<AdminActionButton variant="primary" icon={Pencil} href={hrefWithMock(`/admin/events/${activitySlug || 'events'}/`)}>Edit</AdminActionButton>
				<AdminActionButton variant="danger" icon={Trash2} onclick={() => void cancelEvent()}>Cancel Event</AdminActionButton>
			</div>

			<div class="admin-event-detail__card admin-ui-card">
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
			</div>

			<div class="admin-event-detail__card admin-ui-card">
				<div class="admin-event-detail__section-label">Description</div>
				{#if detail.event.recapText && detail.event.recapText.trim()}
					<p class="admin-event-detail__description">{detail.event.recapText}</p>
				{:else}
					<p class="admin-event-detail__description-empty">No description added yet</p>
				{/if}
			</div>

			<div class="admin-event-detail__card admin-ui-card">
				<div class="admin-event-detail__attendee-header">
					<div class="admin-event-detail__section-label">Attendees</div>
					<span class="admin-event-detail__attendee-count">{joinedCount} / {detail.event.capacity}</span>
				</div>
				{#if detail.attendees.length === 0}
					<p class="admin-event-detail__loading">No attendees yet.</p>
				{:else}
					<ul class="admin-event-detail__attendee-list">
						{#each detail.attendees as attendee}
							<li class="admin-event-detail__attendee-card">
								<div class="admin-event-detail__attendee-avatar">
									{attendeeInitials(attendee.name || attendee.email || attendee.userId)}
								</div>
								<div class="admin-event-detail__attendee-main">
									<div class="admin-event-detail__attendee-name">{attendee.name || attendee.email || attendee.userId}</div>
									<div class="admin-event-detail__attendee-detail">
										{#if attendee.waitlistPosition}
											Waitlist #{attendee.waitlistPosition}
										{:else if attendee.attendanceStatus === 'attended'}
											Attended
										{:else if attendee.attendanceStatus === 'flaked'}
											Flaked
										{:else}
											Joined
										{/if}
									</div>
								</div>
								<span
									class="admin-event-detail__attendee-status"
									class:admin-event-detail__attendee-status--waitlist={attendee.status === 'waitlist'}
								>
									{attendee.status === 'waitlist' ? 'Waitlist' : 'Joined'}
								</span>
							</li>
						{/each}
						{#if openSpots > 0}
							<li class="admin-event-detail__open-spots">
								<span>{openSpots} spot{openSpots === 1 ? '' : 's'} open</span>
							</li>
						{/if}
					</ul>
				{/if}
			</div>

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

	.admin-event-detail__header {
		display: grid;
		gap: 0.65rem;
	}

	.admin-event-detail__activity {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		width: fit-content;
		padding: 0.2rem 0.52rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--event-color) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--event-color) 28%, transparent);
		color: color-mix(in srgb, var(--event-color) 68%, var(--text) 32%);
		font-size: 0.7rem;
		font-weight: 650;
	}

	.admin-event-detail__activity-emoji {
		font-size: 0.92rem;
		line-height: 1;
	}

	.admin-event-detail__header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.admin-event-detail__capacity {
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.admin-event-detail__capacity strong {
		color: var(--text);
		font-weight: 650;
	}

	.admin-event-detail__actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.45rem;
	}

	.admin-event-detail__card {
		padding: 0.95rem 1rem;
		display: grid;
		gap: 0.8rem;
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
		padding: 0.72rem;
		border-radius: 0.72rem;
		border: 1px solid var(--admin-card-border);
		background: color-mix(in srgb, var(--bg) 96%, var(--text) 4%);
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
		font-size: 0.82rem;
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 66%, transparent);
	}

	.admin-event-detail__description-empty {
		margin: 0;
		font-size: 0.82rem;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 46%, transparent);
	}

	.admin-event-detail__attendee-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.admin-event-detail__attendee-count {
		font-size: 0.72rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.admin-event-detail__attendee-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.35rem;
	}

	.admin-event-detail__attendee-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		padding: 0.45rem 0.6rem;
		border-radius: 0.6rem;
		border: 1px solid color-mix(in srgb, var(--event-color) 12%, transparent);
		background: color-mix(in srgb, var(--event-color) 3%, var(--bg));
	}

	.admin-event-detail__attendee-avatar {
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.64rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--event-color) 12%, transparent);
		color: color-mix(in srgb, var(--event-color) 70%, var(--text) 30%);
	}

	.admin-event-detail__attendee-main {
		min-width: 0;
	}

	.admin-event-detail__attendee-name {
		font-size: 0.78rem;
		font-weight: 620;
		color: var(--text);
	}

	.admin-event-detail__attendee-detail {
		font-size: 0.6875rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	.admin-event-detail__attendee-status {
		flex-shrink: 0;
		font-size: 0.67rem;
		font-weight: 650;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0.16rem 0.42rem;
		border-radius: 999px;
		background: color-mix(in srgb, #34c759 12%, transparent);
		color: color-mix(in srgb, #248a3d 84%, var(--text) 16%);
	}

	.admin-event-detail__attendee-status--waitlist {
		background: color-mix(in srgb, #ff9500 12%, transparent);
		color: color-mix(in srgb, #c27800 84%, var(--text) 16%);
	}

	.admin-event-detail__open-spots {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-radius: 0.72rem;
		border: 1px dashed color-mix(in srgb, var(--text) 10%, transparent);
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--text) 48%, transparent);
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
		.admin-event-detail__header-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.admin-event-detail__detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
