<script lang="ts">
	import type { Component, Snippet } from 'svelte'
	import Tooltip from '../../shared/Tooltip.svelte'

	let {
		type = 'button',
		variant = 'subtle',
		disabled = false,
		href = null,
		icon: Icon = null,
		iconSize = 14,
		ariaLabel = undefined,
		onclick = undefined,
		children
	}: {
		type?: 'button' | 'submit' | 'reset'
		variant?: 'primary' | 'subtle' | 'danger'
		disabled?: boolean
		href?: string | null
		icon?: Component | null
		iconSize?: number
		ariaLabel?: string | undefined
		onclick?: ((event: MouseEvent) => void) | undefined
		children?: Snippet
	} = $props()

	const iconOnly = $derived(Icon && !children)
	const tooltipText = $derived(iconOnly && ariaLabel ? ariaLabel : '')
</script>

{#if href}
	<Tooltip text={tooltipText} placement="top">
		<a
			class={`admin-ui-btn admin-ui-btn--${variant} admin-action-btn admin-action-btn--${variant} ${iconOnly ? 'admin-action-btn--icon-only' : ''} ${disabled ? 'admin-action-btn--disabled' : ''}`}
			aria-label={ariaLabel}
			aria-disabled={disabled}
			href={disabled ? undefined : href}
			onclick={(event) => {
				if (disabled) event.preventDefault()
				onclick?.(event as MouseEvent)
			}}
		>
			{#if Icon}<Icon size={iconSize} strokeWidth={2} />{/if}
			{@render children?.()}
		</a>
	</Tooltip>
{:else}
	<Tooltip text={tooltipText} placement="top">
		<button class={`admin-ui-btn admin-ui-btn--${variant} admin-action-btn admin-action-btn--${variant} ${iconOnly ? 'admin-action-btn--icon-only' : ''}`} {type} {disabled} aria-label={ariaLabel} {onclick}>
			{#if Icon}<Icon size={iconSize} strokeWidth={2} />{/if}
			{@render children?.()}
		</button>
	</Tooltip>
{/if}

<style lang="scss">
	.admin-action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		font-family: var(--font-ui-sans, var(--font-sans));

		:global(svg) {
			display: block;
			flex-shrink: 0;
			vector-effect: non-scaling-stroke;
			shape-rendering: geometricPrecision;
		}

		&.admin-action-btn--icon-only {
			width: 32px;
			padding: 0;
		}

		&.admin-action-btn--disabled {
			opacity: 0.45;
			pointer-events: none;
		}
	}
</style>
