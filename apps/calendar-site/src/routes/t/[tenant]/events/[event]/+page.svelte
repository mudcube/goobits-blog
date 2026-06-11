<script lang="ts">
	import { CalendarCheck, Clock, MapPin, UserPlus, UsersRound } from '@lucide/svelte'

	let { data } = $props()

	let seatsTaken = $state(data.state?.seatsTaken ?? data.event.seatsTaken)
	let seatsLeft = $state(data.state?.seatsLeft ?? Math.max(0, data.event.capacity - data.event.seatsTaken))
	let waitlistCount = $state(data.state?.waitlistCount ?? data.event.waitlistCount)
	let userStatus = $state(data.state?.userStatus ?? null)
	let guestCount = $state(data.state?.userGuestCount ?? 0)
	let submitting = $state(false)
	let errorMessage = $state('')
	let successMessage = $state('')

	function dateLabel(value: string) {
		return new Date(value).toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		})
	}

	function timeRangeLabel(startsAt: string, endsAt: string) {
		const start = new Date(startsAt)
		const end = new Date(endsAt)
		const options = {
			hour: 'numeric',
			minute: '2-digit'
		} as const
		return `${start.toLocaleTimeString('en-US', options)} - ${end.toLocaleTimeString('en-US', options)}`
	}

	async function joinEvent() {
		errorMessage = ''
		successMessage = ''
		submitting = true
		try {
			const response = await fetch(`/api/calendar/events/${data.event.id}/join`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ guestCount })
			})
			const result = await response.json().catch(() => null)
			if (!response.ok || !result?.ok) {
				errorMessage = result?.error?.message || 'Could not join this event.'
				return
			}
			userStatus = result.status
			if (result.state) {
				seatsTaken = result.state.seatsTaken
				seatsLeft = result.state.seatsLeft
				waitlistCount = result.state.waitlistCount
				guestCount = result.state.userGuestCount
			}
			successMessage = result.status === 'waitlist' ? 'Added to the waitlist.' : 'You joined this event.'
		} finally {
			submitting = false
		}
	}
</script>

<svelte:head>
	<title>{data.event.title} | {data.tenant.name} | pdx.fun</title>
	<meta name="description" content={`${data.event.title} from ${data.tenant.name} on pdx.fun.`} />
</svelte:head>

