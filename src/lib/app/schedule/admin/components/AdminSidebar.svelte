<script lang="ts">
	import { enhance } from '$app/forms'
	import {
		CalendarDays,
		LayoutDashboard,
		LogOut,
		Settings,
		Users
	} from '@lucide/svelte'
	import type { AdminNavSection } from '$lib/app/schedule/admin/route'

	type NavItem = {
		href: string
		label: string
		icon: typeof LayoutDashboard
		section: AdminNavSection
	}

	const { currentPath, currentSection, hrefWithMock, user } = $props<{
		currentPath: string
		currentSection: AdminNavSection
		hrefWithMock: (path: string) => string
		user: unknown | null
	}>()

	const primaryNav: NavItem[] = [
		{ href: '/schedule/admin/', label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
		{ href: '/schedule/admin/crew/', label: 'Crew', icon: Users, section: 'crew' },
		{ href: '/schedule/admin/events/', label: 'Events', icon: CalendarDays, section: 'events' }
	]

	const footerNav: NavItem[] = [
		{ href: '/schedule/admin/settings/', label: 'Settings', icon: Settings, section: 'settings' }
	]

	function normalizePath(pathname: string) {
		return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
	}

	function active(item: NavItem) {
		const current = normalizePath(currentPath)
		const target = normalizePath(item.href)
		if (item.section === 'dashboard') return current === '/schedule/admin'
		return currentSection === item.section && (current === target || current.startsWith(`${target}/`))
	}
</script>

<aside class="social-admin__sidebar">
	<a class="social-admin__brand" href={hrefWithMock('/schedule/admin/events/')}>Admin</a>

	<nav class="social-admin__nav" aria-label="Admin">
		{#each primaryNav as item}
			<a
				class="social-admin__nav-item"
				class:social-admin__nav-item--active={active(item)}
				aria-current={active(item) ? 'page' : undefined}
				href={hrefWithMock(item.href)}
			>
				<item.icon size={16} strokeWidth={1.8} />
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>

	<div class="social-admin__sidebar-spacer"></div>

	{#each footerNav as item}
		<a
			class="social-admin__nav-item"
			class:social-admin__nav-item--active={active(item)}
			aria-current={active(item) ? 'page' : undefined}
			href={hrefWithMock(item.href)}
		>
			<item.icon size={16} strokeWidth={1.8} />
			<span>{item.label}</span>
		</a>
	{/each}

	{#if user}
		<form class="social-admin__logout" method="POST" action="/schedule/admin?/logout" use:enhance>
			<button type="submit">
				<LogOut size={16} strokeWidth={1.8} />
				<span>Log out</span>
			</button>
		</form>
	{/if}
</aside>
