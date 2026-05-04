<script lang="ts">
	import { AdminRouteShell } from '@calendar/ui'
	import { NoIndexHead } from '$lib/app/seo'

	const { data, children } = $props<{
		data: { user: unknown | null }
		children: () => unknown
	}>()
</script>

<NoIndexHead />

{#if data.user}
	<AdminRouteShell user={data.user}>
		{@render children()}
	</AdminRouteShell>
{:else}
	{@render children()}
{/if}
