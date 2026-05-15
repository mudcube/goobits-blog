<script>
	import { PageShell } from '@goobits/ui'
	import { MikoBlogRouter } from '@goobits/blog-theme-miko'
	import JournalSeo from '$lib/app/seo/JournalSeo.svelte'

	let { data } = $props()
</script>

<JournalSeo {data} />

<PageShell className="showcase-page showcase-page--portfolio showcase-page--journal">
	<div class="showcase-page__inner">
		<MikoBlogRouter {data} useSEO={false} />
	</div>
</PageShell>
