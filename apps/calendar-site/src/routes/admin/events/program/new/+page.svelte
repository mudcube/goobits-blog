<script lang="ts">
	import { AdminNewProgramPage } from '@calendar/ui/admin'

	const { data } = $props<{ data: { user: unknown | null } }>()
</script>

<AdminNewProgramPage user={data.user} />
