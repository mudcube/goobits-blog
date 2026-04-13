<script lang="ts">
	import { page } from '$app/stores'
	import { toAbsoluteSiteUrl } from './meta'

	const canonicalUrl = $derived(toAbsoluteSiteUrl($page.url.pathname))
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow, noarchive" />
	<link rel="canonical" href={canonicalUrl} />
</svelte:head>
