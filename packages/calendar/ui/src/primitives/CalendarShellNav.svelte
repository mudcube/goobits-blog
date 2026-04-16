<script lang="ts">
	import type { Snippet } from 'svelte'
	let {
		homeHref = '/',
		showLogo = false,
		logoSrc,
		logoAlt = 'Home',
		brandLabel,
		brandHref,
		links = [],
		linksAlign = 'left',
		currentPath = '',
		right
	}: {
		homeHref?: string
		showLogo?: boolean
		logoSrc?: string
		logoAlt?: string
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
			{#if showLogo && logoSrc}
				<a class="calendar-shell-nav__home" href={homeHref} aria-label={logoAlt}>
					<img src={logoSrc} alt={logoAlt} class="calendar-shell-nav__home-logo" />
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
		backdrop-filter: blur(14px) saturate(120%);
		background:
			radial-gradient(circle at 78% 0.5rem, rgba(172, 138, 255, 0.12) 0%, rgba(172, 138, 255, 0) 20rem),
			radial-gradient(circle at 16% -1rem, rgba(76, 215, 246, 0.07) 0%, rgba(76, 215, 246, 0) 16rem),
			linear-gradient(180deg, rgba(6, 14, 32, 0.92) 0%, rgba(6, 14, 32, 0.82) 100%);
		border-bottom: 1px solid color-mix(in srgb, var(--calendar-shell-text) 10%, transparent);
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
		transition: background 150ms ease, color 150ms ease;
	}
	.calendar-shell-nav__link:hover {
		color: var(--calendar-shell-text);
		background: color-mix(in srgb, var(--calendar-shell-text) 8%, transparent);
	}
	.calendar-shell-nav__link--active {
		color: var(--calendar-shell-text);
		background: color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
	}
	.calendar-shell-nav__right { display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
</style>
