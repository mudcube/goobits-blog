<script>
	import '@calendar/theme/calendar.scss'
	import { page } from '$app/stores'
	import { CalendarShellLayout } from '@calendar/ui'

	const { data, children } = $props()
	const isAdminRoute = $derived($page.url.pathname.startsWith('/schedule/admin'))
</script>

{#if isAdminRoute}
	{@render children()}
{:else}
	<CalendarShellLayout {data}>
		{@render children()}
	</CalendarShellLayout>
{/if}
