<script lang="ts">
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { LogOut } from '@lucide/svelte'
	import { enhance } from '$app/forms'
	import { getCalendarUiConfig } from '../../../config'

	type AdminUser = {
		name?: string | null
		email?: string | null
	}

	const { user } = $props<{ user: AdminUser }>()
	const calendarConfig = getCalendarUiConfig()
	const adminBase = calendarConfig.routes.adminBase

	let open = $state(false)
	let rootEl: HTMLDivElement | undefined = $state()

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

	onMount(() => {
		const onClickAway = (e: MouseEvent) => {
			if (!open) return
			const target = e.target as HTMLElement | null
			if (rootEl && target && rootEl.contains(target)) return
			open = false
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && open) open = false
		}
		window.addEventListener('mousedown', onClickAway)
		window.addEventListener('keydown', onKey)
		return () => {
			window.removeEventListener('mousedown', onClickAway)
			window.removeEventListener('keydown', onKey)
		}
	})
</script>

<div bind:this={rootEl} class="admin-profile-menu">
	<button
		type="button"
		class="admin-profile-menu__avatar"
		aria-label="Account"
		aria-expanded={open}
		aria-haspopup="menu"
		onclick={() => (open = !open)}
	>
		{initials}
	</button>
	{#if open}
		<div
			class="admin-profile-menu__panel"
			role="menu"
			transition:fly={{ y: -4, duration: 140, easing: cubicOut }}
		>
			<div class="admin-profile-menu__header">
				<div class="admin-profile-menu__name">{displayName}</div>
				{#if displayEmail}
					<div class="admin-profile-menu__email">{displayEmail}</div>
				{/if}
			</div>
			<div class="admin-profile-menu__divider" aria-hidden="true"></div>
			<form
				class="admin-profile-menu__form"
				method="POST"
				action={`${adminBase}?/logout`}
				use:enhance
			>
				<button type="submit" class="admin-profile-menu__item" role="menuitem">
					<LogOut size={14} strokeWidth={1.8} /> Log out
				</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.admin-profile-menu {
		position: relative;
		display: inline-flex;
	}
	.admin-profile-menu__avatar {
		width: 32px;
		height: 32px;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.72rem;
		font-weight: 700;
		background: var(--admin-control-bg);
		color: var(--admin-control-fg);
		border: 1px solid var(--admin-control-border);
		cursor: pointer;
		transition:
			background 110ms ease,
			border-color 110ms ease,
			box-shadow 110ms ease,
			transform 110ms ease;
	}
	.admin-profile-menu__avatar:hover {
		background: var(--admin-control-bg-hover);
		box-shadow: 0 4px 14px var(--shadow-soft);
		transform: translateY(-1px);
	}
	.admin-profile-menu__panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		min-width: 12rem;
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		box-shadow: 0 14px 40px -10px color-mix(in srgb, black 28%, transparent);
		padding: 0.4rem 0;
		z-index: 30;
	}
	.admin-profile-menu__header {
		padding: 0.45rem 0.85rem 0.55rem;
	}
	.admin-profile-menu__name {
		font-size: 0.82rem;
		font-weight: 560;
		color: var(--text);
	}
	.admin-profile-menu__email {
		font-size: 0.72rem;
		font-weight: 400;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 54%, transparent);
		margin-top: 0.15rem;
	}
	.admin-profile-menu__divider {
		height: 1px;
		background: color-mix(in srgb, var(--text) 10%, transparent);
		margin: 0.3rem 0;
	}
	.admin-profile-menu__form {
		margin: 0;
	}
	.admin-profile-menu__item {
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
	}
	.admin-profile-menu__item:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--text);
	}
</style>
