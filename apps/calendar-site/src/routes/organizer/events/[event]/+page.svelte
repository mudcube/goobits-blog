<script lang="ts">
	import { CalendarCheck, CircleSlash, ExternalLink, Save } from '@lucide/svelte'

	let { data, form } = $props()

	function dateTimeLocal(value: string) {
		const date = new Date(value)
		if (!Number.isFinite(date.getTime())) return ''
		const offsetMs = date.getTimezoneOffset() * 60_000
		return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
	}

	function statusLabel(status: string) {
		if (status === 'scheduled') return 'Scheduled'
		if (status === 'canceled' || status === 'cancelled') return 'Canceled'
		return status || 'Draft'
	}
</script>

<svelte:head>
	<title>Manage {data.event.title} | pdx.fun</title>
</svelte:head>

<div class="organizer-event">
	<header class="organizer-event__header">
		<div>
			<p class="organizer-event__eyebrow">Manage event</p>
			<h1>{data.event.title}</h1>
			<p>{data.tenant.name} · {statusLabel(data.event.status)}</p>
		</div>
		<div class="organizer-event__actions" aria-label="Event links">
			<a href="/organizer">Dashboard</a>
			<a href={`/t/${data.tenant.slug}/events/${data.event.id}`}>
				<ExternalLink size={17} strokeWidth={1.8} />
				Public event
			</a>
		</div>
	</header>

	<div class="organizer-event__grid">
		<section class="organizer-event__panel" aria-labelledby="event-profile-heading">
			<div class="organizer-event__panel-head">
				<CalendarCheck size={20} strokeWidth={1.8} />
				<h2 id="event-profile-heading">Event profile</h2>
			</div>
			<form class="organizer-event__form" method="POST" action="?/updateEvent">
				<label class="organizer-event__field organizer-event__field--full">
					<span>Title</span>
					<input name="title" value={data.event.title} maxlength="80" required />
				</label>
				<label class="organizer-event__field">
					<span>Starts</span>
					<input name="startsAt" type="datetime-local" value={dateTimeLocal(data.event.startsAt)} required />
				</label>
				<label class="organizer-event__field">
					<span>Ends</span>
					<input name="endsAt" type="datetime-local" value={dateTimeLocal(data.event.endsAt)} required />
				</label>
				<label class="organizer-event__field">
					<span>Capacity</span>
					<input name="capacity" type="number" min="1" max="250" value={data.event.capacity} required />
				</label>
				<div class="organizer-event__meta">
					<span>{data.event.seatsTaken}/{data.event.capacity} joined</span>
					<span>{data.event.waitlistCount} waitlisted</span>
				</div>
				<button class="organizer-event__button organizer-event__button--primary" type="submit">
					<Save size={18} strokeWidth={1.8} />
					Save event
				</button>
				{#if form?.intent === 'update' && form?.error}
					<p class="organizer-event__error">{form.error}</p>
				{:else if form?.intent === 'update' && form?.success}
					<p class="organizer-event__success">Saved.</p>
				{/if}
			</form>
		</section>

		<section class="organizer-event__panel" aria-labelledby="event-danger-heading">
			<div class="organizer-event__panel-head">
				<CircleSlash size={20} strokeWidth={1.8} />
				<h2 id="event-danger-heading">Status</h2>
			</div>
			<p class="organizer-event__note">
				Canceling removes this event from public listings while preserving attendee history for admin review.
			</p>
			<form class="organizer-event__form" method="POST" action="?/cancelEvent">
				<button
					class="organizer-event__button organizer-event__button--danger"
					type="submit"
					disabled={data.event.status === 'canceled' || data.event.status === 'cancelled'}
				>
					<CircleSlash size={18} strokeWidth={1.8} />
					{data.event.status === 'canceled' || data.event.status === 'cancelled' ? 'Canceled' : 'Cancel event'}
				</button>
				{#if form?.intent === 'cancel' && form?.error}
					<p class="organizer-event__error">{form.error}</p>
				{:else if form?.intent === 'cancel' && form?.success}
					<p class="organizer-event__success">Canceled.</p>
				{/if}
			</form>
		</section>
	</div>
</div>

<style lang="scss">
	.organizer-event {
		width: min(68rem, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(2rem, 5vw, 4rem) 0;
	}

	.organizer-event__header {
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

		p:last-child {
			margin: 0.65rem 0 0;
			color: color-mix(in srgb, var(--calendar-shell-text) 66%, transparent);
			font-weight: 800;
		}
	}

	.organizer-event__eyebrow {
		margin: 0 0 0.45rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 58%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.organizer-event__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;

		a {
			display: inline-flex;
			align-items: center;
			gap: 0.45rem;
			min-height: 2.65rem;
			padding: 0 0.95rem;
			border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
			border-radius: 0.5rem;
			color: var(--calendar-shell-text);
			font-weight: 800;
			text-decoration: none;
		}
	}

	.organizer-event__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
		gap: 1rem;
		align-items: start;
	}

	.organizer-event__panel {
		padding: 1rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
	}

	.organizer-event__panel-head {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin-bottom: 0.9rem;
		color: var(--calendar-shell-text);

		h2 {
			margin: 0;
			font-size: 1.25rem;
			line-height: 1.1;
			letter-spacing: 0;
		}
	}

	.organizer-event__form {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.8rem;
	}

	.organizer-event__field,
	.organizer-event__note {
		display: grid;
		gap: 0.4rem;
		margin: 0;
	}

	.organizer-event__field--full,
	.organizer-event__meta,
	.organizer-event__button,
	.organizer-event__error,
	.organizer-event__success {
		grid-column: 1 / -1;
	}

	.organizer-event__field span,
	.organizer-event__meta,
	.organizer-event__note {
		color: color-mix(in srgb, var(--calendar-shell-text) 70%, transparent);
		font-size: 0.88rem;
		font-weight: 800;
	}

	.organizer-event__field input {
		min-height: 2.65rem;
		width: 100%;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
		border-radius: 0.45rem;
		background: color-mix(in srgb, black 20%, transparent);
		color: var(--calendar-shell-text);
		font: inherit;
		padding: 0 0.75rem;
	}

	.organizer-event__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
	}

	.organizer-event__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 2.8rem;
		border-radius: 0.5rem;
		font: inherit;
		font-weight: 800;
		cursor: pointer;
	}

	.organizer-event__button--primary {
		border: 1px solid color-mix(in srgb, #76e4b8 55%, transparent);
		background: #76e4b8;
		color: #08130f;
	}

	.organizer-event__button--danger {
		border: 1px solid color-mix(in srgb, #fca5a5 50%, transparent);
		background: color-mix(in srgb, #7f1d1d 74%, black 26%);
		color: #fff;
	}

	.organizer-event__button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.organizer-event__error,
	.organizer-event__success {
		margin: 0;
		font-weight: 800;
	}

	.organizer-event__error {
		color: #fca5a5;
	}

	.organizer-event__success {
		color: #76e4b8;
	}

	@media (max-width: 48em) {
		.organizer-event__header,
		.organizer-event__grid {
			display: grid;
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 40em) {
		.organizer-event {
			width: min(100% - 1rem, 68rem);
		}

		.organizer-event__form {
			grid-template-columns: 1fr;
		}
	}
</style>
