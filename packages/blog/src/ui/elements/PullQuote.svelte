<script lang="ts">
	import type { Snippet } from 'svelte'

	const {
		align = 'center',
		cite = '',
		children
	}: {
		align?: 'left' | 'center'
		cite?: string
		children?: Snippet
	} = $props()
</script>

<aside class="pullquote pullquote--{align}">
	<span class="pullquote__mark pullquote__mark--open" aria-hidden="true">“</span>
	<p class="pullquote__text">{@render children?.()}</p>
	<span class="pullquote__mark pullquote__mark--close" aria-hidden="true">”</span>
	{#if cite}
		<p class="pullquote__cite">— {cite}</p>
	{/if}
</aside>

<style>
	.pullquote {
		position: relative;
		margin: 1.75rem auto;
		max-width: 36rem;
		padding: 0.75rem 2.25rem 1.25rem;
	}

	.pullquote--center {
		text-align: center;
	}

	.pullquote--left {
		text-align: left;
	}

	.pullquote__mark {
		position: absolute;
		font-size: 3rem;
		line-height: 0.85;
		font-style: normal;
		font-weight: 400;
		color: color-mix(in srgb, var(--text) 18%, transparent);
		pointer-events: none;
		user-select: none;
	}

	.pullquote__mark--open {
		top: -0.6rem;
		left: 0;
	}

	.pullquote__mark--close {
		bottom: -1.4rem;
		right: 0;
	}

	.pullquote__text {
		position: relative;
		margin: 0;
		font-size: 1.3em;
		font-style: italic;
		font-weight: 400;
		line-height: 1.45;
		letter-spacing: -0.01em;
		color: color-mix(in srgb, var(--text) 88%, transparent);
		text-wrap: balance;
	}

	.pullquote__cite {
		margin: 0.85rem 0 0;
		font-size: 0.78em;
		font-style: normal;
		letter-spacing: 0.02em;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}
</style>
