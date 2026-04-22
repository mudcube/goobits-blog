<script lang="ts">
	import { page } from '$app/stores'
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'

	const { children } = $props()

	const crumbs = $derived.by(() => {
		const path = $page.url.pathname
		if (path === '/dev' || path === '/dev/') return []
		const segments = path.replace(/^\/dev\/?/, '').replace(/\/$/, '').split('/')
		const result: Array<{ label: string; href: string }> = [{ label: 'Dev', href: '/dev/' }]
		let href = '/dev'
		for (const seg of segments) {
			href += `/${seg}`
			result.push({ label: seg, href: `${href}/` })
		}
		return result
	})
</script>

<NoIndexHead />

{#if crumbs.length > 0}
	<nav class="dev-crumbs">
		{#each crumbs as crumb, i}
			{#if i > 0}<span class="dev-crumbs__sep">›</span>{/if}
			{#if i === crumbs.length - 1}
				<span class="dev-crumbs__current">{crumb.label}</span>
			{:else}
				<a class="dev-crumbs__link" href={crumb.href}>{crumb.label}</a>
			{/if}
		{/each}
	</nav>
{/if}

{@render children()}

<style>
	.dev-crumbs {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		max-width: var(--max-width-readable);
		margin: 0.75rem auto 0;
		padding: 0 var(--layout-inline-gutter, 1rem);
		font-size: 0.65rem;
		font-weight: 600;
	}
	.dev-crumbs__link {
		color: color-mix(in srgb, var(--text) 40%, transparent);
		text-decoration: none;
		transition: color 140ms;
	}
	.dev-crumbs__link:hover { color: color-mix(in srgb, var(--text) 70%, transparent); }
	.dev-crumbs__sep { color: color-mix(in srgb, var(--text) 22%, transparent); }
	.dev-crumbs__current { color: color-mix(in srgb, var(--text) 55%, transparent); }
</style>
