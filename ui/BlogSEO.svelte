<script>
	import { createMessageGetter } from '@goobits/blog/utils/index.js'
	import { blogConfig, defaultMessages } from '@goobits/blog/config/index.js'

	let { data, messages = {} } = $props()

	// Create message getter
	const getMessage = createMessageGetter({ ...defaultMessages, ...messages })
</script>

<svelte:head>
	{#if data.pageType === 'index'}
		<title>{getMessage('seoHomePageTitle', `${blogConfig.name} - ${blogConfig.appName || blogConfig.name}`)}</title>
		<meta name="description" content={getMessage('seoHomePageDescription', `${blogConfig.appName || blogConfig.name} - ${blogConfig.name}`)} />
	{:else if data.pageType === 'category' && data.category}
		<title>{getMessage('seoCategoryPageTitle', `${data.category} - ${blogConfig.name}`)}</title>
		<meta name="description" content={getMessage('seoCategoryPageDescription', `Posts in ${data.category} - ${blogConfig.name}`)} />
	{:else if data.pageType === 'tag' && data.tag}
		<title>{getMessage('seoTagPageTitle', `${data.tag} - ${blogConfig.name}`)}</title>
		<meta name="description" content={getMessage('seoTagPageDescription', `Posts tagged ${data.tag} - ${blogConfig.name}`)} />
	{:else if data.pageType === 'post' && data.post?.metadata?.fm}
		<title>{data.post.metadata.fm.title} - {blogConfig.appName || blogConfig.name}</title>
		<meta name="description" content={data.post.metadata.fm.excerpt || `${data.post.metadata.fm.title} - ${blogConfig.appName || blogConfig.name}`} />
	{/if}
</svelte:head>