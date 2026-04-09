<script lang="ts">
	import DirectoryCatalogPage from '$lib/app/directory/DirectoryCatalogPage.svelte'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import { labsCatalog } from '@src/domains/labs/viewmodel'

	const description =
		'Browse playful web experiments, prototypes, and creative coding labs from Miko Meow.'
</script>

<Seo
	title="Creative Coding Labs"
	{description}
	path="/labs/"
	image="/media/labs-flask.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: '/labs/',
			title: 'Creative Coding Labs',
			description,
			type: 'CollectionPage'
		})
	]}
/>

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
