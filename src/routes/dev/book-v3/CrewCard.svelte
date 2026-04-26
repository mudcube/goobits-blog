<script lang="ts">
	import type { Person } from './types'
	import { ft } from './time'

	let {
		bookings,
		overlapping = [],
		onJoin,
		dayLabel = '',
		capacity = 0,
	}: {
		bookings: Person[]
		overlapping?: Person[]
		onJoin: (person: Person) => void
		dayLabel?: string
		capacity?: number
	} = $props()

	const hasBookings = $derived(bookings.length > 0)

	let flashIdx = $state(-1)

	function isOverlapping(person: Person) {
		return overlapping.some(o => o.name === person.name)
	}

	function tapPerson(person: Person, idx: number) {
		flashIdx = -1
		// Force re-trigger by waiting a tick
		requestAnimationFrame(() => { flashIdx = idx })
		onJoin(person)
	}
</script>

{#if hasBookings}
	<div class="cc">
		<fieldset class="cc__card">
			<legend class="cc__legend">Others going {#if dayLabel}{dayLabel}{/if}</legend>
			{#each bookings as person, i}
				{#if i > 0}<div class="cc__divider"></div>{/if}
				<button type="button" class="cc__row" class:cc__row--on={isOverlapping(person)} class:cc__row--flash={flashIdx === i} data-tip="Join {person.name}" onclick={() => tapPerson(person, i)}>
					<span class="cc__dot" style="--c:{person.color};"></span>
					<span class="cc__name">{person.name}</span>
					<span class="cc__time">{ft(person.start)}–{ft(person.end)}</span>
				</button>
			{/each}
			{#if capacity > 0}<p class="cc__capacity">{bookings.length} of {capacity} spots filled</p>{/if}
		</fieldset>
	</div>
{:else}
	<div class="cc">
		<fieldset class="cc__card">
			<legend class="cc__legend">Others going {#if dayLabel}{dayLabel}{/if}</legend>
			<div class="cc__empty-inner">
				<p class="cc__empty-title">You'd be the first.</p>
				<p class="cc__empty-sub">Set the vibe.</p>
			</div>
			{#if capacity > 0}<p class="cc__capacity">0 of {capacity} spots filled</p>{/if}
		</fieldset>
	</div>
{/if}

<style>
	.cc { margin-top: 1rem; margin-bottom: 1rem; }
	.cc__card { border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; margin: 0; padding: 0; }
	.cc__legend { margin: 0 auto; padding: 0 0.5rem; font-size: 0.58rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); white-space: nowrap; line-height: 0; }
	.cc__divider { height: 1px; background: color-mix(in srgb, var(--text) 7%, transparent); margin: 0; }
	.cc__row { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.65rem; width: 100%; background: none; border: none; color: var(--text); font: inherit; cursor: pointer; opacity: 0.45; transition: all 180ms; text-align: left; }
	.cc__row--on { opacity: 1; }
	.cc__row--flash { animation: cc-flash 0.4s ease; }
	@keyframes cc-flash { 0% { background: transparent; } 30% { background: color-mix(in srgb, #a78bfa 15%, transparent); } 100% { background: transparent; } }
	.cc__row:hover { opacity: 1; background: color-mix(in srgb, var(--text) 4%, transparent); }
	.cc__dot { width: 0.38rem; height: 0.38rem; border-radius: 999px; background: var(--c); flex-shrink: 0; }
	.cc__name { font-size: 0.78rem; font-weight: 600; }
	.cc__time { font-size: 0.78rem; color: color-mix(in srgb, var(--text) 48%, transparent); font-variant-numeric: tabular-nums; margin-left: auto; }
	.cc__capacity { margin: 0; padding: 0.4rem 0.65rem; font-size: 0.58rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); text-align: center; border-top: 1px solid color-mix(in srgb, var(--text) 7%, transparent); }
	.cc__empty-inner { text-align: center; padding: 0.75rem 0.65rem; }
	.cc__empty-title { margin: 0; font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.cc__empty-sub { margin: 0.15rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 38%, transparent); }
</style>
