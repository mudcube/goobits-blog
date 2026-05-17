<script>
	import { goto } from '$app/navigation'
	import { CalendarDays, Sparkles } from '@lucide/svelte'
	import { joinCalendarEvent, leaveCalendarEvent } from '../../api/calendar'
	import { applyEventMutationState } from '../booking/feed-state'
	import { getCalendarUiConfig } from '../../config'
	import PillButton from '../../primitives/CalendarPillButton.svelte'
	import CalendarPageHero from '../../primitives/CalendarPageHero.svelte'
	import MonthEventCalendar from '../booking/MonthEventCalendar.svelte'
	import { EventCard } from '@calendar/ui/shared'
	import { ChevronRowCard } from '@calendar/ui/shared'
	import { getActivityEmoji } from '../../shared'
	import { formatEventDayLabel } from '../../shared'
	let { data } = $props()
	let upcoming = $state([])
	let recent = $state([])
	let pendingEventId = $state(null)
	let feedError = $state('')
	const calendarConfig = getCalendarUiConfig()
	const mockMode = $derived(data?.mockMode === true)

	function applyMockJoin(eventId, guestCount = 0) {
		upcoming = upcoming.map((event) => {
			if (event.id !== eventId) return event
			const requested = 1 + Math.max(0, guestCount)
			const canJoin = event.seatsLeft >= requested
			const nextSeatsTaken = canJoin ? Math.min(event.capacity, event.seatsTaken + requested) : event.seatsTaken
			const nextSeatsLeft = Math.max(0, event.capacity - nextSeatsTaken)
			const nextWaitlist = canJoin ? event.waitlistCount : event.waitlistCount + requested
			return {
				...event,
				seatsTaken: nextSeatsTaken,
				seatsLeft: nextSeatsLeft,
				waitlistCount: nextWaitlist,
				userStatus: canJoin ? 'joined' : 'waitlist',
				userGuestCount: Math.max(0, guestCount)
			}
		})
	}

	function applyMockLeave(eventId) {
		upcoming = upcoming.map((event) => {
			if (event.id !== eventId) return event
			if (!event.userStatus) return event
			if (event.userStatus === 'waitlist') {
				const waitlistDrop = 1 + Math.max(0, event.userGuestCount || 0)
				return {
					...event,
					waitlistCount: Math.max(0, event.waitlistCount - waitlistDrop),
					userStatus: null,
					userGuestCount: 0
				}
			}
			const seatDrop = 1 + Math.max(0, event.userGuestCount || 0)
			const nextSeatsTaken = Math.max(0, event.seatsTaken - seatDrop)
			return {
				...event,
				seatsTaken: nextSeatsTaken,
				seatsLeft: Math.max(0, event.capacity - nextSeatsTaken),
				userStatus: null,
				userGuestCount: 0
			}
		})
	}

	$effect(() => {
		// During hydration/navigations, SvelteKit can transiently provide partial data.
		// Only overwrite if the next values are explicitly provided.
		if (Array.isArray(data.upcoming)) upcoming = data.upcoming
		if (Array.isArray(data.recent)) recent = data.recent
	})

	async function join(eventId, guestCount = 0) {
		pendingEventId = eventId
		feedError = ''
		try {
			if (mockMode) {
				applyMockJoin(eventId, guestCount)
				return
			}
			const result = await joinCalendarEvent(eventId, { guestCount })
			upcoming = applyEventMutationState(upcoming, eventId, result.state)
		} catch (error) {
			feedError = error instanceof Error ? error.message : 'Unable to join event'
		} finally {
			pendingEventId = null
		}
	}

	async function leave(eventId) {
		pendingEventId = eventId
		feedError = ''
		try {
			if (mockMode) {
				applyMockLeave(eventId)
				return
			}
			const result = await leaveCalendarEvent(eventId)
			upcoming = applyEventMutationState(upcoming, eventId, result.state)
		} catch (error) {
			feedError = error instanceof Error ? error.message : 'Unable to leave event'
		} finally {
			pendingEventId = null
		}
	}

	const firstName = $derived(data.user?.name?.split(' ')[0] || '')
	const homeTitleLines = $derived(
		firstName ? [`Hey, ${firstName}.`, "What's on the schedule?"] : ['Hey.', "What's on the schedule?"]
	)

	function withMock(path) {
		if (!mockMode) return path
		return path.includes('?') ? `${path}&mock=1` : `${path}?mock=1`
	}

	function eventRoute(event) {
		if (event?.activitySlug) return withMock(`${calendarConfig.routes.calendarBase}/${event.activitySlug}/`)
		return withMock(calendarConfig.routes.calendarBase)
	}

	function dayLabel(iso) {
		return formatEventDayLabel(iso)
	}

	function emojiForActivity(label, slug) {
		return getActivityEmoji(label, slug)
	}
</script>

