<script lang="ts">
	import '@calendar/theme/admin.scss'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'

	const { data, children } = $props<{ data: { user: unknown | null }; children: () => unknown }>()

	const nav = [
		{ href: '/admin', label: 'Home', icon: '🏠' },
		{ href: '/admin/crew', label: 'Crew', icon: '👥' },
		{ href: '/admin/config', label: 'Config', icon: '⚙️' }
	]

	function active(path: string) {
		if (path === '/admin') return $page.url.pathname === '/admin' || $page.url.pathname === '/admin/'
		return $page.url.pathname === path || $page.url.pathname.startsWith(`${path}/`)
	}
</script>

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
		min-height: 100vh;
		display: grid;
		grid-template-columns: 220px 1fr;
		background: linear-gradient(180deg, #faf8ff 0%, #f8fafc 40%);
	}
	.social-admin__sidebar {
		padding: 1rem;
		border-right: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		background: color-mix(in srgb, #ffffff 85%, #f1f5f9 15%);
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
		color: #475569;
		font-weight: 600;
	}
	.social-admin__nav-item--active {
		background: color-mix(in srgb, #6366f1 14%, white);
		color: #4338ca;
	}
	.social-admin__logout {
		margin-top: auto;
	}
	.social-admin__logout button {
		width: 100%;
		padding: 0.6rem 0.8rem;
		border-radius: 0.75rem;
		border: 1px solid #cbd5e1;
		background: #fff;
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
			background: color-mix(in srgb, #ffffff 92%, #e2e8f0 8%);
			border-top: 1px solid #e2e8f0;
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
			color: #64748b;
			font-size: 0.75rem;
			font-weight: 600;
		}
		.social-admin__tab--active {
			background: color-mix(in srgb, #6366f1 16%, white);
			color: #4338ca;
		}
	}
</style>
