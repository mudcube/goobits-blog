<script lang="ts">
	import { scale } from 'svelte/transition'

	type Props = {
		open: boolean
		title: string
		body?: string
		confirmLabel?: string
		cancelLabel?: string
		danger?: boolean
		busy?: boolean
		busyLabel?: string
		/** 'viewport' centers in the screen; 'content' centers within the
		 * admin content column (uses --admin-content-center-x). */
		align?: 'viewport' | 'content'
		onCancel: () => void
		onConfirm: () => void
	}

	const {
		open,
		title,
		body = '',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		danger = false,
		busy = false,
		busyLabel,
		align = 'viewport',
		onCancel,
		onConfirm
	}: Props = $props()

	const titleId = `admin-confirm-${Math.random().toString(36).slice(2, 9)}`
	const bodyId = `${titleId}-body`
</script>

{#if open}
	<button
		type="button"
		class="admin-confirm-modal__scrim"
		aria-label={cancelLabel}
		onclick={onCancel}
	></button>
	<div
		class="admin-confirm-modal"
		class:admin-confirm-modal--content={align === 'content'}
		role="alertdialog"
		aria-modal="true"
		aria-labelledby={titleId}
		aria-describedby={body ? bodyId : undefined}
		transition:scale={{ start: 0.96, duration: 160, opacity: 0 }}
	>
		<h2 id={titleId} class="admin-confirm-modal__title">{title}</h2>
		{#if body}
			<p id={bodyId} class="admin-confirm-modal__body">{body}</p>
		{/if}
		<div class="admin-confirm-modal__actions">
			<button
				type="button"
				class="admin-confirm-modal__btn"
				onclick={onCancel}
				disabled={busy}
			>
				{cancelLabel}
			</button>
			<button
				type="button"
				class="admin-confirm-modal__btn"
				class:admin-confirm-modal__btn--danger={danger}
				class:admin-confirm-modal__btn--primary={!danger}
				onclick={onConfirm}
				disabled={busy}
			>
				{busy ? (busyLabel ?? confirmLabel) : confirmLabel}
			</button>
		</div>
	</div>
{/if}

<style>
	.admin-confirm-modal__scrim {
		position: fixed;
		inset: 0;
		border: none;
		padding: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		z-index: 9990;
		cursor: pointer;
	}

	.admin-confirm-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(22rem, calc(100vw - 2rem));
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		box-shadow: 0 24px 60px color-mix(in srgb, var(--text) 20%, transparent);
		z-index: 9991;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 1.1rem 1.1rem 1rem;
	}

	/* Content-centered: align horizontally to the admin content column
	 * rather than the viewport. Falls back to viewport-center when the
	 * variable isn't defined (e.g. outside .social-admin__main). */
	.admin-confirm-modal--content {
		left: var(--admin-content-center-x, 50%);
	}

	.admin-confirm-modal__title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--text);
	}

	.admin-confirm-modal__body {
		margin: 0;
		font-size: 0.82rem;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}

	.admin-confirm-modal__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.3rem;
	}

	.admin-confirm-modal__btn {
		appearance: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 32px;
		padding: 0 0.95rem;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		border: 1px solid var(--admin-control-border, color-mix(in srgb, var(--text) 22%, transparent));
		background: var(--admin-control-bg, transparent);
		color: var(--admin-control-fg, var(--text));
		border-radius: var(--admin-control-radius, 0.625rem);
		cursor: pointer;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.admin-confirm-modal__btn:hover:not(:disabled) {
		background: var(--admin-control-bg-hover, color-mix(in srgb, var(--text) 6%, transparent));
	}

	.admin-confirm-modal__btn:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.admin-confirm-modal__btn--primary {
		background: var(--admin-accent);
		border-color: var(--admin-accent);
		color: var(--admin-accent-fg, #fff);
	}

	.admin-confirm-modal__btn--primary:hover:not(:disabled) {
		background: var(--admin-accent-strong, var(--admin-accent));
		border-color: var(--admin-accent-strong, var(--admin-accent));
	}

	.admin-confirm-modal__btn--danger {
		background: var(--admin-danger);
		border-color: var(--admin-danger);
		/* `--admin-danger-fg` is a red-tinted color meant for danger TEXT
		 * (red labels), not white-on-red buttons — would render invisible.
		 * Hardcode #fff for guaranteed contrast on the red fill. */
		color: #fff;
	}

	.admin-confirm-modal__btn--danger:hover:not(:disabled) {
		background: var(--admin-danger-strong, var(--admin-danger));
		border-color: var(--admin-danger-strong, var(--admin-danger));
		color: #fff;
	}
</style>
