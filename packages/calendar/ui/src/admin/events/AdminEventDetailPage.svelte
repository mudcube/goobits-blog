<script lang="ts">
	import { untrack } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import { Users } from '@lucide/svelte'
	import { ArrowUpRight } from '@lucide/svelte'
	import { ArrowUp, Check, X as XIcon } from '@lucide/svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import AdminToast from '@calendar/ui/admin/shared/AdminToast.svelte'
	import EditableField from '@calendar/ui/admin/shared/EditableField.svelte'
	import AdminDateTimePicker from '@calendar/ui/admin/shared/AdminDateTimePicker.svelte'
	import AdminInlineConfirm from '@calendar/ui/admin/shared/AdminInlineConfirm.svelte'
	import AdminEventHeroUpload from './AdminEventHeroUpload.svelte'
	import AdminCrewMemberCard from '@calendar/ui/admin/members/AdminCrewMemberCard.svelte'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import { getAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import { withAdminRoute } from '@calendar/ui/config'
	import { adminActionHandlers, adminEventDetailBreadcrumb } from '../shell/state'

	const { data } = $props<{ data: { user: unknown | null; eventId: string; bootstrap?: unknown } }>()

	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	untrack(() => {
		if (data.bootstrap) dashboard.bootstrap(data.bootstrap as never)
	})
	const authed = $derived(!!data.user)
	const eventId = $derived(Number(data.eventId))
	const mockMode = $derived(isAdminMockMode($page.url))
	const adminMockCatalog = getAdminMockCatalog()

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	let loading = $state(false)
	let attemptedLoad = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null
	let cancelConfirmOpen = $state(false)
	const mockEvent = $derived.by(() => {
		if (!mockMode || !Number.isFinite(eventId) || eventId <= 0) return null
		return [...adminMockCatalog.dashboardEvents, ...adminMockCatalog.dashboardRecentEvents]
			.find((event) => event.id === eventId) || null
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
		if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return '-'
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
		return hrefWithMock(withAdminRoute(`crew/${userId}/`))
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

	async function handlePromote(entryId: number) {
		if (mockMode) {
			flash('Mock mode: promote preview only')
			return
		}
		await dashboard.promoteWaitlist(eventId, entryId)
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Promoted from waitlist')
	}

	async function handleTitleCommit(next: string) {
		if (!detail) return
		const trimmed = next.trim()
		if (!trimmed || trimmed === detail.event.title) return
		if (mockMode) {
			flash('Mock mode: title preview only')
			return
		}
		await dashboard.updateEventDetails(eventId, {
			title: trimmed,
			startsAt: detail.event.startsAt,
			endsAt: detail.event.endsAt
		})
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Title saved')
	}

	function validateTitle(next: string): string | null {
		return next.trim() ? null : 'Required'
	}

	async function handleDateTimeCommit(next: { startsAt: string; endsAt: string }) {
		if (!detail) return
		if (mockMode) {
			flash('Mock mode: date preview only')
			return
		}
		await dashboard.updateEventDetails(eventId, {
			title: detail.event.title,
			startsAt: next.startsAt,
			endsAt: next.endsAt
		})
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Time updated')
	}

	async function handleHeroUpload(file: File) {
		if (mockMode) {
			flash('Mock mode: hero upload preview only')
			return null
		}
		const url = await dashboard.uploadEventHero(eventId, file)
		if (!url) {
			flash(dashboard.error || 'Failed to upload image', true)
			return null
		}
		flash('Hero image saved')
		return url
	}

	async function handleHeroClear() {
		if (mockMode) {
			flash('Mock mode: hero clear preview only')
			return false
		}
		const cleared = await dashboard.clearEventHero(eventId)
		if (!cleared) {
			flash(dashboard.error || 'Failed to remove image', true)
			return false
		}
		flash('Hero image removed')
		return true
	}

	async function handleRecapCommit(next: string) {
		if (mockMode) {
			flash('Mock mode: description preview only')
			return
		}
		await dashboard.updateEventRecap(eventId, next)
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Description saved')
	}

	async function handleCapacityCommit(next: string) {
		const value = Number(next)
		if (!Number.isFinite(value) || value < joinedCount) return
		if (mockMode) {
			flash('Mock mode: capacity preview only')
			return
		}
		await dashboard.updateEventCapacity(eventId, value)
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Capacity updated')
	}

	function validateCapacity(next: string): string | null {
		const value = Number(next)
		if (!Number.isFinite(value)) return 'Number'
		if (value < joinedCount) return `≥ ${joinedCount}`
		return null
	}

	async function handleAttendance(userId: string, status: 'unknown' | 'attended' | 'flaked') {
		if (mockMode) {
			flash('Mock mode: attendance preview only')
			return
		}
		await dashboard.updateEventAttendance(eventId, userId, status)
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash(status === 'attended' ? 'Marked attended' : status === 'flaked' ? 'Marked no-show' : 'Cleared')
	}

	function openEditor() {
		if (!detail) return
		void goto(hrefWithMock(withAdminRoute(`events/program/${detail.event.activitySlug || 'events'}/`)))
	}

	async function performCancelEvent() {
		cancelConfirmOpen = false
		if (!detail) return
		if (mockMode) {
			flash('Mock mode: cancel skipped')
			return
		}
		await dashboard.deleteEvent(detail.event.id)
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		void goto(hrefWithMock(withAdminRoute('events/')))
	}

	function cancelEvent() {
		if (!detail) return
		cancelConfirmOpen = true
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
			goto(hrefWithMock(withAdminRoute()), { replaceState: true })
		}
	})

	$effect(() => {
		adminActionHandlers.update((handlers) => ({
			...handlers,
			onEventDetailEdit: handleEditRequest,
			onEventDetailCancel: handleCancelRequest
		}))

		return () => {
			adminActionHandlers.update((handlers) => {
				const next = { ...handlers }
				delete next.onEventDetailEdit
				delete next.onEventDetailCancel
				return next
			})
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
			<AdminToast message={toast} variant={toastError ? 'error' : 'status'} />
		{/if}
		{#if cancelConfirmOpen}
			<div class="admin-event-detail__cancel-confirm">
				<AdminInlineConfirm
					question="Cancel this event? This action cannot be undone."
					confirmLabel="Yes, cancel"
					onCancel={() => (cancelConfirmOpen = false)}
					onConfirm={() => void performCancelEvent()}
				/>
			</div>
		{/if}
		{#if loading || (!mockMode && !attemptedLoad)}
			<p class="admin-event-detail__loading">Loading event detail...</p>
		{:else if detail}
			<div class="admin-event-detail__header">
				<AdminPageHero eyebrow={activityLabel || 'Event'}>
					{#snippet titleSnippet()}
						<EditableField
							value={detail.event.title}
							onCommit={handleTitleCommit}
							validate={validateTitle}
							ariaLabel="Event title"
							className="admin-event-detail__title-edit"
						/>
					{/snippet}
					{#snippet subtitleSnippet()}
						<AdminDateTimePicker
							startsAt={detail.event.startsAt}
							endsAt={detail.event.endsAt}
							onCommit={handleDateTimeCommit}
							ariaLabel="Event date and time"
							formatDisplay={formatEventRange}
						/>
					{/snippet}
				</AdminPageHero>
				<div class="admin-event-detail__capacity">
					<strong>{joinedCount}</strong> of
					<EditableField
						value={String(detail.event.capacity)}
						onCommit={handleCapacityCommit}
						validate={validateCapacity}
						ariaLabel="Capacity"
						className="admin-event-detail__capacity-edit"
					/>
					spots filled
				</div>
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
				<div class="admin-event-detail__section-label">Hero image</div>
				<AdminEventHeroUpload
					heroImageUrl={detail.event.heroImageUrl ?? null}
					{mockMode}
					onUpload={handleHeroUpload}
					onClear={handleHeroClear}
					onError={(message) => flash(message, true)}
				/>
			</section>

			<section class="admin-event-detail__section">
				<div class="admin-event-detail__section-label">Description</div>
				<EditableField
					value={detail.event.recapText ?? ''}
					onCommit={handleRecapCommit}
					ariaLabel="Description"
					placeholder="Add a description for this event…"
					multiline={true}
					className="admin-event-detail__description"
				/>
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
								{#if attendee.status === 'waitlist' || attendee.waitlistPosition}
									<div class="admin-event-detail__attendee-actions">
										<button
											type="button"
											class="admin-ui-btn admin-ui-btn--accent"
											onclick={() => void handlePromote(attendee.entryId)}
										>
											<ArrowUp size={13} strokeWidth={2} /> Promote
										</button>
									</div>
								{:else if eventEnded && attendee.status === 'joined'}
									<div class="admin-event-detail__attendee-actions">
										<button
											type="button"
											class="admin-ui-btn"
											class:admin-ui-btn--accent={attendee.attendanceStatus === 'attended'}
											onclick={() =>
												void handleAttendance(
													attendee.userId,
													attendee.attendanceStatus === 'attended' ? 'unknown' : 'attended'
												)}
										>
											<Check size={13} strokeWidth={2} /> Attended
										</button>
										<button
											type="button"
											class="admin-ui-btn"
											class:admin-ui-btn--warn={attendee.attendanceStatus === 'flaked'}
											onclick={() =>
												void handleAttendance(
													attendee.userId,
													attendee.attendanceStatus === 'flaked' ? 'unknown' : 'flaked'
												)}
										>
											<XIcon size={13} strokeWidth={2} /> No-show
										</button>
									</div>
								{/if}
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

			<a class="admin-event-detail__editor-link" href={hrefWithMock(withAdminRoute(`events/program/${activitySlug || 'events'}/`))}>
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

	.admin-event-detail__capacity :global(.admin-event-detail__capacity-edit) {
		font-weight: 650;
		color: var(--text);
		min-width: 1.5rem;
	}

	.admin-event-detail :global(.admin-event-detail__title-edit) {
		font: inherit;
		color: inherit;
		display: inline;
	}

	.admin-event-detail__cancel-confirm {
		padding: 0.85rem 1rem;
		border-radius: 0.7rem;
		background: var(--admin-danger-bg-faint);
		border: 1px solid var(--admin-danger-border);
		margin-bottom: 0.5rem;
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
		color: var(--admin-text-muted);
		margin-bottom: 0.2rem;
	}

	.admin-event-detail__detail-value {
		font-size: 0.8125rem;
		font-weight: 620;
		color: var(--text);
	}

	.admin-event-detail__section :global(.admin-event-detail__description) {
		font-size: 0.8125rem;
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		min-height: 1.5em;
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
		display: grid;
		gap: 0.4rem;
	}

	.admin-event-detail__attendee-actions {
		display: inline-flex;
		gap: 0.4rem;
		padding-left: 3rem;
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

	@media (max-width: 760px) {
		.admin-event-detail__detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
