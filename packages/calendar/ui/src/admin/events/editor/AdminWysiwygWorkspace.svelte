<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		backLabel: string
		modeLabel: string
		statusLabel?: string
		statusOff?: boolean
		preview: boolean
		primaryLabel: string
		primaryDisabled?: boolean
		drawerOpen: boolean
		onBack: () => void
		onToggleSettings: () => void
		onTogglePreview: () => void
		onPrimary: () => void
		onCloseDrawer: () => void
		canvas: Snippet
		drawer: Snippet
	}

	const {
		backLabel,
		modeLabel,
		statusLabel = '',
		statusOff = false,
		preview,
		primaryLabel,
		primaryDisabled = false,
		drawerOpen,
		onBack,
		onToggleSettings,
		onTogglePreview,
		onPrimary,
		onCloseDrawer,
		canvas,
		drawer
	}: Props = $props()
</script>

<div class="admin-wysiwyg">
	<div class="admin-wysiwyg__bar">
		<button type="button" class="admin-wysiwyg__btn admin-wysiwyg__btn--back" onclick={onBack}>← {backLabel}</button>
		<div class="admin-wysiwyg__sep"></div>
		<span class="admin-wysiwyg__pill">{modeLabel}</span>
		{#if statusLabel}
			<span class="admin-wysiwyg__status">
				<span class:admin-wysiwyg__dot--off={statusOff} class="admin-wysiwyg__dot"></span>
				{statusLabel}
			</span>
		{/if}
		<div class="admin-wysiwyg__sep"></div>
		<button type="button" class="admin-wysiwyg__btn" onclick={onToggleSettings}>⚙ Settings</button>
		<button type="button" class="admin-wysiwyg__btn" onclick={onTogglePreview}>{preview ? '✎ Edit' : '👁 Preview'}</button>
		<button type="button" class="admin-wysiwyg__btn admin-wysiwyg__btn--primary" onclick={onPrimary} disabled={primaryDisabled}>{primaryLabel}</button>
	</div>

	<div class="admin-wysiwyg__canvas">
		{@render canvas()}
	</div>

	{#if drawerOpen}
		<div
			class="admin-wysiwyg__drawer-scrim"
			role="button"
			tabindex="0"
			aria-label="Close settings drawer"
			onclick={onCloseDrawer}
			onkeydown={(event) => (event.key === 'Escape' || event.key === 'Enter') && onCloseDrawer()}
		></div>
		<aside class="admin-wysiwyg__drawer">
			{@render drawer()}
		</aside>
	{/if}
</div>

<style>
	.admin-wysiwyg {
		position: relative;
	}

	.admin-wysiwyg__bar {
		position: absolute;
		left: 0.75rem;
		right: 0.75rem;
		top: 0.65rem;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.4rem 0.45rem;
		border-radius: 12px;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--bg) 88%, var(--text) 12%);
		backdrop-filter: blur(14px);
	}

	.admin-wysiwyg__sep {
		width: 1px;
		height: 18px;
		background: color-mix(in srgb, var(--text) 12%, transparent);
	}

	.admin-wysiwyg__pill {
		font-size: 0.67rem;
		font-weight: 700;
		padding: 0.2rem 0.45rem;
		border-radius: 6px;
		background: color-mix(in srgb, #10b981 12%, transparent);
		border: 1px solid color-mix(in srgb, #10b981 22%, transparent);
		color: color-mix(in srgb, #10b981 78%, var(--text) 22%);
	}

	.admin-wysiwyg__status {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.67rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.admin-wysiwyg__dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: color-mix(in srgb, #10b981 74%, var(--text) 26%);
	}

	.admin-wysiwyg__dot--off {
		background: color-mix(in srgb, #ef4444 74%, var(--text) 26%);
	}

	.admin-wysiwyg__btn {
		min-height: 26px;
		padding: 0 0.55rem;
		border-radius: 7px;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
		color: color-mix(in srgb, var(--text) 78%, transparent);
		font-size: 0.68rem;
		font-weight: 700;
		cursor: pointer;
	}

	.admin-wysiwyg__btn--back {
		background: transparent;
		border-color: transparent;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.admin-wysiwyg__btn--primary {
		background: color-mix(in srgb, var(--text) 78%, var(--bg) 22%);
		color: var(--bg);
	}

	.admin-wysiwyg__canvas {
		padding-top: 3.8rem;
	}

	.admin-wysiwyg__drawer-scrim {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, black 18%, transparent);
		z-index: 120;
	}

	.admin-wysiwyg__drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(340px, 92vw);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
		border-left: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
		z-index: 130;
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 720px) {
		.admin-wysiwyg__bar {
			left: 0.5rem;
			right: 0.5rem;
			overflow: auto;
		}
	}
</style>
