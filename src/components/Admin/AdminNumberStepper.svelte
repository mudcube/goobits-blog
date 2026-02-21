<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let value = 1
	export let min = 1
	export let max = 50
	export let step = 1
	export let ariaLabel = 'Number stepper'

	const dispatch = createEventDispatcher<{ change: { value: number } }>()

	function clamp(next: number) {
		return Math.max(min, Math.min(max, next))
	}

	function setValue(next: number) {
		value = clamp(Number.isFinite(next) ? next : min)
		dispatch('change', { value })
	}

	function nudge(delta: number) {
		setValue(value + delta)
	}

	function onInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement
		setValue(target.valueAsNumber)
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			event.preventDefault()
			nudge(step)
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			nudge(-step)
		}
	}
</script>

<div class="admin-stepper" role="group" aria-label={ariaLabel}>
	<button type="button" class="admin-stepper__btn" aria-label="Decrease value" onclick={() => nudge(-step)}>−</button>
	<input
		class="admin-stepper__input"
		type="number"
		{min}
		{max}
		{step}
		bind:value
		oninput={onInput}
		onkeydown={onKeydown}
	/>
	<button type="button" class="admin-stepper__btn" aria-label="Increase value" onclick={() => nudge(step)}>+</button>
</div>

<style lang="scss">
	.admin-stepper {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;

		.admin-stepper__btn {
			width: 2rem;
			height: 2rem;
			border-radius: 0.5rem;
			border: 1px solid var(--admin-control-border, color-mix(in srgb, var(--text) 14%, transparent));
			background: color-mix(in srgb, var(--text) 3%, transparent);
			color: var(--text);
			font-size: 1rem;
			font-weight: 700;
			cursor: pointer;

			&:hover {
				background: color-mix(in srgb, var(--text) 9%, transparent);
			}
		}

		.admin-stepper__input {
			min-width: 64px;
			min-height: 34px;
			padding: 0.48rem 0.65rem;
			border-radius: 0.5rem;
			border: 1px solid var(--admin-control-border, color-mix(in srgb, var(--text) 14%, transparent));
			background: var(--panel-bg);
			color: var(--text);
			text-align: center;
			font-size: 0.8rem;
			font-weight: 700;
			outline: none;

			&:focus {
				border-color: var(--admin-selected-border, #0071e3);
				box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-focus-ring, #0071e3) 45%, transparent);
			}

			&::-webkit-outer-spin-button,
			&::-webkit-inner-spin-button {
				-webkit-appearance: none;
				margin: 0;
			}
		}
	}
</style>
