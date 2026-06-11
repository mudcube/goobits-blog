<script>
	import { CalendarHomePage } from '@calendar/ui'
	import NoIndexHead from '$lib/seo/NoIndexHead.svelte'

	let { data } = $props()
</script>

<NoIndexHead />

<CalendarHomePage {data} />
