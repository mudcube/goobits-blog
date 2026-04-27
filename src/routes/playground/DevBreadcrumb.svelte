<script lang="ts">
	import { page } from '$app/stores'

	const crumbs = $derived.by(() => {
		const path = $page.url.pathname
		if (path === '/playground' || path === '/playground/') return []
		const segments = path.replace(/^\/dev\/?/, '').replace(/\/$/, '').split('/')
		const result: Array<{ label: string; href: string }> = [{ label: 'Playground', href: '/playground/' }]
		let href = '/playground'
		for (const seg of segments) {
			href += `/${seg}`
			result.push({ label: seg, href: `${href}/` })
		}
		return result
	})
</script>

{#if crumbs.length > 0}
	<nav class="dev-bc">
		{#each crumbs as crumb, i}
			{#if i > 0}<span class="dev-bc__sep">›</span>{/if}
			{#if i === crumbs.length - 1}
				<span class="dev-bc__current">{crumb.label}</span>
			{:else}
				<a class="dev-bc__link" href={crumb.href}>{crumb.label}</a>
			{/if}
		{/each}
	</nav>
{/if}

<style>
	.dev-bc { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.35rem; font-size: 0.6rem; font-weight: 600; }
	.dev-bc__link { color: color-mix(in srgb, var(--text) 38%, transparent); text-decoration: none; }
	.dev-bc__link:hover { color: color-mix(in srgb, var(--text) 65%, transparent); }
	.dev-bc__sep { color: color-mix(in srgb, var(--text) 20%, transparent); }
	.dev-bc__current { color: color-mix(in srgb, var(--text) 50%, transparent); }
</style>
