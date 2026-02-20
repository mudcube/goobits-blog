<script lang="ts">
	import { goto } from '$app/navigation'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import { AdminEventDetailSheet, AdminLoginCard } from '@calendar/ui'

	const { data, form } = $props<{ data: { user: unknown | null }; form: unknown }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const isMobile = $derived(typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches)

	let showCreate = $state(false)
	let selectedActivitySlug = $state('')
	let createTitle = $state('')
	let createStartsAt = $state('')
	let createEndsAt = $state('')
	let createCapacity = $state(6)
	let createCostDollars = $state(0)
	let openedDetailId = $state<number | null>(null)
	let ignoredAlertEventId = $state<number | null>(null)

	$effect(() => {
		if (!authed) return
		dashboard.loadStatus()
		dashboard.loadBookings()
		dashboard.loadPaymentDefaults()
		dashboard.loadPrograms()
		dashboard.loadEvents()
	})

	const activityEmojis: Record<string, string> = {
		gym: '🏋',
		circus: '🎪',
		movie: '🎬',
		movies: '🎬',
		hike: '🏔',
		adventure: '🏔',
		social: '🍺'
	}

	function emojiForActivity(label: string, slug?: string) {
		const key = (slug || label || '').toLowerCase().trim()
		return activityEmojis[key] || '✨'
	}

	function statusFor(event: {
		seatsTaken: number
		capacity: number
		waitlistCount: number
	}) {
		if (event.waitlistCount > 0 || event.seatsTaken >= event.capacity) return 'full'
		return 'open'
	}

	function dayLabel(iso: string) {
		const date = new Date(iso)
		return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }).toUpperCase()
	}

	function timeLabel(iso: string) {
		return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()
	}

	function groupedEvents() {
		const byDay = new Map<string, Array<typeof dashboard.events[number]>>()
		for (const ev of dashboard.events) {
			const key = dayLabel(ev.startsAt)
			const list = byDay.get(key) || []
			list.push(ev)
			byDay.set(key, list)
		}
		return [...byDay.entries()]
	}

	function attentionEvent() {
		return dashboard.events.find(
			(ev) =>
				(ev.waitlistCount > 0 || ev.seatsTaken >= ev.capacity) &&
				ev.id !== ignoredAlertEventId
		)
	}

	function openEventDetail(eventId: number) {
		if (isMobile) {
			goto(`/admin/events/${eventId}`)
			return
		}
		openedDetailId = eventId
		void dashboard.openEventDetail(eventId)
	}

	async function expandSpotsForAttention() {
		const event = attentionEvent()
		if (!event) return
		await dashboard.updateEventCapacity(event.id, event.capacity + 2)
		await dashboard.loadEvents()
		if (openedDetailId === event.id) {
			void dashboard.openEventDetail(event.id)
		}
	}

	function openWaitlistForAttention() {
		const event = attentionEvent()
		if (!event) return
		openEventDetail(event.id)
	}

	function ignoreAttention() {
		const event = attentionEvent()
		if (!event) return
		ignoredAlertEventId = event.id
	}

	function closeEventDetail() {
		openedDetailId = null
		dashboard.closeEventDetail()
	}

	function openCreate() {
		showCreate = true
		selectedActivitySlug = ''
		createTitle = ''
		createStartsAt = ''
		createEndsAt = ''
		createCapacity = dashboard.capacity
		createCostDollars = 0
	}

	function selectActivity(slug: string, label: string) {
		selectedActivitySlug = slug
		createTitle = label === 'Gym'
			? 'Leg Day Crew'
			: label === 'Movies'
				? 'Movie Night'
				: label === 'Adventure'
					? 'Trail Run'
					: label === 'Circus'
						? 'Open Gym'
						: `${label} Hangout`
	}

	async function submitCreate() {
		if (!selectedActivitySlug || !createTitle || !createStartsAt || !createEndsAt) return
		dashboard.eventDraft = {
			...dashboard.eventDraft,
			activitySlug: selectedActivitySlug,
			title: createTitle,
			startsAt: new Date(createStartsAt).toISOString(),
			endsAt: new Date(createEndsAt).toISOString(),
			capacity: createCapacity,
			costCents: Math.max(0, Math.round(createCostDollars * 100))
		}
		await dashboard.createEvents()
		if (!dashboard.error) showCreate = false
	}
