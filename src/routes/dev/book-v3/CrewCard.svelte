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

	function isOverlapping(person: Person) {
		return overlapping.some(o => o.name === person.name)
	}
</script>

{#if hasBookings}
	<div class="cc">
		<div class="cc__header"><span class="cc__line"></span><span class="cc__label">Others going {#if dayLabel}{dayLabel}{/if}</span><span class="cc__line"></span></div>
		{#each bookings as person, i}
			{#if i > 0}<div class="cc__divider"></div>{/if}
			<button type="button" class="cc__row" class:cc__row--on={isOverlapping(person)} data-tip="Join {person.name}" onclick={() => onJoin(person)}>
				<span class="cc__dot" style="--c:{person.color};"></span>
				<span class="cc__name">{person.name}</span>
				<span class="cc__time">{ft(person.start)}–{ft(person.end)}</span>
			</button>
		{/each}
	</div>
{:else}
	<div class="cc__empty">
		<p class="cc__empty-title">You're first.</p>
		<p class="cc__empty-sub">Pick a time and set the vibe.</p>
	</div>
{/if}

<style>
	.cc { margin-bottom: 0.75rem; }
	.cc__header { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.35rem; margin-bottom: 0.1rem; }
	.cc__line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 10%, transparent); }
	.cc__label { font-size: 0.58rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); white-space: nowrap; }
	.cc__divider { height: 1px; background: color-mix(in srgb, var(--text) 7%, transparent); margin: 0 0.5rem; }
	.cc__row { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem; width: 100%; background: none; border: none; color: var(--text); font: inherit; cursor: pointer; opacity: 0.45; transition: all 180ms; text-align: left; border-radius: 0.5rem; }
	.cc__row--on { opacity: 1; }
	.cc__row:hover { opacity: 1; background: color-mix(in srgb, var(--text) 4%, transparent); }
	.cc__dot { width: 0.38rem; height: 0.38rem; border-radius: 999px; background: var(--c); flex-shrink: 0; }
	.cc__name { font-size: 0.78rem; font-weight: 600; }
	.cc__time { font-size: 0.78rem; color: color-mix(in srgb, var(--text) 48%, transparent); font-variant-numeric: tabular-nums; margin-left: auto; }
	.cc__empty { text-align: center; padding: 0.75rem 0; }
	.cc__empty-title { margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.cc__empty-sub { margin: 0.2rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 42%, transparent); }
</style>
