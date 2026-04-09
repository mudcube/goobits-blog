<script lang="ts">
	import {
		SITE_AUTHOR,
		SITE_DEFAULT_IMAGE,
		SITE_NAME,
		type JsonLdNode,
		serializeJsonLd,
		toAbsoluteAssetUrl,
		toAbsoluteSiteUrl,
		toPageTitle
	} from './meta'

	type SeoProps = {
		title: string
		description?: string
		path?: string
		image?: string
		type?: 'website' | 'article'
		noindex?: boolean
		jsonLd?: JsonLdNode[]
		publishedTime?: string
		modifiedTime?: string
	}

	const {
		title,
		description = '',
		path = '/',
		image = SITE_DEFAULT_IMAGE,
		type = 'website',
		noindex = false,
		jsonLd = [],
		publishedTime = '',
		modifiedTime = ''
	}: SeoProps = $props()

	const pageTitle = $derived(toPageTitle(title))
	const canonicalUrl = $derived(toAbsoluteSiteUrl(path))
	const imageUrl = $derived(toAbsoluteAssetUrl(image))
	const robots = $derived(noindex ? 'noindex, nofollow, noarchive' : 'index, follow')
	const jsonLdScriptClose = '</' + 'script>'
	const jsonLdMarkup = $derived(
		jsonLd
			.map(node => `<script type="application/ld+json">${serializeJsonLd(node)}${jsonLdScriptClose}`)
			.join('')
	)
</script>

<svelte:head>
	<title>{pageTitle}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	<meta name="author" content={SITE_AUTHOR} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={canonicalUrl} />

	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={pageTitle} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={imageUrl} />
	{#if type === 'article' && publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}
	{#if type === 'article' && modifiedTime}
		<meta property="article:modified_time" content={modifiedTime} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	<meta name="twitter:image" content={imageUrl} />

	{@html jsonLdMarkup}
</svelte:head>
