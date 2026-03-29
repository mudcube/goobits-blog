<script>
	import { ActivityBookingPage } from '@calendar/ui'
	const { data } = $props()
</script>

<div class="calendar-activity-page calendar-activity-page--{data.activity.slug}">
	<div class="calendar-activity-page__content">
		<ActivityBookingPage activity={data.activity} upcoming={data.upcoming} recent={data.recent} mockMode={data.mockMode === true} />
	</div>
</div>
