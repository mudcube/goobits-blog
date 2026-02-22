<script lang="ts">
	import { getAdminActivityEmoji } from '$lib/admin/activity-display'

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

	const { events, onOpenEvent } = $props<{
		events: DashboardEvent[]
		onOpenEvent: (eventId: number) => void
	}>()

	const todayDateLabel = $derived(
		new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
	)

	const todayEvents = $derived.by(() => {
		const today = isoDay(new Date())
		return [...events]
			.filter((event) => isoDay(new Date(event.startsAt)) === today)
			.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
	})

	const nowDividerIndex = $derived.by(() => {
		const now = Date.now()
		for (let i = 0; i < todayEvents.length; i += 1) {
			const eventStart = new Date(todayEvents[i]?.startsAt ?? '').getTime()
			if (eventStart > now) return i
		}
		return todayEvents.length
	})

	function isoDay(date: Date) {
		const y = date.getFullYear()
		const m = `${date.getMonth() + 1}`.padStart(2, '0')
		const d = `${date.getDate()}`.padStart(2, '0')
		return `${y}-${m}-${d}`
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

	function initials(event: DashboardEvent, index: number) {
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

<div class="admin-dashboard-today">
	<div class="admin-dashboard-today__head">
		<span class="admin-dashboard-today__label">Today</span>
		<span class="admin-dashboard-today__date">{todayDateLabel}</span>
	</div>

	<div class="admin-dashboard-today__stack">
		{#if todayEvents.length === 0}
			<div class="admin-dashboard-today__empty admin-ui-card">No sessions scheduled for today.</div>
		{:else}
			{#each todayEvents as event, index}
				{#if nowDividerIndex === index}
					<div class="admin-dashboard-today__now">
						<div class="admin-dashboard-today__now-dot"></div>
						<div class="admin-dashboard-today__now-line"></div>
						<span class="admin-dashboard-today__now-time">{timeLabel(new Date().toISOString())}</span>
					</div>
				{/if}
				<button
					type="button"
					class="admin-dashboard-today__event admin-ui-card"
					class:admin-dashboard-today__event--past={isPast(event.startsAt)}
					onclick={() => onOpenEvent(event.id)}
				>
					<div class="admin-dashboard-today__event-icon">{getAdminActivityEmoji(event.activityLabel, event.activitySlug || undefined)}</div>
					<div class="admin-dashboard-today__event-body">
						<div class="admin-dashboard-today__event-top">
							<div class="admin-dashboard-today__event-name">{event.title}</div>
							<div class="admin-dashboard-today__event-time">{timeLabel(event.startsAt)}</div>
						</div>
						<div class="admin-dashboard-today__event-desc">
							{#if isPast(event.startsAt)}
								{event.activityLabel} · finished
							{:else}
								{event.activityLabel} · {Math.max(event.capacity - event.seatsTaken, 0)} spots left
							{/if}
						</div>
						<div class="admin-dashboard-today__people">
							<span class="admin-dashboard-today__avatar admin-dashboard-today__avatar--you">You</span>
							{#each Array.from({ length: Math.min(event.seatsTaken || 0, 5) }, (_value, idx) => idx) as i (i)}
								<span class="admin-dashboard-today__avatar">{initials(event, i)}</span>
							{/each}
							<span class="admin-dashboard-today__people-text">
								{event.seatsTaken}
								{#if isPast(event.startsAt)}went{:else}going{/if}
							</span>
						</div>
					</div>
				</button>
				{#if index === todayEvents.length - 1 && nowDividerIndex === todayEvents.length}
					<div class="admin-dashboard-today__now">
						<div class="admin-dashboard-today__now-dot"></div>
						<div class="admin-dashboard-today__now-line"></div>
						<span class="admin-dashboard-today__now-time">{timeLabel(new Date().toISOString())}</span>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style>
	.admin-dashboard-today {
		display: grid;
		gap: 0.62rem;
	}

	.admin-dashboard-today__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
	}

	.admin-dashboard-today__label {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--admin-accent) 80%, var(--text) 20%);
	}

	.admin-dashboard-today__date {
		font-size: 0.72rem;
		font-weight: 500;
		color: color-mix(in srgb, var(--text) 45%, transparent);
	}

	.admin-dashboard-today__stack {
		display: grid;
		gap: 0.62rem;
	}

	.admin-dashboard-today__event {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		text-align: left;
		cursor: pointer;
		transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
	}

	.admin-dashboard-today__event:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px color-mix(in srgb, var(--admin-accent) 14%, transparent);
	}

	.admin-dashboard-today__event--past {
		opacity: 0.45;
	}

	.admin-dashboard-today__event-icon {
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

	.admin-dashboard-today__event-body {
		flex: 1;
		min-width: 0;
	}

	.admin-dashboard-today__event-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.admin-dashboard-today__event-name {
		font-size: 0.94rem;
		font-weight: 650;
		letter-spacing: -0.01em;
	}

	.admin-dashboard-today__event-time {
		font-size: 0.75rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		white-space: nowrap;
	}

	.admin-dashboard-today__event-desc {
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		margin-top: 0.1rem;
	}

	.admin-dashboard-today__people {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.55rem;
	}

	.admin-dashboard-today__avatar {
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

	.admin-dashboard-today__avatar--you {
		background: color-mix(in srgb, var(--admin-accent) 20%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
	}

	.admin-dashboard-today__people-text {
		margin-left: 0.2rem;
		font-size: 0.69rem;
		font-weight: 500;
		color: color-mix(in srgb, var(--text) 45%, transparent);
	}

	.admin-dashboard-today__now {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.15rem 0;
	}

	.admin-dashboard-today__now-dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--admin-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}

	.admin-dashboard-today__now-line {
		flex: 1;
		height: 1.5px;
		border-radius: 1px;
		background: linear-gradient(90deg, var(--admin-accent), color-mix(in srgb, var(--admin-accent) 8%, transparent) 85%);
	}

	.admin-dashboard-today__now-time {
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--admin-accent);
	}

	.admin-dashboard-today__empty {
		padding: 0.8rem 1rem;
		font-size: 0.8rem;
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}
</style>
