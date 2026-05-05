<script lang="ts">
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { Bell, LogOut, ShieldCheck, UserRound } from '@lucide/svelte'
	import { logoutCalendarSession } from '../api/calendar'
	import { getCalendarUiConfig } from '../config'

	type CalendarUser = {
		name?: string | null
		email?: string | null
		avatarUrl?: string | null
	}

	const { user, isAdmin = false } = $props<{
		user: CalendarUser
		isAdmin?: boolean
	}>()

	const calendarConfig = getCalendarUiConfig()
	const calendarBase = calendarConfig.routes.calendarBase
	const adminBase = calendarConfig.routes.adminBase

	let open = $state(false)
	let rootEl: HTMLDivElement | undefined = $state()
	let avatarBroken = $state(false)

	const displayName = $derived(user?.name?.trim() || user?.email?.trim() || 'Account')
	const displayEmail = $derived(user?.email?.trim() || '')
	const initials = $derived(deriveInitials(displayName))

	function deriveInitials(label: string): string {
		const trimmed = label.trim()
		if (!trimmed) return '?'
		const parts = trimmed.split(/\s+/).filter(Boolean)
		if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase()
		return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
	}

	async function handleLogout() {
		open = false
		await logoutCalendarSession()
		window.location.href = calendarConfig.routes.calendarLoginPath
	}

	onMount(() => {
		const onClickAway = (event: MouseEvent) => {
			if (!open) return
			const target = event.target as HTMLElement | null
			if (rootEl && target && rootEl.contains(target)) return
			open = false
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && open) open = false
		}
		window.addEventListener('mousedown', onClickAway)
		window.addEventListener('keydown', onKey)
		return () => {
			window.removeEventListener('mousedown', onClickAway)
			window.removeEventListener('keydown', onKey)
		}
	})
</script>

<div bind:this={rootEl} class="calendar-profile-menu">
	<button
		type="button"
		class="calendar-profile-menu__avatar"
		aria-label="Account"
		aria-expanded={open}
		aria-haspopup="menu"
		onclick={() => (open = !open)}
	>
		{#if user?.avatarUrl && !avatarBroken}
			<img
				src={user.avatarUrl}
				alt=""
				referrerpolicy="no-referrer"
				loading="lazy"
				decoding="async"
				onerror={() => (avatarBroken = true)}
			/>
		{:else}
			<span>{initials}</span>
		{/if}
	</button>
	{#if open}
		<div
			class="calendar-profile-menu__panel"
			role="menu"
			transition:fly={{ y: -4, duration: 140, easing: cubicOut }}
		>
			<div class="calendar-profile-menu__header">
				<div class="calendar-profile-menu__name">{displayName}</div>
				{#if displayEmail}
					<div class="calendar-profile-menu__email">{displayEmail}</div>
				{/if}
			</div>
			<div class="calendar-profile-menu__divider" aria-hidden="true"></div>
			<a
				class="calendar-profile-menu__item"
				role="menuitem"
				href={`${calendarBase}?mine=1`}
				onclick={() => (open = false)}
			>
				<Bell size={14} strokeWidth={1.8} /> My schedule
			</a>
			<a
				class="calendar-profile-menu__item"
				role="menuitem"
				href={`${calendarBase}/profile`}
				onclick={() => (open = false)}
			>
				<UserRound size={14} strokeWidth={1.8} /> Profile
			</a>
			{#if isAdmin}
				<a
					class="calendar-profile-menu__item"
					role="menuitem"
					href={adminBase}
					onclick={() => (open = false)}
				>
					<ShieldCheck size={14} strokeWidth={1.8} /> Admin
				</a>
			{/if}
			<div class="calendar-profile-menu__divider" aria-hidden="true"></div>
			<button
				type="button"
				class="calendar-profile-menu__item"
				role="menuitem"
				onclick={() => void handleLogout()}
			>
				<LogOut size={14} strokeWidth={1.8} /> Log out
			</button>
		</div>
	{/if}
</div>

<style>
	.calendar-profile-menu {
		position: relative;
		display: inline-flex;
	}
	.calendar-profile-menu__avatar {
		width: 32px;
		height: 32px;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.72rem;
		font-weight: 700;
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: color-mix(in srgb, var(--text) 80%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		cursor: pointer;
		overflow: hidden;
		padding: 0;
		transition:
			background 110ms ease,
			border-color 110ms ease,
			box-shadow 110ms ease,
			transform 110ms ease;
	}
	.calendar-profile-menu__avatar:hover {
		background: color-mix(in srgb, var(--text) 10%, transparent);
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
		transform: translateY(-1px);
	}
	.calendar-profile-menu__avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.calendar-profile-menu__panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		min-width: 13rem;
		background: var(--bg);
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		border-radius: 0.875rem;
		box-shadow: 0 14px 40px -10px color-mix(in srgb, black 28%, transparent);
		padding: 0.4rem 0;
		z-index: 30;
	}
	.calendar-profile-menu__header {
		padding: 0.45rem 0.85rem 0.55rem;
	}
	.calendar-profile-menu__name {
		font-size: 0.82rem;
		font-weight: 560;
		color: var(--text);
	}
	.calendar-profile-menu__email {
		font-size: 0.72rem;
		font-weight: 400;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 54%, transparent);
		margin-top: 0.15rem;
	}
	.calendar-profile-menu__divider {
		height: 1px;
		background: color-mix(in srgb, var(--text) 10%, transparent);
		margin: 0.3rem 0;
	}
	.calendar-profile-menu__item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.85rem;
		border: none;
		background: transparent;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 500;
		color: color-mix(in srgb, var(--text) 72%, transparent);
		cursor: pointer;
		text-align: left;
		text-decoration: none;
	}
	.calendar-profile-menu__item:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--text);
	}
</style>
