<script lang="ts">
	import { AdminRouteShell } from '@calendar/ui'

	const { data, children } = $props<{
		data: { user: unknown | null }
		children: () => unknown
	}>()
</script>

<AdminRouteShell user={data.user}>
	{@render children()}
</AdminRouteShell>
