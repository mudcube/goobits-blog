<script lang="ts">
	import { goto } from '$app/navigation'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)

	const activityEmojis: Record<string, string> = {
		gym: '💪',
		circus: '🎪',
		movie: '🎬',
		movies: '🎬',
		hike: '🏔️',
		adventure: '🏔️',
		social: '🍺'
	}

	const activityColors: Record<string, string> = {
		gym: '#6366f1',
		circus: '#ec4899',
		movie: '#f59e0b',
		movies: '#f59e0b',
		hike: '#10b981',
		adventure: '#10b981',
		social: '#8b5cf6'
	}

	$effect(() => {
		if (!authed) return
		dashboard.loadPrograms()
		dashboard.loadEvents()
	})

	function emojiForActivity(label: string, slug?: string) {
		const key = (slug || label || '').toLowerCase().trim()
		return activityEmojis[key] || '✨'
	}

	function colorForActivity(label: string, slug?: string) {
		const key = (slug || label || '').toLowerCase().trim()
		return activityColors[key] || '#64748b'
	}

	function dayLabel(iso: string) {
		const date = new Date(iso)
		return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }).toUpperCase()
	}

	function timeLabel(iso: string) {
		return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()
	}
</script>

{#if authed}
	<div class="social-events">
		<div class="social-events__head">
			<h2>Events</h2>
			<button type="button" class="social-events__new" onclick={() => goto('/admin/events/new/')}>+ New Event</button>
		</div>

		<h4>ACTIVITY PAGES</h4>
		<div class="social-events__program-grid">
			{#each dashboard.programs as program}
				<button
					type="button"
					class="social-events__program-card"
					style={`--activity-color: ${colorForActivity(program.label, program.slug)}`}
					onclick={() => goto(`/admin/events/program/${program.slug}/`)}
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
		{#if dashboard.eventsLoading}
			<p class="social-events__meta">Loading events...</p>
		{:else if dashboard.events.length === 0}
			<p class="social-events__meta">No upcoming events.</p>
		{:else}
			<div class="social-events__list">
				{#each dashboard.events as ev}
					<button type="button" class="social-events__event" onclick={() => goto(`/admin/events/${ev.id}`)}>
						<div class="social-events__event-main">
							<span class="social-events__event-emoji">{emojiForActivity(ev.activityLabel, ev.activitySlug)}</span>
							<div>
								<div class="social-events__event-title">{ev.title}</div>
								<div class="social-events__event-sub">{dayLabel(ev.startsAt)} · {timeLabel(ev.startsAt)}</div>
							</div>
						</div>
						<div class="social-events__event-tail">
							<span class:social-events__event-cap--full={ev.seatsTaken >= ev.capacity || ev.waitlistCount > 0} class="social-events__event-cap">
								{ev.seatsTaken}/{ev.capacity}
							</span>
							<span class="social-events__event-arrow">›</span>
						</div>
					</button>
				{/each}
			</div>
		{/if}

		<h4>PAST</h4>
		<div class="social-events__list social-events__list--past">
			{#if dashboard.recentEvents.length === 0}
				<div class="social-events__past-row social-events__past-row--empty">
					<div class="social-events__meta">Past adventures will show up here soon.</div>
				</div>
			{:else}
				{#each dashboard.recentEvents.slice(0, 8) as recent}
					<div class="social-events__past-row">
						<div>
							<div class="social-events__past-title">{recent.title}</div>
							<div class="social-events__event-sub">{dayLabel(recent.startsAt)} · {recent.seatsTaken}/{recent.capacity} attended</div>
						</div>
						<button type="button" onclick={() => goto(`/admin/events/${recent.id}`)}>View</button>
					</div>
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

	.social-events__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		margin-bottom: 0.25rem;
	}

	.social-events h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text);
	}

	.social-events h4 {
		margin: 0 0 0.35rem;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		font-weight: 700;
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}

	.social-events__new,
	.social-events__past-row button {
		min-height: 36px;
		padding: 0 1rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
		background: color-mix(in srgb, var(--text) 78%, var(--bg) 22%);
		color: var(--bg);
		font-weight: 700;
		cursor: pointer;
		transition: transform 120ms ease, box-shadow 120ms ease;
	}

	.social-events__new:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 14px color-mix(in srgb, var(--text) 20%, transparent);
	}

	.social-events__program-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.65rem;
		margin-bottom: 0.75rem;
	}

	.social-events__program-card {
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		border-radius: 14px;
		padding: 0.95rem 0.7rem;
		background: color-mix(in srgb, var(--bg) 95%, var(--text) 5%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		cursor: pointer;
		box-shadow: 0 1px 2px var(--shadow-softest);
		transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
		text-align: center;
	}

	.social-events__program-card:hover {
		border-color: color-mix(in srgb, var(--activity-color) 42%, transparent);
		box-shadow: 0 4px 14px color-mix(in srgb, var(--activity-color) 22%, transparent);
		transform: translateY(-2px);
	}

	.social-events__program-icon {
		width: 44px;
		height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		background: color-mix(in srgb, var(--activity-color) 10%, var(--bg) 90%);
		border: 1px solid color-mix(in srgb, var(--activity-color) 22%, transparent);
		font-size: 1.3rem;
	}

	.social-events__program-label {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text);
	}

	.social-events__program-status {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.7rem;
		color: color-mix(in srgb, var(--text) 56%, transparent);
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

	.social-events__list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.social-events__event {
		background: color-mix(in srgb, var(--bg) 95%, var(--text) 5%);
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		border-radius: 14px;
		padding: 0.85rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		text-align: left;
		transition: border-color 120ms ease, box-shadow 120ms ease;
		box-shadow: 0 1px 2px var(--shadow-softest);
	}

	.social-events__event:hover {
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
		box-shadow: 0 4px 14px var(--shadow-soft);
	}

	.social-events__event-main {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.social-events__event-emoji {
		font-size: 1.25rem;
		width: 28px;
		text-align: center;
	}

	.social-events__event-title {
		font-size: 0.87rem;
		font-weight: 700;
		color: var(--text);
	}

	.social-events__event-sub {
		font-size: 0.74rem;
		color: color-mix(in srgb, var(--text) 64%, transparent);
		margin-top: 0.1rem;
	}

	.social-events__event-tail {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.social-events__event-cap {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--status-success-text);
	}

	.social-events__event-cap--full {
		color: var(--status-error-text);
	}

	.social-events__event-arrow {
		font-size: 1rem;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}

	.social-events__list--past .social-events__past-row {
		background: color-mix(in srgb, var(--bg) 95%, var(--text) 5%);
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		border-radius: 14px;
		padding: 0.85rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
		box-shadow: 0 1px 2px var(--shadow-softest);
	}

	.social-events__past-row--empty {
		justify-content: flex-start;
	}

	.social-events__past-title {
		font-size: 0.86rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 78%, transparent);
	}

	.social-events__past-row button {
		background: transparent;
		border-color: color-mix(in srgb, var(--text) 20%, transparent);
		color: color-mix(in srgb, var(--text) 80%, transparent);
		font-size: 0.72rem;
		min-height: 30px;
		padding: 0 0.8rem;
	}

	.social-events__meta {
		margin: 0;
		font-size: 0.84rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}
</style>
