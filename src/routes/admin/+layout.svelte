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
		{ href: '/admin/events/', label: 'Events', icon: CalendarDays }
	]

	const footerNav = [{ href: '/admin/settings/', label: 'Settings', icon: Settings }]

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
		const eventsSingleSegment = normalized.match(/^\/admin\/events\/([^/]+)$/)
		const eventLeaf = eventsSingleSegment?.[1] || ''
		const isEventId = /^\d+$/.test(eventLeaf)
		const prettyLeaf = (value: string) =>
			value
				.split('-')
				.filter(Boolean)
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(' ')
		if (normalized === '/admin') return items
		if (normalized.startsWith('/admin/crew')) return [...items, { label: 'Crew' }]
		if (normalized === '/admin/settings' || normalized.startsWith('/admin/settings/')) return [...items, { label: 'Settings' }]
		if (normalized === '/admin/events') return [...items, { label: 'Events' }]
		if (normalized === '/admin/events/new') return [...items, { label: 'Events', href: '/admin/events/' }, { label: 'New Event' }]
		if (normalized.startsWith('/admin/events/program/')) {
			const legacyLeaf = normalized.split('/').pop() || 'program'
			return [...items, { label: 'Events', href: '/admin/events/' }, { label: prettyLeaf(legacyLeaf) }]
		}
		if (eventsSingleSegment && !isEventId) return [...items, { label: 'Events', href: '/admin/events/' }, { label: prettyLeaf(eventLeaf) }]
		if (normalized.startsWith('/admin/events/')) return [...items, { label: 'Events', href: '/admin/events/' }, { label: 'Event Detail' }]
		return [...items, { label: adminSectionTitle(normalized) }]
	}

	function showBreadcrumbs(pathname: string) {
		return pathname.startsWith('/admin')
	}

	function normalizePath(pathname: string) {
		return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
	}

	function isProgramEditorRoute(pathname: string) {
		const normalized = normalizePath(pathname)
		const eventsSingleSegment = normalized.match(/^\/admin\/events\/([^/]+)$/)
		const eventLeaf = eventsSingleSegment?.[1] || ''
		const isEventId = /^\d+$/.test(eventLeaf)
		return !!(eventsSingleSegment && !isEventId)
	}

	function isEventsIndexRoute(pathname: string) {
		return normalizePath(pathname) === '/admin/events'
	}

	function isEventsNewRoute(pathname: string) {
		return normalizePath(pathname) === '/admin/events/new'
	}

	function isCrewRoute(pathname: string) {
		return normalizePath(pathname) === '/admin/crew'
	}

	function isDashboardRoute(pathname: string) {
		return normalizePath(pathname) === '/admin'
	}

	function triggerProgramEditorSettings() {
		window.dispatchEvent(new CustomEvent('admin-program-editor-toggle-settings'))
	}

	function triggerProgramEditorSave() {
		window.dispatchEvent(new CustomEvent('admin-program-editor-save'))
	}

	function triggerCrewInvite() {
		window.dispatchEvent(new CustomEvent('admin-crew-create-invite'))
	}
</script>

