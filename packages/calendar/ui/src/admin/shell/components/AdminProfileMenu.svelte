<script lang="ts">
	import { LogOut } from '@lucide/svelte'
	import { enhance } from '$app/forms'
	import { getCalendarUiConfig } from '../../../config'
	import ProfileMenu from '../../../shared/ProfileMenu.svelte'

	type AdminUser = {
		name?: string | null
		email?: string | null
		avatarUrl?: string | null
	}

	const { user } = $props<{ user: AdminUser }>()
	const calendarConfig = getCalendarUiConfig()
	const adminBase = calendarConfig.routes.adminBase
</script>

<ProfileMenu {user} className="admin-profile-menu">
	{#snippet menu({ close })}
		<form
			class="profile-menu__form"
			method="POST"
			action={`${adminBase}?/logout`}
			use:enhance={() => {
				close()
				return async ({ update }) => {
					await update()
				}
			}}
		>
			<button type="submit" class="profile-menu__item" role="menuitem">
				<LogOut size={14} strokeWidth={1.8} /> Log out
			</button>
		</form>
	{/snippet}
</ProfileMenu>

<style>
	:global(.admin-profile-menu) {
		--profile-menu-bg: var(--admin-control-bg);
		--profile-menu-bg-hover: var(--admin-control-bg-hover);
		--profile-menu-border: var(--admin-control-border);
		--profile-menu-fg: var(--admin-control-fg);
		--profile-menu-panel-bg: var(--admin-card-bg);
		--profile-menu-panel-border: var(--admin-card-border);
	}
</style>
