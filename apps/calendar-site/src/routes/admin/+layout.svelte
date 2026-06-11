<script lang="ts">
	import { onMount } from 'svelte'
	import { AdminRouteShell } from '@calendar/ui'
	import {
		hydrateAdminCalendarWeekStart,
		type AdminCalendarWeekStart
	} from '@calendar/ui/admin/shared/calendar-preferences'
	import { NoIndexHead } from '$lib/seo'

	const { data, children } = $props<{
		data: {
			user: unknown | null
			viewSettings?: { weekStart: AdminCalendarWeekStart }
		}
		children: () => unknown
	}>()

	onMount(() => {
		const weekStart = data.viewSettings?.weekStart
		if (weekStart) hydrateAdminCalendarWeekStart(weekStart)
	})
</script>

<NoIndexHead />

{#if data.user}
	<AdminRouteShell user={data.user}>
		{@render children()}
	</AdminRouteShell>
{:else}
	{@render children()}
{/if}
