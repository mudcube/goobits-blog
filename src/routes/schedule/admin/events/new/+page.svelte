<script lang="ts">
	import { AdminNewEventPage } from '@calendar/ui/admin'

	const { data } = $props<{ data: { user: unknown | null } }>()
</script>

<AdminNewEventPage user={data.user} />
