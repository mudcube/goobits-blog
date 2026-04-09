<script lang="ts">
	import type { Snippet } from 'svelte'

	type PageShellProps = {
		className?: string
		children?: Snippet
	}

	const { className = '', children }: PageShellProps = $props()
</script>

<div class={`ui-page-shell ${className}`.trim()}>
	{@render children?.()}
</div>

<style>
	.ui-page-shell {
		--page-shell-space-top: 3.1rem;
		--page-shell-space-bottom: 5.25rem;
		--page-shell-space-top-mobile: 2.4rem;

		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width-readable))
			minmax(var(--layout-inline-gutter), 1fr);
		width: 100%;
		box-sizing: border-box;
		padding-top: var(--page-shell-space-top);
		padding-bottom: var(--page-shell-space-bottom);
	}

	.ui-page-shell > :global(*) {
		grid-column: 2;
		min-width: 0;
	}

	@media (max-width: 760px) {
		.ui-page-shell {
			padding-top: var(--page-shell-space-top-mobile);
		}
	}
</style>
