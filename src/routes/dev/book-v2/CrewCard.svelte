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
		<p class="cc__label">Join someone</p>
		{#each bookings as person}
			<button type="button" class="cc__row" class:cc__row--on={overlapping.some(o => o.name === person.name)} onclick={() => onJoin(person)}>
				<span class="cc__dot" style="--c:{person.color};"></span>
				<span class="cc__info">
					<span class="cc__name">{person.name}</span>
					<span class="cc__time">{ft(person.start)} – {ft(person.end)}</span>
				</span>
				<span class="cc__action">Join →</span>
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
	.cc { display: grid; gap: 0.3rem; margin-bottom: 0.5rem; }
	.cc__label { margin: 0 0 0.2rem; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 42%, transparent); }
	.cc__row { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.75rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, var(--card-bg) 50%, transparent); font: inherit; color: inherit; cursor: pointer; text-align: left; transition: all 150ms; }
	.cc__row:hover { border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, transparent); }
	.cc__row--on { border-color: color-mix(in srgb, #a78bfa 22%, transparent); }
	.cc__dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; background: var(--c); flex-shrink: 0; }
	.cc__info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
	.cc__name { font-size: 0.8rem; font-weight: 600; }
	.cc__time { font-size: 0.68rem; color: color-mix(in srgb, var(--text) 50%, transparent); font-variant-numeric: tabular-nums; }
	.cc__action { font-size: 0.72rem; font-weight: 600; color: #a78bfa; flex-shrink: 0; padding: 0.3rem 0.6rem; border: 1px solid color-mix(in srgb, #a78bfa 25%, transparent); border-radius: 0.35rem; background: color-mix(in srgb, #a78bfa 5%, transparent); transition: all 150ms; }
	.cc__row:hover .cc__action { background: color-mix(in srgb, #a78bfa 12%, transparent); border-color: color-mix(in srgb, #a78bfa 40%, transparent); }

	.cc__empty { text-align: center; padding: 0.75rem 0; }
	.cc__empty-title { margin: 0; font-family: var(--font-display); font-size: 1rem; font-weight: 500; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.cc__empty-sub { margin: 0.2rem 0 0; font-size: 0.75rem; color: color-mix(in srgb, var(--text) 42%, transparent); }
</style>
