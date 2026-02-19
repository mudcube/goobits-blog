<script lang="ts">
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { formatAdminDate } from '@calendar/ui/features/admin/admin'
	import { createAdminMembersController } from '@calendar/ui/features/members/admin/admin-members.svelte'
	import { AdminMembersPanel } from '@calendar/ui'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const members = createAdminMembersController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)

	$effect(() => {
		if (!authed) return
		members.load()
	})
</script>

{#if authed}
	<AdminMembersPanel {members} formatDate={formatAdminDate} />
{/if}
