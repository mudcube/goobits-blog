<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import Tooltip from './Tooltip.svelte'

	type ProfileUser = {
		name?: string | null
		email?: string | null
		avatarUrl?: string | null
	}

	const {
		user,
		menu,
		className = '',
		ariaLabel = 'Account'
	} = $props<{
		user: ProfileUser
		menu: Snippet<[{ close: () => void }]>
		className?: string
		ariaLabel?: string
	}>()

	let open = $state(false)
	let avatarBroken = $state(false)
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

	function close() {
		open = false
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

<div bind:this={rootEl} class={`profile-menu ${className}`.trim()}>
	<Tooltip text={open ? '' : displayName} placement="bottom">
		<button
			type="button"
			class="profile-menu__avatar"
			aria-label={ariaLabel}
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
				<span class="profile-menu__initials">{initials}</span>
			{/if}
		</button>
	</Tooltip>
	{#if open}
		<div
			class="profile-menu__panel"
			role="menu"
			transition:fly={{ y: -4, duration: 140, easing: cubicOut }}
		>
			<div class="profile-menu__header">
				<div class="profile-menu__name">{displayName}</div>
				{#if displayEmail}
					<div class="profile-menu__email">{displayEmail}</div>
				{/if}
			</div>
			<div class="profile-menu__divider" aria-hidden="true"></div>
			{@render menu({ close })}
		</div>
	{/if}
</div>

<style>
	.profile-menu {
		position: relative;
		display: inline-flex;
	}
	.profile-menu__avatar {
		width: 32px;
		height: 32px;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		font: inherit;
		font-size: 0.72rem;
		font-weight: 700;
		background: var(--profile-menu-bg, color-mix(in srgb, var(--text) 6%, transparent));
		color: var(--profile-menu-fg, color-mix(in srgb, var(--text) 80%, transparent));
		border: 1px solid var(--profile-menu-border, color-mix(in srgb, var(--text) 14%, transparent));
		cursor: pointer;
		overflow: hidden;
		transition:
			background 160ms ease,
			border-color 160ms ease,
			box-shadow 160ms ease,
			transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.profile-menu__avatar:hover {
		background: var(--profile-menu-bg-hover, color-mix(in srgb, var(--text) 10%, transparent));
		border-color: var(--profile-menu-border-hover, color-mix(in srgb, var(--text) 22%, transparent));
		box-shadow: 0 2px 8px color-mix(in srgb, var(--text) 8%, transparent);
		transform: translateY(-1px);
	}
	.profile-menu__avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.profile-menu__initials {
		line-height: 1;
	}
	.profile-menu__panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		min-width: 13rem;
		background: var(--profile-menu-panel-bg, var(--bg));
		border: 1px solid var(--profile-menu-panel-border, color-mix(in srgb, var(--text) 12%, transparent));
		border-radius: 0.875rem;
		box-shadow: 0 14px 40px -10px color-mix(in srgb, black 28%, transparent);
		padding: 0.4rem 0;
		z-index: 30;
	}
	.profile-menu__header {
		padding: 0.45rem 0.85rem 0.55rem;
	}
	.profile-menu__name {
		font-size: 0.82rem;
		font-weight: 560;
		color: var(--text);
	}
	.profile-menu__email {
		font-size: 0.72rem;
		font-weight: 400;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 54%, transparent);
		margin-top: 0.15rem;
	}
	.profile-menu__divider {
		height: 1px;
		background: color-mix(in srgb, var(--text) 10%, transparent);
		margin: 0.3rem 0;
	}

	/* Menu items rendered via the snippet inherit these via :global so callers don't have to restyle. */
	.profile-menu__panel :global(.profile-menu__item) {
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
	.profile-menu__panel :global(.profile-menu__item:hover) {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--text);
	}
	.profile-menu__panel :global(form.profile-menu__form) {
		margin: 0;
	}
</style>
