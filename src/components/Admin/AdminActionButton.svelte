<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button'
	export let variant: 'primary' | 'subtle' | 'danger' = 'subtle'
	export let disabled = false
	export let onclick: ((event: MouseEvent) => void) | undefined = undefined
</script>

<button class={`admin-action-btn admin-action-btn--${variant}`} {type} {disabled} {onclick}>
	<slot />
</button>

<style lang="scss">
	.admin-action-btn {
		min-height: 32px;
		padding: 0 0.92rem;
		border-radius: 0.52rem;
		border: 1px solid var(--admin-control-border, color-mix(in srgb, var(--text) 14%, transparent));
		font-size: 0.76rem;
		font-weight: 650;
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease, opacity 120ms ease;

		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
		}

		&.admin-action-btn--subtle {
			background: var(--admin-control-bg, var(--panel-bg));
			color: color-mix(in srgb, var(--admin-control-fg, var(--text)) 70%, transparent);

			&:hover:not(:disabled) {
				background: var(--admin-control-bg-hover, color-mix(in srgb, var(--text) 5%, transparent));
				color: var(--admin-control-fg, var(--text));
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
