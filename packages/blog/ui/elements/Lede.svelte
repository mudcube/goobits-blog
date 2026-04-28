<script lang="ts">
	import type { Snippet } from 'svelte'

	const { children }: { children?: Snippet } = $props()
</script>

<p class="lede">{@render children?.()}</p>

<style>
	.lede {
		margin: 0 0 1.5rem;
		font-family: var(--font-serif, var(--font-display));
		font-size: clamp(1.05rem, 2vw, 1.25rem);
		font-style: italic;
		font-weight: 400;
		line-height: 1.55;
		letter-spacing: -0.005em;
		color: color-mix(in srgb, var(--text) 72%, transparent);
		text-wrap: balance;
	}
</style>
