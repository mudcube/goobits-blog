<script>
	import './Blog.scss'
	import Breadcrumbs from './Breadcrumbs.svelte'
	import { generateBreadcrumbs } from '../utils/breadcrumbUtils.js'

	let { data, children, messages = {} } = $props()

	// Make breadcrumb configuration reactive using $derived
	const breadcrumbConfig = $derived(generateBreadcrumbs(data))
</script>

{#key data.pageType + (data.category || '') + (data.tag || '') + (data.post?.path || '')}
	<main class="goo__container">
		<Breadcrumbs
			items={breadcrumbConfig.items}
			current={breadcrumbConfig.current}
			showHome={breadcrumbConfig.showHome}
			messages={messages}
		/>

		{@render children()}
	</main>
{/key}