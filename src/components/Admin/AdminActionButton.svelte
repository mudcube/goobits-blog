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
		class={`admin-action-btn admin-action-btn--${variant} ${disabled ? 'admin-action-btn--disabled' : ''}`}
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
	<button class={`admin-action-btn admin-action-btn--${variant}`} {type} {disabled} aria-label={ariaLabel} {onclick}>
		{#if icon}<svelte:component this={icon} size={iconSize} strokeWidth={2} />{/if}
		<slot />
	</button>
{/if}

<style lang="scss">
	.admin-action-btn {
		min-height: 32px;
		padding: 0 0.92rem;
		border-radius: 0.52rem;
		border: 1px solid var(--admin-control-border, color-mix(in srgb, var(--text) 14%, transparent));
		font-size: 0.76rem;
		font-weight: 650;
		font-family: var(--font-ui-sans, var(--font-sans));
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease, opacity 120ms ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		text-decoration: none;

		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
		}

		&.admin-action-btn--disabled {
			opacity: 0.45;
			pointer-events: none;
		}

		&.admin-action-btn--subtle {
			background: var(--admin-control-primary-bg, var(--text));
			border-color: var(--admin-control-primary-bg, var(--text));
			color: var(--admin-control-primary-fg, var(--bg));

			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		}

		&.admin-action-btn--primary {
			background: var(--admin-control-primary-bg, var(--text));
			border-color: var(--admin-control-primary-bg, var(--text));
			color: var(--admin-control-primary-fg, var(--bg));

			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		}

		&.admin-action-btn--danger {
			background: var(--admin-control-danger-bg, color-mix(in srgb, #ff3b30 88%, var(--panel-bg) 12%));
			border-color: color-mix(in srgb, #ff3b30 70%, transparent);
			color: var(--admin-control-danger-fg, #fff);

			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		}
	}
</style>
