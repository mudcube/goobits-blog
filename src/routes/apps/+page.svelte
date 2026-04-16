<script>
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import { appsCollection, appsDescription, getAppImage } from '@src/domains/apps/catalog'
	import AppsPage from '@src/domains/apps/AppsPage.svelte'
</script>

<Seo
	title="Apps, Tools & Interactive Software"
	description={appsDescription}
	path="/apps/"
	image={getAppImage(appsCollection[0].id)}
	jsonLd={[
		buildWebPageJsonLd({
			path: '/apps/',
			title: 'Apps, Tools & Interactive Software',
			description: appsDescription,
			type: 'CollectionPage'
		})
	]}
/>

<AppsPage />
