<script>
	import '@calendar/theme/calendar.scss'
	import { CalendarShellLayout } from '@calendar/ui'

	const { data, children } = $props()
</script>

<CalendarShellLayout {data}>
	{@render children()}
</CalendarShellLayout>
