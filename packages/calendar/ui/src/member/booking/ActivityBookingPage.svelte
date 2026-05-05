<script lang="ts">
	import BookingCalendar from './BookingCalendar.svelte'
	import CalendarPageHero from '../../primitives/CalendarPageHero.svelte'
	import type { CalendarActivityConfig } from '@calendar/core'
	import type { CalendarEventsResponse } from '../../api/calendar'

	const {
		activity,
		upcoming = [],
		mockMode = false
	} = $props<{
		activity: CalendarActivityConfig
		upcoming?: CalendarEventsResponse['upcoming']
		mockMode?: boolean
	}>()
</script>

<svelte:head>
	<title>{activity.pageTitle}</title>
</svelte:head>

<div class="calendar-page calendar-activity calendar-activity--{activity.slug}">
	<div class="calendar-activity__panel">
		<CalendarPageHero
			emoji={activity.icon || '💪'}
			eyebrow={activity.eyebrow}
			titleLines={activity.heroTitleLines}
			subtitle={activity.heroSubtitle}
			serviceStatusNote={activity.serviceStatusNote}
		/>

		<BookingCalendar
			activity={{
				slug: activity.slug,
				label: activity.activityName || activity.label,
				icon: activity.icon,
				tagline: activity.heroSubtitle || '',
				windowStart: 9,
				windowEnd: 18,
				maxDuration: 2,
				capacity: 8
			}}
			initialUpcoming={upcoming}
			{mockMode}
		/>
	</div>
</div>

<style lang="scss">
	.calendar-activity__panel {
		width: 100%;
		padding: 1.1rem 1rem 1.65rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
