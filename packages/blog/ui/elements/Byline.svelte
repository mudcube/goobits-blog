<script lang="ts">
	const {
		name = '',
		preface = ''
	}: {
		name?: string
		preface?: string
	} = $props()
</script>

<footer class="byline">
	{#if preface}
		<span class="byline__preface">{preface}</span>
	{/if}
	{#if name}
		<span class="byline__name">{name}</span>
	{/if}
</footer>

<style>
	.byline {
		margin: 2.5rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		align-items: flex-start;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.byline__preface,
	.byline__name {
		font-size: 0.95em;
		line-height: 1.5;
	}
</style>
