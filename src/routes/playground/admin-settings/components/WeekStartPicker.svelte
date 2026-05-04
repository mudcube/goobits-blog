<script lang="ts">
	type WeekStart = 'monday' | 'sunday'

	let {
		value,
		onChange
	}: {
		value: WeekStart
		onChange: (next: WeekStart) => void
	} = $props()

	const options: Array<{ value: WeekStart; label: string }> = [
		{ value: 'monday', label: 'Monday' },
		{ value: 'sunday', label: 'Sunday' }
	]
</script>

<div class="week-start-picker" role="radiogroup" aria-label="Week starts on">
	{#each options as opt}
		<label
			class="week-start-picker__opt"
			class:week-start-picker__opt--active={value === opt.value}
		>
			<input
				type="radio"
				class="week-start-picker__input"
				name="week-start"
				value={opt.value}
				checked={value === opt.value}
				onchange={() => onChange(opt.value)}
			/>
			<span class="week-start-picker__label">{opt.label}</span>
		</label>
	{/each}
</div>

<style>
	.week-start-picker {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}
	.week-start-picker__opt {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 2.4rem;
		padding: 0 0.875rem;
		border-radius: 0.625rem;
		border: 1px solid var(--admin-card-border);
		background: var(--admin-card-bg);
		color: color-mix(in srgb, var(--text) 70%, transparent);
		cursor: pointer;
		font-size: 0.82rem;
		font-weight: 520;
		letter-spacing: -0.005em;
		transition:
			border-color 120ms ease,
			background 120ms ease,
			color 120ms ease;
	}
	.week-start-picker__opt:hover {
		background: color-mix(in srgb, var(--admin-accent) 7%, var(--bg) 93%);
		border-color: color-mix(in srgb, var(--admin-accent) 28%, transparent);
	}
	.week-start-picker__input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.week-start-picker__opt--active {
		border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
		color: var(--text);
	}
</style>
