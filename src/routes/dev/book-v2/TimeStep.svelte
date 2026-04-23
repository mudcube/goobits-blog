<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import type { OpenDay, Person } from './types'
	import { CalendarCheck } from '@lucide/svelte'
	import SkyTrack from '../schedule-time-picker-v5/SkyTrack.svelte'
	import TimeReadout from './TimeReadout.svelte'
	import CrewCard from './CrewCard.svelte'

	let {
		day,
		hourly,
		sunrise,
		sunset,
		hasRain,
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
		overlapping: Person[]
		start?: number
		end?: number
		onJoin: (person: Person) => void
		onConfirm: () => void
	} = $props()
</script>

<TimeReadout bind:start bind:end {hourly} />

<SkyTrack {sunrise} {sunset} {hourly} {hasRain} bind:start bind:end />

<CrewCard bookings={day.bookings} {overlapping} {onJoin} />

<button type="button" class="ts__confirm" onclick={onConfirm}>
	<CalendarCheck size={16} strokeWidth={2.2} />
	<span>Confirm</span>
</button>

<style>
	.ts__confirm { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem 1rem; border: none; border-radius: 0.5rem; background: #22c55e; color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 180ms; box-shadow: 0 2px 10px color-mix(in srgb, #22c55e 25%, transparent); }
	.ts__confirm:hover { background: #16a34a; box-shadow: 0 4px 16px color-mix(in srgb, #22c55e 35%, transparent); }
</style>
