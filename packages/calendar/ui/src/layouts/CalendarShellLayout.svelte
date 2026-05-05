<script>
	import { page } from '$app/stores'
	import CalendarProfileMenu from './CalendarProfileMenu.svelte'
	import ShellNav from '../primitives/CalendarShellNav.svelte'
	const { data, children, logoSrc, logoAlt = 'Home' } = $props()
	const headerLinks = $derived([...(data.activities ?? [])].sort((a, b) => a.label.localeCompare(b.label)))
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
					<CalendarProfileMenu user={data.user} isAdmin={!!data.isAdmin} />
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
