<script lang="ts">
	import { CalendarDays, MapPin, PlusCircle, UsersRound } from '@lucide/svelte'

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
</script>

<svelte:head>
	<title>{data.tenant.name} | pdx.fun</title>
	<meta name="description" content={`Upcoming events from ${data.tenant.name} on pdx.fun.`} />
</svelte:head>

<div class="tenant-page">
	<section class="tenant-page__hero">
		<p class="tenant-page__eyebrow">Organizer</p>
		<h1>{data.tenant.name}</h1>
		<p>Upcoming public events from this pdx.fun organizer.</p>
		<a class="tenant-page__button" href="/events/new">
			<PlusCircle size={18} strokeWidth={1.8} />
			Create your own event
		</a>
	</section>

	<section class="tenant-page__events" aria-labelledby="tenant-events-heading">
		<div class="tenant-page__section-head">
			<p class="tenant-page__eyebrow">Calendar</p>
			<h2 id="tenant-events-heading">Upcoming events</h2>
		</div>

		{#if data.events.length}
			<div class="tenant-page__event-list">
				{#each data.events as event}
					<article class="tenant-page__event">
						<div class="tenant-page__date">
							<strong>{dateLabel(event.startsAt)}</strong>
							<span>{timeLabel(event.startsAt)}</span>
						</div>
						<div class="tenant-page__event-main">
							<p class="tenant-page__event-kicker">{event.activityLabel}</p>
							<h3>
								<a href={`/t/${data.tenant.slug}/events/${event.id}`}>{event.title}</a>
							</h3>
							<div class="tenant-page__meta">
								<span><UsersRound size={15} strokeWidth={1.8} /> {event.seatsTaken}/{event.capacity}</span>
								{#if event.location}
									<span><MapPin size={15} strokeWidth={1.8} /> {event.location}</span>
								{/if}
							</div>
							{#if event.note}
								<p class="tenant-page__note">{event.note}</p>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="tenant-page__empty">
				<CalendarDays size={30} strokeWidth={1.6} />
				<p>No upcoming public events yet.</p>
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	.tenant-page {
		width: min(64rem, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(2rem, 5vw, 4rem) 0;
	}

	.tenant-page__hero {
		display: grid;
		gap: 0.9rem;
		margin-bottom: clamp(2rem, 5vw, 3.5rem);

		h1 {
			margin: 0;
			color: var(--calendar-shell-text);
			font-size: clamp(3rem, 8vw, 6rem);
			line-height: 0.9;
			letter-spacing: 0;
		}

		p:not(.tenant-page__eyebrow) {
			max-width: 36rem;
			margin: 0;
			color: color-mix(in srgb, var(--calendar-shell-text) 68%, transparent);
			font-size: 1.08rem;
			line-height: 1.45;
		}
	}

	.tenant-page__eyebrow {
		margin: 0;
		color: color-mix(in srgb, var(--calendar-shell-text) 58%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.tenant-page__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: fit-content;
		min-height: 2.8rem;
		margin-top: 0.35rem;
		padding: 0 1rem;
		border-radius: 0.5rem;
		background: #76e4b8;
		color: #08130f;
		font-weight: 800;
		text-decoration: none;
	}

	.tenant-page__section-head {
		margin-bottom: 1rem;

		h2 {
			margin: 0.4rem 0 0;
			color: var(--calendar-shell-text);
			font-size: clamp(1.7rem, 4vw, 2.6rem);
			line-height: 1;
			letter-spacing: 0;
		}
	}

	.tenant-page__event-list {
		display: grid;
		gap: 0.75rem;
	}

	.tenant-page__event {
		display: grid;
		grid-template-columns: 8.5rem minmax(0, 1fr);
		gap: 1rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
	}

	.tenant-page__date {
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

	.tenant-page__event-main {
		min-width: 0;

		h3 {
			margin: 0.15rem 0 0;
			color: var(--calendar-shell-text);
			font-size: 1.25rem;
			line-height: 1.15;

			a {
				color: inherit;
				text-decoration-thickness: 0.08em;
				text-underline-offset: 0.18em;
			}
		}
	}

	.tenant-page__event-kicker {
		margin: 0;
		color: color-mix(in srgb, var(--calendar-shell-text) 55%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.tenant-page__meta {
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

	.tenant-page__note {
		margin: 0.75rem 0 0;
		color: color-mix(in srgb, var(--calendar-shell-text) 66%, transparent);
		line-height: 1.45;
	}

	.tenant-page__empty {
		display: grid;
		justify-items: center;
		gap: 0.65rem;
		padding: 2.5rem 1rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
		color: color-mix(in srgb, var(--calendar-shell-text) 66%, transparent);
		text-align: center;

		p {
			margin: 0;
		}
	}

	@media (max-width: 40em) {
		.tenant-page {
			width: min(100% - 1rem, 64rem);
		}

		.tenant-page__event {
			grid-template-columns: 1fr;
		}

		.tenant-page__button {
			width: 100%;
		}
	}
</style>
