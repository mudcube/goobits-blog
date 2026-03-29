<script>
	import { goto } from '$app/navigation'
	import { joinCalendarEvent, leaveCalendarEvent } from '../../../api/calendar'
	import { applyEventMutationState } from './feed-state'
	import { getCalendarUiConfig } from '../../../config'
	import PillButton from '../../../primitives/PillButton.svelte'
	import Hero from '../../../primitives/Hero.svelte'
	import MonthEventCalendar from './MonthEventCalendar.svelte'
	import AdminEventSessionCard from '@components/Admin/AdminEventSessionCard.svelte'
	import AdminChevronRowCard from '@components/Admin/AdminChevronRowCard.svelte'
	import { getAdminActivityEmoji } from '$lib/admin/activity-display'
	import { formatAdminDayLabel } from '$lib/admin/date-format'
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
	const homeTitleLines = $derived(firstName ? [`Hey, ${firstName}.`, "What's the move?"] : ['Hey.', "What's the move?"])

	function eventRoute(event) {
		if (event?.activitySlug) return `${calendarConfig.routes.calendarBase}/${event.activitySlug}/`
		return calendarConfig.routes.calendarBase
	}

	function dayLabel(iso) {
		return formatAdminDayLabel(iso)
	}

	function emojiForActivity(label, slug) {
		return getAdminActivityEmoji(label, slug)
	}
</script>

<svelte:head>
	<title>{calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

<div class="calendar-page calendar-home">
	<Hero
		className="calendar-page__hero calendar-home__hero"
		glowClass="calendar-page__hero-glow calendar-home__glow"
		eyebrowClass="calendar-page__eyebrow calendar-home__eyebrow"
		subtitleClass="calendar-page__subtitle calendar-home__sub"
		eyebrow="Members"
		titleLines={homeTitleLines}
		subtitle="Pick an activity and let's make something happen."
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
				href={data.onlyMine ? calendarConfig.routes.calendarBase : `${calendarConfig.routes.calendarBase}?mine=1`}
				variant="ghost"
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
			<p class="calendar-page__subtitle calendar-home__sub">No events are scheduled yet.</p>
		{:else}
			<div class="social-events__upcoming-grid">
				{#each upcoming as event}
					<AdminEventSessionCard event={event} onOpenEvent={() => goto(eventRoute(event))} />
				{/each}
			</div>
		{/if}
	</section>

	<section class="calendar-page__section calendar-home__section">
		<h2 class="calendar-home__feed-title">Last Week</h2>
		{#if recent.length === 0}
			<p class="calendar-page__subtitle calendar-home__sub">No completed events yet.</p>
		{:else}
			<div class="social-events__past-list">
				{#each recent as event}
					<AdminChevronRowCard compact={true} href={eventRoute(event)} ariaLabel={`Open ${event.title}`}>
						{#snippet start()}
							<span class="social-events__past-emoji">{emojiForActivity(event.activityLabel, event.activitySlug)}</span>
						{/snippet}
						<div>
							<div class="social-events__past-title">{event.title}</div>
							<div class="social-events__event-sub">{dayLabel(event.startsAt)} · {event.seatsTaken} went</div>
						</div>
					</AdminChevronRowCard>
				{/each}
			</div>
		{/if}
	</section>

</div>

<style>
	.calendar-home :global(.admin-ui-card) {
		border-radius: 14px;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 10%, transparent);
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
		box-shadow: 0 1px 2px color-mix(in srgb, black 8%, transparent);
	}

	.calendar-home :global(.admin-ui-card--interactive) {
		transition:
			border-color 150ms ease,
			background 150ms ease,
			box-shadow 170ms cubic-bezier(0.2, 0.8, 0.2, 1),
			transform 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.calendar-home :global(.admin-ui-card--interactive:hover) {
		background: color-mix(in srgb, var(--calendar-panel-bg) 92%, transparent);
		border-color: color-mix(in srgb, var(--calendar-shell-text) 16%, transparent);
		box-shadow: 0 4px 16px color-mix(in srgb, var(--calendar-shell-text) 8%, transparent);
		transform: translateY(-1px);
	}

	.social-events__upcoming-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.social-events__past-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.social-events__past-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--calendar-shell-text) 84%, transparent);
	}

	.social-events__past-emoji {
		font-size: 1rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.social-events__event-sub {
		font-size: 0.74rem;
		line-height: 1;
		color: color-mix(in srgb, var(--calendar-shell-text) 60%, transparent);
		margin-top: 0.1rem;
	}

	@media (max-width: 720px) {
		.social-events__upcoming-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
