<script lang="ts">
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { X as XIcon } from '@lucide/svelte'

	type Variant = 'status' | 'error' | 'undo'
	type Position = 'top-right' | 'top-center' | 'bottom-right'

	const {
		message,
		variant = 'status',
		position = 'top-right',
		actionLabel,
		onAction,
		onDismiss
	} = $props<{
		message: string
		variant?: Variant
		position?: Position
		actionLabel?: string
		onAction?: () => void
		onDismiss?: () => void
	}>()
</script>

<div
	class="admin-toast"
	class:admin-toast--error={variant === 'error'}
	class:admin-toast--undo={variant === 'undo'}
	class:admin-toast--top-center={position === 'top-center'}
	class:admin-toast--bottom-right={position === 'bottom-right'}
	role="status"
	aria-live="polite"
	transition:fly={{ y: -8, duration: 180, easing: cubicOut }}
>
	<span class="admin-toast__label">
		{#if variant === 'status'}✓ {/if}{message}
	</span>
	{#if actionLabel && onAction}
		<button type="button" class="admin-toast__action" onclick={onAction}>
			{actionLabel}
		</button>
	{/if}
	{#if onDismiss}
		<button
			type="button"
			class="admin-toast__dismiss"
			aria-label="Dismiss"
			onclick={onDismiss}
		>
			<XIcon size={12} />
		</button>
	{/if}
</div>

<style>
	.admin-toast {
		position: fixed;
		top: calc(3rem + 0.6rem);
		right: clamp(1rem, 2.2vw, 2rem);
		z-index: 90;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.85rem;
		border-radius: 0.7rem;
		background: color-mix(in srgb, var(--text) 92%, var(--bg) 8%);
		color: var(--bg);
		font-size: 0.78rem;
		font-weight: 480;
		box-shadow: 0 12px 30px -10px color-mix(in srgb, black 38%, transparent);
	}
	.admin-toast--top-center {
		left: 50%;
		right: auto;
		transform: translateX(-50%);
	}
	.admin-toast--bottom-right {
		top: auto;
		bottom: 1rem;
	}
	.admin-toast--error {
		background: var(--admin-danger);
	}
	.admin-toast--undo {
		padding-right: 0.55rem;
	}
	.admin-toast__label {
		font-style: italic;
		opacity: 0.92;
	}
	.admin-toast--error .admin-toast__label {
		font-style: normal;
		font-weight: 540;
		opacity: 1;
	}
	.admin-toast__action {
		border: none;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		font-style: normal;
		cursor: pointer;
		padding: 0.2rem 0.55rem;
		border-radius: 0.4rem;
	}
	.admin-toast__action:hover {
		background: color-mix(in srgb, var(--bg) 14%, transparent);
	}
	.admin-toast__dismiss {
		border: none;
		background: transparent;
		color: inherit;
		opacity: 0.55;
		display: inline-flex;
		padding: 0.25rem;
		cursor: pointer;
		border-radius: 0.35rem;
	}
	.admin-toast__dismiss:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--bg) 14%, transparent);
	}
</style>
