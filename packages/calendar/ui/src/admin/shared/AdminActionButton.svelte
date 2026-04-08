<script lang="ts">
	import type { Component } from 'svelte'

	export let type: 'button' | 'submit' | 'reset' = 'button'
	export let variant: 'primary' | 'subtle' | 'danger' = 'subtle'
	export let disabled = false
	export let href: string | null = null
	export let icon: Component | null = null
	export let iconSize = 14
	export let ariaLabel: string | undefined = undefined
	export let onclick: ((event: MouseEvent) => void) | undefined = undefined
</script>

{#if href}
	<a
		class={`admin-ui-btn admin-ui-btn--${variant} admin-action-btn admin-action-btn--${variant} ${disabled ? 'admin-action-btn--disabled' : ''}`}
		aria-label={ariaLabel}
		aria-disabled={disabled}
		href={disabled ? undefined : href}
		onclick={(event) => {
			if (disabled) event.preventDefault()
			onclick?.(event as MouseEvent)
		}}
	>
		{#if icon}<svelte:component this={icon} size={iconSize} strokeWidth={2} />{/if}
		<slot />
	</a>
{:else}
	<button class={`admin-ui-btn admin-ui-btn--${variant} admin-action-btn admin-action-btn--${variant}`} {type} {disabled} aria-label={ariaLabel} {onclick}>
		{#if icon}<svelte:component this={icon} size={iconSize} strokeWidth={2} />{/if}
		<slot />
	</button>
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

		&.admin-action-btn--disabled {
			opacity: 0.45;
			pointer-events: none;
		}
	}
</style>
