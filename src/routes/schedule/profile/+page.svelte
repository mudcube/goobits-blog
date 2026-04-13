<script>
	import { CalendarProfilePage } from '@calendar/ui'
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'

	let { data } = $props()
</script>

<NoIndexHead />

<CalendarProfilePage {data} />
