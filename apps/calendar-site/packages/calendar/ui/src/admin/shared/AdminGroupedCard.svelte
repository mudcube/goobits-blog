<script lang="ts">
	import type { Snippet } from 'svelte'

	const { children }: { children: Snippet } = $props()
</script>

<div class="admin-grouped-card">
	{@render children()}
</div>

<style>
	.admin-grouped-card {
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		background: var(--admin-card-bg);
		overflow: hidden;
	}

	/* Add dividers between direct children for the grouped row pattern */
	.admin-grouped-card > :global(* + *) {
		border-top: 1px solid color-mix(in srgb, var(--admin-card-border) 60%, transparent);
	}
</style>
