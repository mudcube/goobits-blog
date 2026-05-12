<script lang="ts">
	import { page } from '$app/stores'
	import { Bell, LogOut, ShieldCheck, UserRound } from '@lucide/svelte'
	import { logoutCalendarSession } from '../api/calendar'
	import { getCalendarUiConfig } from '../config'
	import ProfileMenu from '../shared/ProfileMenu.svelte'
	import ShellNav from '../primitives/CalendarShellNav.svelte'

	const { data, children, logoSrc, logoAlt = 'Home' } = $props()
	const headerLinks = $derived([...(data.activities ?? [])].sort((a, b) => a.label.localeCompare(b.label)))

	const calendarConfig = getCalendarUiConfig()
	const calendarBase = calendarConfig.routes.calendarBase
	const adminBase = calendarConfig.routes.adminBase

	async function handleLogout(close: () => void) {
		close()
		await logoutCalendarSession()
		window.location.href = calendarConfig.routes.calendarLoginPath
	}
</script>

<div class="calendar-shell">
	<ShellNav
		homeHref="/"
		showLogo={true}
		{logoSrc}
		logoAlt={logoAlt}
		links={headerLinks}
		linksAlign="right"
		currentPath={$page.url.pathname}
	>
		{#snippet right()}
			<div class="calendar-shell__nav-user">
				{#if data.user}
					<ProfileMenu user={data.user}>
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
							{#if data.isAdmin}
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
				{/if}
			</div>
		{/snippet}
	</ShellNav>

	<div class="calendar-shell__layout">
		<main class="calendar-shell__main">
			{@render children()}
		</main>
	</div>
</div>
