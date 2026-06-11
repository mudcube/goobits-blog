<script>
	import { CalendarProfilePage } from '@calendar/ui'
	import NoIndexHead from '$lib/seo/NoIndexHead.svelte'

	let { data } = $props()
</script>

<NoIndexHead />

<CalendarProfilePage {data} />
