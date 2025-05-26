<script>
	/**
	 * BlogRouter Component
	 * 
	 * Main router component that handles displaying the correct blog view
	 * based on the page type (index, category, tag, or post)
	 * 
	 * @component
	 */
	import BlogListPage from './BlogListPage.svelte'
	import BlogPostPage from './BlogPostPage.svelte'
	import BlogSEO from './BlogSEO.svelte'
	import BlogLayout from './BlogLayout.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {Object} data - Page data from server
	 * @property {boolean} [useSEO=true] - Whether to include SEO component
	 * @property {boolean} [useLayout=true] - Whether to wrap in BlogLayout
	 */
	
	let { 
		data, 
		useSEO = true, 
		useLayout = true,
		messages = {}
	} = $props()
</script>

{#if useSEO}
	<BlogSEO {data} />
{/if}

{#if useLayout}
	<BlogLayout {data} {messages}>
		{#if ['index', 'category', 'tag'].includes(data.pageType)}
			<BlogListPage {data} {messages} />
		{:else if data.pageType === 'post' && data.post}
			<BlogPostPage {data} {messages} />
		{/if}
	</BlogLayout>
{:else}
	{#if ['index', 'category', 'tag'].includes(data.pageType)}
		<BlogListPage {data} {messages} />
	{:else if data.pageType === 'post' && data.post}
		<BlogPostPage {data} {messages} />
	{/if}
{/if}