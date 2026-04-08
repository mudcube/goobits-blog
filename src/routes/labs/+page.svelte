<script lang="ts">
	import DirectoryCatalogPage from '$lib/app/directory/DirectoryCatalogPage.svelte'
	import { labsCatalog } from '@src/domains/labs/viewmodel'
</script>

<svelte:head>
	<title>Labs - MIKO.ART</title>
</svelte:head>

<DirectoryCatalogPage
	eyebrow="Labs"
	title="Labs"
	icon="/media/labs-flask.png"
	iconAlt="Flask icon"
	subtitle="Playful experiments, sketches, and odd ideas."
	items={labsCatalog}
	emptyMessage="No experiments match your filters."
	itemLabel="experiment"
/>
