<script lang="ts">
	import type { Snippet } from 'svelte'
	let {
		brandLabel,
		brandHref,
		links = [],
		currentPath = '',
		right
	}: {
		brandLabel?: string
		brandHref?: string
		links?: Array<{ href?: string; label?: string }>
		currentPath?: string
		right?: Snippet
	} = $props()
</script>

<nav class="calendar-shell-nav">
	<div class="calendar-shell-nav__inner">
		<div class="calendar-shell-nav__left">
			{#if brandLabel}
				<a class="calendar-shell-nav__brand" href={brandHref || '/'}>{brandLabel}</a>
			{/if}
			{#if links.length}
				<div class="calendar-shell-nav__links">
					{#each links as link}
						{#if link?.href && link?.label}
							<a class={`calendar-shell-nav__link ${currentPath === link.href ? 'calendar-shell-nav__link--active' : ''}`} href={link.href}>{link.label}</a>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
		<div class="calendar-shell-nav__right">{@render right?.()}</div>
	</div>
</nav>

<style>
	.calendar-shell-nav {
		position: sticky;
		top: 0;
		z-index: 10;
		backdrop-filter: blur(8px);
		background: color-mix(in srgb, var(--calendar-shell-bg) 88%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
	}
	.calendar-shell-nav__inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		padding: 0.55rem 1rem;
	}
	.calendar-shell-nav__left { display: flex; align-items: center; gap: 0.8rem; min-width: 0; }
	.calendar-shell-nav__brand { color: var(--calendar-shell-text); text-decoration: none; font-weight: 700; }
	.calendar-shell-nav__links { display: flex; gap: 0.45rem; flex-wrap: wrap; }
	.calendar-shell-nav__link {
		text-decoration: none;
		color: color-mix(in srgb, var(--calendar-shell-text) 75%, transparent);
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
		font-size: 0.82rem;
	}
	.calendar-shell-nav__link--active {
		color: var(--calendar-shell-text);
		background: color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
	}
	.calendar-shell-nav__right { display: flex; align-items: center; gap: 0.45rem; }
</style>
