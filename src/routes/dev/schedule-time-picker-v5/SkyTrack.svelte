<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import { SNAP, snap, clamp, pct as pctFn, ft, ftShort } from './time'

	let {
		windowStart = 0,
		windowEnd = 24,
		sunrise,
		sunset,
		hourly,
		hasRain = false,
		start = $bindable(12),
		end = $bindable(14),
	}: {
		windowStart?: number
		windowEnd?: number
		sunrise: number
		sunset: number
		hourly: HourlyWeather[]
		hasRain?: boolean
		start?: number
		end?: number
	} = $props()

	let dragging = $state<'start' | 'end' | 'range' | null>(null)
	let trackEl = $state<HTMLDivElement | null>(null)
	let dragOffset = 0

	function pct(h: number) { return pctFn(h, windowStart, windowEnd) }

	// Temperature
	const tempMin = $derived(Math.min(...hourly.map(w => w.temperature)))
	const tempMax = $derived(Math.max(...hourly.map(w => w.temperature)))
	const tempRange = $derived(tempMax - tempMin || 1)
	const MAX_PRECIP = 0.1

	function tempAreaPath() {
		const pts = hourly.map(w => ({ x: pct(w.hour), y: 100 - ((w.temperature - tempMin) / tempRange) * 70 }))
		if (pts.length === 0) return ''
		return `M ${pts[0]!.x},100 ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${pts[pts.length-1]!.x},100 Z`
	}
	function tempLinePath() {
		return hourly.map((w, i) => `${i === 0 ? 'M' : 'L'} ${pct(w.hour)},${100 - ((w.temperature - tempMin) / tempRange) * 70}`).join(' ')
	}
	function rainAreaPath() {
		const pts = hourly.map(w => ({ x: pct(w.hour), y: 100 - (Math.min(w.precipitation / MAX_PRECIP, 1) * 80) }))
		if (pts.length === 0) return ''
		return `M ${pts[0]!.x},100 ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${pts[pts.length-1]!.x},100 Z`
	}

	// Sky gradient
	function skyGradient() {
		const r = (h: number) => `${(h / 24) * 100}%`
		return `linear-gradient(90deg, #0a0c1a 0%, #0a0c1a ${r(sunrise - 1.5)}, #2d1f42 ${r(sunrise - 0.5)}, #7a4a3a ${r(sunrise)}, #d4944a ${r(sunrise + 0.75)}, #8b7a55 ${r(sunrise + 1.75)}, #4a5a6a ${r(sunrise + 2.75)}, #344868 ${r(12 - 2)}, #3a5070 ${r(12)}, #344868 ${r(12 + 2)}, #4a5a6a ${r(sunset - 2.75)}, #8b7a55 ${r(sunset - 1.75)}, #d4944a ${r(sunset - 0.75)}, #7a4a3a ${r(sunset)}, #2d1f42 ${r(sunset + 0.5)}, #0a0c1a ${r(sunset + 1.5)}, #0a0c1a 100%)`
	}

	// Stars in night portions
	const sunrisePct = $derived(pct(sunrise))
	const sunsetPct = $derived(pct(sunset))
	const STAR_SEEDS = [
		{ xBase: 2, y: 20 }, { xBase: 5, y: 40 }, { xBase: 8, y: 14 }, { xBase: 3.5, y: 55 },
		{ xBase: 1, y: 46 }, { xBase: 6, y: 62 }, { xBase: 4, y: 30 }, { xBase: 10, y: 35 },
		{ xBase: 12, y: 22 }, { xBase: 15, y: 48 }, { xBase: 18, y: 16 }, { xBase: 7, y: 68 },
		{ xBase: 82, y: 18 }, { xBase: 85, y: 44 }, { xBase: 88, y: 26 }, { xBase: 90, y: 58 },
		{ xBase: 93, y: 16 }, { xBase: 95, y: 46 }, { xBase: 97, y: 64 }, { xBase: 84, y: 35 },
		{ xBase: 92, y: 22 }, { xBase: 98, y: 42 }, { xBase: 86, y: 55 }, { xBase: 96, y: 30 },
	]

	const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]

	// Drag
	function getHour(clientX: number) {
		if (!trackEl) return windowStart
		const rect = trackEl.getBoundingClientRect()
		return snap(clamp(windowStart + ((clientX - rect.left) / rect.width) * (windowEnd - windowStart), windowStart, windowEnd))
	}
	function onDown(event: PointerEvent, type: 'start' | 'end' | 'range') {
		event.preventDefault(); event.stopPropagation(); dragging = type
		const hour = getHour(event.clientX)
		if (type === 'start') dragOffset = hour - start
		else if (type === 'end') dragOffset = hour - end
		else dragOffset = hour - start
		;(event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId)
	}
	function onMove(event: PointerEvent) {
		if (!dragging) return; const hour = getHour(event.clientX)
		if (dragging === 'start') { start = snap(clamp(hour - dragOffset, windowStart, end - 0.25)) }
		else if (dragging === 'end') { end = snap(clamp(hour - dragOffset, start + 0.25, windowEnd)) }
		else { const dur = end - start; let ns = snap(hour - dragOffset); ns = clamp(ns, windowStart, windowEnd - dur); start = ns; end = ns + dur }
	}
	function onUp() { dragging = null }
