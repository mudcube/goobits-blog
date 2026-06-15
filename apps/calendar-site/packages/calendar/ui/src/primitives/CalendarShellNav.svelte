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
		left,
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
		left?: Snippet
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
			{@render left?.()}
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
		--calendar-shell-nav-height: 3.25rem;
		position: sticky;
		top: 0;
		z-index: 10;
		backdrop-filter: blur(14px) saturate(120%);
		background: var(
			--shell-nav-bg,
			radial-gradient(circle at 78% 0.5rem, rgba(172, 138, 255, 0.12) 0%, rgba(172, 138, 255, 0) 20rem),
			radial-gradient(circle at 16% -1rem, rgba(76, 215, 246, 0.07) 0%, rgba(76, 215, 246, 0) 16rem),
			linear-gradient(180deg, rgba(6, 14, 32, 0.92) 0%, rgba(6, 14, 32, 0.82) 100%)
		);
		border-bottom: 1px solid var(--shell-nav-border, color-mix(in srgb, var(--calendar-shell-text) 10%, transparent));
	}
	.calendar-shell-nav__inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		max-width: var(--max-width-readable);
		margin: 0 auto;
		width: 100%;
		min-height: var(--calendar-shell-nav-height);
		padding: 0 1rem;
		box-sizing: border-box;
		min-width: 0;
		flex-wrap: nowrap;
	}
	.calendar-shell-nav__left {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		min-width: 0;
		flex-shrink: 0;
	}
	.calendar-shell-nav__home {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		text-decoration: none;
	}
	.calendar-shell-nav__home-logo {
		display: block;
		height: 24px;
		width: auto;
	}
	.calendar-shell-nav__brand { color: var(--calendar-shell-text); text-decoration: none; font-weight: 700; }
	.calendar-shell-nav__links {
		display: flex;
		gap: 0.25rem;
		flex-wrap: nowrap;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.calendar-shell-nav__links::-webkit-scrollbar {
		display: none;
	}
	.calendar-shell-nav__link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		text-decoration: none;
		color: var(--shell-nav-link, color-mix(in srgb, var(--calendar-shell-text) 75%, transparent));
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.84rem;
		letter-spacing: 0.01em;
		transition: background 150ms ease, color 150ms ease;
	}
	.calendar-shell-nav__link:hover {
		color: var(--shell-nav-link-hover, var(--calendar-shell-text));
		background: var(--shell-nav-link-hover-bg, color-mix(in srgb, var(--calendar-shell-text) 8%, transparent));
	}
	.calendar-shell-nav__link--active {
		color: var(--shell-nav-link-active, var(--calendar-shell-text));
		background: var(--shell-nav-link-active-bg, color-mix(in srgb, var(--calendar-shell-text) 14%, transparent));
	}
	.calendar-shell-nav__right {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.6rem;
		min-width: 0;
		flex: 1 1 auto;
	}

	@media (max-width: 25em) {
		.calendar-shell-nav__inner {
			gap: 0.25rem;
			padding-inline: 0.5rem;
		}
		.calendar-shell-nav__left { gap: 0.25rem; }
		.calendar-shell-nav__link { padding: 0.3rem 0.5rem; }
	}
</style>
