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
	.ts__confirm { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem 1rem; border: 1px solid color-mix(in srgb, #a78bfa 25%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, #7a5af8 12%, transparent); color: #fff; font: inherit; font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; letter-spacing: -0.02em; cursor: pointer; transition: all 180ms; }
	.ts__confirm:hover { background: color-mix(in srgb, #7a5af8 20%, transparent); border-color: color-mix(in srgb, #a78bfa 45%, transparent); transform: translateY(-1px); }
</style>
