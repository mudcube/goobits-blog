<script lang="ts">
	import { goto } from '$app/navigation'
	import { CalendarPlus, Clock, MapPin, UsersRound } from '@lucide/svelte'

	let { data } = $props()

	let title = $state('')
	let activitySlug = $state('')
	let startsAt = $state('')
	let endsAt = $state('')
	let capacity = $state(12)
	let location = $state('')
	let note = $state('')
	let submitting = $state(false)
	let error = $state('')

	$effect(() => {
		if (!activitySlug && data.programs[0]) {
			activitySlug = data.programs[0].slug
		}
	})

	function toIso(value: string) {
		const date = new Date(value)
		return Number.isFinite(date.getTime()) ? date.toISOString() : ''
	}

	async function createEvent() {
		error = ''
		const startsIso = toIso(startsAt)
		const endsIso = toIso(endsAt)
		if (!title.trim() || !activitySlug || !startsIso || !endsIso) {
			error = 'Add a title, activity, start time, and end time.'
			return
		}
		submitting = true
		try {
			const response = await fetch('/api/calendar/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					activitySlug,
					startsAt: startsIso,
					endsAt: endsIso,
					capacity,
					location,
					note,
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles'
				})
			})
			const result = await response.json().catch(() => null)
			if (!response.ok || !result?.ok) {
				error = result?.error?.message || 'Unable to create event.'
				return
			}
			await goto(`/t/${result.tenant.slug}`)
		} finally {
			submitting = false
		}
	}
</script>

<svelte:head>
	<title>Create an event | pdx.fun</title>
</svelte:head>

<div class="event-create">
	<section class="event-create__header">
		<p class="event-create__eyebrow">{data.tenant.name}</p>
		<h1>Create an event</h1>
		<p>Publish something local people can find, join, and share.</p>
	</section>

	<form class="event-create__form" onsubmit={(event) => { event.preventDefault(); void createEvent() }}>
		<label class="event-create__field event-create__field--full">
			<span>Title</span>
			<input bind:value={title} name="title" maxlength="80" placeholder="Thursday evening movement jam" required />
		</label>

		<label class="event-create__field">
			<span>Activity</span>
			<select bind:value={activitySlug} name="activitySlug" required>
				{#each data.programs as program}
					<option value={program.slug}>{program.icon} {program.label}</option>
				{/each}
			</select>
		</label>

		<label class="event-create__field">
			<span><UsersRound size={15} strokeWidth={1.8} /> Capacity</span>
			<input bind:value={capacity} name="capacity" type="number" min="1" max="250" required />
		</label>

		<label class="event-create__field">
			<span><Clock size={15} strokeWidth={1.8} /> Starts</span>
			<input bind:value={startsAt} name="startsAt" type="datetime-local" required />
		</label>

		<label class="event-create__field">
			<span><Clock size={15} strokeWidth={1.8} /> Ends</span>
			<input bind:value={endsAt} name="endsAt" type="datetime-local" required />
		</label>

		<label class="event-create__field event-create__field--full">
			<span><MapPin size={15} strokeWidth={1.8} /> Location</span>
			<input bind:value={location} name="location" maxlength="120" placeholder="Venue, park, address, or TBD" />
		</label>

		<label class="event-create__field event-create__field--full">
			<span>Notes</span>
			<textarea bind:value={note} name="note" maxlength="300" rows="5" placeholder="What should people know before they join?"></textarea>
		</label>

		{#if error}
			<p class="event-create__error">{error}</p>
		{/if}

		<div class="event-create__actions">
			<a class="event-create__link" href={`/t/${data.tenant.slug}`}>View organizer page</a>
			<button class="event-create__button" type="submit" disabled={submitting || !data.programs.length}>
				<CalendarPlus size={18} strokeWidth={1.8} />
				{submitting ? 'Creating...' : 'Publish event'}
			</button>
		</div>
	</form>
</div>

<style lang="scss">
	.event-create {
		width: min(48rem, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(2rem, 5vw, 4rem) 0;
	}

	.event-create__header {
		margin-bottom: 1.5rem;

		h1 {
			margin: 0;
			color: var(--calendar-shell-text);
			font-size: clamp(2.4rem, 6vw, 4rem);
			line-height: 0.95;
			letter-spacing: 0;
		}

		p:last-child {
			max-width: 34rem;
			margin: 0.9rem 0 0;
			color: color-mix(in srgb, var(--calendar-shell-text) 68%, transparent);
			font-size: 1.05rem;
			line-height: 1.45;
		}
	}

	.event-create__eyebrow {
		margin: 0 0 0.6rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 58%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.event-create__form {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.9rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
	}

	.event-create__field {
		display: grid;
		gap: 0.4rem;

		span {
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
			color: color-mix(in srgb, var(--calendar-shell-text) 72%, transparent);
			font-size: 0.82rem;
			font-weight: 700;
		}

		input,
		select,
		textarea {
			width: 100%;
			border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
			border-radius: 0.45rem;
			background: color-mix(in srgb, black 20%, transparent);
			color: var(--calendar-shell-text);
			font: inherit;
		}

		input,
		select {
			min-height: 2.8rem;
			padding: 0 0.8rem;
		}

		textarea {
			resize: vertical;
			padding: 0.8rem;
		}
	}

	.event-create__field--full,
	.event-create__error,
	.event-create__actions {
		grid-column: 1 / -1;
	}

	.event-create__error {
		margin: 0;
		color: #fca5a5;
		font-weight: 700;
	}

	.event-create__actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-top: 0.4rem;
	}

	.event-create__link {
		color: color-mix(in srgb, var(--calendar-shell-text) 72%, transparent);
		font-weight: 700;
	}

	.event-create__button {
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
		font-weight: 800;
		cursor: pointer;

		&:disabled {
			cursor: not-allowed;
			opacity: 0.55;
		}
	}

	@media (max-width: 40em) {
		.event-create {
			width: min(100% - 1rem, 48rem);
		}

		.event-create__form {
			grid-template-columns: 1fr;
		}

		.event-create__actions {
			align-items: stretch;
			flex-direction: column-reverse;
		}

		.event-create__button {
			width: 100%;
		}
	}
</style>
