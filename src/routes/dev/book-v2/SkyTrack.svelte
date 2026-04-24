<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import { Thermometer, CloudRain } from '@lucide/svelte'
	import { SNAP, snap, clamp, pct as pctFn, ft, ftShort } from './sky-time'

	let {
		windowStart = 0,
		windowEnd = 24,
		sunrise,
		sunset,
		hourly,
		hasRain = false,
		animate = false,
		start = $bindable(12),
		end = $bindable(14),
	}: {
		windowStart?: number
		windowEnd?: number
		sunrise: number
		sunset: number
		hourly: HourlyWeather[]
		hasRain?: boolean
		animate?: boolean
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

	// Smart temperature label placement
	const tempLabels = $derived.by(() => {
		if (hourly.length < 3) return hourly.map(w => w.hour)
		const candidates: Array<{ hour: number; temp: number; priority: number }> = []

		// Find peaks, valleys, and endpoints
		for (let i = 0; i < hourly.length; i++) {
			const prev = hourly[i - 1]?.temperature ?? hourly[i]!.temperature
			const curr = hourly[i]!.temperature
			const next = hourly[i + 1]?.temperature ?? curr
			const isPeak = curr >= prev && curr >= next
			const isValley = curr <= prev && curr <= next
			const isEndpoint = i === 0 || i === hourly.length - 1
			const isMax = curr === tempMax
			const isMin = curr === tempMin

			if (isMax) candidates.push({ hour: hourly[i]!.hour, temp: curr, priority: 3 })
			else if (isMin) candidates.push({ hour: hourly[i]!.hour, temp: curr, priority: 3 })
			else if (isPeak || isValley) candidates.push({ hour: hourly[i]!.hour, temp: curr, priority: 2 })
			else if (isEndpoint) candidates.push({ hour: hourly[i]!.hour, temp: curr, priority: 1 })
		}

		// Sort by priority (highest first), then deduplicate by min distance
		candidates.sort((a, b) => b.priority - a.priority)
		const MIN_PCT_GAP = 10 // minimum % distance between labels
		const chosen: typeof candidates = []
		for (const c of candidates) {
			const xPct = pct(c.hour)
			const tooClose = chosen.some(ch => Math.abs(pct(ch.hour) - xPct) < MIN_PCT_GAP)
			if (!tooClose) chosen.push(c)
		}

		return chosen.map(c => c.hour).sort((a, b) => a - b)
	})

	// Sky gradient — modeled after real sky colors
	function skyGradient() {
		const r = (h: number) => `${(h / 24) * 100}%`
		return `linear-gradient(90deg,` +
			// Night
			`#0b1026 0%, #0b1026 ${r(sunrise - 2)},` +
			// Pre-dawn: indigo → purple
			`#1a1040 ${r(sunrise - 1.2)}, #3b2066 ${r(sunrise - 0.5)},` +
			// Sunrise: rose → peach-gold
			`#c4627a ${r(sunrise)}, #e8a565 ${r(sunrise + 0.6)},` +
			// Morning: pale warm → pale blue → blue
			`#d4b07a ${r(sunrise + 1.2)}, #7ab0d4 ${r(sunrise + 2.5)},` +
			// Midday: vivid blue
			`#4a90d9 ${r(12 - 1.5)}, #3a7bd5 ${r(12)}, #4a90d9 ${r(12 + 1.5)},` +
			// Afternoon → golden hour: blue → pale blue → warm
			`#7ab0d4 ${r(sunset - 2.5)}, #d4b07a ${r(sunset - 1.2)},` +
			// Sunset: peach-gold → rose
			`#e8a565 ${r(sunset - 0.6)}, #c4627a ${r(sunset)},` +
			// Twilight: purple → indigo
			`#5c3478 ${r(sunset + 0.5)}, #1a1040 ${r(sunset + 1.2)},` +
			// Night
			`#0b1026 ${r(sunset + 2)}, #0b1026 100%)`
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

	const ALL_HOURS = Array.from({ length: 25 }, (_, i) => i)
	const MAJOR_HOURS = new Set([0, 3, 6, 9, 12, 15, 18, 21, 24])

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
<div class="st__lanes" class:st__lanes--dry={!hasRain} class:st__lanes--anim={animate && !dragging} bind:this={trackEl}>
	<div class="st__lane st__lane--main">
		<div class="st__sky" style="background:{skyGradient()};"></div>
		{#each STAR_SEEDS as star}
			{#if star.xBase < sunrisePct || star.xBase > sunsetPct}
				<span class="st__star" style="left:{star.xBase}%; top:{star.y}%;"></span>
			{/if}
		{/each}
		<div class="st__horizon"></div>
		<div class="st__ground"></div>
		<svg class="st__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
			<defs><linearGradient id="st-tg" x1="0" x2="0" y1="1" y2="0"><stop offset="0%" stop-color="rgba(8, 10, 20, 0.9)" /><stop offset="30%" stop-color="rgba(12, 18, 35, 0.7)" /><stop offset="70%" stop-color="rgba(40, 60, 90, 0.3)" /><stop offset="100%" stop-color="rgba(60, 80, 110, 0.15)" /></linearGradient></defs>
			<path d={tempAreaPath()} fill="url(#st-tg)" />
			<path d={tempLinePath()} fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.4" />
		</svg>
		{#each hourly.filter(w => tempLabels.includes(w.hour)) as w}
			<span class="st__temp" style="left:{pct(w.hour)}%; bottom:{((w.temperature - tempMin) / tempRange) * 70 + 6}%;">{w.temperature}°</span>
		{/each}
	</div>

	{#if hasRain}
		<div class="st__lane st__lane--rain">
			<svg class="st__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
				<defs><linearGradient id="st-rg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#3b82f6" /></linearGradient></defs>
				<path d={rainAreaPath()} fill="url(#st-rg)" opacity="0.65" />
			</svg>
		</div>
	{/if}

	<!-- Lane labels (above masks) -->
	<span class="st__label st__label--temp"><Thermometer size={9} strokeWidth={2} /> Temp</span>
	{#if hasRain}<span class="st__label st__label--rain"><CloudRain size={9} strokeWidth={2} /> Rain</span>{/if}

	<!-- Selection -->
	<div class="st__sel-vis">
		<div class="st__handle" style="left:{pct(start)}%;"></div>
		<div class="st__handle" style="left:{pct(end)}%;"></div>
	</div>
	<div class="st__mask st__mask--left" style="width:{pct(start)}%;"></div>
	<div class="st__mask st__mask--right" style="left:{pct(end)}%; width:{100 - pct(end)}%;"></div>
	<button type="button" class="st__sel" style="left:{pct(start)}%; width:{pct(end) - pct(start)}%;" data-tip="Drag to move" onpointerdown={(e) => onDown(e, 'range')} aria-label="Selected time range, drag to move"></button>
	<button type="button" class="st__hit" data-tip="Drag to resize" style="left:{pct(start)}%; z-index:{pct(end) - pct(start) < 5 ? 16 : 15};" onpointerdown={(e) => onDown(e, 'start')} onkeydown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); start = snap(clamp(start - SNAP, windowStart, end - 0.25)) } if (e.key === 'ArrowRight') { e.preventDefault(); start = snap(clamp(start + SNAP, windowStart, end - 0.25)) } }} aria-label="Start time, use arrow keys to adjust"></button>
	<button type="button" class="st__hit" data-tip="Drag to resize" style="left:{pct(end)}%;" onpointerdown={(e) => onDown(e, 'end')} onkeydown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); end = snap(clamp(end - SNAP, start + 0.25, windowEnd)) } if (e.key === 'ArrowRight') { e.preventDefault(); end = snap(clamp(end + SNAP, start + 0.25, windowEnd)) } }} aria-label="End time, use arrow keys to adjust"></button>
