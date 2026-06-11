<script lang="ts">
	import { CalendarPlus, ExternalLink, MapPin, Settings, UsersRound } from '@lucide/svelte'

	let { data } = $props()

	function dateLabel(value: string) {
		return new Date(value).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		})
	}

	function timeLabel(value: string) {
		return new Date(value).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit'
		})
	}

	function statusLabel(status: string) {
		if (status === 'scheduled') return 'Scheduled'
		if (status === 'cancelled') return 'Cancelled'
		return status || 'Draft'
	}
</script>

<svelte:head>
	<title>Organizer dashboard | pdx.fun</title>
</svelte:head>

<div class="organizer-page">
	<section class="organizer-page__header">
		<div>
			<p class="organizer-page__eyebrow">Organizer</p>
			<h1>{data.tenant.name}</h1>
			<p class="organizer-page__summary">/{data.tenant.slug}</p>
		</div>
		<div class="organizer-page__actions" aria-label="Organizer actions">
			<a class="organizer-page__button organizer-page__button--primary" href="/events/new">
				<CalendarPlus size={18} strokeWidth={1.8} />
				Create event
			</a>
			<a class="organizer-page__button" href={`/t/${data.tenant.slug}`}>
				<ExternalLink size={18} strokeWidth={1.8} />
				Public page
			</a>
			<a class="organizer-page__icon-button" href="/organizer/settings" aria-label="Organizer settings">
				<Settings size={18} strokeWidth={1.8} />
			</a>
			{#if data.isAdmin}
				<a class="organizer-page__button" href="/admin/events">Admin events</a>
			{/if}
		</div>
	</section>

	<section class="organizer-page__stats" aria-label="Organizer stats">
		<div class="organizer-page__stat">
			<strong>{data.stats.upcomingEvents}</strong>
			<span>Upcoming</span>
		</div>
		<div class="organizer-page__stat">
			<strong>{data.stats.totalEvents}</strong>
			<span>Total</span>
		</div>
		<div class="organizer-page__stat">
			<strong>{data.stats.seatsTaken}</strong>
			<span>Joined seats</span>
		</div>
		<div class="organizer-page__stat">
			<strong>{data.stats.waitlistCount}</strong>
			<span>Waitlist</span>
		</div>
	</section>

	<section class="organizer-page__events" aria-labelledby="organizer-events-heading">
		<div class="organizer-page__section-head">
			<p class="organizer-page__eyebrow">Events</p>
			<h2 id="organizer-events-heading">Your calendar</h2>
		</div>

		{#if data.events.length}
			<div class="organizer-page__event-list">
				{#each data.events as event}
					<article class="organizer-page__event">
						<div class="organizer-page__date">
							<strong>{dateLabel(event.startsAt)}</strong>
							<span>{timeLabel(event.startsAt)}</span>
						</div>
						<div class="organizer-page__event-main">
							<div class="organizer-page__event-title">
								<div>
									<p class="organizer-page__event-kicker">{event.activityLabel}</p>
									<h3>{event.title}</h3>
								</div>
								<span class="organizer-page__status">{statusLabel(event.status)}</span>
							</div>
							<div class="organizer-page__meta">
								<span><UsersRound size={15} strokeWidth={1.8} /> {event.seatsTaken}/{event.capacity}</span>
								{#if event.location}
									<span><MapPin size={15} strokeWidth={1.8} /> {event.location}</span>
								{/if}
							</div>
							<div class="organizer-page__event-actions">
								<a href={`/t/${data.tenant.slug}`}>Public page</a>
								{#if data.isAdmin}
									<a href={`/admin/events/detail/${event.id}`}>Admin detail</a>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="organizer-page__empty">
				<h3>No events yet</h3>
				<p>Create the first event for {data.tenant.name}.</p>
				<a class="organizer-page__button organizer-page__button--primary" href="/events/new">
					<CalendarPlus size={18} strokeWidth={1.8} />
					Create event
				</a>
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	.organizer-page {
		width: min(68rem, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(2rem, 5vw, 4rem) 0;
	}

	.organizer-page__header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;

		h1 {
			margin: 0;
			color: var(--calendar-shell-text);
			font-size: clamp(2.4rem, 6vw, 4.6rem);
			line-height: 0.95;
			letter-spacing: 0;
		}
	}

	.organizer-page__eyebrow {
		margin: 0 0 0.45rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 58%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.organizer-page__summary {
		margin: 0.65rem 0 0;
		color: color-mix(in srgb, var(--calendar-shell-text) 66%, transparent);
		font-weight: 700;
	}

	.organizer-page__actions,
	.organizer-page__event-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem;
	}

	.organizer-page__button,
	.organizer-page__icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		border-radius: 0.5rem;
		font-weight: 800;
		text-decoration: none;
	}

	.organizer-page__button {
		gap: 0.5rem;
		padding: 0 1rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
		color: var(--calendar-shell-text);
	}

	.organizer-page__button--primary {
		border-color: color-mix(in srgb, #76e4b8 55%, transparent);
		background: #76e4b8;
		color: #08130f;
	}

	.organizer-page__icon-button {
		width: 2.75rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
		color: color-mix(in srgb, var(--calendar-shell-text) 76%, transparent);
	}

	.organizer-page__stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
		margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
	}

	.organizer-page__stat {
		min-height: 5.5rem;
		padding: 0.9rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);

		strong,
		span {
			display: block;
		}

		strong {
			color: var(--calendar-shell-text);
			font-size: 1.8rem;
			line-height: 1;
		}

		span {
			margin-top: 0.45rem;
			color: color-mix(in srgb, var(--calendar-shell-text) 62%, transparent);
			font-size: 0.88rem;
			font-weight: 700;
		}
	}

	.organizer-page__section-head {
		margin-bottom: 1rem;

		h2 {
			margin: 0;
			color: var(--calendar-shell-text);
			font-size: clamp(1.6rem, 4vw, 2.4rem);
			line-height: 1;
			letter-spacing: 0;
		}
	}

	.organizer-page__event-list {
		display: grid;
		gap: 0.75rem;
	}

	.organizer-page__event {
		display: grid;
		grid-template-columns: 8.5rem minmax(0, 1fr);
		gap: 1rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
	}

	.organizer-page__date {
		display: grid;
		align-content: center;
		gap: 0.2rem;
		min-height: 5rem;
		padding: 0.75rem;
		border-radius: 0.45rem;
		background: color-mix(in srgb, #76e4b8 12%, transparent);

		strong,
		span {
			display: block;
		}

		strong {
			color: #d8ffeb;
		}

		span {
			color: color-mix(in srgb, var(--calendar-shell-text) 62%, transparent);
			font-size: 0.9rem;
		}
	}

	.organizer-page__event-main {
		min-width: 0;
	}

	.organizer-page__event-title {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 0.85rem;

		h3 {
			margin: 0.15rem 0 0;
			color: var(--calendar-shell-text);
			font-size: 1.25rem;
			line-height: 1.15;
		}
	}

	.organizer-page__event-kicker {
		margin: 0;
		color: color-mix(in srgb, var(--calendar-shell-text) 55%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.organizer-page__status {
		flex: 0 0 auto;
		padding: 0.35rem 0.55rem;
		border-radius: 0.45rem;
		background: color-mix(in srgb, var(--calendar-shell-text) 8%, transparent);
		color: color-mix(in srgb, var(--calendar-shell-text) 68%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
	}

	.organizer-page__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.7rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 68%, transparent);
		font-size: 0.9rem;

		span {
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
		}
	}

	.organizer-page__event-actions {
		margin-top: 0.8rem;

		a {
			color: #76e4b8;
			font-size: 0.9rem;
			font-weight: 800;
		}
	}

	.organizer-page__empty {
		display: grid;
		justify-items: center;
		gap: 0.65rem;
		padding: 2.5rem 1rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
		text-align: center;

		h3,
		p {
			margin: 0;
		}

		h3 {
			color: var(--calendar-shell-text);
		}

		p {
			color: color-mix(in srgb, var(--calendar-shell-text) 66%, transparent);
		}
	}

	@media (max-width: 48em) {
		.organizer-page__header {
			align-items: stretch;
			flex-direction: column;
		}

		.organizer-page__stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 40em) {
		.organizer-page {
			width: min(100% - 1rem, 68rem);
		}

		.organizer-page__event {
			grid-template-columns: 1fr;
		}

		.organizer-page__event-title {
			flex-direction: column;
		}

		.organizer-page__button {
			flex: 1 1 12rem;
		}
	}
</style>
