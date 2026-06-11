<script>
	import '@calendar/theme/member.scss'
	import { page } from '$app/stores'
	import { CalendarShellLayout } from '@calendar/ui'
	import NoIndexHead from '$lib/seo/NoIndexHead.svelte'

	const { data, children } = $props()
	const isAdminRoute = $derived($page.url.pathname.startsWith('/admin'))
</script>

<NoIndexHead />

{#if isAdminRoute}
	{@render children()}
{:else}
	<CalendarShellLayout {data}>
		{@render children()}
	</CalendarShellLayout>
{/if}
