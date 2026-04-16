<script>
	import { page } from '$app/stores'
	import { Bell, UserRound, LogOut } from '@lucide/svelte'
	import { logoutCalendarSession } from '../api/calendar'
	import { getCalendarUiConfig } from '../config'
	import PillButton from '../primitives/CalendarPillButton.svelte'
import ShellNav from '../primitives/CalendarShellNav.svelte'
	const { data, children } = $props()
	const headerLinks = $derived([...(data.activities ?? [])].sort((a, b) => a.label.localeCompare(b.label)))
	const calendarConfig = getCalendarUiConfig()

	async function logout() {
		await logoutCalendarSession()
		// Server-side auth middleware will handle redirects cleanly on next navigation.
		window.location.href = calendarConfig.routes.calendarLoginPath
	}
</script>

<div class="calendar-shell">
	<ShellNav
		homeHref="/"
		showLogo={true}
		logoSrc="/media/brand/logo.svg"
		logoAlt={calendarConfig.brand.siteName}
		links={headerLinks}
		linksAlign="right"
		currentPath={$page.url.pathname}
	>
		{#snippet right()}
			<div class="calendar-shell__nav-user">
				{#if data.user}
					<PillButton
						href={`${calendarConfig.routes.calendarBase}?mine=1`}
						variant="secondary"
						size="sm"
						className="calendar-shell__nav-button calendar-shell__nav-button--link"
						ariaLabel="My schedule"
					>
						<Bell size={13} />
						My schedule
					</PillButton>
					<PillButton
						href={`${calendarConfig.routes.calendarBase}/profile`}
						variant="secondary"
						size="sm"
						className="calendar-shell__nav-button calendar-shell__nav-button--link"
						ariaLabel="Profile"
					>
						<UserRound size={13} />
						Profile
					</PillButton>
					{#if data.user.avatarUrl}
						<img src={data.user.avatarUrl} alt="" class="calendar-shell__nav-avatar" />
					{/if}
					<PillButton onClick={logout} variant="secondary" size="sm" className="calendar-shell__nav-button">
						<LogOut size={13} />
						Log out
					</PillButton>
					{#if data.isAdmin}
						<PillButton
							href={calendarConfig.routes.adminBase}
							variant="primary"
							size="sm"
							className="calendar-shell__nav-button calendar-shell__nav-button--link"
							ariaLabel="Admin"
						>
							Admin
						</PillButton>
					{/if}
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
