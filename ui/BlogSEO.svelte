<script>
	import { createMessageGetter } from '../utils/index.js'
	import { blogConfig, defaultMessages } from '../config/index.js'
	import { page } from '$app/state'

	let { data, messages = {} } = $props()

	// Create message getter
	const getMessage = $derived(createMessageGetter({ ...defaultMessages, ...messages }))
	const canonicalUrl = $derived(new URL(page.url.pathname, blogConfig.siteUrl || page.url.origin).toString())
	const title = $derived(getTitle())
	const description = $derived(getDescription())
	const image = $derived(data.post?.metadata?.fm?.image?.src)
	const jsonLdScript = $derived(`<script type="application/ld+json">${ JSON.stringify(createJsonLd()).replace(/</g, '\\u003c') }</scr` + 'ipt>')

	function getTitle() {
		if (data.pageType === 'index') {
			return getMessage(
				'homePageTitle',
				`${ blogConfig.name } - ${ blogConfig.appName || blogConfig.name }`,
				blogConfig.name,
				blogConfig.description
			)
		}
		if (data.pageType === 'category' && data.category) {
			return getMessage('categoryPageTitle', `${ data.category } - ${ blogConfig.name }`, data.category, blogConfig.name)
		}
		if (data.pageType === 'tag' && data.tag) {
			return getMessage('tagPageTitle', `${ data.tag } - ${ blogConfig.name }`, data.tag, blogConfig.name)
		}
		if (data.pageType === 'post' && data.post?.metadata?.fm) {
			return `${ data.post.metadata.fm.title } - ${ blogConfig.appName || blogConfig.name }`
		}
		return blogConfig.name
	}

	function getDescription() {
		if (data.pageType === 'index') {
			return getMessage(
				'homePageDescription',
				blogConfig.description,
				blogConfig.description,
				blogConfig.name
			)
		}
		if (data.pageType === 'category' && data.category) {
			return getMessage('categoryPageDescription', `Posts in ${ data.category } - ${ blogConfig.name }`, data.category, blogConfig.name)
		}
		if (data.pageType === 'tag' && data.tag) {
			return getMessage('tagPageDescription', `Posts tagged ${ data.tag } - ${ blogConfig.name }`, data.tag, blogConfig.name)
		}
		if (data.pageType === 'post' && data.post?.metadata?.fm) {
			return data.post.metadata.fm.excerpt || `${ data.post.metadata.fm.title } - ${ blogConfig.appName || blogConfig.name }`
		}
		return blogConfig.description
	}

	function createJsonLd() {
		const base = {
			'@context': 'https://schema.org',
			'@type': data.pageType === 'post' ? 'BlogPosting' : 'Blog',
			name: title,
			description,
			url: canonicalUrl,
			publisher: {
				'@type': 'Organization',
				name: 'Sketch.IO, Inc.',
				url: 'https://sketchpad.com/'
			}
		}
		if (data.pageType !== 'post') return base

		const metadata = data.post?.metadata?.fm || {}
		const authorName = typeof metadata.author === 'string'
			? metadata.author
			: metadata.author?.name || 'Sketchpad Team'
		return {
			...base,
			headline: metadata.title,
			datePublished: metadata.date || data.post?.date,
			author: {
				'@type': 'Person',
				name: authorName
			},
			...(image ? { image: new URL(image, canonicalUrl).toString() } : {})
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={data.pageType === 'post' ? 'article' : 'website'} />
	<meta property="og:url" content={canonicalUrl} />
	{#if image}
		<meta property="og:image" content={new URL(image, canonicalUrl).toString()} />
	{/if}
	<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if image}
		<meta name="twitter:image" content={new URL(image, canonicalUrl).toString()} />
	{/if}
	{@html jsonLdScript}
</svelte:head>