<svelte:head>
	<title>{calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

<div class="calendar-page calendar-home">
	<CalendarPageHero
		eyebrow="Members"
		titleLines={homeTitleLines}
		subtitle="Pick an activity and get on the schedule."
	/>

	<MonthEventCalendar
		title={data.onlyMine ? 'My calendar' : 'Calendar'}
		events={upcoming}
		{pendingEventId}
		onJoin={join}
		onLeave={leave}
	/>

	<section class="calendar-page__section calendar-home__section">
		<div class="calendar-home__feed-head">
			<h2 class="calendar-home__feed-title">{data.onlyMine ? 'My Schedule' : 'Upcoming Events'}</h2>
			<PillButton
				href={data.onlyMine ? withMock(calendarConfig.routes.calendarBase) : withMock(`${calendarConfig.routes.calendarBase}?mine=1`)}
				variant={data.onlyMine ? 'secondary' : 'ghost'}
				size="md"
				className="calendar-page__ghost-button"
			>
				{data.onlyMine ? 'Show all events' : 'My schedule'}
			</PillButton>
		</div>
		{#if feedError}
			<p class="calendar-page__status-text--muted">{feedError}</p>
		{/if}
		{#if upcoming.length === 0}
			<div class="calendar-home__empty">
				<span class="calendar-home__empty-icon" aria-hidden="true">
					<CalendarDays size={28} strokeWidth={1.6} />
				</span>
				<p class="calendar-home__empty-text">No events are scheduled yet.</p>
				<p class="calendar-home__empty-hint">Browse activities above to find something fun.</p>
			</div>
		{:else}
			<div class="social-events__upcoming-grid">
				{#each upcoming as event}
					<EventCard event={event} onOpenEvent={() => goto(eventRoute(event))} />
				{/each}
			</div>
		{/if}
	</section>

	<section class="calendar-page__section calendar-home__section">
		<h2 class="calendar-home__feed-title">Last Week</h2>
		{#if recent.length === 0}
			<div class="calendar-home__empty">
				<span class="calendar-home__empty-icon" aria-hidden="true">
					<Sparkles size={26} strokeWidth={1.6} />
				</span>
				<p class="calendar-home__empty-text">No completed events yet.</p>
				<p class="calendar-home__empty-hint">Your past events will show up here.</p>
			</div>
		{:else}
			<div class="social-events__past-list">
				{#each recent as event}
					<ChevronRowCard compact={true} href={eventRoute(event)} ariaLabel={`Open ${event.title}`}>
						{#snippet start()}
							<span class="social-events__past-emoji">{emojiForActivity(event.activityLabel, event.activitySlug)}</span>
						{/snippet}
						<div>
							<div class="social-events__past-title">{event.title}</div>
							<div class="social-events__event-sub">{dayLabel(event.startsAt)} · {event.seatsTaken} went</div>
						</div>
					</ChevronRowCard>
				{/each}
			</div>
		{/if}
	</section>

</div>

<style>
	.calendar-home :global(.calendar-ui-card) {
		border-radius: 0.875rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 10%, transparent);
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
		box-shadow: 0 1px 2px color-mix(in srgb, black 8%, transparent);
	}

	.calendar-home :global(.calendar-ui-card--interactive) {
		transition:
			border-color 150ms ease,
			background 150ms ease,
			box-shadow 170ms cubic-bezier(0.2, 0.8, 0.2, 1),
			transform 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.calendar-home :global(.calendar-ui-card--interactive:hover) {
		background: color-mix(in srgb, var(--calendar-panel-bg) 92%, transparent);
		border-color: color-mix(in srgb, var(--calendar-shell-text) 16%, transparent);
		box-shadow: 0 4px 16px color-mix(in srgb, var(--calendar-shell-text) 8%, transparent);
		transform: translateY(-1px);
	}

	.social-events__upcoming-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.social-events__past-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.social-events__past-title {
		font-size: 0.84rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--calendar-shell-text) 86%, transparent);
	}

	.social-events__past-emoji {
		font-size: 1.1rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.social-events__event-sub {
		font-size: 0.78rem;
		line-height: 1.3;
		color: color-mix(in srgb, var(--calendar-shell-text) 60%, transparent);
		margin-top: 0.15rem;
	}

	.calendar-home__empty {
		display: grid;
		justify-items: center;
		gap: 0.35rem;
		padding: 2.5rem 1rem;
		text-align: center;
	}

	.calendar-home__empty-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: color-mix(in srgb, var(--calendar-shell-text) 48%, transparent);
		margin-bottom: 0.35rem;
	}

	.calendar-home__empty-text {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 500;
		color: color-mix(in srgb, var(--calendar-shell-text) 64%, transparent);
	}

	.calendar-home__empty-hint {
		margin: 0;
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 42%, transparent);
	}

	@media (max-width: 720px) {
		.social-events__upcoming-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
