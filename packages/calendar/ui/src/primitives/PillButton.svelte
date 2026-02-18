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
		border-radius: 999px;
		border: 1px solid transparent;
		font: inherit;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		line-height: 1;
		transition: opacity 0.15s ease;
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
		background: color-mix(in srgb, var(--calendar-shell-text) 92%, black 8%);
		color: var(--calendar-shell-bg);
	}
	.calendar-btn--secondary {
		background: color-mix(in srgb, var(--calendar-shell-bg) 80%, white 20%);
		border-color: color-mix(in srgb, var(--calendar-shell-text) 22%, transparent);
		color: var(--calendar-shell-text);
	}
	.calendar-btn--ghost {
		background: transparent;
		border-color: color-mix(in srgb, var(--calendar-shell-text) 25%, transparent);
		color: var(--calendar-shell-text);
	}
	.calendar-btn--danger {
		background: color-mix(in srgb, #b91c1c 78%, black 22%);
		color: #fff;
	}
</style>
