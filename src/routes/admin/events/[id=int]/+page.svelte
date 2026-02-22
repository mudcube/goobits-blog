<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import { Pencil, Trash2, Users } from '@lucide/svelte'
	import AdminActionButton from '@components/Admin/AdminActionButton.svelte'
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
	let editMode = $state(false)
	let saving = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null
	let draftCapacity = $state(1)
	let draftDescription = $state('')
	let draftStartsAt = $state('')
	let draftEndsAt = $state('')
	const mockEvent = $derived.by(() => {
		if (!mockMode || !Number.isFinite(eventId) || eventId <= 0) return null
		return [...mockDashboardEvents, ...mockDashboardRecentEvents].find((event) => event.id === eventId) || null
	})
	const allEvents = $derived.by(() => [...dashboard.events, ...dashboard.recentEvents])
	const eventSource = $derived.by(() => {
		if (mockMode) return mockEvent
		return allEvents.find((event) => event.id === eventId) || null
	})
	const detail = $derived.by(() => {
		if (mockMode) {
			if (!mockEvent) return null
			return {
				event: {
					id: mockEvent.id,
					title: mockEvent.title,
					startsAt: mockEvent.startsAt,
					endsAt: mockEvent.endsAt,
					capacity: mockEvent.capacity,
					waitlistCount: mockEvent.waitlistCount || 0
				},
				attendees: (mockEvent.participants || []).map((participant, idx) => ({
					entryId: idx + 1,
					userId: participant.userId,
					name: participant.name,
					email: null,
					status: 'joined' as const,
					waitlistPosition: null as number | null
				})),
				weather: null as { summary: string; temperatureF: number } | null
			}
		}
		return dashboard.selectedEventDetail
	})
	const activityLabel = $derived(eventSource?.activityLabel || '')
	const activitySlug = $derived(eventSource?.activitySlug || '')
	const activityEmoji = $derived(getAdminActivityEmoji(activityLabel, activitySlug))
	const activityColor = $derived(getAdminActivityColor(activityLabel, activitySlug))
	const hasTimeDraftChanges = $derived.by(() => {
		if (!detail) return false
		return draftStartsAt !== detail.event.startsAt || draftEndsAt !== detail.event.endsAt
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

	function formatDateTime(iso: string) {
		return new Date(iso).toLocaleString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		})
	}

	function toLocalDateTimeInputValue(iso: string) {
		if (!iso) return ''
		const date = new Date(iso)
		if (Number.isNaN(date.getTime())) return ''
		const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		return local.toISOString().slice(0, 16)
	}

	function resetDraftFromDetail() {
		if (!detail) return
		draftCapacity = detail.event.capacity
		draftDescription = eventSource?.recapText || ''
		draftStartsAt = detail.event.startsAt
		draftEndsAt = detail.event.endsAt
	}

	function beginEditing() {
		resetDraftFromDetail()
		editMode = true
	}

	function cancelEditing() {
		resetDraftFromDetail()
		editMode = false
	}

	async function saveChanges() {
		if (!detail || mockMode) {
			flash('Mock mode: changes are preview-only')
			editMode = false
			return
		}
		saving = true
		try {
			if (draftCapacity !== detail.event.capacity) {
				await dashboard.updateEventCapacity(detail.event.id, Math.max(1, Math.min(50, draftCapacity)))
				if (dashboard.error) {
					flash(dashboard.error, true)
					return
				}
			}
			const existingHeroImageUrl = eventSource?.heroImageUrl || ''
			if (draftDescription !== (eventSource?.recapText || '')) {
				await dashboard.updateEventMemory(detail.event.id, draftDescription, existingHeroImageUrl)
				if (dashboard.error) {
					flash(dashboard.error, true)
					return
				}
			}
			await dashboard.openEventDetail(detail.event.id)
			await dashboard.loadEvents()
			editMode = false
			if (hasTimeDraftChanges) {
				flash('Saved description & capacity. Time editing is coming soon.')
			} else {
				flash('Event updated')
			}
		} finally {
			saving = false
		}
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

	$effect(() => {
		if (!detail || editMode) return
		resetDraftFromDetail()
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
			<div class="admin-event-detail__card admin-ui-card">
				<div class="admin-event-detail__head">
					<div class="admin-event-detail__activity" style={`--event-color:${activityColor}`}>
						<span class="admin-event-detail__activity-emoji">{activityEmoji}</span>
						<span>{activityLabel || 'Activity'}</span>
					</div>
					<h2 class="admin-event-detail__title">{detail.event.title}</h2>
					<p class="admin-event-detail__meta">{formatDateTime(detail.event.startsAt)} – {formatDateTime(detail.event.endsAt)}</p>
					<a class="admin-event-detail__editor-link" href={hrefWithMock(`/admin/events/${activitySlug || eventSource?.activitySlug || 'events'}/`)}>
						Open Program Editor
					</a>
				</div>

				<div class="admin-event-detail__fields">
					<label>
						<span>Description</span>
						<textarea
							class="admin-ui-input admin-event-detail__textarea"
							rows="3"
							bind:value={draftDescription}
							disabled={!editMode}
							placeholder="Add context or notes for attendees"
						></textarea>
					</label>
					<div class="admin-event-detail__field-row">
						<label>
							<span>Start time</span>
							<input
								class="admin-ui-input"
								type="datetime-local"
								value={toLocalDateTimeInputValue(draftStartsAt)}
								disabled={!editMode}
								onchange={(event) => {
									const value = (event.currentTarget as HTMLInputElement).value
									draftStartsAt = value ? new Date(value).toISOString() : draftStartsAt
								}}
							/>
						</label>
						<label>
							<span>End time</span>
							<input
								class="admin-ui-input"
								type="datetime-local"
								value={toLocalDateTimeInputValue(draftEndsAt)}
								disabled={!editMode}
								onchange={(event) => {
									const value = (event.currentTarget as HTMLInputElement).value
									draftEndsAt = value ? new Date(value).toISOString() : draftEndsAt
								}}
							/>
						</label>
						<label>
							<span>Capacity</span>
							<input class="admin-ui-input" type="number" min="1" max="50" bind:value={draftCapacity} disabled={!editMode} />
						</label>
					</div>
					{#if editMode && hasTimeDraftChanges}
						<p class="admin-event-detail__hint">Time edits are staged in UI; server-side time updates are not enabled yet.</p>
					{/if}
				</div>

				<div class="admin-event-detail__actions">
					{#if editMode}
						<AdminActionButton variant="subtle" onclick={cancelEditing} disabled={saving}>Discard</AdminActionButton>
						<AdminActionButton variant="primary" onclick={() => void saveChanges()} disabled={saving}>Save changes</AdminActionButton>
					{:else}
						<AdminActionButton variant="primary" icon={Pencil} onclick={beginEditing}>Edit</AdminActionButton>
						<AdminActionButton variant="danger" icon={Trash2} onclick={() => void cancelEvent()}>Cancel Event</AdminActionButton>
					{/if}
				</div>

				<div class="admin-event-detail__attendees">
					<div class="admin-event-detail__attendees-head">
						<h3><Users size={14} /> Attendees</h3>
						<span>{detail.attendees.length} total</span>
					</div>
					{#if detail.attendees.length === 0}
						<p class="admin-event-detail__loading">No attendees yet.</p>
					{:else}
						<ul class="admin-event-detail__attendee-list">
							{#each detail.attendees as attendee}
								<li>
									<div class="admin-event-detail__attendee-main">
										<div class="admin-event-detail__attendee-name">{attendee.name || attendee.email || attendee.userId}</div>
										{#if attendee.email}
											<div class="admin-event-detail__attendee-email">{attendee.email}</div>
										{/if}
									</div>
									<div class="admin-event-detail__attendee-status" class:admin-event-detail__attendee-status--waitlist={attendee.status === 'waitlist'}>
										{attendee.status}
										{#if attendee.waitlistPosition}
											· #{attendee.waitlistPosition}
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		{:else}
			<p class="admin-event-detail__loading">Event not found.</p>
		{/if}
	</div>
{/if}

<style>
	.admin-event-detail {
		display: grid;
		gap: 0.85rem;
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

	.admin-event-detail__card {
		padding: 0.95rem 1rem;
		display: grid;
		gap: 0.8rem;
	}

	.admin-event-detail__head {
		display: grid;
		gap: 0.3rem;
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

	.admin-event-detail__title {
		margin: 0;
		font-size: 1.06rem;
		line-height: 1.2;
		font-weight: 680;
		color: var(--text);
	}

	.admin-event-detail__meta {
		margin: 0;
		font-size: 0.8rem;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.admin-event-detail__editor-link {
		display: inline-flex;
		width: fit-content;
		font-size: 0.74rem;
		font-weight: 600;
		text-decoration: none;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.admin-event-detail__editor-link:hover {
		color: var(--text);
	}

	.admin-event-detail__fields {
		display: grid;
		gap: 0.55rem;
	}

	.admin-event-detail__fields label {
		display: grid;
		gap: 0.24rem;
	}

	.admin-event-detail__fields label > span {
		font-size: 0.7rem;
		font-weight: 620;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.admin-event-detail__textarea {
		min-height: 82px;
		padding-top: 0.45rem;
		padding-bottom: 0.45rem;
		resize: vertical;
	}

	.admin-event-detail__field-row {
		display: grid;
		grid-template-columns: 1fr 1fr 120px;
		gap: 0.5rem;
	}

	.admin-event-detail__hint {
		margin: 0;
		font-size: 0.71rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	.admin-event-detail__actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.45rem;
	}

	.admin-event-detail__attendees {
		display: grid;
		gap: 0.5rem;
	}

	.admin-event-detail__attendees-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.admin-event-detail__attendees-head h3 {
		margin: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.82rem;
		font-weight: 660;
	}

	.admin-event-detail__attendees-head span {
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

	.admin-event-detail__attendee-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		padding: 0.45rem 0.6rem;
		border-radius: 0.6rem;
		border: 1px solid var(--admin-card-border);
		background: color-mix(in srgb, var(--admin-card-bg) 86%, var(--bg) 14%);
	}

	.admin-event-detail__attendee-main {
		min-width: 0;
	}

	.admin-event-detail__attendee-name {
		font-size: 0.78rem;
		font-weight: 620;
		color: var(--text);
	}

	.admin-event-detail__attendee-email {
		font-size: 0.68rem;
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

	.admin-event-detail__toast {
		bottom: 1rem;
		z-index: 130;
	}

	@media (max-width: 760px) {
		.admin-event-detail__field-row {
			grid-template-columns: 1fr;
		}
	}
</style>