</script>

<svelte:window onpointermove={onMove} onpointerup={onUp} />

<!-- Track -->
<div class="st__lanes" class:st__lanes--dry={!hasRain} bind:this={trackEl}>
	<div class="st__lane st__lane--main">
		<div class="st__sky" style="background:{skyGradient()};"></div>
		{#each STAR_SEEDS as star}
			{#if star.xBase < sunrisePct || star.xBase > sunsetPct}
				<span class="st__star" style="left:{star.xBase}%; top:{star.y}%;"></span>
			{/if}
		{/each}
		<div class="st__horizon"></div>
		<svg class="st__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
			<defs><linearGradient id="st-tg" x1="0" x2="0" y1="1" y2="0"><stop offset="0%" stop-color="#3b6fa880" /><stop offset="40%" stop-color="#5a8ab080" /><stop offset="65%" stop-color="#b0906080" /><stop offset="100%" stop-color="#d4944a80" /></linearGradient></defs>
			<path d={tempAreaPath()} fill="url(#st-tg)" />
			<path d={tempLinePath()} fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.35" />
		</svg>
		{#each hourly.filter(w => w.hour % 4 === 0) as w}
			<span class="st__temp" style="left:{pct(w.hour)}%; bottom:{((w.temperature - tempMin) / tempRange) * 50 + 18}%;">{w.temperature}°</span>
		{/each}
	</div>

	{#if hasRain}
		<div class="st__lane st__lane--rain">
			<svg class="st__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
				<defs><linearGradient id="st-rg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#2563eb" /></linearGradient></defs>
				<path d={rainAreaPath()} fill="url(#st-rg)" opacity="0.55" />
			</svg>
		</div>
	{/if}

	<!-- Selection -->
	<div class="st__sel-vis">
		<div class="st__handle st__handle--left" style="left:{pct(start)}%;"></div>
		<div class="st__handle st__handle--right" style="left:{pct(end)}%;"></div>
	</div>
	<div class="st__mask st__mask--left" style="width:{pct(start)}%;"></div>
	<div class="st__mask st__mask--right" style="left:{pct(end)}%; width:{100 - pct(end)}%;"></div>
	<button type="button" class="st__sel" style="left:{pct(start)}%; width:{pct(end) - pct(start)}%;" onpointerdown={(e) => onDown(e, 'range')} aria-label="Selected time range, drag to move"></button>
	<button type="button" class="st__hit" style="left:{pct(start)}%;" onpointerdown={(e) => onDown(e, 'start')} onkeydown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); start = snap(clamp(start - SNAP, windowStart, end - 0.25)) } if (e.key === 'ArrowRight') { e.preventDefault(); start = snap(clamp(start + SNAP, windowStart, end - 0.25)) } }} aria-label="Start time, use arrow keys to adjust"></button>
	<button type="button" class="st__hit" style="left:{pct(end)}%;" onpointerdown={(e) => onDown(e, 'end')} onkeydown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); end = snap(clamp(end - SNAP, start + 0.25, windowEnd)) } if (e.key === 'ArrowRight') { e.preventDefault(); end = snap(clamp(end + SNAP, start + 0.25, windowEnd)) } }} aria-label="End time, use arrow keys to adjust"></button>
</div>

