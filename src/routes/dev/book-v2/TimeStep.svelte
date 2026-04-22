<script lang="ts">
	import { ArrowRight } from '@lucide/svelte'
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

<CrewCard bookings={day.bookings} {overlapping} {onJoin} />

<button type="button" class="ts__confirm" onclick={onConfirm}>
	<span>I'm in · {ft(start)}–{ft(end)}</span>
	<ArrowRight size={16} strokeWidth={2.2} />
</button>

<style>
	.ts__confirm { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem; border: none; border-radius: 0.5rem; background: var(--gradient-action); color: #fff; font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 14px color-mix(in srgb, #7a5af8 20%, transparent); transition: all 150ms; }
	.ts__confirm:hover { box-shadow: 0 4px 20px color-mix(in srgb, #7a5af8 30%, transparent); transform: translateY(-1px); }
</style>
