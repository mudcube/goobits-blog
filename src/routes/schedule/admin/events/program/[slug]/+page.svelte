<script lang="ts">
	import { AdminProgramPage } from '@calendar/ui/admin'

	const { data } = $props<{ data: { user: unknown | null; slug: string } }>()
</script>

<AdminProgramPage user={data.user} slug={data.slug} />