<svelte:head>
	<title>{adminSectionTitle($page.url.pathname)} | {calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

<div class="social-admin">
	{#if showBreadcrumbs($page.url.pathname)}
		<nav class="social-admin__breadcrumbs" aria-label="Breadcrumbs">
			<div class="social-admin__breadcrumbs-body">
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
			</div>
			{#if isProgramEditorRoute($page.url.pathname)}
				<div class="social-admin__breadcrumbs-actions">
					<button type="button" class="admin-ui-btn" onclick={triggerProgramEditorSettings}>Settings</button>
					<button type="button" class="admin-ui-btn admin-ui-btn--primary" onclick={triggerProgramEditorSave}>Save</button>
				</div>
			{:else if isDashboardRoute($page.url.pathname)}
				<div class="social-admin__breadcrumbs-actions">
					<a class="admin-ui-btn admin-ui-btn--primary social-admin__breadcrumbs-btn-link" href="/admin/events/new/">+ New</a>
				</div>
			{:else if isEventsIndexRoute($page.url.pathname)}
				<div class="social-admin__breadcrumbs-actions">
					<a class="admin-ui-btn admin-ui-btn--primary social-admin__breadcrumbs-btn-link" href="/admin/events/new/">+ New Event</a>
				</div>
			{:else if isEventsNewRoute($page.url.pathname)}
				<div class="social-admin__breadcrumbs-actions">
					<a class="admin-ui-btn social-admin__breadcrumbs-btn-link" href="/admin/events/">Back to Events</a>
				</div>
			{:else if isCrewRoute($page.url.pathname)}
				<div class="social-admin__breadcrumbs-actions">
					<button type="button" class="admin-ui-btn admin-ui-btn--primary" onclick={triggerCrewInvite}>Invite Friend</button>
				</div>
			{/if}
		</nav>
	{/if}

	<aside class="social-admin__sidebar">
		<a class="social-admin__brand" href="/admin/events/">Rainbow Gym</a>
		<nav class="social-admin__nav" aria-label="Admin">
			{#each primaryNav as item}
				<a class="social-admin__nav-item" class:social-admin__nav-item--active={active(item.href)} href={item.href}>
					<item.icon size={16} strokeWidth={1.8} />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
		<div class="social-admin__sidebar-spacer"></div>
		{#each footerNav as item}
			<a class="social-admin__nav-item" class:social-admin__nav-item--active={active(item.href)} href={item.href}>
				<item.icon size={16} strokeWidth={1.8} />
				<span>{item.label}</span>
			</a>
		{/each}
		{#if data.user}
			<form class="social-admin__logout" method="POST" action="/admin?/logout" use:enhance>
				<button type="submit">
					<LogOut size={16} strokeWidth={1.8} />
					<span>Log out</span>
				</button>
			</form>
		{/if}
	</aside>

	<main class="social-admin__main">
		{@render children()}
	</main>
</div>

<style>
	.social-admin {
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
		--admin-control-radius: 0.625rem;
		--admin-control-border: color-mix(in srgb, var(--text) 18%, transparent);
		--admin-control-bg: color-mix(in srgb, var(--panel-bg) 88%, var(--text) 12%);
		--admin-control-bg-hover: color-mix(in srgb, var(--panel-bg) 78%, var(--text) 22%);
		--admin-control-fg: color-mix(in srgb, var(--text) 92%, transparent);
		--admin-control-primary-bg: color-mix(in srgb, #111 84%, var(--text) 16%);
		--admin-control-primary-fg: #fff;
		--admin-control-danger-bg: color-mix(in srgb, #ef4444 86%, var(--bg) 14%);
		--admin-control-danger-fg: #fff;
		--admin-selected-border: color-mix(in srgb, var(--text) 38%, transparent);
		--admin-selected-bg: color-mix(in srgb, var(--text) 11%, var(--bg) 89%);
		--admin-focus-ring: color-mix(in srgb, #0a84ff 52%, transparent);
		min-height: 100vh;
		min-width: 0;
		display: grid;
		grid-template-columns: 13.75rem 1fr;
		grid-template-rows: auto 1fr;
		background: var(--bg);
		color: var(--text);
		overflow-x: clip;
	}

	:global(.social-admin :is(button, a, input, select, textarea):focus-visible) {
		outline: 2px solid var(--admin-focus-ring);
		outline-offset: 2px;
	}

	:global(.social-admin .admin-ui-card) {
		border-radius: 14px;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--bg) 95%, var(--text) 5%);
		box-shadow: 0 1px 2px var(--shadow-softest);
	}

	:global(.social-admin .admin-ui-btn) {
		min-height: 32px;
		padding: 0 0.9rem;
		border-radius: var(--admin-control-radius);
		border: 1px solid var(--admin-control-border);
		background: var(--admin-control-bg);
		color: var(--admin-control-fg);
		font-size: 0.78rem;
		font-weight: 650;
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
	}

	:global(.social-admin .admin-ui-btn:hover:not(:disabled)) {
		background: var(--admin-control-bg-hover);
	}

	:global(.social-admin .admin-ui-btn:disabled) {
		opacity: 0.45;
		cursor: default;
	}

	:global(.social-admin .admin-ui-btn--primary) {
		background: var(--admin-control-primary-bg);
		border-color: var(--admin-control-primary-bg);
		color: var(--admin-control-primary-fg);
	}

	:global(.social-admin .admin-ui-btn--primary:hover:not(:disabled)) {
		opacity: 0.92;
	}

	:global(.social-admin .admin-ui-btn--danger) {
		background: var(--admin-control-danger-bg);
		color: var(--admin-control-danger-fg);
		border-color: color-mix(in srgb, #ef4444 65%, transparent);
	}

	:global(.social-admin .admin-ui-input) {
		width: 100%;
		min-height: 36px;
		padding: 0 0.72rem;
		border-radius: 8px;
		border: 1px solid var(--admin-control-border);
		background: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 0.86rem;
	}

	:global(.social-admin .admin-ui-input:focus) {
		outline: none;
		border-color: var(--admin-selected-border);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-focus-ring) 45%, transparent);
	}

	:global(.social-admin .admin-ui-chip) {
		min-height: 32px;
		padding: 0 0.65rem;
		border-radius: 20px;
		border: 1px solid var(--admin-control-border);
		background: color-mix(in srgb, var(--bg) 96%, var(--text) 4%);
		color: color-mix(in srgb, var(--admin-control-fg) 70%, transparent);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
	}

	:global(.social-admin .admin-ui-chip:hover) {
		background: var(--admin-control-bg-hover);
		color: var(--admin-control-fg);
	}

	:global(.social-admin .admin-ui-chip--active) {
		background: var(--admin-selected-bg);
		border-color: var(--admin-selected-border);
		color: var(--admin-control-fg);
	}

	/* --- Sidebar --- */
	.social-admin__sidebar {
		grid-row: 1 / span 2;
		grid-column: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 2rem 1rem 1.5rem 1.25rem;
		border-right: 1px solid color-mix(in srgb, var(--admin-border) 60%, transparent);
		min-width: 0;
		overflow-x: clip;
		overflow-y: auto;
		max-height: 100vh;
	}

	.social-admin__brand {
		display: inline-flex;
		align-items: center;
		padding: 0 0.5rem;
		margin-bottom: 1.2rem;
		color: var(--text);
		text-decoration: none;
		font-size: 0.81rem;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.social-admin__nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.social-admin__sidebar-spacer {
		flex: 1;
		min-height: 0.75rem;
	}

	.social-admin__nav-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 400;
		line-height: 1.25;
		text-decoration: none;
		color: var(--admin-nav-link);
		background: transparent;
		cursor: pointer;
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
		font-weight: 500;
	}

	/* --- Logout --- */
	.social-admin__logout {
		margin: 0;
	}
	.social-admin__logout button {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		border: none;
		background: transparent;
		color: color-mix(in srgb, var(--admin-muted) 80%, var(--text));
		font-size: 0.8125rem;
		font-weight: 400;
		font-family: inherit;
		line-height: 1.25;
		cursor: pointer;
		text-align: left;
		transition: color 0.15s, background 0.15s;
	}
	.social-admin__logout button:hover {
		color: var(--text);
		background: color-mix(in srgb, var(--text) 3.5%, transparent);
	}
	.social-admin__logout button:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: -2px;
	}

	/* --- Breadcrumbs (top bar, spans full width) --- */
	.social-admin__breadcrumbs {
		grid-column: 2;
		grid-row: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem 1.25rem;
		min-height: 2.5rem;
		border-bottom: 1px solid color-mix(in srgb, var(--admin-border) 60%, transparent);
		font-size: 0.76rem;
		box-sizing: border-box;
	}
	.social-admin__breadcrumbs-body {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		gap: 0.35rem;
		min-width: 0;
		overflow: hidden;
	}
	.social-admin__breadcrumbs-body > a {
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
	.social-admin__breadcrumbs-actions {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}
	.social-admin__breadcrumbs-btn-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		white-space: nowrap;
	}
	.social-admin__breadcrumbs-btn-link:hover {
		text-decoration: none;
	}

	/* --- Main content (left-aligned, no centering) --- */
	.social-admin__main {
		grid-row: 2;
		grid-column: 2;
		width: min(100%, 72rem);
		padding: 1.25rem 1.25rem 1.75rem;
		min-width: 0;
		overflow-x: clip;
	}

	/* --- Mobile: collapse sidebar to horizontal strip --- */
	@media (max-width: 820px) {
		.social-admin {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto 1fr;
		}
		.social-admin__breadcrumbs {
			grid-column: 1;
			grid-row: 1;
			padding: 0.5rem 1rem;
		}
		.social-admin__breadcrumbs-body {
			min-width: 0;
		}
		.social-admin__sidebar {
			grid-row: 2;
			grid-column: 1;
			flex-direction: row;
			align-items: center;
			gap: 0.25rem;
			padding: 0.6rem 1rem;
			border-right: none;
			border-bottom: 1px solid color-mix(in srgb, var(--admin-border) 60%, transparent);
			overflow-x: auto;
			overflow-y: hidden;
			max-height: none;
			-webkit-overflow-scrolling: touch;
		}
		.social-admin__brand { display: none; }
		.social-admin__nav {
			flex-direction: row;
			gap: 0.25rem;
			flex-wrap: nowrap;
		}
		.social-admin__sidebar-spacer {
			flex: 1;
			min-height: 0;
			min-width: 0.5rem;
		}
		.social-admin__nav-item {
			white-space: nowrap;
		}
		.social-admin__logout button {
			white-space: nowrap;
		}
		.social-admin__main {
			grid-row: 3;
			grid-column: 1;
			padding: 1.5rem 1rem;
		}
	}
</style>
