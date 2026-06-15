<script lang="ts">
	import { CalendarDays, LayoutDashboard, Settings as SettingsIcon, Users } from '@lucide/svelte'
	import { getCalendarUiConfig } from '../../../config'
	import type { AdminNavSection } from '../route'

	type NavItem = {
		href: string
		label: string
		icon: typeof LayoutDashboard
		section: AdminNavSection
	}

	const { currentPath, currentSection, hrefWithMock } = $props<{
		currentPath: string
		currentSection: AdminNavSection
		hrefWithMock: (path: string) => string
	}>()
	const calendarConfig = getCalendarUiConfig()
	const adminBase = calendarConfig.routes.adminBase

	const primaryNav: NavItem[] = [
		{ href: `${adminBase}/`, label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
		{ href: `${adminBase}/crew/`, label: 'Crew', icon: Users, section: 'crew' },
		{ href: `${adminBase}/events/`, label: 'Events', icon: CalendarDays, section: 'events' },
		{ href: `${adminBase}/settings/`, label: 'Settings', icon: SettingsIcon, section: 'settings' }
	]

	function normalizePath(pathname: string) {
		return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
	}

	function active(item: NavItem) {
		const current = normalizePath(currentPath)
		const target = normalizePath(item.href)
		if (item.section === 'dashboard') return current === adminBase
		return currentSection === item.section && (current === target || current.startsWith(`${target}/`))
	}
</script>

<aside class="social-admin__sidebar">
	<a class="social-admin__brand" href={hrefWithMock(`${adminBase}/events/`)}>Admin</a>

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
</aside>
