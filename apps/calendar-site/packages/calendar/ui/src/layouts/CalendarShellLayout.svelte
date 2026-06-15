<script lang="ts">
	import { page } from '$app/stores'
	import { Bell, CalendarPlus, LogOut, ShieldCheck, UserRound } from '@lucide/svelte'
	import { logoutCalendarSession } from '../api/calendar'
	import { getCalendarUiConfig } from '../config'
	import ProfileMenu from '../shared/ProfileMenu.svelte'
	import ShellNav from '../primitives/CalendarShellNav.svelte'

	const { data, children, logoSrc, logoAlt = 'Home' } = $props()
	const headerLinks = $derived([...(data.activities ?? [])].sort((a, b) => a.label.localeCompare(b.label)))

	const calendarConfig = getCalendarUiConfig()
	const calendarBase = calendarConfig.routes.calendarBase
	const adminBase = calendarConfig.routes.adminBase
	const brandLabel = calendarConfig.brand.siteName

	async function handleLogout(close: () => void) {
		close()
		await logoutCalendarSession()
		window.location.href = calendarConfig.routes.calendarLoginPath
	}
</script>

<div class="calendar-shell">
	<ShellNav
		homeHref="/"
		brandLabel={brandLabel}
		brandHref="/"
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
								href="/events/new"
								onclick={close}
							>
								<CalendarPlus size={14} strokeWidth={1.8} /> Create event
							</a>
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
				{:else}
					<a class="calendar-shell__auth-link" href={calendarConfig.routes.calendarLoginPath}>Sign in</a>
					<a class="calendar-shell__auth-link calendar-shell__auth-link--primary" href="/register">Register</a>
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

<style>
	.calendar-shell__nav-user {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.calendar-shell__auth-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.2rem;
		padding: 0 0.7rem;
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.45rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 78%, transparent);
		font-size: 0.84rem;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	.calendar-shell__auth-link--primary {
		border-color: color-mix(in srgb, #76e4b8 45%, transparent);
		background: #76e4b8;
		color: #08130f;
	}

	@media (max-width: 40em) {
		.calendar-shell__auth-link {
			padding-inline: 0.55rem;
		}
	}
</style>
