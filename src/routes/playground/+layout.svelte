<script lang="ts">
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'

	const { children } = $props()
</script>

<NoIndexHead />

{@render children()}
