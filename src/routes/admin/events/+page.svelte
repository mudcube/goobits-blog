<script lang="ts">
	import { goto } from '$app/navigation'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import AdminPageHero from '@components/Admin/AdminPageHero.svelte'
	import { getAdminActivityColor, getAdminActivityEmoji } from '$lib/admin/activity-display'
	import { formatAdminDayLabel, formatAdminTimeLabel } from '$lib/admin/date-format'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)

	$effect(() => {
		if (!authed) return
		dashboard.loadPrograms()
		dashboard.loadEvents()
	})

	function emojiForActivity(label: string, slug?: string) {
		return getAdminActivityEmoji(label, slug)
	}

	function colorForActivity(label: string, slug?: string) {
		return getAdminActivityColor(label, slug)
	}

	function dayLabel(iso: string) {
		return formatAdminDayLabel(iso)
	}

	function timeLabel(iso: string) {
		return formatAdminTimeLabel(iso)
	}
</script>

{#if authed}
	<div class="social-events admin-content">
		<AdminPageHero
			eyebrow="Admin"
			title="Events"
			subtitle="Manage program pages and upcoming sessions."
		/>

		<h4>ACTIVITY PAGES</h4>
		<div class="social-events__program-grid">
			{#each dashboard.programs as program}
				<button
					type="button"
					class="social-events__program-card admin-ui-card"
					style={`--activity-color: ${colorForActivity(program.label, program.slug)}`}
					onclick={() => goto(`/admin/events/${program.slug}/`)}
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
					<button type="button" class="social-events__event admin-ui-card" onclick={() => goto(`/admin/events/${ev.id}`)}>
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
				<div class="social-events__past-row social-events__past-row--empty admin-ui-card">
					<div class="social-events__meta">Past adventures will show up here soon.</div>
				</div>
			{:else}
				{#each dashboard.recentEvents.slice(0, 8) as recent}
					<div class="social-events__past-row admin-ui-card">
						<div>
							<div class="social-events__past-title">{recent.title}</div>
							<div class="social-events__event-sub">{dayLabel(recent.startsAt)} · {recent.seatsTaken}/{recent.capacity} attended</div>
						</div>
						<button type="button" class="admin-ui-btn" onclick={() => goto(`/admin/events/${recent.id}`)}>View</button>
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

	.social-events__program-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.65rem;
		margin-bottom: 0.75rem;
	}

	.social-events__program-card {
		padding: 0.95rem 0.7rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		cursor: pointer;
		transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
		text-align: center;
	}

	.social-events__program-card:hover {
		border-color: color-mix(in srgb, var(--activity-color) 42%, transparent);
		box-shadow: 0 4px 14px color-mix(in srgb, var(--activity-color) 22%, transparent);
		transform: translateY(-2px);
	}
	.social-events__program-card:focus-visible {
		border-color: var(--admin-selected-border);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-focus-ring) 45%, transparent);
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
		padding: 0.85rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		text-align: left;
		transition: border-color 120ms ease, box-shadow 120ms ease;
	}

	.social-events__event:hover {
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
		box-shadow: 0 4px 14px var(--shadow-soft);
	}
	.social-events__event:focus-visible {
		border-color: var(--admin-selected-border);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-focus-ring) 45%, transparent);
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
		padding: 0.85rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
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
		border-color: var(--admin-control-border);
		color: color-mix(in srgb, var(--admin-control-fg) 82%, transparent);
		font-size: 0.72rem;
		min-height: 30px;
		padding: 0 0.8rem;
		transition: background 120ms ease, color 120ms ease;
	}
	.social-events__past-row button:hover {
		background: var(--admin-control-bg-hover);
		color: var(--admin-control-fg);
	}

	.social-events__meta {
		margin: 0;
		font-size: 0.84rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}
</style>
