<script>
	import ShellNav from '../primitives/CalendarShellNav.svelte'
import PillButton from '../primitives/CalendarPillButton.svelte'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { getCalendarUiConfig } from '../config'

	const { children, data, logoSrc, logoAlt = 'Home' } = $props()
	const calendarConfig = getCalendarUiConfig()
	const connectedNow = $derived($page.url.searchParams.get('connected') === '1')

	$effect(() => {
		if (!connectedNow) return
		// Clean up query param after showing notice.
		goto(`${calendarConfig.routes.adminBase}/overview`, { replaceState: true, keepFocus: true, noScroll: true })
	})
</script>

<div class="admin-root">
	<ShellNav
		currentPath={$page.url.pathname}
		showLogo={true}
		homeHref="/"
		{logoSrc}
		logoAlt={logoAlt}
	>
		{#snippet right()}
			<span class="admin-shell__nav-badge">Admin</span>
			{#if data.user}
				<form method="POST" action={`${calendarConfig.routes.adminBase}?/logout`} use:enhance>
					<PillButton className="admin-shell__nav-button" type="submit" size="sm" variant="secondary">
						Logout
					</PillButton>
				</form>
			{/if}
		{/snippet}
	</ShellNav>

	<div class="admin-shell__main">
		{#if connectedNow}
			<p class="admin-shell__notice admin-shell__notice--success">Google Calendar connected.</p>
		{/if}
		<div class="admin-shell__content">
			{@render children()}
		</div>
	</div>
</div>
