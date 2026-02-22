<script lang="ts">
	import { ChevronRight } from '@lucide/svelte'
	import type { Snippet } from 'svelte'

	const {
		compact = false,
		onclick,
		ariaLabel = undefined,
		start,
		children,
		end
	} = $props<{
		compact?: boolean
		onclick?: () => void
		ariaLabel?: string
		start?: Snippet
		children: Snippet
		end?: Snippet
	}>()
</script>

<button type="button" class="admin-chevron-row-card admin-ui-card admin-ui-card--interactive" class:admin-chevron-row-card--compact={compact} aria-label={ariaLabel} onclick={onclick}>
	<div class="admin-chevron-row-card__start">
		{@render start?.()}
	</div>
	<div class="admin-chevron-row-card__body">
		{@render children()}
	</div>
	<div class="admin-chevron-row-card__end" aria-hidden="true">
		{#if end}
			{@render end()}
		{:else}
			<ChevronRight size={16} strokeWidth={2} />
		{/if}
	</div>
</button>

<style>
	.admin-chevron-row-card {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 0.875rem;
		text-align: left;
		color: inherit;
		font: inherit;
	}

	.admin-chevron-row-card--compact {
		padding: 0.625rem 0.875rem;
	}

	.admin-chevron-row-card:focus-visible { outline: none; }

	.admin-chevron-row-card__start {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
	}

	.admin-chevron-row-card__body {
		flex: 1;
		min-width: 0;
	}

	.admin-chevron-row-card__end {
		color: color-mix(in srgb, var(--text) 36%, transparent);
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.admin-chevron-row-card:hover .admin-chevron-row-card__end {
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}
</style>
