<script lang="ts">
	import ShowcaseCollectionPage from '@src/domains/showcase/ShowcaseCollectionPage.svelte'
	import type { ShowcaseCollectionEntry } from '@src/domains/showcase/types'

	let { items }: { items: ShowcaseCollectionEntry[] } = $props()

	const description =
		'Browse internal prototypes, schedule experiments, booking flows, and route-level design explorations.'
</script>

<ShowcaseCollectionPage
	path="/dev/"
	seoTitle="Dev Prototypes"
	{description}
	eyebrow="Dev"
	title="Internal routes, sketches, and"
	titleAccent="prototype iterations"
	icon="/media/page-icons/labs-flask.png"
	iconAlt="Flask icon"
	intro="Internal booking experiments, schedule pickers, and route-level design explorations under active development."
	signalLabel={`Prototype Shelf No. ${String(items.length).padStart(3, '0')}`}
	gridTitle="Prototype Index"
	gridKicker="Internal experiments, booking flows, schedule concepts, and workbench routes"
	gridFilterLabel="View // Internal Prototypes"
	entries={items}
	ctaTitle="Need a prototype"
	ctaTitleAccent="moved into product?"
	ctaCopy="Turning a promising experiment into a production route, shared package component, or polished booking flow."
	ctaHref="/contact?from=dev&topic=prototype_to_product"
	ctaLinkLabel="Start a Conversation"
/>
