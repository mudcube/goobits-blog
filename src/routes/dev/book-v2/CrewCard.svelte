<script lang="ts">
	import type { Person } from './types'
	import { ft } from './time'

	let {
		bookings,
		overlapping = [],
		onJoin,
		dayLabel = '',
	}: {
		bookings: Person[]
		overlapping?: Person[]
		onJoin: (person: Person) => void
		dayLabel?: string
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
		</fieldset>
	</div>
{:else}
	<div class="cc__empty">
		<p class="cc__empty-title">You're first.</p>
		<p class="cc__empty-sub">Pick a time and set the vibe.</p>
	</div>
{/if}

<style>
	.cc { margin-top: 1rem; margin-bottom: 0.75rem; }
	.cc__card { border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.6rem; margin: 0; padding: 0; }
	.cc__legend { margin: 0 auto; padding: 0 0.5rem; font-size: 0.58rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); white-space: nowrap; }
	.cc__divider { height: 1px; background: color-mix(in srgb, var(--text) 7%, transparent); margin: 0; }
	.cc__row { display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 0.65rem; width: 100%; background: none; border: none; color: var(--text); font: inherit; cursor: pointer; opacity: 0.45; transition: all 180ms; text-align: left; }
	.cc__row--on { opacity: 1; }
	.cc__row--flash { animation: cc-flash 0.4s ease; }
	@keyframes cc-flash { 0% { background: transparent; } 30% { background: color-mix(in srgb, #a78bfa 15%, transparent); } 100% { background: transparent; } }
	.cc__row:hover { opacity: 1; background: color-mix(in srgb, var(--text) 4%, transparent); }
	.cc__dot { width: 0.38rem; height: 0.38rem; border-radius: 999px; background: var(--c); flex-shrink: 0; }
	.cc__name { font-size: 0.78rem; font-weight: 600; }
	.cc__time { font-size: 0.78rem; color: color-mix(in srgb, var(--text) 48%, transparent); font-variant-numeric: tabular-nums; margin-left: auto; }
	.cc__empty { text-align: center; padding: 0.75rem 0; }
	.cc__empty-title { margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.cc__empty-sub { margin: 0.2rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 42%, transparent); }
</style>
