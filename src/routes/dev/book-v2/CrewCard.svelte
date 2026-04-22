<script lang="ts">
	import type { Person } from './types'
	import { ft } from './time'

	let {
		bookings,
		overlapping = [],
		onJoin,
	}: {
		bookings: Person[]
		overlapping?: Person[]
		onJoin: (person: Person) => void
	} = $props()

	const hasBookings = $derived(bookings.length > 0)
</script>

{#if hasBookings}
	<div class="cc">
		{#each bookings as person}
			<button type="button" class="cc__row" class:cc__row--on={overlapping.some(o => o.name === person.name)} onclick={() => onJoin(person)}>
				<span class="cc__dot" style="--c:{person.color};"></span>
				<span class="cc__name">{person.name}</span>
				<span class="cc__time">{ft(person.start)}–{ft(person.end)}</span>
				<span class="cc__action">Join</span>
			</button>
		{/each}
	</div>
	<p class="cc__alt">or drag your own time above</p>
{:else}
	<div class="cc__empty">
		<p class="cc__empty-title">You're first.</p>
		<p class="cc__empty-sub">Pick a time and set the vibe.</p>
	</div>
{/if}

<style>
	.cc { display: grid; gap: 0.3rem; margin-bottom: 0.25rem; }
	.cc__row { display: flex; align-items: center; gap: 0.45rem; padding: 0.55rem 0.7rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, var(--card-bg) 50%, transparent); font: inherit; color: inherit; cursor: pointer; text-align: left; transition: all 150ms; }
	.cc__row:hover { border-color: color-mix(in srgb, #a78bfa 28%, transparent); background: color-mix(in srgb, #a78bfa 5%, transparent); }
	.cc__row--on { border-color: color-mix(in srgb, #a78bfa 22%, transparent); }
	.cc__dot { width: 0.42rem; height: 0.42rem; border-radius: 999px; background: var(--c); flex-shrink: 0; }
	.cc__name { font-size: 0.78rem; font-weight: 600; }
	.cc__time { font-size: 0.65rem; color: color-mix(in srgb, var(--text) 48%, transparent); font-variant-numeric: tabular-nums; }
	.cc__action { margin-left: auto; font-size: 0.7rem; font-weight: 600; color: #a78bfa; }
	.cc__alt { margin: 0.15rem 0 0; font-size: 0.62rem; color: color-mix(in srgb, var(--text) 35%, transparent); text-align: center; }

	.cc__empty { text-align: center; padding: 0.75rem 0; }
	.cc__empty-title { margin: 0; font-family: var(--font-display); font-size: 1rem; font-weight: 500; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.cc__empty-sub { margin: 0.2rem 0 0; font-size: 0.75rem; color: color-mix(in srgb, var(--text) 42%, transparent); }
</style>
