<script lang="ts">
	import type { Snippet } from 'svelte'

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
	type Size = 'sm' | 'md' | 'lg'

	let {
		href,
		target,
		rel,
		type = 'button',
		variant = 'secondary',
		size = 'md',
		fullWidth = false,
		className = '',
		ariaLabel,
		disabled = false,
		onClick,
		children
	}: {
		href?: string | undefined
		target?: string | undefined
		rel?: string | undefined
		type?: 'button' | 'submit' | 'reset'
		variant?: Variant
		size?: Size
		fullWidth?: boolean
		className?: string
		ariaLabel?: string | undefined
		disabled?: boolean
		onClick?: ((event: MouseEvent) => void) | undefined
		children?: Snippet | undefined
	} = $props()

	const classes = $derived(`calendar-btn calendar-btn--${variant} calendar-btn--${size} ${fullWidth ? 'calendar-btn--full' : ''} ${className}`.trim())
</script>

{#if href && !disabled}
	<a href={href} target={target} rel={rel} class={classes} aria-label={ariaLabel} onclick={onClick}>
		{@render children?.()}
	</a>
{:else}
	<button {type} class={classes} {disabled} aria-label={ariaLabel} onclick={onClick}>
		{@render children?.()}
	</button>
{/if}

<style>
	.calendar-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		border-radius: 0.625rem;
		border: 1px solid transparent;
		font: inherit;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		line-height: 1;
		transition:
			background 140ms ease,
			border-color 140ms ease,
			color 140ms ease,
			box-shadow 140ms ease,
			transform 140ms ease;
	}

	.calendar-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--calendar-shell-text) 32%, transparent);
	}

	.calendar-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.calendar-btn--sm { padding: 0.45rem 0.75rem; font-size: 0.8rem; }
	.calendar-btn--md { padding: 0.6rem 0.95rem; font-size: 0.9rem; }
	.calendar-btn--lg { padding: 0.75rem 1.2rem; font-size: 0.95rem; }
	.calendar-btn--full { width: 100%; }

	.calendar-btn--primary {
		background: var(--gradient-action);
		color: #fff;
		box-shadow: 0 2px 12px color-mix(in srgb, #7a5af8 22%, transparent);
	}
	.calendar-btn--primary:hover:not(:disabled) {
		box-shadow: 0 4px 18px color-mix(in srgb, #7a5af8 32%, transparent);
		transform: translateY(-1px);
	}

	.calendar-btn--secondary {
		background: color-mix(in srgb, var(--calendar-shell-text) 8%, transparent);
		border-color: color-mix(in srgb, var(--calendar-shell-text) 22%, transparent);
		color: var(--calendar-shell-text);
	}
	.calendar-btn--secondary:hover:not(:disabled) {
		background: color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
		border-color: color-mix(in srgb, var(--calendar-shell-text) 32%, transparent);
		transform: translateY(-1px);
	}

	.calendar-btn--ghost {
		background: transparent;
		border-color: color-mix(in srgb, var(--calendar-shell-text) 22%, transparent);
		color: color-mix(in srgb, var(--calendar-shell-text) 82%, transparent);
	}
	.calendar-btn--ghost:hover:not(:disabled) {
		background: color-mix(in srgb, var(--calendar-shell-text) 8%, transparent);
		border-color: color-mix(in srgb, var(--calendar-shell-text) 32%, transparent);
		color: var(--calendar-shell-text);
	}

	.calendar-btn--danger {
		background: color-mix(in srgb, #b91c1c 78%, black 22%);
		color: #fff;
	}
	.calendar-btn--danger:hover:not(:disabled) {
		background: color-mix(in srgb, #b91c1c 90%, black 10%);
		transform: translateY(-1px);
	}
</style>
