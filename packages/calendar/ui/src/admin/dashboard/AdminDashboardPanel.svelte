<script>
	import AdminWeekGrid from './AdminWeekGrid.svelte'
	import AdminNeedsAttention from './AdminNeedsAttention.svelte'
	import AdminMemoriesRail from './AdminMemoriesRail.svelte'
	const { dashboard } = $props()
</script>

<h1 class="admin-page__title">Dashboard</h1>
<p class="admin-page__subtitle">Calendar-first admin view for this week.</p>

{#if dashboard.error}
	<div class="admin-page__section admin-page__section--error">
		<p class="admin-page__calendar-error">{dashboard.error}</p>
	</div>
{/if}

<div class="admin-page__stats">
	<div class="admin-page__stat-card">
		<div class="admin-page__stat-value">{dashboard.stats.upcoming}</div>
		<div class="admin-page__stat-label">Upcoming events</div>
	</div>
	<div class="admin-page__stat-card">
		<div class="admin-page__stat-value">{dashboard.stats.seats}</div>
		<div class="admin-page__stat-label">Seats reserved</div>
	</div>
	<div class="admin-page__stat-card">
		<div class="admin-page__stat-value" class:admin-page__stat-value--synced={dashboard.connected && !dashboard.connectionExpired} class:admin-page__stat-value--danger={dashboard.connected && dashboard.connectionExpired} class:admin-page__stat-value--muted={!dashboard.connected}>
			{#if dashboard.connected && !dashboard.connectionExpired}Synced{:else if dashboard.connected && dashboard.connectionExpired}Expired{:else}Offline{/if}
		</div>
		<div class="admin-page__stat-label">Google Calendar</div>
	</div>
</div>

<AdminWeekGrid {dashboard} />
<div class="admin-page__divider" aria-hidden="true"></div>
<AdminNeedsAttention {dashboard} />
<div class="admin-page__divider" aria-hidden="true"></div>
<AdminMemoriesRail {dashboard} />
