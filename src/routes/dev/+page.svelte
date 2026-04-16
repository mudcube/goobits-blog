<script lang="ts">
	import DirectoryCatalogPage from '$lib/app/directory/DirectoryCatalogPage.svelte'

	let { data } = $props<{ data: { items: { href: string; title: string; vibe: string; date?: string }[] } }>()
</script>

<svelte:head>
	<title>Dev - MIKO.ART</title>
</svelte:head>

<DirectoryCatalogPage
	eyebrow="Dev"
	title="Dev"
	icon="/media/page-icons/labs-flask.png"
	iconAlt="Flask icon"
	subtitle="Internal prototypes and route-level design explorations."
	items={data.items}
	emptyMessage="No dev prototypes are available yet."
	itemLabel="prototype"
/>
