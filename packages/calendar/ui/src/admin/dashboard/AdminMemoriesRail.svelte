<script>
	import PillButton from '../../primitives/PillButton.svelte'
	const { dashboard } = $props()

	function when(iso) {
		return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
	}
</script>

<div class="admin-page__section">
	<div class="admin-page__section-head">
		<h3 class="admin-page__section-title">Memories</h3>
		<span class="admin-page__section-count">{dashboard.recentEvents.length} recent</span>
	</div>
	{#if dashboard.recentEvents.length === 0}
		<p class="admin-page__section-description">No past events yet.</p>
	{:else}
		<div class="admin-page__members-list">
			{#each dashboard.recentEvents.slice(0, 5) as event, i}
				<div class="admin-page__members-row">
					<div class="admin-page__members-main">
						<div class="admin-page__members-code-row"><strong>{when(event.startsAt)}</strong><span class="admin-page__members-meta"> · {event.title}</span></div>
						<div class="admin-page__members-meta">{event.seatsTaken}/{event.capacity} went</div>
					</div>
					<div class="admin-page__members-actions">
						<PillButton className="admin-page__button-secondary admin-page__button-secondary--compact" variant="secondary" size="sm" onClick={() => dashboard.openEventDetail(event.id)}>Add recap</PillButton>
					</div>
				</div>
				{#if i < Math.min(dashboard.recentEvents.length, 5) - 1}<div class="admin-page__booking-divider"></div>{/if}
			{/each}
		</div>
	{/if}
</div>
