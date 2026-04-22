<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte'
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
</script>

<div class="bs">
	<div class="bs__badge">
		<span class="bs__check">✓</span>
		<div class="bs__sparkle bs__sparkle--1"></div>
		<div class="bs__sparkle bs__sparkle--2"></div>
		<div class="bs__sparkle bs__sparkle--3"></div>
		<div class="bs__sparkle bs__sparkle--4"></div>
	</div>
	<h2 class="bs__title">You're in.</h2>
	<p class="bs__detail">{activityIcon} {activityLabel} · {formatDate(date)}</p>
	<p class="bs__time">{ft(start)} – {ft(end)}</p>
	{#if overlapping.length > 0}
		<p class="bs__crew">{overlapping.map(p => p.name).join(' and ')} will be there too 🤙</p>
	{/if}
	<button type="button" class="bs__back" onclick={onBack}>
		<ChevronLeft size={14} strokeWidth={2.2} />
		<span>Back to calendar</span>
	</button>
</div>

<style>
	.bs { text-align: center; padding: 1.5rem 0; animation: bs-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
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

	.bs__title { margin: 0; font-family: var(--font-display); font-size: 1.6rem; font-weight: 500; letter-spacing: -0.03em; }
	.bs__detail { margin: 0.35rem 0 0; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.bs__time { margin: 0.1rem 0 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 500; }
	.bs__crew { margin: 0.55rem 0 1.1rem; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.bs__back { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.6rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 150ms; }
	.bs__back:hover { background: color-mix(in srgb, var(--text) 4%, transparent); }
</style>
