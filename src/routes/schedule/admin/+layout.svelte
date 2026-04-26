<script lang="ts">
	import { AdminRouteShell } from '@calendar/ui'
	import { NoIndexHead } from '$lib/app/seo'

	const { data, children } = $props<{
		data: { user: unknown | null }
		children: () => unknown
	}>()
</script>

<NoIndexHead />

<AdminRouteShell user={data.user}>
	{@render children()}
</AdminRouteShell>