</div>

<!-- Ticks -->
<div class="st__ticks">
	{#each ALL_HOURS as h}
		{@const nearSun = Math.abs(h - sunrise) < 1.5 || Math.abs(h - sunset) < 1.5}
		{#if !nearSun}
			<span class="st__tick" style="left:{pct(h)}%;">
				<span class="st__tick-line" class:st__tick-line--major={MAJOR_HOURS.has(h)}></span>
				{#if MAJOR_HOURS.has(h)}<span class="st__tick-num">{ftShort(h)}</span>{/if}
			</span>
		{/if}
	{/each}
	<span class="st__tick st__tick--sun" style="left:{pct(sunrise)}%;"><span class="st__tick-line st__tick-line--sun"></span><span class="st__tick-num st__tick-num--warm">{ft(sunrise)}</span></span>
	<span class="st__tick st__tick--sun" style="left:{pct(sunset)}%;"><span class="st__tick-line st__tick-line--sun"></span><span class="st__tick-num st__tick-num--warm">{ft(sunset)}</span></span>
</div>

<style>
	/* Track */
	.st__lanes { position: relative; display: grid; grid-template-rows: 6rem 2rem; gap: 2px; border-radius: 0.65rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--text) 6%, transparent); touch-action: none; background: color-mix(in srgb, var(--text) 8%, transparent); margin-bottom: 0.15rem; }
	.st__lanes--dry { grid-template-rows: 6rem; }
	.st__lane { position: relative; overflow: hidden; }
	.st__lane--main { background: #080a14; }
	.st__lane--rain { background: #080a10; }
	/* Lane labels — siblings of masks, z above masks */
	.st__label { position: absolute; left: 0.4rem; display: inline-flex; align-items: center; gap: 0.15rem; font-size: 0.42rem; font-weight: 700; color: rgba(255, 255, 255, 0.5); z-index: 6; pointer-events: none; letter-spacing: 0.04em; text-transform: uppercase; }
	.st__label--temp { top: 0.3rem; }
	.st__label--rain { bottom: 0.35rem; }
	.st__sky { position: absolute; inset: 0; }
	.st__star { position: absolute; width: 1.5px; height: 1.5px; border-radius: 999px; background: white; opacity: 0.12; pointer-events: none; z-index: 1; }
	.st__horizon { position: absolute; left: 0; right: 0; top: 60%; height: 1px; background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, #c4794a 12%, transparent) 22%, color-mix(in srgb, #d4a85a 20%, transparent) 38%, color-mix(in srgb, #d4a85a 16%, transparent) 50%, color-mix(in srgb, #d4a85a 20%, transparent) 62%, color-mix(in srgb, #c4794a 12%, transparent) 78%, transparent 100%); box-shadow: 0 0 5px color-mix(in srgb, #c4794a 8%, transparent); }
	.st__ground { position: absolute; left: 0; right: 0; bottom: 0; height: 40%; background: linear-gradient(to top, rgba(6, 8, 16, 0.6) 0%, rgba(6, 8, 16, 0.2) 40%, transparent 100%); z-index: 2; pointer-events: none; }
	.st__svg { position: absolute; inset: 0; width: 100%; height: 100%; }
	.st__temp { position: absolute; transform: translateX(-50%); font-size: 0.52rem; font-weight: 700; font-variant-numeric: tabular-nums; color: color-mix(in srgb, white 55%, transparent); z-index: 5; pointer-events: none; text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6); }

	/* Masks + Selection */
	.st__mask { position: absolute; top: 0; bottom: 0; background: rgba(4, 4, 10, 0.4); z-index: 5; pointer-events: none; }
	.st__mask--left { left: 0; border-radius: 0.65rem 0 0 0.65rem; }
	.st__mask--right { border-radius: 0 0.65rem 0.65rem 0; }
	.st__sel { position: absolute; top: 0; bottom: 0; background: color-mix(in srgb, white 3%, transparent); border-left: 1px solid color-mix(in srgb, white 20%, transparent); border-right: 1px solid color-mix(in srgb, white 20%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, white 3%, transparent), 0 0 20px color-mix(in srgb, #a78bfa 6%, transparent); cursor: grab; z-index: 10; padding: 0; font: inherit; border-radius: 0; transition: background 120ms; }
	.st__sel:hover { background: color-mix(in srgb, white 6%, transparent); }
	.st__sel-vis { pointer-events: none; position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 12; }
	.st__handle { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 0.75rem; height: 0.75rem; border-radius: 999px; background: #fff; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), 0 0 8px color-mix(in srgb, #a78bfa 15%, transparent); }
	.st__hit { position: absolute; top: 0; bottom: 0; width: 0.7rem; transform: translateX(-50%); z-index: 15; cursor: ew-resize; background: none; border: none; padding: 0; font: inherit; }
	.st__hit:focus-visible { outline: 2px solid #a78bfa; outline-offset: 2px; border-radius: 2px; }
	@media (pointer: coarse) { .st__hit { width: 1.2rem; } }

	/* Animated transitions (crew tap, arrow keys) */
	.st__lanes--anim .st__sel,
	.st__lanes--anim .st__mask,
	.st__lanes--anim .st__hit,
	.st__lanes--anim .st__handle { transition: left 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s cubic-bezier(0.16, 1, 0.3, 1); }

	/* Ticks */
	.st__ticks { position: relative; height: 1.4rem; margin-bottom: 0; }
	.st__tick { position: absolute; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; }
	.st__tick-line { width: 1px; height: 0.25rem; background: color-mix(in srgb, var(--text) 18%, transparent); }
	.st__tick-line--major { height: 0.4rem; background: color-mix(in srgb, var(--text) 30%, transparent); }
	.st__tick-line--sun { height: 0.4rem; background: color-mix(in srgb, #c4794a 50%, transparent); }
	.st__tick-num { font-size: 0.48rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); margin-top: 0.08rem; }
	.st__tick-num--warm { color: color-mix(in srgb, #c4794a 55%, transparent); }

	@media (max-width: 30rem) { .st__lanes { grid-template-rows: 5rem 1.65rem; } .st__lanes--dry { grid-template-rows: 5rem; } }
</style>
