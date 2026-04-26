<script lang="ts">
	import { CalendarPlus, ArrowLeft } from '@lucide/svelte'
	import type { Person } from './types'
	import { ft, formatDate } from './time'

	let {
		activityIcon,
		activityLabel,
		date,
		start,
		end,
		overlapping = [],
		onBack,
	}: {
		activityIcon: string
		activityLabel: string
		date: Date
		start: number
		end: number
		overlapping?: Person[]
		onBack: () => void
	} = $props()

	const crewNames = $derived(
		overlapping.length === 0 ? '' :
		overlapping.length === 1 ? overlapping[0]!.name :
		overlapping.slice(0, -1).map(p => p.name).join(', ') + ' and ' + overlapping[overlapping.length - 1]!.name
	)
</script>

<div class="bs">
	<div class="bs__badge">
		<span class="bs__check">✓</span>
		<div class="bs__sparkle bs__sparkle--1"></div>
		<div class="bs__sparkle bs__sparkle--2"></div>
		<div class="bs__sparkle bs__sparkle--3"></div>
		<div class="bs__sparkle bs__sparkle--4"></div>
	</div>
	<h2 class="bs__title">You're booked.</h2>

	<div class="bs__card">
		<p class="bs__activity">{activityIcon} {activityLabel}</p>
		<p class="bs__date">{formatDate(date)} · {ft(start)} – {ft(end)}</p>
	</div>

	{#if overlapping.length > 0}
		<div class="bs__crew">
			<div class="bs__crew-dots">
				{#each overlapping as person}
					<span class="bs__crew-dot" style="background:{person.color};"></span>
				{/each}
			</div>
			<p class="bs__crew-text">{crewNames} will be there too</p>
		</div>
	{/if}

	<div class="bs__actions">
		<button type="button" class="bs__add-cal">
			<CalendarPlus size={15} strokeWidth={2} />
			<span>Add to Calendar</span>
		</button>
		<button type="button" class="bs__back" onclick={onBack}>
			<ArrowLeft size={14} strokeWidth={2} />
			<span>Pick a different day</span>
		</button>
	</div>
</div>

<style>
	.bs { text-align: center; animation: bs-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bs-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

	.bs__badge { position: relative; width: 3.2rem; height: 3.2rem; margin: 0 auto 0.85rem; }
	.bs__check { width: 3.2rem; height: 3.2rem; border-radius: 999px; background: color-mix(in srgb, #3cbf8a 10%, transparent); border: 1.5px solid color-mix(in srgb, #3cbf8a 28%, transparent); color: #3cbf8a; display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; animation: bs-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
	@keyframes bs-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

	.bs__sparkle { position: absolute; width: 4px; height: 4px; border-radius: 999px; background: #3cbf8a; opacity: 0; }
	.bs__sparkle--1 { top: -6px; left: 50%; animation: bs-spark 0.6s 0.3s ease-out both; }
	.bs__sparkle--2 { bottom: -6px; left: 50%; animation: bs-spark 0.6s 0.4s ease-out both; }
	.bs__sparkle--3 { left: -6px; top: 50%; animation: bs-spark 0.6s 0.35s ease-out both; }
	.bs__sparkle--4 { right: -6px; top: 50%; animation: bs-spark 0.6s 0.45s ease-out both; }
	@keyframes bs-spark { 0% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1.5); } 100% { opacity: 0; transform: scale(0.5) translateY(-8px); } }

	.bs__title { margin: 0 0 0.75rem; font-family: var(--font-display); font-size: 1.5rem; font-weight: 500; letter-spacing: -0.03em; }

	.bs__card { padding: 0.65rem 0; border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent); }
	.bs__activity { margin: 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.bs__date { margin: 0.15rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 60%, transparent); }

	.bs__crew { margin-top: 0.65rem; }
	.bs__crew-dots { display: flex; justify-content: center; gap: 0.25rem; margin-bottom: 0.25rem; }
	.bs__crew-dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; }
	.bs__crew-text { margin: 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 55%, transparent); }

	.bs__actions { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.85rem; }
	.bs__add-cal { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem; border: 1px solid color-mix(in srgb, #a78bfa 25%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, #7a5af8 12%, transparent); color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 180ms; }
	.bs__add-cal:hover { background: color-mix(in srgb, #7a5af8 20%, transparent); border-color: color-mix(in srgb, #a78bfa 45%, transparent); transform: translateY(-1px); }
	.bs__back { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.55rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; background: transparent; color: color-mix(in srgb, var(--text) 55%, transparent); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 150ms; }
	.bs__back:hover { background: color-mix(in srgb, var(--text) 4%, transparent); color: var(--text); }
</style>