<!-- Ticks -->
<div class="st__ticks">
	{#each HOUR_TICKS.filter(h => Math.abs(h - sunrise) > 1.5 && Math.abs(h - sunset) > 1.5) as h}
		<span class="st__tick" style="left:{pct(h)}%;"><span class="st__tick-dot"></span><span class="st__tick-num">{ftShort(h)}</span></span>
	{/each}
	<span class="st__tick st__tick--sun" style="left:{pct(sunrise)}%;"><span class="st__tick-dot st__tick-dot--warm"></span><span class="st__tick-num st__tick-num--warm">{ft(sunrise)}</span></span>
	<span class="st__tick st__tick--sun" style="left:{pct(sunset)}%;"><span class="st__tick-dot st__tick-dot--warm"></span><span class="st__tick-num st__tick-num--warm">{ft(sunset)}</span></span>
</div>

<style>
	/* Track */
	.st__lanes { position: relative; display: grid; grid-template-rows: 6rem 2rem; gap: 1px; border-radius: 0.65rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--text) 6%, transparent); touch-action: none; background: color-mix(in srgb, var(--text) 4%, transparent); margin-bottom: 0.15rem; }
	.st__lanes--dry { grid-template-rows: 6rem; }
	.st__lane { position: relative; overflow: hidden; }
	.st__lane--main { background: #080a14; }
	.st__lane--rain { background: #080a10; }
	.st__sky { position: absolute; inset: 0; }
	.st__star { position: absolute; width: 1.5px; height: 1.5px; border-radius: 999px; background: white; opacity: 0.12; pointer-events: none; z-index: 1; }
	.st__horizon { position: absolute; left: 0; right: 0; top: 60%; height: 1px; background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, #c4794a 12%, transparent) 22%, color-mix(in srgb, #d4a85a 20%, transparent) 38%, color-mix(in srgb, #d4a85a 16%, transparent) 50%, color-mix(in srgb, #d4a85a 20%, transparent) 62%, color-mix(in srgb, #c4794a 12%, transparent) 78%, transparent 100%); box-shadow: 0 0 5px color-mix(in srgb, #c4794a 8%, transparent); }
	.st__svg { position: absolute; inset: 0; width: 100%; height: 100%; }
	.st__temp { position: absolute; transform: translateX(-50%); font-size: 0.52rem; font-weight: 700; font-variant-numeric: tabular-nums; color: color-mix(in srgb, white 55%, transparent); z-index: 5; pointer-events: none; text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6); }

	/* Masks + Selection */
	.st__mask { position: absolute; top: 0; bottom: 0; background: rgba(4, 4, 10, 0.55); z-index: 8; pointer-events: none; }
	.st__mask--left { left: 0; border-radius: 0.65rem 0 0 0.65rem; }
	.st__mask--right { border-radius: 0 0.65rem 0.65rem 0; }
	.st__sel { position: absolute; top: 0; bottom: 0; background: color-mix(in srgb, white 3%, transparent); border-left: 1px solid color-mix(in srgb, white 20%, transparent); border-right: 1px solid color-mix(in srgb, white 20%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, white 3%, transparent), 0 0 20px color-mix(in srgb, #a78bfa 6%, transparent); cursor: grab; z-index: 12; padding: 0; font: inherit; border-radius: 0; transition: background 120ms; }
	.st__sel:hover { background: color-mix(in srgb, white 6%, transparent); }
	.st__sel-vis { pointer-events: none; position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 15; }
	.st__handle { position: absolute; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 0.55rem solid transparent; border-bottom: 0.55rem solid transparent; }
	.st__handle--left { border-right: 0.4rem solid rgba(10, 10, 18, 0.85); transform: translate(-100%, -50%); filter: drop-shadow(-1px 0 0 color-mix(in srgb, white 35%, transparent)) drop-shadow(0 -1px 0 color-mix(in srgb, white 18%, transparent)) drop-shadow(0 1px 0 color-mix(in srgb, white 18%, transparent)); }
	.st__handle--right { border-left: 0.4rem solid rgba(10, 10, 18, 0.85); transform: translate(0, -50%); filter: drop-shadow(1px 0 0 color-mix(in srgb, white 35%, transparent)) drop-shadow(0 -1px 0 color-mix(in srgb, white 18%, transparent)) drop-shadow(0 1px 0 color-mix(in srgb, white 18%, transparent)); }
	.st__hit { position: absolute; top: 0; bottom: 0; width: 1.5rem; transform: translateX(-50%); z-index: 25; cursor: ew-resize; background: none; border: none; padding: 0; font: inherit; }
	.st__hit:focus-visible { outline: 2px solid #a78bfa; outline-offset: 2px; border-radius: 2px; }
	@media (pointer: coarse) { .st__hit { width: 2.75rem; } }

	/* Ticks */
	.st__ticks { position: relative; height: 1.2rem; margin-bottom: 0; }
	.st__tick { position: absolute; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.08rem; }
	.st__tick-dot { width: 2px; height: 2px; border-radius: 999px; background: color-mix(in srgb, var(--text) 35%, transparent); }
	.st__tick-num { font-size: 0.52rem; font-weight: 600; color: color-mix(in srgb, var(--text) 50%, transparent); }
	.st__tick-dot--warm { background: #c4794a; width: 3px; height: 3px; }
	.st__tick-num--warm { color: color-mix(in srgb, #c4794a 60%, transparent); font-size: 0.48rem; }

	@media (max-width: 30rem) { .st__lanes { grid-template-rows: 5rem 1.8rem; } .st__lanes--dry { grid-template-rows: 5rem; } }
</style>
