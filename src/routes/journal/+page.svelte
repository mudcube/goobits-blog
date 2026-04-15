<script>
	import { PageShell } from '@miko/ui'
	import { MikoBlogRouter } from '@goobits/blog-theme-miko'

	let { data } = $props()
</script>

<PageShell className="showcase-page showcase-page--portfolio showcase-page--journal">
	<div class="showcase-page__inner">
		<MikoBlogRouter {data} />
	</div>
</PageShell>
