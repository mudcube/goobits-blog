<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import AdminSelect from './AdminSelect.svelte'

	export let value = '10:30'
	export let minuteStep = 5

	const dispatch = createEventDispatcher<{ change: { value: string } }>()

	let hour = '10'
	let minute = '30'
	let period: 'AM' | 'PM' = 'AM'

	$: syncFromValue(value)

	function pad2(next: number) {
		return String(next).padStart(2, '0')
	}

	function syncFromValue(next: string) {
		const [hourToken = '', minuteToken = ''] = next.split(':')
		const parsedHours = Number.parseInt(hourToken, 10)
		const parsedMinutes = Number.parseInt(minuteToken, 10)
		const hours24 = Number.isFinite(parsedHours) ? parsedHours : 10
		const minutes = Number.isFinite(parsedMinutes) ? parsedMinutes : 30
		const nextPeriod: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM'
		const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
		hour = String(hours12)
		minute = pad2(Math.max(0, Math.min(59, minutes)))
		period = nextPeriod
	}

	function apply() {
		const hourNum = Math.max(1, Math.min(12, Number.parseInt(hour, 10) || 10))
		const minuteNum = Math.max(0, Math.min(59, Number.parseInt(minute, 10) || 0))
		const hours24 = period === 'PM' ? (hourNum % 12) + 12 : hourNum % 12
		value = `${pad2(hours24)}:${pad2(minuteNum)}`
		dispatch('change', { value })
	}

	$: minuteOptions = Array.from(
		{ length: Math.floor(60 / Math.max(1, minuteStep)) },
		(_, index) => pad2(index * Math.max(1, minuteStep))
	)
</script>

<div class="admin-time" role="group" aria-label="Select time">
	<AdminSelect bind:value={hour} ariaLabel="Hour" onchange={apply}>
		{#each Array.from({ length: 12 }, (_, i) => String(i + 1)) as option}
			<option value={option}>{option}</option>
		{/each}
	</AdminSelect>
	<span class="admin-time__sep">:</span>
	<AdminSelect bind:value={minute} ariaLabel="Minute" onchange={apply}>
		{#each minuteOptions as option}
			<option value={option}>{option}</option>
		{/each}
	</AdminSelect>
	<div class="admin-time__period">
		<button type="button" class:admin-time__period-btn--on={period === 'AM'} class="admin-time__period-btn" onclick={() => { period = 'AM'; apply() }}>AM</button>
		<button type="button" class:admin-time__period-btn--on={period === 'PM'} class="admin-time__period-btn" onclick={() => { period = 'PM'; apply() }}>PM</button>
	</div>
</div>

<style lang="scss">
	.admin-time {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.35rem;

		.admin-time__sep {
			font-weight: 700;
			color: color-mix(in srgb, var(--text) 60%, transparent);
		}

		.admin-time__period {
			display: inline-flex;
			border-radius: 0.5rem;
			border: 1px solid var(--admin-control-border, color-mix(in srgb, var(--text) 14%, transparent));
			overflow: hidden;
		}

		.admin-time__period-btn {
			min-height: 34px;
			min-width: 2.4rem;
			border: none;
			border-right: 1px solid var(--admin-control-border, color-mix(in srgb, var(--text) 14%, transparent));
			background: transparent;
			color: color-mix(in srgb, var(--text) 62%, transparent);
			font-size: 0.72rem;
			font-weight: 700;
			cursor: pointer;

			&:last-child {
				border-right: none;
			}
		}

		.admin-time__period-btn--on {
			background: var(--admin-selected-bg, color-mix(in srgb, var(--text) 84%, var(--bg) 16%));
			color: var(--text);
		}
	}
</style>
