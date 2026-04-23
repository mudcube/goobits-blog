<script lang="ts">
	import type { Person } from './types'
	import { ft } from './time'

	let {
		bookings,
		onJoin,
	}: {
		bookings: Person[]
		onJoin: (person: Person) => void
	} = $props()

	const hasBookings = $derived(bookings.length > 0)
</script>

{#if hasBookings}
	<div class="cc">
		<div class="cc__header"><span class="cc__line"></span><span class="cc__label">Join someone</span><span class="cc__line"></span></div>
		{#each bookings as person, i}
			{#if i > 0}<div class="cc__divider"></div>{/if}
			<div class="cc__row">
				<span class="cc__dot" style="--c:{person.color};"></span>
				<span class="cc__name">{person.name}</span>
				<span class="cc__time">{ft(person.start)}–{ft(person.end)}</span>
				<button type="button" class="cc__join" onclick={() => onJoin(person)}>Join</button>
			</div>
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
	.cc__header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
	.cc__line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 10%, transparent); }
	.cc__label { font-size: 0.58rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); white-space: nowrap; }
	.cc__divider { height: 1px; background: color-mix(in srgb, var(--text) 7%, transparent); }
	.cc__row { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0; }
	.cc__dot { width: 0.38rem; height: 0.38rem; border-radius: 999px; background: var(--c); flex-shrink: 0; }
	.cc__name { font-size: 0.78rem; font-weight: 600; }
	.cc__time { font-size: 0.78rem; color: color-mix(in srgb, var(--text) 48%, transparent); font-variant-numeric: tabular-nums; }
	.cc__join { margin-left: auto; font: inherit; font-size: 0.78rem; font-weight: 600; color: #fff; flex-shrink: 0; padding: 0.3rem 0.7rem; border: none; border-radius: 0.5rem; background: var(--gradient-action); cursor: pointer; transition: all 140ms; box-shadow: 0 1px 6px color-mix(in srgb, #7a5af8 15%, transparent); }
	.cc__join:hover { box-shadow: 0 2px 10px color-mix(in srgb, #7a5af8 25%, transparent); transform: translateY(-1px); }
	.cc__empty { text-align: center; padding: 0.75rem 0; }
	.cc__empty-title { margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.cc__empty-sub { margin: 0.2rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 42%, transparent); }
</style>
