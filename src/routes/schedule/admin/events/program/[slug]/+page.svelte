<script lang="ts">
	import { AdminProgramPage } from '@calendar/ui/admin'
	import type { AdminBootstrap } from '@calendar/core'

	const { data } = $props<{ data: { user: unknown | null; slug: string; bootstrap?: AdminBootstrap | null } }>()
</script>

<AdminProgramPage user={data.user} slug={data.slug} bootstrap={data.bootstrap} />
