<script lang="ts">
	const {
		siteKey = ''
	} = $props<{
		siteKey?: string
	}>()
</script>

<svelte:head>
	{#if siteKey}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>
