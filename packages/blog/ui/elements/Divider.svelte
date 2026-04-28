<script lang="ts">
	import type { Snippet } from 'svelte'

	const {
		ornament = '❦',
		children
	}: {
		ornament?: string
		children?: Snippet
	} = $props()
</script>

<div class="divider" role="separator" aria-hidden="true">
	<span class="divider__center">
		{#if children}
			{@render children()}
		{:else}
			<span class="divider__ornament">{ornament}</span>
		{/if}
	</span>
</div>

<style>
	.divider {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 1.5rem 0;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.divider__center {
		position: relative;
		display: inline-block;
		padding: 0 1.25rem;
		font-size: 0.72rem;
		font-weight: 500;
		font-style: italic;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		line-height: 1;
		white-space: nowrap;
	}

	.divider__center::before,
	.divider__center::after {
		content: '';
		position: absolute;
		top: 50%;
		height: 1px;
		background: color-mix(in srgb, var(--text) 22%, transparent);
		transform: translateY(-50%);
	}

	.divider__center::before {
		right: 100%;
		width: 5rem;
	}

	.divider__center::after {
		left: 100%;
		width: 5rem;
	}

	.divider__ornament {
		font-size: 1.4em;
		letter-spacing: 0;
		text-transform: none;
		font-style: normal;
		display: inline-block;
		line-height: 1;
		vertical-align: middle;
	}
</style>
