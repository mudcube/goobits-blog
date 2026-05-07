<script lang="ts">
	let { value = $bindable('19:00'), label = 'Time' } = $props<{
		value?: string
		label?: string
	}>()
</script>

<label class="time-chip">
	<span class="time-chip__icon" aria-hidden="true">
		<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</svg>
	</span>
	<input
		class="time-chip__input"
		type="time"
		step="900"
		bind:value
		aria-label={label}
	/>
</label>

<style>
	.time-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: var(--ins-control-h);
		padding: 0 var(--ins-control-pad-x);
		border: 1px solid var(--ins-control-border);
		background: var(--ins-control-bg);
		border-radius: var(--ins-control-radius);
		cursor: pointer;
		transition: border-color 140ms, box-shadow 140ms;
		box-sizing: border-box;
	}

	.time-chip:hover { border-color: var(--ins-control-border-hover); }

	.time-chip:focus-within {
		border-color: var(--ins-control-border-focus);
		box-shadow: var(--ins-control-focus-ring);
	}

	.time-chip__icon {
		display: inline-flex;
		align-items: center;
		color: var(--ins-control-fg-muted);
		flex: none;
	}

	.time-chip__input {
		appearance: none;
		-webkit-appearance: none;
		border: none;
		background: transparent;
		color: var(--ins-control-fg);
		font: inherit;
		font-size: var(--ins-control-font-size);
		font-weight: var(--ins-control-font-weight);
		font-variant-numeric: tabular-nums;
		padding: 0;
		outline: none;
		line-height: 1;
		min-width: 5.6rem;
	}

	/* Hide the native picker indicator — our clock icon is the affordance */
	.time-chip__input::-webkit-calendar-picker-indicator {
		display: none;
	}

	.time-chip__input::-webkit-date-and-time-value { text-align: left; }
</style>
