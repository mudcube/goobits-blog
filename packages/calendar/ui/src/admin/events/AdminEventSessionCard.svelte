<script lang="ts">
	import { getAdminActivityEmoji } from '../shared/activity-display'

	type Participant = {
		name?: string | null
		displayName?: string | null
		userId?: string | null
	}

	type DashboardEvent = {
		id: number
		title: string
		activityLabel: string
		activitySlug?: string | null
		startsAt: string
		seatsTaken: number
		capacity: number
		participants?: Participant[]
	}

	const { event, onOpenEvent } = $props<{
		event: DashboardEvent
		onOpenEvent: (eventId: number) => void
	}>()

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

	function initials(index: number) {
		const raw = event.participants?.[index]?.displayName || event.participants?.[index]?.name
		if (!raw) return `#${index + 1}`
		const parts = raw
			.trim()
			.split(/\s+/)
			.filter(Boolean)
		const first = parts[0]?.charAt(0) ?? ''
		const second = parts[1]?.charAt(0) ?? ''
		return `${first}${second}`.toUpperCase() || raw.slice(0, 2).toUpperCase()
	}
</script>

<button
	type="button"
	class="admin-event-session-card admin-ui-card admin-ui-card--interactive"
	class:admin-event-session-card--past={isPast(event.startsAt)}
	data-testid="member-event-card"
	data-event-id={String(event.id)}
	onclick={() => onOpenEvent(event.id)}
>
	<div class="admin-event-session-card__icon">{getAdminActivityEmoji(event.activityLabel, event.activitySlug || undefined)}</div>
	<div class="admin-event-session-card__body">
		<div class="admin-event-session-card__top">
			<div class="admin-event-session-card__name">{event.title}</div>
			<div class="admin-event-session-card__time">{timeLabel(event.startsAt)}</div>
		</div>
		<div class="admin-event-session-card__desc">
			{#if isPast(event.startsAt)}
				{event.activityLabel} · finished
			{:else}
				{event.activityLabel} · {Math.max(event.capacity - event.seatsTaken, 0)} spots left
			{/if}
		</div>
		<div class="admin-event-session-card__people">
			<span class="admin-event-session-card__avatar admin-event-session-card__avatar--you">You</span>
			{#each Array.from({ length: Math.min(event.seatsTaken || 0, 5) }, (_value, idx) => idx) as i (i)}
				<span class="admin-event-session-card__avatar">{initials(i)}</span>
			{/each}
			<span class="admin-event-session-card__people-text" data-testid="member-event-attendance">
				{event.seatsTaken}
				{#if isPast(event.startsAt)}went{:else}going{/if}
			</span>
		</div>
	</div>
</button>

<style>
	.admin-event-session-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		text-align: left;
		width: 100%;
	}

	.admin-event-session-card--past {
		opacity: 0.45;
	}

	.admin-event-session-card__icon {
		width: 2.7rem;
		height: 2.7rem;
		border-radius: 0.75rem;
		display: grid;
		place-items: center;
		font-size: 1.35rem;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--admin-accent) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 20%, transparent);
	}

	.admin-event-session-card__body {
		flex: 1;
		min-width: 0;
	}

	.admin-event-session-card__top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.admin-event-session-card__name {
		font-size: 0.94rem;
		font-weight: 650;
		letter-spacing: -0.01em;
	}

	.admin-event-session-card__time {
		font-size: 0.75rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		white-space: nowrap;
	}

	.admin-event-session-card__desc {
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		margin-top: 0.1rem;
	}

	.admin-event-session-card__people {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.55rem;
	}

	.admin-event-session-card__avatar {
		width: 1.45rem;
		height: 1.45rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		font-size: 0.5rem;
		font-weight: 700;
		background: color-mix(in srgb, var(--text) 8%, transparent);
		color: color-mix(in srgb, var(--text) 65%, transparent);
	}

	.admin-event-session-card__avatar--you {
		background: color-mix(in srgb, var(--admin-accent) 20%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
	}

	.admin-event-session-card__people-text {
		margin-left: 0.2rem;
		font-size: 0.69rem;
		font-weight: 500;
		color: color-mix(in srgb, var(--text) 45%, transparent);
	}
</style>
