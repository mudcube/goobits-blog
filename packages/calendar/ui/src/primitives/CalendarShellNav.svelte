<script lang="ts">
	import type { Snippet } from 'svelte'
	let {
		homeHref = '/',
		showLogo = false,
		brandLabel,
		brandHref,
		links = [],
		linksAlign = 'left',
		currentPath = '',
		right
	}: {
		homeHref?: string
		showLogo?: boolean
		brandLabel?: string
		brandHref?: string
		links?: Array<{ href?: string; label?: string }>
		linksAlign?: 'left' | 'right'
		currentPath?: string
		right?: Snippet
	} = $props()
</script>

<nav class="calendar-shell-nav">
	<div class="calendar-shell-nav__inner">
		<div class="calendar-shell-nav__left">
			{#if showLogo}
				<a class="calendar-shell-nav__home" href={homeHref} aria-label="Home">
					<img src="/media/brand/logo.svg" alt="MIKO.ART" class="calendar-shell-nav__home-logo" />
				</a>
			{/if}
			{#if brandLabel}
				<a class="calendar-shell-nav__brand" href={brandHref || '/'}>{brandLabel}</a>
			{/if}
			{#if links.length && linksAlign === 'left'}
				<div class="calendar-shell-nav__links">
					{#each links as link}
						{#if link?.href && link?.label}
							<a class={`calendar-shell-nav__link ${currentPath === link.href ? 'calendar-shell-nav__link--active' : ''}`} href={link.href}>{link.label}</a>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
		<div class="calendar-shell-nav__right">
			{#if links.length && linksAlign === 'right'}
				<div class="calendar-shell-nav__links">
					{#each links as link}
						{#if link?.href && link?.label}
							<a class={`calendar-shell-nav__link ${currentPath === link.href ? 'calendar-shell-nav__link--active' : ''}`} href={link.href}>{link.label}</a>
						{/if}
					{/each}
				</div>
			{/if}
			{@render right?.()}
		</div>
	</div>
</nav>

<style>
	.calendar-shell-nav {
		position: sticky;
		top: 0;
		z-index: 10;
		backdrop-filter: blur(12px) saturate(110%);
		background: color-mix(in srgb, var(--calendar-shell-bg) 88%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
	}
	.calendar-shell-nav__inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		max-width: var(--max-width-readable);
		margin: 0 auto;
		width: 100%;
		padding: 0.55rem 1rem;
	}
	.calendar-shell-nav__left { display: flex; align-items: center; gap: 0.8rem; min-width: 0; }
	.calendar-shell-nav__home {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
	}
	.calendar-shell-nav__home-logo {
		display: block;
		height: 24px;
		width: auto;
	}
	.calendar-shell-nav__brand { color: var(--calendar-shell-text); text-decoration: none; font-weight: 700; }
	.calendar-shell-nav__links { display: flex; gap: 0.45rem; flex-wrap: wrap; }
	.calendar-shell-nav__link {
		text-decoration: none;
		color: color-mix(in srgb, var(--calendar-shell-text) 75%, transparent);
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
		font-family: var(--font-serif);
		font-size: 0.84rem;
		letter-spacing: 0.01em;
	}
	.calendar-shell-nav__link--active {
		color: var(--calendar-shell-text);
		background: color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
	}
	.calendar-shell-nav__right { display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
</style>
