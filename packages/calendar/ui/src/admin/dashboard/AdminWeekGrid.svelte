<script>
	const { dashboard } = $props()
</script>

<div class="admin-page__section">
	<div class="admin-page__section-head">
		<h3 class="admin-page__section-title">This week</h3>
		<span class="admin-page__section-count">{dashboard.bookings.length} events</span>
	</div>
	{#if dashboard.loading}
		<p class="admin-page__section-description">Loading week view...</p>
	{:else if dashboard.bookings.length === 0}
		<p class="admin-page__section-description">No events scheduled this week.</p>
	{:else}
		<div class="admin-page__bookings-list">
			{#each dashboard.bookings as b, i}
				<div class="admin-page__booking-row">
					<span class="admin-page__booking-date">{b.date}</span>
					<span class="admin-page__booking-meta">{b.title} · {b.time}</span>
					<span class="admin-page__status-badge" class:admin-page__status-badge--confirmed={b.status === 'open'} class:admin-page__status-badge--pending={b.status !== 'open'}>
						{b.seats}/{b.capacity}
					</span>
				</div>
				{#if i < dashboard.bookings.length - 1}<div class="admin-page__booking-divider"></div>{/if}
			{/each}
		</div>
	{/if}
</div>
