<script lang="ts">
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { LogOut } from '@lucide/svelte'

	let {
		name,
		email,
		initials,
		onLogout
	}: {
		name: string
		email: string
		initials: string
		onLogout: () => void
	} = $props()

	let open = $state(false)
	let rootEl: HTMLDivElement | undefined = $state()

	onMount(() => {
		const onClickAway = (e: MouseEvent) => {
			if (!open) return
			const target = e.target as HTMLElement | null
			if (rootEl && target && rootEl.contains(target)) return
			open = false
		}
		window.addEventListener('mousedown', onClickAway)
		return () => window.removeEventListener('mousedown', onClickAway)
	})

	function handleLogout() {
		open = false
		onLogout()
	}
</script>

<div bind:this={rootEl} class="profile-menu">
	<button
		type="button"
		class="profile-menu__avatar"
		aria-label="Account"
		aria-expanded={open}
		aria-haspopup="menu"
		onclick={() => (open = !open)}
	>
		{initials}
	</button>
	{#if open}
		<div
			class="profile-menu__panel"
			role="menu"
			transition:fly={{ y: -4, duration: 140, easing: cubicOut }}
		>
			<div class="profile-menu__header">
				<div class="profile-menu__name">{name}</div>
				<div class="profile-menu__email">{email}</div>
			</div>
			<div class="profile-menu__divider" aria-hidden="true"></div>
			<button type="button" class="profile-menu__item" role="menuitem" onclick={handleLogout}>
				<LogOut size={14} strokeWidth={1.8} /> Log out
			</button>
		</div>
	{/if}
</div>

<style>
	.profile-menu {
		position: relative;
		display: inline-flex;
	}
	.profile-menu__avatar {
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.82rem;
		font-weight: 700;
		background: color-mix(in srgb, var(--admin-accent) 22%, transparent);
		color: var(--text);
		border: none;
		cursor: pointer;
	}
	.profile-menu__avatar:hover {
		background: color-mix(in srgb, var(--admin-accent) 32%, transparent);
	}
	.profile-menu__panel {
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
	.profile-menu__item {
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
	.profile-menu__item:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--text);
	}
</style>
