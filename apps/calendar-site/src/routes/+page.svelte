<script lang="ts">
	import { CalendarDays, MapPin, PlusCircle, Search, UsersRound } from '@lucide/svelte'
	import NoIndexHead from '$lib/seo/NoIndexHead.svelte'

	let { data } = $props()
	const featuredActivities = $derived(data.activities ?? [])
	const upcomingEvents = $derived(data.upcoming ?? [])
</script>

<NoIndexHead />

<svelte:head>
	<title>pdx.fun | Portland events by local organizers</title>
	<meta
		name="description"
		content="Find local Portland events, register, and create an organizer page for your own events."
	/>
</svelte:head>

<div class="pdx-home">
	<section class="pdx-home__hero">
		<div class="pdx-home__hero-copy">
			<p class="pdx-home__eyebrow">Portland, Oregon</p>
			<h1>pdx.fun</h1>
			<p class="pdx-home__lead">
				A shared calendar for local crews, classes, popups, adventures, jams, and weird little plans that
				need a place to live.
			</p>
			<div class="pdx-home__actions" aria-label="Primary actions">
				<a class="pdx-home__button pdx-home__button--primary" href="/register">
					<PlusCircle size={18} strokeWidth={1.8} />
					Start an organizer page
				</a>
				<a class="pdx-home__button" href="#events">
					<Search size={18} strokeWidth={1.8} />
					Browse events
				</a>
			</div>
		</div>

		<div class="pdx-home__quick-panel" aria-label="How pdx.fun works">
			<div class="pdx-home__quick-row">
				<span><UsersRound size={18} strokeWidth={1.8} /></span>
				<div>
					<strong>Register</strong>
					<p>Create your member account.</p>
				</div>
			</div>
			<div class="pdx-home__quick-row">
				<span><MapPin size={18} strokeWidth={1.8} /></span>
				<div>
					<strong>Create</strong>
					<p>Open an organizer page for your events.</p>
				</div>
			</div>
			<div class="pdx-home__quick-row">
				<span><CalendarDays size={18} strokeWidth={1.8} /></span>
				<div>
					<strong>Publish</strong>
					<p>Share event pages people can join.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="pdx-home__section" aria-labelledby="activity-heading">
		<div class="pdx-home__section-head">
			<p class="pdx-home__eyebrow">Explore</p>
			<h2 id="activity-heading">Find something happening</h2>
		</div>
		<div class="pdx-home__activity-grid">
			{#each featuredActivities as activity}
				<a class="pdx-home__activity" href={activity.href}>
					<span class="pdx-home__activity-icon" aria-hidden="true">{activity.icon}</span>
					<span>
						<strong>{activity.label}</strong>
						<small>{activity.description}</small>
					</span>
				</a>
			{/each}
		</div>
	</section>

	<section class="pdx-home__section" id="events" aria-labelledby="events-heading">
		<div class="pdx-home__section-head">
			<p class="pdx-home__eyebrow">Calendar</p>
			<h2 id="events-heading">Upcoming events</h2>
		</div>
		{#if upcomingEvents.length}
			<div class="pdx-home__event-list">
				{#each upcomingEvents.slice(0, 6) as event}
					<a class="pdx-home__event" href={event.activitySlug ? `/${event.activitySlug}` : '/'}>
						<span class="pdx-home__event-date">
							{new Date(event.startsAt).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric'
							})}
						</span>
						<span>
							<strong>{event.title}</strong>
							<small>{event.activityLabel ?? 'pdx.fun event'}</small>
						</span>
					</a>
				{/each}
			</div>
		{:else}
			<div class="pdx-home__empty">
				<CalendarDays size={28} strokeWidth={1.6} />
				<p>No public events are posted yet.</p>
				<a href="/register">Be the first organizer</a>
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	.pdx-home {
		--pdx-panel: color-mix(in srgb, var(--calendar-panel-bg) 82%, transparent);
		--pdx-line: color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		width: min(70rem, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(1.25rem, 4vw, 3rem) 0 4rem;
	}

	.pdx-home__hero {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.65fr);
		gap: clamp(1rem, 3vw, 2rem);
		align-items: stretch;
		min-height: min(38rem, calc(100vh - 5rem));
	}

	.pdx-home__hero-copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: clamp(2rem, 7vw, 5.5rem) 0;
	}

	.pdx-home__eyebrow {
		margin: 0 0 0.7rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 58%, transparent);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	h2 {
		margin: 0;
		letter-spacing: 0;
		color: var(--calendar-shell-text);
	}

	h1 {
		font-size: clamp(4rem, 11vw, 8rem);
		line-height: 0.86;
	}

	h2 {
		font-size: clamp(1.7rem, 3vw, 2.55rem);
		line-height: 1;
	}

	.pdx-home__lead {
		max-width: 41rem;
		margin: 1.4rem 0 0;
		color: color-mix(in srgb, var(--calendar-shell-text) 72%, transparent);
		font-size: clamp(1.05rem, 2vw, 1.35rem);
		line-height: 1.45;
	}

	.pdx-home__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.pdx-home__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 2.9rem;
		padding: 0.7rem 1rem;
		border: 1px solid var(--pdx-line);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-shell-text) 8%, transparent);
		color: var(--calendar-shell-text);
		font-weight: 700;
		text-decoration: none;
	}

	.pdx-home__button--primary {
		border-color: color-mix(in srgb, #76e4b8 55%, transparent);
		background: #76e4b8;
		color: #08130f;
	}

	.pdx-home__quick-panel {
		align-self: center;
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid var(--pdx-line);
		border-radius: 0.5rem;
		background: var(--pdx-panel);
	}

	.pdx-home__quick-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.75rem;
		align-items: start;
		padding: 0.75rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--calendar-shell-text) 5%, transparent);

		span:first-child {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 2rem;
			height: 2rem;
			border-radius: 50%;
			color: #76e4b8;
			background: color-mix(in srgb, #76e4b8 14%, transparent);
		}

		strong {
			display: block;
			color: var(--calendar-shell-text);
		}

		p {
			margin: 0.2rem 0 0;
			color: color-mix(in srgb, var(--calendar-shell-text) 62%, transparent);
			font-size: 0.9rem;
			line-height: 1.4;
		}
	}

	.pdx-home__section {
		margin-top: clamp(2rem, 6vw, 4rem);
	}

	.pdx-home__section-head {
		margin-bottom: 1rem;
	}

	.pdx-home__activity-grid,
	.pdx-home__event-list {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.pdx-home__activity,
	.pdx-home__event,
	.pdx-home__empty {
		border: 1px solid var(--pdx-line);
		border-radius: 0.5rem;
		background: var(--pdx-panel);
		color: inherit;
		text-decoration: none;
	}

	.pdx-home__activity,
	.pdx-home__event {
		display: grid;
		gap: 0.75rem;
		min-height: 8rem;
		padding: 1rem;
		transition:
			border-color 150ms ease,
			transform 150ms ease,
			background 150ms ease;

		&:hover {
			border-color: color-mix(in srgb, #76e4b8 36%, transparent);
			background: color-mix(in srgb, var(--calendar-panel-bg) 94%, transparent);
			transform: translateY(-1px);
		}

		strong,
		small {
			display: block;
		}

		strong {
			color: var(--calendar-shell-text);
			font-size: 1rem;
		}

		small {
			margin-top: 0.25rem;
			color: color-mix(in srgb, var(--calendar-shell-text) 58%, transparent);
			font-size: 0.86rem;
			line-height: 1.35;
		}
	}

	.pdx-home__activity-icon {
		font-size: 1.55rem;
		line-height: 1;
	}

	.pdx-home__event {
		grid-template-columns: auto minmax(0, 1fr);
		min-height: auto;
	}

	.pdx-home__event-date {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.3rem;
		height: 3.3rem;
		border-radius: 0.45rem;
		background: color-mix(in srgb, #76e4b8 14%, transparent);
		color: #bdf7dc;
		font-size: 0.82rem;
		font-weight: 800;
		text-align: center;
	}

	.pdx-home__empty {
		display: grid;
		justify-items: center;
		gap: 0.65rem;
		padding: 2rem;
		text-align: center;
		color: color-mix(in srgb, var(--calendar-shell-text) 70%, transparent);

		p {
			margin: 0;
		}

		a {
			color: #bdf7dc;
			font-weight: 700;
		}
	}

	@media (max-width: 64em) {
		.pdx-home__hero {
			grid-template-columns: 1fr;
			min-height: auto;
		}

		.pdx-home__quick-panel {
			align-self: stretch;
		}

		.pdx-home__activity-grid,
		.pdx-home__event-list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 40em) {
		.pdx-home {
			width: min(100% - 1rem, 70rem);
		}

		.pdx-home__hero-copy {
			padding-top: 1rem;
		}

		.pdx-home__actions,
		.pdx-home__button {
			width: 100%;
		}

		.pdx-home__activity-grid,
		.pdx-home__event-list {
			grid-template-columns: 1fr;
		}
	}
</style>
