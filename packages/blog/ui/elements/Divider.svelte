<script lang="ts">
	const {
		ornament = false
	}: {
		ornament?: boolean | string
	} = $props()

	const glyph = $derived(typeof ornament === 'string' ? ornament : '◇')
</script>

<div class="divider" class:divider--ornamented={ornament} role="separator" aria-hidden="true">
	<span class="divider__rule"></span>
	{#if ornament}
		<span class="divider__glyph">{glyph}</span>
		<span class="divider__rule"></span>
	{/if}
</div>

<style>
	.divider {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin: 3rem auto;
		max-width: 14rem;
		color: color-mix(in srgb, var(--text) 28%, transparent);
	}

	.divider__rule {
		flex: 1;
		height: 1px;
		background: color-mix(in srgb, var(--text) 20%, transparent);
		-webkit-mask-image: linear-gradient(to right, transparent, black 30%, black 70%, transparent);
		mask-image: linear-gradient(to right, transparent, black 30%, black 70%, transparent);
	}

	.divider--ornamented .divider__rule:first-child {
		-webkit-mask-image: linear-gradient(to right, transparent, black 90%);
		mask-image: linear-gradient(to right, transparent, black 90%);
	}

	.divider--ornamented .divider__rule:last-child {
		-webkit-mask-image: linear-gradient(to left, transparent, black 90%);
		mask-image: linear-gradient(to left, transparent, black 90%);
	}

	.divider__glyph {
		display: inline-block;
		flex-shrink: 0;
		font-size: 0.75rem;
		line-height: 1;
		opacity: 0.85;
	}
</style>
