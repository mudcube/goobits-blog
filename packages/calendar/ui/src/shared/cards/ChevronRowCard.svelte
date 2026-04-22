<script lang="ts">
	import { ChevronRight } from '@lucide/svelte'
	import type { Snippet } from 'svelte'

	const {
		compact = false,
		href = null,
		onclick,
		ariaLabel = undefined,
		start,
		children,
		end
	} = $props<{
		compact?: boolean
		href?: string | null
		onclick?: () => void
		ariaLabel?: string
		start?: Snippet
		children: Snippet
		end?: Snippet
	}>()
</script>

{#if href}
	<a class="chevron-row-card calendar-ui-card calendar-ui-card--interactive" class:chevron-row-card--compact={compact} aria-label={ariaLabel} href={href} onclick={onclick}>
		<div class="chevron-row-card__start">
			{@render start?.()}
		</div>
		<div class="chevron-row-card__body">
			{@render children()}
		</div>
		<div class="chevron-row-card__end" aria-hidden="true">
			{#if end}
				{@render end()}
			{:else}
				<ChevronRight size={16} strokeWidth={2} />
			{/if}
		</div>
	</a>
{:else}
	<button type="button" class="chevron-row-card calendar-ui-card calendar-ui-card--interactive" class:chevron-row-card--compact={compact} aria-label={ariaLabel} onclick={onclick}>
		<div class="chevron-row-card__start">
			{@render start?.()}
		</div>
		<div class="chevron-row-card__body">
			{@render children()}
		</div>
		<div class="chevron-row-card__end" aria-hidden="true">
			{#if end}
				{@render end()}
			{:else}
				<ChevronRight size={16} strokeWidth={2} />
			{/if}
		</div>
	</button>
{/if}

<style>
	.chevron-row-card {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 0.875rem;
		text-align: left;
		color: inherit;
		font: inherit;
		text-decoration: none;
	}

	.chevron-row-card--compact {
		padding: 0.625rem 0.875rem;
	}

	.chevron-row-card:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--text) 78%, transparent);
		outline-offset: 2px;
	}

	.chevron-row-card__start {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
	}

	.chevron-row-card__body {
		flex: 1;
		min-width: 0;
	}

	.chevron-row-card__end {
		color: color-mix(in srgb, var(--text) 36%, transparent);
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.chevron-row-card:hover .chevron-row-card__end {
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}
</style>
