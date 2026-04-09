<script lang="ts">
	import { EventSessionCard } from '@calendar/ui/shared'

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

</script>

<div class="admin-dashboard-today">
	<div class="admin-dashboard-today__head">
		<span class="admin-dashboard-today__label">Today</span>
		<span class="admin-dashboard-today__date">{todayDateLabel}</span>
	</div>

	<div class="admin-dashboard-today__stack">
		{#if todayEvents.length === 0}
			<div class="admin-dashboard-today__empty calendar-ui-card">No sessions scheduled for today.</div>
		{:else}
			{#each todayEvents as event, index}
				{#if nowDividerIndex === index}
					<div class="admin-dashboard-today__now">
						<div class="admin-dashboard-today__now-dot"></div>
						<div class="admin-dashboard-today__now-line"></div>
						<span class="admin-dashboard-today__now-time">{timeLabel(new Date().toISOString())}</span>
					</div>
				{/if}
				<EventSessionCard {event} {onOpenEvent} />
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
