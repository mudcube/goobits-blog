<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import type { OpenDay, Person } from './types'
	import { ft, formatDate } from './time'
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

<TimeReadout {start} {end} {hourly} />

<SkyTrack {sunrise} {sunset} {hourly} {hasRain} bind:start bind:end />

<CrewCard bookings={day.bookings} {overlapping} {onJoin} />

<button type="button" class="ts__confirm" onclick={onConfirm}>
	<span class="ts__action">I'm in</span>
	<span class="ts__meta">{formatDate(day.date)} · {ft(start)}–{ft(end)}</span>
</button>

<style>
	.ts__confirm { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.1rem; padding: 0.7rem 1rem; border: 1px solid color-mix(in srgb, #a78bfa 25%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, #7a5af8 12%, transparent); color: #fff; font: inherit; cursor: pointer; transition: all 180ms; }
	.ts__confirm:hover { background: color-mix(in srgb, #7a5af8 20%, transparent); border-color: color-mix(in srgb, #a78bfa 45%, transparent); transform: translateY(-1px); }
	.ts__action { font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; letter-spacing: -0.02em; }
	.ts__meta { font-size: 0.58rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: color-mix(in srgb, #fff 65%, transparent); }
</style>
