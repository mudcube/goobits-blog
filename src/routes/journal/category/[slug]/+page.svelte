<script>
	import { Seo, buildWebPageJsonLd, formatSeoLabel } from '$lib/app/seo'
	import Results from '@src/domains/journal/components/Results.svelte'
	let { data } = $props()
	const title = $derived(formatSeoLabel(data.category))
	const description = $derived(`Journal entries in the ${title} category from Miko Meow.`)
</script>

<Seo
	title={`Journal Category: ${title}`}
	{description}
	path={`/journal/category/${data.category}/`}
	image="/media/journal-journaling.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: `/journal/category/${data.category}/`,
			title: `Journal Category: ${title}`,
			description,
			type: 'CollectionPage'
		})
	]}
/>

<div class="journal-results journal-results--category">
	<div class="journal-results__content">
		<Results {...data} type="category" />
	</div>
</div>
