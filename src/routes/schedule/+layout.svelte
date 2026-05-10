<script>
	import '@calendar/theme/member.scss'
	import { page } from '$app/stores'
	import { CalendarShellLayout } from '@calendar/ui'
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'
	import { getCalendarConfig } from '@calendar/core/config'

	const { data, children } = $props()
	const isAdminRoute = $derived($page.url.pathname.startsWith('/schedule/admin'))
	const calendarConfig = getCalendarConfig()
</script>

<NoIndexHead />

{#if isAdminRoute}
	{@render children()}
{:else}
	<CalendarShellLayout {data} logoSrc="/media/brand/logo.svg" logoAlt={calendarConfig.brand.siteName}>
		{@render children()}
	</CalendarShellLayout>
{/if}
