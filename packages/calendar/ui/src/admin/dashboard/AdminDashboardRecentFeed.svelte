<script lang="ts">
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

	const { recentEvents, mockMode = false } = $props<{
		recentEvents: DashboardEvent[]
		mockMode?: boolean
	}>()

	type FeedItem = {
		id: string
		name: string
		initials: string
		verb: string
		target: string
		when: string
		userId: string | null
	}

	function relativeWhen(iso: string) {
		const now = Date.now()
		const then = new Date(iso).getTime()
		if (!Number.isFinite(then)) return ''
		const diff = now - then
		const hour = 60 * 60 * 1000
		const day = 24 * hour
		if (diff < hour) return 'just now'
		if (diff < day) return `${Math.max(1, Math.floor(diff / hour))}h ago`
		if (diff < day * 2) return 'yesterday'
		return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
	}

	function initials(name: string) {
		const parts = name.trim().split(/\s+/).filter(Boolean)
		const a = parts[0]?.[0] ?? ''
		const b = parts[1]?.[0] ?? ''
		return `${a}${b}`.toUpperCase() || name.slice(0, 2).toUpperCase()
	}

	function firstName(name: string) {
		return name.trim().split(/\s+/).filter(Boolean)[0] || name
	}

	const feedItems = $derived.by<FeedItem[]>(() => {
		const items: FeedItem[] = []
		for (const event of recentEvents) {
			const participantName =
				event.participants?.[0]?.displayName ||
				event.participants?.[0]?.name ||
				''
			const participantUserId = event.participants?.[0]?.userId || null
			if (participantName) {
				items.push({
					id: `${event.id}-joined`,
					name: firstName(participantName),
					initials: initials(participantName),
					verb: 'joined',
					target: event.title,
					when: relativeWhen(event.startsAt),
					userId: participantUserId
				})
			} else {
				items.push({
					id: `${event.id}-attended`,
					name: event.activityLabel || 'Member',
					initials: initials(event.activityLabel || 'M'),
					verb: 'attended',
					target: event.title,
					when: relativeWhen(event.startsAt),
					userId: null
				})
			}
			if (items.length >= 6) break
		}
		return items
	})
</script>

<div class="admin-dashboard-recent">
	<div class="admin-dashboard-recent__label">Recent</div>
	<div class="admin-dashboard-recent__list">
		{#if feedItems.length === 0}
			<div class="admin-dashboard-recent__row admin-dashboard-recent__row--empty">
				<span>No recent activity yet.</span>
			</div>
		{:else}
			{#each feedItems as item (item.id)}
				<div class="admin-dashboard-recent__row">
					<div class="admin-dashboard-recent__avatar">{item.initials}</div>
					<div class="admin-dashboard-recent__text">
						{#if item.userId}
							<a class="admin-dashboard-recent__name-link" href={`/schedule/admin/crew/${item.userId}/${mockMode ? '?mock=1' : ''}`}>
								<strong>{item.name}</strong>
							</a>
						{:else}
							<strong>{item.name}</strong>
						{/if}
						<span> {item.verb} {item.target}</span>
					</div>
					<div class="admin-dashboard-recent__when">{item.when}</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.admin-dashboard-recent {
		display: grid;
		gap: 0.35rem;
		margin-top: 1rem;
	}

	.admin-dashboard-recent__label {
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 44%, transparent);
	}

	.admin-dashboard-recent__list {
		display: flex;
		flex-direction: column;
		border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.admin-dashboard-recent__row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.48rem 0;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.admin-dashboard-recent__row--empty {
		color: color-mix(in srgb, var(--text) 50%, transparent);
		font-size: 0.75rem;
	}

	.admin-dashboard-recent__avatar {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--text) 8%, transparent);
		color: color-mix(in srgb, var(--text) 64%, transparent);
		font-size: 0.47rem;
		font-weight: 700;
		line-height: 1;
		text-align: center;
		padding-top: 0.01rem;
	}

	.admin-dashboard-recent__text {
		flex: 1;
		min-width: 0;
		font-size: 0.72rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.admin-dashboard-recent__text strong {
		color: var(--text);
		font-weight: 640;
	}

	.admin-dashboard-recent__name-link {
		color: inherit;
		text-decoration: none;
	}

	.admin-dashboard-recent__name-link:hover strong {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.admin-dashboard-recent__when {
		font-size: 0.63rem;
		font-weight: 500;
		color: color-mix(in srgb, var(--text) 42%, transparent);
	}
</style>
