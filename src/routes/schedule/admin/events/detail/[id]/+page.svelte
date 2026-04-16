<script lang="ts">
	import { AdminEventDetailPage } from '@calendar/ui/admin'

	const { data } = $props<{ data: { user: unknown | null; eventId: string } }>()
</script>

<AdminEventDetailPage {data} />
