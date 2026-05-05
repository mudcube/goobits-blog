<script lang="ts">
	import { Bell, LogOut, ShieldCheck, UserRound } from '@lucide/svelte'
	import { logoutCalendarSession } from '../api/calendar'
	import { getCalendarUiConfig } from '../config'
	import ProfileMenu from '../shared/ProfileMenu.svelte'

	type CalendarUser = {
		name?: string | null
		email?: string | null
		avatarUrl?: string | null
	}

	const { user, isAdmin = false } = $props<{
		user: CalendarUser
		isAdmin?: boolean
	}>()

	const calendarConfig = getCalendarUiConfig()
	const calendarBase = calendarConfig.routes.calendarBase
	const adminBase = calendarConfig.routes.adminBase

	async function handleLogout(close: () => void) {
		close()
		await logoutCalendarSession()
		window.location.href = calendarConfig.routes.calendarLoginPath
	}
</script>

<ProfileMenu {user}>
	{#snippet menu({ close })}
		<a
			class="profile-menu__item"
			role="menuitem"
			href={`${calendarBase}?mine=1`}
			onclick={close}
		>
			<Bell size={14} strokeWidth={1.8} /> My schedule
		</a>
		<a
			class="profile-menu__item"
			role="menuitem"
			href={`${calendarBase}/profile`}
			onclick={close}
		>
			<UserRound size={14} strokeWidth={1.8} /> Profile
		</a>
		{#if isAdmin}
			<a
				class="profile-menu__item"
				role="menuitem"
				href={adminBase}
				onclick={close}
			>
				<ShieldCheck size={14} strokeWidth={1.8} /> Admin
			</a>
		{/if}
		<button
			type="button"
			class="profile-menu__item"
			role="menuitem"
			onclick={() => void handleLogout(close)}
		>
			<LogOut size={14} strokeWidth={1.8} /> Log out
		</button>
	{/snippet}
</ProfileMenu>
