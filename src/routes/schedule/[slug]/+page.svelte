<script>
	import { ActivityBookingPage } from '@calendar/ui'
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'
	const { data } = $props()
</script>

<NoIndexHead />

<div class="calendar-activity-page calendar-activity-page--{data.activity.slug}">
	<div class="calendar-activity-page__content">
		<ActivityBookingPage activity={data.activity} upcoming={data.upcoming} recent={data.recent} mockMode={data.mockMode === true} />
	</div>
</div>