<div class="event-detail">
	<nav class="event-detail__back" aria-label="Organizer navigation">
		<a href={`/t/${data.tenant.slug}`}>{data.tenant.name}</a>
	</nav>

	<section class="event-detail__hero">
		<p class="event-detail__eyebrow">{data.event.activityLabel}</p>
		<h1>{data.event.title}</h1>
		<div class="event-detail__meta">
			<span><Clock size={16} strokeWidth={1.8} /> {dateLabel(data.event.startsAt)} · {timeRangeLabel(data.event.startsAt, data.event.endsAt)}</span>
			{#if data.event.location}
				<span><MapPin size={16} strokeWidth={1.8} /> {data.event.location}</span>
			{/if}
			<span><UsersRound size={16} strokeWidth={1.8} /> {seatsTaken}/{data.event.capacity} joined</span>
		</div>
	</section>

	<div class="event-detail__body">
		<section class="event-detail__main" aria-label="Event details">
			{#if data.event.note}
				<p class="event-detail__note">{data.event.note}</p>
			{/if}

			<div class="event-detail__facts">
				<div>
					<strong>{seatsLeft}</strong>
					<span>Seats left</span>
				</div>
				<div>
					<strong>{waitlistCount}</strong>
					<span>Waitlist</span>
				</div>
			</div>
		</section>

		<aside class="event-detail__join" aria-label="Join event">
			{#if userStatus === 'joined' || userStatus === 'waitlist'}
				<CalendarCheck size={26} strokeWidth={1.7} />
				<h2>{userStatus === 'waitlist' ? 'Waitlisted' : 'Joined'}</h2>
				<p>{userStatus === 'waitlist' ? 'You are on the waitlist for this event.' : 'You are on the attendee list.'}</p>
			{:else if data.isSignedIn}
				<h2>Join this event</h2>
				<label class="event-detail__field">
					<span>Guests</span>
					<input bind:value={guestCount} type="number" min="0" max="8" />
				</label>
				<button class="event-detail__button" type="button" disabled={submitting} onclick={() => void joinEvent()}>
					<UserPlus size={18} strokeWidth={1.8} />
					{submitting ? 'Joining...' : seatsLeft > 0 ? 'Join event' : 'Join waitlist'}
				</button>
			{:else}
				<h2>Join this event</h2>
				<p>Sign in to save your seat or join the waitlist.</p>
				<a class="event-detail__button" href={data.loginUrl}>
					<UserPlus size={18} strokeWidth={1.8} />
					Sign in to join
				</a>
			{/if}

			{#if errorMessage}
				<p class="event-detail__error">{errorMessage}</p>
			{/if}
			{#if successMessage}
				<p class="event-detail__success">{successMessage}</p>
			{/if}
		</aside>
	</div>
</div>

<style lang="scss">
	.event-detail {
		width: min(68rem, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(2rem, 5vw, 4rem) 0;
	}

	.event-detail__back {
		margin-bottom: 1.5rem;

		a {
			color: color-mix(in srgb, var(--calendar-shell-text) 68%, transparent);
			font-weight: 800;
		}
	}

	.event-detail__hero {
		display: grid;
		gap: 0.9rem;
		margin-bottom: clamp(1.75rem, 4vw, 2.75rem);

		h1 {
			max-width: 52rem;
			margin: 0;
			color: var(--calendar-shell-text);
			font-size: clamp(2.8rem, 7vw, 5.6rem);
			line-height: 0.92;
			letter-spacing: 0;
		}
	}

	.event-detail__eyebrow {
		margin: 0;
		color: color-mix(in srgb, var(--calendar-shell-text) 58%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.event-detail__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem 1rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 70%, transparent);
		font-weight: 700;

		span {
			display: inline-flex;
			align-items: center;
			gap: 0.4rem;
		}
	}

	.event-detail__body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
		gap: 1rem;
		align-items: start;
	}

	.event-detail__main,
	.event-detail__join {
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
	}

	.event-detail__main {
		padding: 1.1rem;
	}

	.event-detail__note {
		margin: 0;
		color: color-mix(in srgb, var(--calendar-shell-text) 76%, transparent);
		font-size: 1.05rem;
		line-height: 1.55;
	}

	.event-detail__facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;

		div {
			min-height: 5.2rem;
			padding: 0.9rem;
			border-radius: 0.45rem;
			background: color-mix(in srgb, var(--calendar-shell-text) 7%, transparent);
		}

		strong,
		span {
			display: block;
		}

		strong {
			color: var(--calendar-shell-text);
			font-size: 1.7rem;
			line-height: 1;
		}

		span {
			margin-top: 0.45rem;
			color: color-mix(in srgb, var(--calendar-shell-text) 62%, transparent);
			font-size: 0.88rem;
			font-weight: 800;
		}
	}

	.event-detail__join {
		display: grid;
		gap: 0.8rem;
		padding: 1rem;

		h2,
		p {
			margin: 0;
		}

		h2 {
			color: var(--calendar-shell-text);
			font-size: 1.35rem;
			line-height: 1.1;
			letter-spacing: 0;
		}

		p {
			color: color-mix(in srgb, var(--calendar-shell-text) 68%, transparent);
			line-height: 1.45;
		}
	}

	.event-detail__field {
		display: grid;
		gap: 0.4rem;

		span {
			color: color-mix(in srgb, var(--calendar-shell-text) 70%, transparent);
			font-size: 0.82rem;
			font-weight: 800;
		}

		input {
			min-height: 2.65rem;
			width: 100%;
			border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
			border-radius: 0.45rem;
			background: color-mix(in srgb, black 20%, transparent);
			color: var(--calendar-shell-text);
			font: inherit;
			padding: 0 0.75rem;
		}
	}

	.event-detail__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 2.8rem;
		padding: 0 1rem;
		border: 1px solid color-mix(in srgb, #76e4b8 55%, transparent);
		border-radius: 0.5rem;
		background: #76e4b8;
		color: #08130f;
		font: inherit;
		font-weight: 800;
		text-decoration: none;
		cursor: pointer;

		&:disabled {
			cursor: not-allowed;
			opacity: 0.55;
		}
	}

	.event-detail__error,
	.event-detail__success {
		font-weight: 800;
	}

	.event-detail__error {
		color: #fca5a5;
	}

	.event-detail__success {
		color: #76e4b8;
	}

	@media (max-width: 48em) {
		.event-detail__body {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 40em) {
		.event-detail {
			width: min(100% - 1rem, 68rem);
		}

		.event-detail__facts {
			grid-template-columns: 1fr;
		}
	}
</style>
