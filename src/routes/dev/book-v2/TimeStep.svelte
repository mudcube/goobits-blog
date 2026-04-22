<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import type { OpenDay, Person } from './types'
	import { ft } from './time'
	import SkyTrack from '../schedule-time-picker-v5/SkyTrack.svelte'
	import TimeReadout from './TimeReadout.svelte'
	import CrewCard from './CrewCard.svelte'

	let {
		day,
		hourly,
		sunrise,
		sunset,
		hasRain,
		peopleRows,
		overlapping,
		start = $bindable(12),
		end = $bindable(14),
		onJoin,
		onConfirm,
	}: {
		day: OpenDay
		hourly: HourlyWeather[]
		sunrise: number
		sunset: number
		hasRain: boolean
		peopleRows: Person[][]
		overlapping: Person[]
		start?: number
		end?: number
		onJoin: (person: Person) => void
		onConfirm: () => void
	} = $props()
</script>

<SkyTrack {sunrise} {sunset} {hourly} {hasRain} {peopleRows} {overlapping} bind:start bind:end />

<TimeReadout {start} {end} {hourly} />

<CrewCard bookings={day.bookings} {onJoin} />

<button type="button" class="ts__confirm" onclick={onConfirm}>
	I'm in · {ft(start)}–{ft(end)}
</button>

<style>
	.ts__confirm { width: 100%; padding: 0.65rem; border: none; border-radius: 0.5rem; background: var(--gradient-action); color: #fff; font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; box-shadow: 0 3px 16px color-mix(in srgb, #7a5af8 22%, transparent); transition: all 150ms; text-align: center; }
	.ts__confirm:hover { box-shadow: 0 5px 24px color-mix(in srgb, #7a5af8 32%, transparent); transform: translateY(-1px); }
</style>
