<script lang="ts">
	import '@calendar/theme/admin.scss'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { getCalendarUiConfig } from '@calendar/ui/config'

	const { data, children } = $props<{ data: { user: unknown | null }; children: () => unknown }>()
	const calendarConfig = getCalendarUiConfig()

	const nav = [
		{ href: '/admin/', label: 'Home', icon: '🏠' },
		{ href: '/admin/crew/', label: 'Crew', icon: '👥' },
		{ href: '/admin/config/', label: 'Config', icon: '⚙️' }
	]

	function active(path: string) {
		const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path
		const current = $page.url.pathname.endsWith('/') && $page.url.pathname.length > 1
			? $page.url.pathname.slice(0, -1)
			: $page.url.pathname
		if (normalizedPath === '/admin') return current === '/admin'
		return current === normalizedPath || current.startsWith(`${normalizedPath}/`)
	}

	function adminSectionTitle(pathname: string) {
		if (pathname === '/admin/crew' || pathname.startsWith('/admin/crew/')) return 'Crew'
		if (pathname === '/admin/config' || pathname.startsWith('/admin/config/')) return 'Config'
		if (pathname.startsWith('/admin/events/')) return 'Event Detail'
		return 'Home'
	}
</script>

<svelte:head>
	<title>{adminSectionTitle($page.url.pathname)} | {calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

<div class="social-admin">
	<aside class="social-admin__sidebar">
		<div class="social-admin__brand">🌈 Social OS</div>
		<nav class="social-admin__nav" aria-label="Admin">
			{#each nav as item}
				<a class="social-admin__nav-item" class:social-admin__nav-item--active={active(item.href)} href={item.href}>
					<span aria-hidden="true">{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
		{#if data.user}
			<form class="social-admin__logout" method="POST" action="/admin?/logout" use:enhance>
				<button type="submit">Log out</button>
			</form>
		{/if}
	</aside>

	<main class="social-admin__content">{@render children()}</main>

	<nav class="social-admin__tabbar" aria-label="Admin Mobile">
		{#each nav as item}
			<a class="social-admin__tab" class:social-admin__tab--active={active(item.href)} href={item.href}>
				<span aria-hidden="true">{item.icon}</span>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
</div>

<style>
	.social-admin {
		--social-admin-muted: color-mix(in srgb, var(--text) 62%, transparent);
		--social-admin-border: color-mix(in srgb, var(--text) 12%, transparent);
		--social-admin-border-strong: color-mix(in srgb, var(--text) 18%, transparent);
		--social-admin-panel: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
		--social-admin-active-bg: color-mix(in srgb, var(--text) 10%, transparent);
		--social-admin-active-fg: var(--text);
		min-height: 100vh;
		display: grid;
		grid-template-columns: 220px 1fr;
		background: var(--bg);
		color: var(--text);
	}
	.social-admin__sidebar {
		padding: 1rem;
		border-right: 1px solid var(--social-admin-border);
		background: var(--social-admin-panel);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.social-admin__brand {
		font-size: 1rem;
		font-weight: 800;
		padding: 0.35rem 0.45rem;
	}
	.social-admin__nav {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.social-admin__nav-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 0.7rem;
		border-radius: 0.75rem;
		text-decoration: none;
		color: var(--social-admin-muted);
		font-weight: 600;
	}
	.social-admin__nav-item--active {
		background: var(--social-admin-active-bg);
		color: var(--social-admin-active-fg);
	}
	.social-admin__logout {
		margin-top: auto;
	}
	.social-admin__logout button {
		width: 100%;
		padding: 0.6rem 0.8rem;
		border-radius: 0.75rem;
		border: 1px solid var(--social-admin-border-strong);
		background: color-mix(in srgb, var(--bg) 92%, var(--text) 8%);
		color: var(--text);
		cursor: pointer;
	}
	.social-admin__content {
		padding: 1.25rem;
		padding-bottom: 4.5rem;
	}
	.social-admin__tabbar {
		display: none;
	}
	@media (max-width: 820px) {
		.social-admin {
			display: block;
		}
		.social-admin__sidebar {
			display: none;
		}
		.social-admin__content {
			padding: 0.85rem;
			padding-bottom: 5.25rem;
		}
		.social-admin__tabbar {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 0.35rem;
			padding: 0.45rem 0.55rem;
			background: var(--social-admin-panel);
			border-top: 1px solid var(--social-admin-border);
		}
		.social-admin__tab {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.15rem;
			min-height: 44px;
			border-radius: 0.6rem;
			text-decoration: none;
			color: var(--social-admin-muted);
			font-size: 0.75rem;
			font-weight: 600;
		}
		.social-admin__tab--active {
			background: var(--social-admin-active-bg);
			color: var(--social-admin-active-fg);
		}
	}
</style>
