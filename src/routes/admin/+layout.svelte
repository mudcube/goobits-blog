<script lang="ts">
	import '@calendar/theme/admin.scss'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { getCalendarUiConfig } from '@calendar/ui/config'
	import { LayoutDashboard, Users, CalendarDays, Settings, LogOut } from '@lucide/svelte'

	const { data, children } = $props<{ data: { user: unknown | null }; children: () => unknown }>()
	const calendarConfig = getCalendarUiConfig()

	const primaryNav = [
		{ href: '/admin/', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/admin/crew/', label: 'Crew', icon: Users },
		{ href: '/admin/events/', label: 'Events', icon: CalendarDays },
		{ href: '/admin/settings/', label: 'Settings', icon: Settings }
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
		if (pathname === '/admin/events' || pathname.startsWith('/admin/events/')) return 'Events'
		if (pathname === '/admin/settings' || pathname.startsWith('/admin/settings/')) return 'Settings'
		if (pathname === '/admin/config' || pathname.startsWith('/admin/config/')) return 'Settings'
		return 'Dashboard'
	}

	function breadcrumbs(pathname: string) {
		const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
		const items: Array<{ label: string; href?: string }> = [{ label: 'Admin', href: '/admin/' }]
		if (normalized === '/admin') return items
		if (normalized.startsWith('/admin/crew')) return [...items, { label: 'Crew' }]
		if (normalized === '/admin/settings' || normalized.startsWith('/admin/settings/')) return [...items, { label: 'Settings' }]
		if (normalized === '/admin/events') return [...items, { label: 'Events' }]
		if (normalized === '/admin/events/new') return [...items, { label: 'Events', href: '/admin/events/' }, { label: 'New Event' }]
		if (normalized.startsWith('/admin/events/program/')) return [...items, { label: 'Events', href: '/admin/events/' }, { label: 'Program Editor' }]
		if (normalized.startsWith('/admin/events/')) return [...items, { label: 'Events', href: '/admin/events/' }, { label: 'Event Detail' }]
		return [...items, { label: adminSectionTitle(normalized) }]
	}
</script>

<svelte:head>
	<title>{adminSectionTitle($page.url.pathname)} | {calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

<div class="social-admin">
	<header class="social-admin__header">
		<div class="social-admin__topbar">
			<nav class="social-admin__nav" aria-label="Admin">
				{#each primaryNav as item}
					<a class="social-admin__nav-item" class:social-admin__nav-item--active={active(item.href)} href={item.href}>
						<item.icon size={16} strokeWidth={1.8} />
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>
			<div class="social-admin__topbar-actions">
				{#if data.user}
					<form class="social-admin__logout" method="POST" action="/admin?/logout" use:enhance>
						<button type="submit">
							<LogOut size={16} strokeWidth={1.8} />
							<span>Log out</span>
						</button>
					</form>
				{/if}
			</div>
		</div>
		<nav class="social-admin__breadcrumbs" aria-label="Breadcrumbs">
			{#each breadcrumbs($page.url.pathname) as item, i}
				{#if item.href && i < breadcrumbs($page.url.pathname).length - 1}
					<a href={item.href}>{item.label}</a>
				{:else}
					<span>{item.label}</span>
				{/if}
				{#if i < breadcrumbs($page.url.pathname).length - 1}
					<span class="social-admin__crumb-sep">&rsaquo;</span>
				{/if}
			{/each}
		</nav>
	</header>

	<main class="social-admin__content">
		{@render children()}
	</main>
</div>

<style>
	.social-admin {
		--admin-content-width: 60rem;
		--admin-gutter: var(--space-5, 1.25rem);
		--admin-muted: var(--muted);
		--admin-border: var(--border);
		--admin-panel: var(--panel-bg);
		--admin-active-bg: var(--shell-nav-link-active-bg);
		--admin-active-fg: var(--shell-nav-link-active);
		--admin-hover-bg: var(--shell-nav-link-hover-bg);
		--admin-hover-fg: var(--shell-nav-link-hover);
		--admin-nav-link: var(--shell-nav-link);
		--admin-button-border: var(--shell-nav-button-border);
		--admin-button-hover-bg: var(--shell-nav-button-hover-bg);
		--admin-button-hover-border: var(--shell-nav-button-hover-border);
		min-height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr;
		background: var(--bg);
		color: var(--text);
	}

	/* --- Header (full-bleed bg, constrained contents) --- */
	.social-admin__header {
		display: grid;
		grid-template-columns: 1fr min(var(--admin-content-width), 100%) 1fr;
		background: var(--admin-panel);
		border-bottom: 1px solid var(--admin-border);
		box-shadow: 0 1px 3px var(--shadow-softest);
	}
	.social-admin__topbar {
		grid-column: 2;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.6rem var(--admin-gutter);
	}
	.social-admin__breadcrumbs {
		grid-column: 2;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.35rem;
		padding: 0.4rem var(--admin-gutter);
		border-top: 1px solid var(--admin-border);
		font-size: 0.76rem;
	}

	/* --- Nav --- */
	.social-admin__nav {
		display: flex;
		flex-direction: row;
		gap: 0.35rem;
		flex-wrap: wrap;
	}
	.social-admin__topbar-actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}
	.social-admin__nav-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 0.7rem;
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: var(--admin-nav-link);
		font-weight: 600;
		transition: background 0.15s, color 0.15s;
	}
	.social-admin__nav-item:hover {
		background: var(--admin-hover-bg);
		color: var(--admin-hover-fg);
	}
	.social-admin__nav-item:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: -2px;
	}
	.social-admin__nav-item--active {
		background: var(--admin-active-bg);
		color: var(--admin-active-fg);
	}

	/* --- Logout --- */
	.social-admin__logout {
		margin: 0;
	}
	.social-admin__logout button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.6rem 0.8rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--admin-button-border);
		background: var(--bg);
		color: var(--text);
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}
	.social-admin__logout button:hover {
		background: var(--admin-button-hover-bg);
		border-color: var(--admin-button-hover-border);
	}
	.social-admin__logout button:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: -2px;
	}

	/* --- Breadcrumbs --- */
	.social-admin__breadcrumbs a {
		color: var(--admin-hover-fg);
		text-decoration: none;
	}
	.social-admin__breadcrumbs span {
		color: var(--admin-muted);
	}
	.social-admin__breadcrumbs .social-admin__crumb-sep {
		color: var(--admin-muted);
		opacity: 0.65;
	}

	/* --- Content (same grid constraint as header) --- */
	.social-admin__content {
		display: grid;
		grid-template-columns: 1fr min(var(--admin-content-width), 100%) 1fr;
		padding-top: var(--admin-gutter);
		padding-bottom: var(--admin-gutter);
	}
	.social-admin__content > :global(*) {
		grid-column: 2;
		padding-left: var(--admin-gutter);
		padding-right: var(--admin-gutter);
	}

	/* --- Mobile --- */
	@media (max-width: 820px) {
		.social-admin {
			--admin-gutter: var(--space-3, 0.75rem);
		}
		.social-admin__topbar {
			flex-wrap: wrap;
			align-items: flex-start;
		}
		.social-admin__topbar-actions {
			margin-left: 0;
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
