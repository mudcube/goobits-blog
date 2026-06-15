<script lang="ts">
	import { tick, type Snippet } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'

	type Variant = 'dialog' | 'drawer'

	const {
		title,
		variant = 'dialog',
		ariaLabel,
		preventClose,
		topOffset,
		width,
		onClose,
		body,
		foot
	}: {
		title?: string
		variant?: Variant
		ariaLabel?: string
		preventClose?: () => boolean
		topOffset?: string
		width?: string
		onClose: () => void
		body: Snippet
		foot?: Snippet
	} = $props()

	let panelEl: HTMLDivElement | undefined = $state()

	$effect(() => {
		void tick().then(() => {
			panelEl?.querySelector<HTMLElement>('button, [tabindex="0"], input, select, textarea')?.focus()
		})
	})

	function attemptClose() {
		if (preventClose?.()) return
		onClose()
	}

	function handleKey(e: KeyboardEvent) {
		e.stopPropagation()
		if (e.key === 'Escape') attemptClose()
	}
</script>

<div
	class="admin-sheet"
	class:admin-sheet--drawer={variant === 'drawer'}
	style:--admin-sheet-top-offset={topOffset ?? null}
	role="presentation"
	onclick={attemptClose}
	onkeydown={handleKey}
	transition:fade={{ duration: 160 }}
>
	<div
		bind:this={panelEl}
		class="admin-sheet__panel"
		class:admin-sheet__panel--drawer={variant === 'drawer'}
		style:--admin-sheet-width={width ?? null}
		role="dialog"
		aria-modal="true"
		aria-label={ariaLabel ?? title}
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={handleKey}
		transition:fly={{
			y: variant === 'drawer' ? 0 : 12,
			x: variant === 'drawer' ? 24 : 0,
			duration: 200,
			easing: quintOut
		}}
	>
		{#if title}
			<header class="admin-sheet__head">
				<h3 class="admin-sheet__title">{title}</h3>
			</header>
		{/if}
		<div class="admin-sheet__body">
			{@render body()}
		</div>
		{#if foot}
			<footer class="admin-sheet__foot">
				{@render foot()}
			</footer>
		{/if}
	</div>
</div>

<style>
	.admin-sheet {
		position: fixed;
		inset: 0;
		/* Solid black scrim — dims toward black in both themes. Matches
		 * ConfirmModal so the two primitives read as design-system siblings
		 * (color-mix with --text drifts to washed-out in dark mode). */
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 100;
	}
	.admin-sheet--drawer {
		align-items: stretch;
		justify-content: flex-end;
		padding: 0;
		top: var(--admin-sheet-top-offset, 0);
	}

	.admin-sheet__panel {
		width: var(--admin-sheet-width, min(26rem, 100%));
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		/* Drop shadow matches ConfirmModal so both primitives elevate the
		 * same way against the scrim. */
		box-shadow: 0 24px 60px color-mix(in srgb, var(--text) 20%, transparent);
		display: grid;
		grid-template-rows: auto 1fr auto;
		max-height: 90vh;
		overflow: hidden;
	}
	.admin-sheet__panel--drawer {
		width: var(--admin-sheet-width, min(20rem, 90vw));
		height: 100%;
		max-height: 100%;
		border-radius: 0;
		border-left: 1px solid var(--admin-card-border);
		border-top: none;
		border-right: none;
		border-bottom: none;
	}

	.admin-sheet__head {
		padding: 1.05rem 1.15rem 0.55rem;
	}
	.admin-sheet__title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 580;
		letter-spacing: -0.005em;
		color: var(--text);
	}
	.admin-sheet__body {
		padding: 0.4rem 1.15rem 0.95rem;
		display: grid;
		gap: 0.7rem;
		overflow-y: auto;
		min-height: 0;
	}
	.admin-sheet__body :global(.ui-form-control) {
		min-height: 2rem;
		padding: 0 0.7rem;
		font-size: 0.84rem;
		border-radius: 0.625rem;
	}
	.admin-sheet__foot {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1.15rem 1rem;
		border-top: 1px solid color-mix(in srgb, var(--admin-card-border) 80%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
	}
</style>
