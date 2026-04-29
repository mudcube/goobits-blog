<script lang="ts">
	import type { HourlyWeather } from './weather'
	import type { BookingSlot, OpenDay, Person } from './types'
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
		selectedSlotId = $bindable<string | number | null>(null),
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
		selectedSlotId?: string | number | null
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

	function selectSlot(slot: BookingSlot) {
		selectedSlotId = slot.id
		start = slot.start
		end = slot.end
	}
</script>

<p class="ts__instruction">Pick your time</p>

{#if day.mode === 'preset' && day.slots?.length}
	<div class="ts__slots">
		{#each day.slots as slot}
			<button
				type="button"
				class="ts__slot"
				class:ts__slot--selected={selectedSlotId === slot.id}
				onclick={() => selectSlot(slot)}
			>
				<span class="ts__slot-main">{slot.label}</span>
				<span class="ts__slot-meta">
					{#if (slot.seatsLeft ?? 0) > 0}
						{slot.seatsLeft} left
					{:else}
						Waitlist
					{/if}
				</span>
			</button>
		{/each}
	</div>
{:else}
	<TimeReadout bind:start bind:end {hourly} onNudge={() => animateChange(() => {})} />

	<p class="ts__track-label">Weather & daylight</p>
	<SkyTrack {sunrise} {sunset} {hourly} {hasRain} animate={animating} maxDuration={day.maxDuration ?? 24} bind:start bind:end />
{/if}

<CrewCard bookings={day.bookings} {overlapping} onJoin={handleJoin} dayLabel={formatDate(day.date)} capacity={8} />

<button type="button" class="ts__confirm" data-tip="Lock in your time" onclick={onConfirm}>
	<span>Confirm</span>
	<ChevronRight size={15} strokeWidth={2.2} />
</button>

<style>
	.ts__instruction { margin: 0 0 0.15rem; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 55%, transparent); text-align: center; }
	.ts__track-label { margin: 0 0 0.25rem; font-size: 0.58rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 35%, transparent); }
	.ts__slots { display: grid; gap: 0.45rem; margin: 0.4rem 0 0.75rem; }
	.ts__slot { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; width: 100%; padding: 0.7rem 0.8rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.7rem; background: color-mix(in srgb, var(--panel-bg, var(--bg)) 82%, transparent); color: var(--text); font: inherit; cursor: pointer; }
	.ts__slot--selected { border-color: var(--book-accent); background: color-mix(in srgb, var(--book-accent) 12%, var(--panel-bg, var(--bg)) 88%); }
	.ts__slot-main { font-size: 0.82rem; font-weight: 650; }
	.ts__slot-meta { font-size: 0.72rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.ts__confirm { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.7rem 1rem; border: none; border-radius: 999px; background: var(--book-confirm); color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 180ms; box-shadow: 0 2px 10px color-mix(in srgb, var(--book-confirm) 25%, transparent); }
	.ts__confirm:hover { background: var(--book-confirm-hover); box-shadow: 0 4px 16px color-mix(in srgb, var(--book-confirm) 35%, transparent); }
</style>
