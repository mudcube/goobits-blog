<script lang="ts">
	let {
		value = $bindable(12),
		min = 1,
		max = 50,
		unit = 'spots',
		label = 'Capacity'
	} = $props<{
		value?: number
		min?: number
		max?: number
		unit?: string
		label?: string
	}>()

	function dec() { value = Math.max(min, value - 1) }
	function inc() { value = Math.min(max, value + 1) }
</script>

<div class="spots-stepper" role="group" aria-label={label}>
	<button
		type="button"
		class="spots-stepper__btn"
		aria-label="Less"
		disabled={value <= min}
		onclick={dec}
	>−</button>
	<span class="spots-stepper__value">
		<span class="spots-stepper__num" aria-live="polite">{value}</span>
		<span class="spots-stepper__unit">{unit}</span>
	</span>
	<button
		type="button"
		class="spots-stepper__btn"
		aria-label="More"
		disabled={value >= max}
		onclick={inc}
	>+</button>
</div>

<style>
	.spots-stepper {
		display: inline-flex;
		align-items: stretch;
		height: var(--ins-control-h);
		border: 1px solid var(--ins-control-border);
		background: var(--ins-control-bg);
		border-radius: var(--ins-control-radius);
		overflow: hidden;
		box-sizing: border-box;
		transition: border-color 140ms;
	}

	.spots-stepper:hover { border-color: var(--ins-control-border-hover); }

	.spots-stepper__btn {
		appearance: none;
		border: none;
		background: transparent;
		color: var(--ins-control-fg-muted);
		font: inherit;
		/* Slightly bigger than value so the math glyphs read at the right weight,
		 * paired with align-items: center so the visual center of the glyph
		 * (math axis for −/+) lines up with the value's optical center. */
		font-size: 1rem;
		font-weight: 600;
		line-height: 1;
		width: var(--ins-control-h);
		height: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 140ms, color 140ms;
	}

	.spots-stepper__btn:hover:not(:disabled) {
		background: var(--ins-control-bg-soft);
		color: var(--ins-control-fg);
	}

	.spots-stepper__btn:active:not(:disabled) {
		background: color-mix(in srgb, var(--admin-accent) 14%, transparent);
		color: var(--admin-accent);
	}

	.spots-stepper__btn:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.spots-stepper__value {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		padding: 0 0.65rem;
		font-variant-numeric: tabular-nums;
		border-left: 1px solid var(--ins-control-bg-soft-divider);
		border-right: 1px solid var(--ins-control-bg-soft-divider);
		height: 100%;
		line-height: 1;
		white-space: nowrap;
		box-sizing: border-box;
	}

	.spots-stepper__num {
		font-size: var(--ins-control-font-size);
		font-weight: var(--ins-control-font-weight);
		color: var(--ins-control-fg);
		line-height: 1;
	}

	.spots-stepper__unit {
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--ins-control-fg-muted);
		line-height: 1;
	}
</style>