</script>

{#if !authed}
	<AdminLoginCard {form} />
{:else}
	<div class="social-home">
		<div class="social-home__main">
			<h2 class="social-home__title">👋 Hey Admin.</h2>
			<p class="social-home__subtitle">2 things need your eyes.</p>

			{#if attentionEvent()}
				<div class="social-home__alert">
					<div class="social-home__alert-head">
						<span>⚠️</span>
						<span>{attentionEvent()?.title} needs attention</span>
					</div>
					<div class="social-home__alert-actions">
						<button type="button" onclick={expandSpotsForAttention}>Expand Spots</button>
						<button type="button" onclick={openWaitlistForAttention}>Open Waitlist</button>
						<button type="button" onclick={ignoreAttention}>Ignore</button>
					</div>
				</div>
			{/if}

			<div class="social-home__section-head">
				<h3>THIS WEEK</h3>
				<button type="button" class="social-home__new" onclick={openCreate}>+ New</button>
			</div>

			{#if dashboard.eventsLoading}
				<p class="social-home__empty">Loading events...</p>
			{:else if dashboard.events.length === 0}
				<p class="social-home__empty">No sessions yet.</p>
			{:else}
				{#each groupedEvents() as [day, dayEvents]}
					<div class="social-home__day">{day}</div>
					{#each dayEvents as ev}
						<button type="button" class="social-home__event-card" onclick={() => openEventDetail(ev.id)}>
							<div class="social-home__event-head">
								<div>
									<span class="social-home__event-time">{timeLabel(ev.startsAt)} · </span>
									<span class="social-home__event-title">{ev.title}</span>
								</div>
								<span class="social-home__event-arrow">›</span>
							</div>
							<div class="social-home__event-meta">
								<span>{emojiForActivity(ev.activityLabel, ev.activitySlug)}</span>
								<span>{ev.activityLabel}</span>
								<span class="social-home__event-capacity" class:social-home__event-capacity--full={statusFor(ev) === 'full'}>
									{ev.seatsTaken}/{ev.capacity} {statusFor(ev) === 'full' ? 'Full ⚠' : 'going'}
								</span>
							</div>
						</button>
					{/each}
				{/each}
			{/if}

			<div class="social-home__day">SAT — SUN</div>
			<div class="social-home__empty-weekend">
				<p>Nothing planned yet.</p>
				<button type="button" onclick={openCreate}>+ Start an Adventure?</button>
			</div>

			<div class="social-home__memory-lane">
				<h4>Memory Lane</h4>
				<p>Past adventures will show up here — coming soon.</p>
			</div>
		</div>

		{#if !isMobile && openedDetailId && dashboard.selectedEventDetail}
			<div
				class="social-home__detail-scrim"
				role="button"
				tabindex="0"
				aria-label="Close event detail"
				onclick={closeEventDetail}
				onkeydown={(event) => (event.key === 'Escape' || event.key === 'Enter') && closeEventDetail()}
			>
				<div
					class="social-home__detail-sheet"
					role="dialog"
					tabindex="-1"
					aria-label="Event detail"
					onclick={(event) => event.stopPropagation()}
					onkeydown={(event) => event.key === 'Escape' && closeEventDetail()}
				>
					<button type="button" class="social-home__back" onclick={closeEventDetail}>← Back</button>
					<AdminEventDetailSheet {dashboard} detail={dashboard.selectedEventDetail} />
					<div class="social-home__detail-actions">
						<button type="button" onclick={() => goto('/admin/')}>Edit Event</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if showCreate}
		<div
			class="social-home__modal-scrim"
			role="button"
			tabindex="0"
			aria-label="Close create modal"
			onclick={() => (showCreate = false)}
			onkeydown={(event) => (event.key === 'Escape' || event.key === 'Enter') && (showCreate = false)}
		>
			<div
				class="social-home__modal"
				role="dialog"
				tabindex="-1"
				aria-label="Create event"
				onclick={(event) => event.stopPropagation()}
				onkeydown={(event) => event.key === 'Escape' && (showCreate = false)}
			>
				<div class="social-home__modal-head">
					<h3>What's the plan?</h3>
					<button type="button" onclick={() => (showCreate = false)}>✕</button>
				</div>
				<div class="social-home__activity-grid">
					{#each dashboard.enabledPrograms as program}
						<button
							type="button"
							class="social-home__activity"
							class:social-home__activity--active={selectedActivitySlug === program.slug}
							onclick={() => selectActivity(program.slug, program.label)}
						>
							<span>{emojiForActivity(program.label, program.slug)}</span>
							<span>{program.label}</span>
						</button>
					{/each}
				</div>

				{#if selectedActivitySlug}
					<div class="social-home__create-form">
						<label for="social-create-title">Title</label>
						<input id="social-create-title" type="text" bind:value={createTitle} />

						<div class="social-home__grid-2">
							<div>
								<label for="social-create-starts">Starts</label>
								<input id="social-create-starts" type="datetime-local" bind:value={createStartsAt} />
							</div>
							<div>
								<label for="social-create-ends">Ends</label>
								<input id="social-create-ends" type="datetime-local" bind:value={createEndsAt} />
							</div>
						</div>

						<div class="social-home__grid-2">
							<div>
								<label for="social-create-spots">Spots</label>
								<input id="social-create-spots" type="number" min="2" max="20" bind:value={createCapacity} />
							</div>
							<div>
								<label for="social-create-cost">Cost ($)</label>
								<input id="social-create-cost" type="number" min="0" step="1" bind:value={createCostDollars} />
							</div>
						</div>

						<div class="social-home__create-actions">
							<button type="button" class="social-home__secondary" onclick={() => (showCreate = false)}>Cancel</button>
							<button type="button" onclick={submitCreate} disabled={dashboard.eventsCreating}>
								{dashboard.eventsCreating ? 'Creating…' : "Let's Go"}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<style>
	.social-home {
		position: relative;
	}

	.social-home__main {
		max-width: 48rem;
		display: grid;
		gap: 0.75rem;
	}

	.social-home__title {
		margin: 0;
		font-size: 1.375rem;
		color: var(--text);
	}

	.social-home__subtitle {
		margin: 0 0 0.5rem;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-home__alert {
		border-radius: 14px;
		padding: 1rem 1.25rem;
		border: 1px solid color-mix(in srgb, var(--color-warning) 30%, transparent);
		background: color-mix(in srgb, var(--color-warning) 15%, var(--bg));
	}

	.social-home__alert-head {
		display: flex;
		gap: 0.5rem;
		font-weight: 600;
	}

	.social-home__alert-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.social-home__alert-actions button {
		min-height: 32px;
		padding: 0 0.75rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 24%, transparent);
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
		color: var(--text);
		cursor: pointer;
	}

	.social-home__section-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}

	.social-home__section-head h3 {
		margin: 0;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}

	.social-home__new,
	.social-home__create-actions button {
		min-height: 32px;
		padding: 0 1rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 24%, transparent);
		background: var(--text);
		color: var(--bg);
		font-weight: 700;
		cursor: pointer;
	}

	.social-home__day {
		margin-top: 0.5rem;
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}

	.social-home__event-card {
		width: 100%;
		min-height: 64px;
		border-radius: 14px;
		padding: 0.875rem 1rem;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
		text-align: left;
		cursor: pointer;
	}

	.social-home__event-head,
	.social-home__event-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.social-home__event-head {
		justify-content: space-between;
	}

	.social-home__event-time,
	.social-home__event-meta {
		color: color-mix(in srgb, var(--text) 62%, transparent);
		font-size: 0.8125rem;
	}

	.social-home__event-title {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text);
	}

	.social-home__event-arrow {
		color: color-mix(in srgb, var(--text) 55%, transparent);
		font-size: 1.125rem;
	}

	.social-home__event-capacity {
		margin-left: auto;
		font-weight: 700;
		color: var(--status-success-text);
	}

	.social-home__event-capacity--full {
		color: var(--status-error-text);
	}

	.social-home__empty,
	.social-home__empty-weekend p {
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-home__empty-weekend {
		border-radius: 14px;
		padding: 1rem;
		border: 1px dashed color-mix(in srgb, var(--text) 24%, transparent);
		text-align: center;
	}

	.social-home__empty-weekend button {
		min-height: 32px;
		padding: 0 1rem;
		border-radius: 10px;
		border: 1px dashed color-mix(in srgb, var(--text) 35%, transparent);
		background: transparent;
		color: var(--text);
		font-weight: 700;
		cursor: pointer;
	}

	.social-home__memory-lane {
		margin-top: 0.5rem;
		border-radius: 14px;
		padding: 1rem 1.25rem;
		border: 1px dashed color-mix(in srgb, var(--text) 24%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
	}

	.social-home__memory-lane h4 {
		margin: 0 0 0.25rem;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-home__memory-lane p {
		margin: 0;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-home__detail-scrim,
	.social-home__modal-scrim {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--text) 30%, transparent);
		display: flex;
		justify-content: flex-end;
		z-index: 100;
	}

	.social-home__detail-sheet {
		width: 420px;
		max-width: min(420px, 96vw);
		background: var(--bg);
		padding: 1rem;
		overflow: auto;
		animation: social-home-sheet-in 200ms ease-out;
	}

	.social-home__back {
		background: none;
		border: none;
		color: var(--text);
		font-weight: 600;
		padding: 0;
		cursor: pointer;
		margin-bottom: 0.75rem;
	}

	.social-home__detail-actions {
		margin-top: 0.75rem;
	}

	.social-home__detail-actions button {
		min-height: 32px;
		padding: 0 1rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 24%, transparent);
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
		color: var(--text);
		font-weight: 700;
		cursor: pointer;
	}

	.social-home__modal-scrim {
		align-items: center;
		justify-content: center;
	}

	.social-home__modal {
		width: 420px;
		max-width: 90vw;
		border-radius: 20px;
		padding: 1.5rem;
		background: var(--bg);
		border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
	}

	.social-home__modal-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.social-home__modal-head h3 {
		margin: 0;
		font-size: 1.125rem;
	}

	.social-home__modal-head button {
		border: none;
		background: none;
		color: color-mix(in srgb, var(--text) 62%, transparent);
		cursor: pointer;
	}

	.social-home__activity-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.social-home__activity {
		min-height: 72px;
		border-radius: 12px;
		border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
		display: grid;
		place-items: center;
		gap: 0.125rem;
		cursor: pointer;
	}

	.social-home__activity--active {
		border-color: color-mix(in srgb, var(--text) 45%, transparent);
		background: color-mix(in srgb, var(--text) 10%, var(--bg));
	}

	.social-home__create-form {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
		display: grid;
		gap: 0.5rem;
	}

	.social-home__create-form label {
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-home__create-form input {
		width: 100%;
		min-height: 40px;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
		color: var(--text);
		padding: 0 0.75rem;
	}

	.social-home__grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.625rem;
	}

	.social-home__create-actions {
		display: flex;
		gap: 0.625rem;
		margin-top: 0.5rem;
	}

	.social-home__create-actions .social-home__secondary {
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
		color: var(--text);
	}

	@keyframes social-home-sheet-in {
		from {
			transform: translateX(24px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@media (max-width: 820px) {
		.social-home__main {
			max-width: none;
		}
	}
</style>
