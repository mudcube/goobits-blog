<script>
	import { CalendarHomePage } from '@calendar/ui'
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'

	let { data } = $props()
</script>

<NoIndexHead />

<CalendarHomePage {data} />
