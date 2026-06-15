<script>
	import PillButton from '../../primitives/CalendarPillButton.svelte'
	const { dashboard, detail } = $props()

	function formatDateTime(iso) {
		return new Date(iso).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		})
	}
</script>

<div class="admin-page__section">
	<div class="admin-page__section-head">
		<h3 class="admin-page__section-title">{detail.event.title}</h3>
		<PillButton className="admin-page__button-secondary admin-page__button-secondary--compact" variant="secondary" size="sm" onClick={dashboard.closeEventDetail}>
			Close
		</PillButton>
	</div>
	<p class="admin-page__section-description">{formatDateTime(detail.event.startsAt)} – {formatDateTime(detail.event.endsAt)}</p>
	{#if detail.weather}
		<p class="admin-page__section-description">Forecast: {detail.weather.summary}, {detail.weather.temperatureF}°F</p>
	{/if}
	<div class="admin-page__members-list">
		{#each detail.attendees as attendee, i}
			<div class="admin-page__members-row">
				<div class="admin-page__members-main">
					<div class="admin-page__members-code-row">
						<strong>{attendee.name || attendee.email || attendee.userId}</strong>
						<span class="admin-page__members-meta"> · {attendee.status}</span>
					</div>
					{#if attendee.waitlistPosition}
						<div class="admin-page__members-meta">Waitlist #{attendee.waitlistPosition}</div>
					{/if}
				</div>
				{#if attendee.status === 'waitlist'}
					<div class="admin-page__members-actions">
						<PillButton className="admin-page__button-secondary admin-page__button-secondary--compact" variant="secondary" size="sm" onClick={() => dashboard.promoteWaitlist(detail.event.id, attendee.entryId)}>
							Promote
						</PillButton>
					</div>
				{/if}
			</div>
			{#if i < detail.attendees.length - 1}<div class="admin-page__booking-divider"></div>{/if}
		{/each}
	</div>
</div>
