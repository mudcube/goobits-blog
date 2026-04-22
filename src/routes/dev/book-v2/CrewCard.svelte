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
		<div class="cc__header"><span class="cc__header-line"></span><span class="cc__header-text">Join someone</span><span class="cc__header-line"></span></div>
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
	.cc { margin-bottom: 0.6rem; }
	.cc__header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem; }
	.cc__header-line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 10%, transparent); }
	.cc__header-text { font-size: 0.6rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); white-space: nowrap; }
	.cc__divider { height: 1px; background: color-mix(in srgb, var(--text) 7%, transparent); }
	.cc__row { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0; }
	.cc__dot { width: 0.38rem; height: 0.38rem; border-radius: 999px; background: var(--c); flex-shrink: 0; }
	.cc__name { font-size: 0.8rem; font-weight: 600; }
	.cc__time { font-size: 0.68rem; color: color-mix(in srgb, var(--text) 48%, transparent); font-variant-numeric: tabular-nums; }
	.cc__join { margin-left: auto; font: inherit; font-size: 0.7rem; font-weight: 600; color: #a78bfa; flex-shrink: 0; padding: 0.28rem 0.6rem; border: 1px solid color-mix(in srgb, #a78bfa 25%, transparent); border-radius: 0.35rem; background: color-mix(in srgb, #a78bfa 5%, transparent); cursor: pointer; transition: all 140ms; box-shadow: 0 1px 4px color-mix(in srgb, #7a5af8 10%, transparent); }
	.cc__join:hover { background: color-mix(in srgb, #a78bfa 12%, transparent); border-color: color-mix(in srgb, #a78bfa 40%, transparent); box-shadow: 0 2px 8px color-mix(in srgb, #7a5af8 18%, transparent); }
	.cc__empty { text-align: center; padding: 0.75rem 0; }
	.cc__empty-title { margin: 0; font-family: var(--font-display); font-size: 1rem; font-weight: 500; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.cc__empty-sub { margin: 0.2rem 0 0; font-size: 0.75rem; color: color-mix(in srgb, var(--text) 42%, transparent); }
</style>
