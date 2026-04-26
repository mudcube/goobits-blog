<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import type { OpenDay, Person } from './types'
	import { ChevronRight } from '@lucide/svelte'
	import { formatDate } from './time'
	import SkyTrack from './SkyTrack.svelte'
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

	let animating = $state(false)
	let animTimer: ReturnType<typeof setTimeout>

	function animateChange(fn: () => void) {
		animating = true
		fn()
		clearTimeout(animTimer)
		animTimer = setTimeout(() => { animating = false }, 300)
	}

	function handleJoin(person: Person) {
		animateChange(() => onJoin(person))
	}
</script>

<p class="ts__instruction">Pick your time</p>

<TimeReadout bind:start bind:end {hourly} onNudge={() => animateChange(() => {})} />

<p class="ts__track-label">Weather & daylight</p>
<SkyTrack {sunrise} {sunset} {hourly} {hasRain} animate={animating} maxDuration={day.maxDuration ?? 24} bind:start bind:end />

<CrewCard bookings={day.bookings} {overlapping} onJoin={handleJoin} dayLabel={formatDate(day.date)} capacity={8} />

<button type="button" class="ts__confirm" data-tip="Lock in your time" onclick={onConfirm}>
	<span>Confirm</span>
	<ChevronRight size={15} strokeWidth={2.2} />
</button>

<style>
	.ts__instruction { margin: 0 0 0.15rem; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 55%, transparent); text-align: center; }
	.ts__track-label { margin: 0 0 0.25rem; font-size: 0.58rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 35%, transparent); }
	.ts__confirm { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.7rem 1rem; border: none; border-radius: 999px; background: #22c55e; color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 180ms; box-shadow: 0 2px 10px color-mix(in srgb, #22c55e 25%, transparent); }
	.ts__confirm:hover { background: #16a34a; box-shadow: 0 4px 16px color-mix(in srgb, #22c55e 35%, transparent); }
</style>
