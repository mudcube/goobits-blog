<script lang="ts">
	import DirectoryCatalogPage from '$lib/app/directory/DirectoryCatalogPage.svelte'
	import type { DirectoryItem } from '$lib/app/directory/viewmodel'

	let { items }: { items: DirectoryItem[] } = $props()
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
	items={items}
	emptyMessage="No dev prototypes are available yet."
	itemLabel="prototype"
/>
