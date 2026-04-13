<script>
	import { Seo, buildWebPageJsonLd, formatSeoLabel } from '$lib/app/seo'
	import { BlogResults } from '@miko/blog-legacy'

	let { data } = $props()
	const tag = $derived(data.tag)
	const title = $derived(formatSeoLabel(tag))
	const description = $derived(`Journal entries tagged ${title} from Miko Meow.`)
</script>

<Seo
	title={`Journal Tag: ${title}`}
	{description}
	path={`/journal/tag/${tag}/`}
	image="/media/journal-journaling.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: `/journal/tag/${tag}/`,
			title: `Journal Tag: ${title}`,
			description,
			type: 'CollectionPage'
		})
	]}
/>

<div class="journal-results journal-results--tag">
	<div class="journal-results__content">
		<BlogResults {...data} category={tag} type="tag"/>
	</div>
</div>
