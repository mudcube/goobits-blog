<script>
	import { BlogSEO } from '@goobits/blog'
	import MikoArchivePage from './MikoArchivePage.svelte'
	import MikoEntryPage from './MikoEntryPage.svelte'
	import '../styles/miko-theme.scss'

	const { data, useSEO = true } = $props()
</script>

{#if useSEO}
	<BlogSEO {data} />
{/if}

{#if ['index', 'category', 'tag'].includes(data.pageType)}
	<MikoArchivePage {data} />
{:else if data.pageType === 'post' && data.post}
	<MikoEntryPage {data} />
{:else}
	<section class="miko-blog__unknown">
		<div class="miko-blog__unknown-inner">
			<p>Unknown page type: {data.pageType || 'undefined'}</p>
		</div>
	</section>
{/if}
