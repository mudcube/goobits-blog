<script lang="ts">
	import { CloudRain } from '@lucide/svelte'
	import { Hero, PageShell } from '@miko/ui'
	import { createMockWeatherProvider, describeWeatherCode, isPrecipitation } from '$lib/app/weather'

	const weather = createMockWeatherProvider()
	let forceRainState = $state(false)
	const clearDay = weather.getDay('2026-04-21')!
	const rainyDay = weather.getDay('2026-04-20')!
	const day = $derived(forceRainState ? rainyDay : clearDay)

	const SNAP = 0.25
	const WINDOW_START = 0
	const WINDOW_END = 24
	const SUNRISE = $derived(day.sunrise)
	const SUNSET = $derived(day.sunset)
	const HOURLY = $derived(day.hourly)

	const OTHERS = [
		{ name: 'Jen', color: '#d4748c', start: 12, end: 14 },
		{ name: 'Tyler', color: '#d8944a', start: 13, end: 15 }
	]

	const TEMP_MIN = $derived(Math.min(...HOURLY.map(w => w.temperature)))
	const TEMP_MAX = $derived(Math.max(...HOURLY.map(w => w.temperature)))
	const TEMP_RANGE = $derived(TEMP_MAX - TEMP_MIN || 1)
	const MAX_PRECIP = 0.1
	const TEMP_HIGH = $derived(Math.max(...HOURLY.map(w => w.temperature)))
	const hasAnyRain = $derived(HOURLY.some(w => w.precipitation > 0))
	const daySummary = $derived(hasAnyRain ? 'Rain' : 'Dry')

	function tempAreaPath() {
		const pts = HOURLY.map(w => ({ x: pct(w.hour), y: 100 - ((w.temperature - TEMP_MIN) / TEMP_RANGE) * 70 }))
		if (pts.length === 0) return ''
		return `M ${pts[0]!.x},100 ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${pts[pts.length-1]!.x},100 Z`
	}
	function tempLinePath() {
		return HOURLY.map((w, i) => `${i === 0 ? 'M' : 'L'} ${pct(w.hour)},${100 - ((w.temperature - TEMP_MIN) / TEMP_RANGE) * 70}`).join(' ')
	}
	function rainAreaPath() {
		const pts = HOURLY.map(w => ({ x: pct(w.hour), y: 100 - (Math.min(w.precipitation / MAX_PRECIP, 1) * 80) }))
		if (pts.length === 0) return ''
		return `M ${pts[0]!.x},100 ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${pts[pts.length-1]!.x},100 Z`
	}

	let start = $state(12)
	let end = $state(14)
	let dragging = $state<'start' | 'end' | 'range' | null>(null)
	let trackEl = $state<HTMLDivElement | null>(null)
	let dragOffset = 0
	let confirmed = $state(false)

	const duration = $derived(end - start)
	const overlapping = $derived(OTHERS.filter(o => o.start < end && o.end > start))

	function weatherAt(hour: number) {
		const exact = HOURLY.find(w => w.hour === Math.floor(hour))
		return exact ?? HOURLY.reduce((a, b) => Math.abs(a.hour - hour) < Math.abs(b.hour - hour) ? a : b)
	}
	const wxStart = $derived(weatherAt(start))
	const wxEnd = $derived(weatherAt(end > start ? end - 1 : end))

	const peopleRows = $derived.by(() => {
		const rows: Array<Array<typeof OTHERS[number]>> = []
		for (const person of OTHERS) {
			let placed = false
			for (const row of rows) { if (!row.some(p => p.start < person.end && p.end > person.start)) { row.push(person); placed = true; break } }
			if (!placed) rows.push([person])
		}
		return rows
	})

	function pct(h: number) { return ((h - WINDOW_START) / (WINDOW_END - WINDOW_START)) * 100 }
	function snap(v: number) { return Math.round(v / SNAP) * SNAP }
	function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
	function ft(h: number) { const hr = Math.floor(h) % 24; const min = Math.round((h - Math.floor(h)) * 60); const sfx = hr >= 12 ? 'p' : 'a'; const d = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr; return min === 0 ? `${d}${sfx}` : `${d}:${String(min).padStart(2, '0')}${sfx}` }
	function ftShort(h: number) { const hr = Math.floor(h) % 24; if (hr === 0 || hr === 24) return '12a'; if (hr < 12) return `${hr}`; if (hr === 12) return '12'; return `${hr - 12}` }
	function fDur(d: number) { const h = Math.floor(d); const m = Math.round((d - h) * 60); if (h === 0) return `${m}m`; if (m === 0) return `${h}h`; return `${h}h ${m}m` }

	function getHour(clientX: number) { if (!trackEl) return WINDOW_START; const rect = trackEl.getBoundingClientRect(); return snap(clamp(WINDOW_START + ((clientX - rect.left) / rect.width) * (WINDOW_END - WINDOW_START), WINDOW_START, WINDOW_END)) }
	function onDown(event: PointerEvent, type: 'start' | 'end' | 'range') { event.preventDefault(); event.stopPropagation(); dragging = type; const hour = getHour(event.clientX); if (type === 'start') dragOffset = hour - start; else if (type === 'end') dragOffset = hour - end; else dragOffset = hour - start; (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId) }
	function onMove(event: PointerEvent) { if (!dragging) return; const hour = getHour(event.clientX); if (dragging === 'start') { start = snap(clamp(hour - dragOffset, WINDOW_START, end - 0.25)) } else if (dragging === 'end') { end = snap(clamp(hour - dragOffset, start + 0.25, WINDOW_END)) } else { const dur = end - start; let ns = snap(hour - dragOffset); ns = clamp(ns, WINDOW_START, WINDOW_END - dur); start = ns; end = ns + dur } }
	function onUp() { dragging = null }

	const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]

	function skyGradient() {
		const r = (h: number) => `${(h / 24) * 100}%`
		return `linear-gradient(90deg, #0a0c1a 0%, #0a0c1a ${r(SUNRISE - 1.5)}, #2d1f42 ${r(SUNRISE - 0.5)}, #7a4a3a ${r(SUNRISE)}, #d4944a ${r(SUNRISE + 0.75)}, #8b7a55 ${r(SUNRISE + 1.75)}, #4a5a6a ${r(SUNRISE + 2.75)}, #344868 ${r(12 - 2)}, #3a5070 ${r(12)}, #344868 ${r(12 + 2)}, #4a5a6a ${r(SUNSET - 2.75)}, #8b7a55 ${r(SUNSET - 1.75)}, #d4944a ${r(SUNSET - 0.75)}, #7a4a3a ${r(SUNSET)}, #2d1f42 ${r(SUNSET + 0.5)}, #0a0c1a ${r(SUNSET + 1.5)}, #0a0c1a 100%)`
	}

	const STARS = [ { x: 2, y: 20 }, { x: 5, y: 40 }, { x: 8, y: 14 }, { x: 3.5, y: 55 }, { x: 88, y: 18 }, { x: 91, y: 44 }, { x: 95, y: 26 }, { x: 93, y: 58 }, { x: 97, y: 16 }, { x: 1, y: 46 }, { x: 6, y: 62 }, { x: 90, y: 64 }, { x: 4, y: 30 }, { x: 94, y: 35 } ]
</script>

<svelte:head><title>Time Picker v5 - Dev - MIKO.ART</title></svelte:head>
<svelte:window onpointermove={onMove} onpointerup={onUp} />

<PageShell className="tp5">
	<div class="tp5__inner">
		<Hero eyebrow="Dev" title="Time Picker" icon="/media/page-icons/labs-flask.png" iconAlt="Flask" subtitle="Drag a time window across the day with weather and daylight cues." compact />
		<div class="tp5__toolbar">
			<nav class="tp5__versions">
				<a href="/dev/schedule-time-picker/">v1</a>
				<a href="/dev/schedule-time-picker-v2/">v2</a>
				<a href="/dev/schedule-time-picker-v3/">v3</a>
				<a href="/dev/schedule-time-picker-v4/">v4</a>
				<a href="/dev/schedule-time-picker-v5/" aria-current="page">v5</a>
			</nav>
			<button type="button" class="tp5__rain-btn" class:tp5__rain-btn--on={forceRainState} onclick={() => forceRainState = !forceRainState}>
				<CloudRain size={11} strokeWidth={2} /> {forceRainState ? 'Rain' : 'Dry'}
			</button>
		</div>

		<div class="tp5__card">
			<!-- Compressed single-line header -->
			<p class="tp5__header">SAT · Apr 21 · {TEMP_HIGH}° · {daySummary}</p>

			<!-- People strip -->
			{#if OTHERS.length > 0}
				<div class="tp5__people" style="--rows:{peopleRows.length};">
					{#each peopleRows as row, rowIdx}
						{#each row as person}
							<div class="tp5__ppl" class:tp5__ppl--on={overlapping.includes(person)} style="left:{pct(person.start)}%; width:{pct(person.end) - pct(person.start)}%; --c:{person.color}; --row:{rowIdx};" title="{person.name} · {ft(person.start)}–{ft(person.end)}">
								<span class="tp5__ppl-name">{person.name}</span>
							</div>
						{/each}
					{/each}
				</div>
			{/if}

			<!-- Track -->
			<div class="tp5__lanes" class:tp5__lanes--dry={!hasAnyRain} bind:this={trackEl}>
				<div class="tp5__lane tp5__lane--main">
					<div class="tp5__sky" style="background:{skyGradient()};"></div>
					{#each STARS as star, i}
						<span class="tp5__star" style="left:{star.x}%; top:{star.y}%; animation-delay:{i * 0.4}s;"></span>
					{/each}
					<div class="tp5__horizon"></div>
					<svg class="tp5__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
						<defs><linearGradient id="tp5-tg" x1="0" x2="0" y1="1" y2="0"><stop offset="0%" stop-color="#3b6fa880" /><stop offset="40%" stop-color="#5a8ab080" /><stop offset="65%" stop-color="#b0906080" /><stop offset="100%" stop-color="#d4944a80" /></linearGradient></defs>
						<path d={tempAreaPath()} fill="url(#tp5-tg)" />
						<polyline d={tempLinePath()} fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.35" />
					</svg>
					{#each HOURLY.filter(w => w.hour % 4 === 0) as w}
						<span class="tp5__temp" style="left:{pct(w.hour)}%; bottom:{((w.temperature - TEMP_MIN) / TEMP_RANGE) * 50 + 18}%;">{w.temperature}°</span>
					{/each}
				</div>

				{#if hasAnyRain}
					<div class="tp5__lane tp5__lane--rain">
						<svg class="tp5__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
							<defs><linearGradient id="tp5-rg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#2563eb" /></linearGradient></defs>
							<path d={rainAreaPath()} fill="url(#tp5-rg)" opacity="0.55" />
						</svg>
					</div>
				{/if}

				<!-- Selection with time labels at edges -->
				<div class="tp5__sel-vis">
					<div class="tp5__handle tp5__handle--left" style="left:{pct(start)}%;"></div>
					<div class="tp5__handle tp5__handle--right" style="left:{pct(end)}%;"></div>
					<span class="tp5__sel-time tp5__sel-time--start" style="left:{pct(start)}%;">{ft(start)}</span>
					<span class="tp5__sel-time tp5__sel-time--end" style="left:{pct(end)}%;">{ft(end)}</span>
				</div>
				<div class="tp5__mask tp5__mask--left" style="width:{pct(start)}%;"></div>
				<div class="tp5__mask tp5__mask--right" style="left:{pct(end)}%; width:{100 - pct(end)}%;"></div>
				<button type="button" class="tp5__sel" style="left:{pct(start)}%; width:{pct(end) - pct(start)}%;" onpointerdown={(e) => onDown(e, 'range')}></button>
				<button type="button" class="tp5__hit" style="left:{pct(start)}%;" onpointerdown={(e) => onDown(e, 'start')} aria-label="Start time"></button>
				<button type="button" class="tp5__hit" style="left:{pct(end)}%;" onpointerdown={(e) => onDown(e, 'end')} aria-label="End time"></button>
			</div>

			<!-- Ticks -->
			<div class="tp5__ticks">
				{#each HOUR_TICKS.filter(h => Math.abs(h - SUNRISE) > 1.5 && Math.abs(h - SUNSET) > 1.5) as h}
					<span class="tp5__tick" style="left:{pct(h)}%;"><span class="tp5__tick-dot"></span><span class="tp5__tick-num">{ftShort(h)}</span></span>
				{/each}
				<span class="tp5__tick tp5__tick--sun" style="left:{pct(SUNRISE)}%;"><span class="tp5__tick-dot tp5__tick-dot--warm"></span><span class="tp5__tick-num tp5__tick-num--warm">{ft(SUNRISE)}</span></span>
				<span class="tp5__tick tp5__tick--sun" style="left:{pct(SUNSET)}%;"><span class="tp5__tick-dot tp5__tick-dot--warm"></span><span class="tp5__tick-num tp5__tick-num--warm">{ft(SUNSET)}</span></span>
			</div>

			<!-- Readout -->
			<div class="tp5__readout">
				<div class="tp5__readout-row1">
					<span class="tp5__r-left"><span class="tp5__r-time">{ft(start)}</span><span class="tp5__r-line"></span></span>
					<span class="tp5__r-dur">{fDur(duration)}</span>
					<span class="tp5__r-right"><span class="tp5__r-line"></span><span class="tp5__r-time">{ft(end)}</span></span>
				</div>
				<div class="tp5__readout-row2">
					<span class="tp5__r-wx" class:tp5__r-wx--rain={isPrecipitation(wxStart.weatherCode)}>{wxStart.temperature}° {describeWeatherCode(wxStart.weatherCode).toLowerCase()}</span>
					<span class="tp5__r-wx tp5__r-wx--end" class:tp5__r-wx--rain={isPrecipitation(wxEnd.weatherCode)}>{wxEnd.temperature}° {describeWeatherCode(wxEnd.weatherCode).toLowerCase()}</span>
				</div>
			</div>

			<!-- Crew + Confirm merged card -->
			<div class="tp5__footer">
				{#if OTHERS.length > 0}
					<div class="tp5__crew">
						{#each OTHERS as other}
							<div class="tp5__crew-row" class:tp5__crew-row--on={overlapping.includes(other)}>
								<span class="tp5__crew-dot" style="--c:{other.color};"></span>
								<span class="tp5__crew-name">{other.name}</span>
								<span class="tp5__crew-time">{ft(other.start)}–{ft(other.end)}</span>
							</div>
						{/each}
					</div>
				{/if}
				{#if !confirmed}
					<button type="button" class="tp5__confirm" onclick={() => confirmed = true}>
						<span>Confirm</span><span class="tp5__confirm-arrow">→</span>
					</button>
				{:else}
					<div class="tp5__set">
						<span class="tp5__set-check">✓</span>
						<span class="tp5__set-text">{ft(start)}–{ft(end)}</span>
						<button type="button" class="tp5__set-change" onclick={() => confirmed = false}>Change</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</PageShell>

<style>
	.tp5__inner { max-width: 30rem; margin: 0 auto; }
	.tp5__toolbar { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
	.tp5__versions { display: flex; gap: 0.5rem; }
	.tp5__versions a { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); text-decoration: none; padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); }
	.tp5__versions a:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.tp5__versions a[aria-current="page"] { color: #a78bfa; border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, transparent); }
	.tp5__rain-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); background: transparent; color: color-mix(in srgb, var(--text) 45%, transparent); font: inherit; font-size: 0.68rem; font-weight: 600; cursor: pointer; }
	.tp5__rain-btn:hover { border-color: color-mix(in srgb, var(--text) 25%, transparent); color: var(--text); }
	.tp5__rain-btn--on { color: #60a5fa; border-color: color-mix(in srgb, #60a5fa 30%, transparent); background: color-mix(in srgb, #60a5fa 6%, transparent); }

	.tp5__card { padding: clamp(1rem, 2.5vw, 1.5rem); border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 1rem; background: linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 70%, transparent), color-mix(in srgb, var(--bg) 88%, transparent)); }

	/* Single-line header */
	.tp5__header { margin: 0 0 0.75rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: color-mix(in srgb, var(--text) 50%, transparent); }

	/* People */
	.tp5__people { position: relative; height: calc(var(--rows, 1) * 1.1rem + 0.2rem); margin-bottom: 3px; border-radius: 0.4rem; overflow: hidden; background: #08090e; border: 1px solid color-mix(in srgb, var(--text) 6%, transparent); }
	.tp5__ppl { position: absolute; top: calc(var(--row, 0) * 1.1rem + 0.1rem); height: calc(1.1rem - 0.15rem); border-radius: 0.25rem; background: color-mix(in srgb, var(--c) 14%, transparent); border: 1px solid color-mix(in srgb, var(--c) 25%, transparent); display: flex; align-items: center; padding: 0 0.3rem; z-index: 5; opacity: 0.5; transition: opacity 150ms; cursor: default; }
	.tp5__ppl--on { opacity: 1; }
	.tp5__ppl-name { font-size: 0.48rem; font-weight: 700; color: color-mix(in srgb, var(--c) 80%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

	/* Track */
	.tp5__lanes { position: relative; display: grid; grid-template-rows: 6rem 2rem; gap: 1px; border-radius: 0.65rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--text) 6%, transparent); touch-action: none; background: color-mix(in srgb, var(--text) 4%, transparent); margin-bottom: 0.25rem; }
	.tp5__lanes--dry { grid-template-rows: 6rem; }
	.tp5__lane { position: relative; overflow: hidden; }
	.tp5__lane--main { background: #080a14; }
	.tp5__lane--rain { background: #080a10; }
	.tp5__sky { position: absolute; inset: 0; }
	.tp5__star { position: absolute; width: 1.5px; height: 1.5px; border-radius: 999px; background: white; pointer-events: none; z-index: 1; animation: tp5-twinkle 3.5s ease-in-out infinite; }
	@keyframes tp5-twinkle { 0%, 100% { opacity: 0.08; } 50% { opacity: 0.2; } }
	.tp5__horizon { position: absolute; left: 0; right: 0; top: 60%; height: 1px; background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, #c4794a 12%, transparent) 22%, color-mix(in srgb, #d4a85a 20%, transparent) 38%, color-mix(in srgb, #d4a85a 16%, transparent) 50%, color-mix(in srgb, #d4a85a 20%, transparent) 62%, color-mix(in srgb, #c4794a 12%, transparent) 78%, transparent 100%); box-shadow: 0 0 5px color-mix(in srgb, #c4794a 8%, transparent); }
	.tp5__svg { position: absolute; inset: 0; width: 100%; height: 100%; }
	.tp5__temp { position: absolute; transform: translateX(-50%); font-size: 0.52rem; font-weight: 700; font-variant-numeric: tabular-nums; color: color-mix(in srgb, white 55%, transparent); z-index: 5; pointer-events: none; text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6); }

	/* Masks + Selection */
	.tp5__mask { position: absolute; top: 0; bottom: 0; background: rgba(4, 4, 10, 0.55); z-index: 8; pointer-events: none; }
	.tp5__mask--left { left: 0; border-radius: 0.65rem 0 0 0.65rem; }
	.tp5__mask--right { border-radius: 0 0.65rem 0.65rem 0; }
	.tp5__sel { position: absolute; top: 0; bottom: 0; background: color-mix(in srgb, white 3%, transparent); border-left: 1px solid color-mix(in srgb, white 20%, transparent); border-right: 1px solid color-mix(in srgb, white 20%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, white 3%, transparent), 0 0 20px color-mix(in srgb, #a78bfa 6%, transparent); cursor: grab; z-index: 12; padding: 0; font: inherit; border-radius: 0; }
	.tp5__sel-vis { pointer-events: none; position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 15; }
	.tp5__handle { position: absolute; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 0.55rem solid transparent; border-bottom: 0.55rem solid transparent; }
	.tp5__handle--left { border-right: 0.4rem solid rgba(10, 10, 18, 0.85); transform: translate(-100%, -50%); filter: drop-shadow(-1px 0 0 color-mix(in srgb, white 35%, transparent)) drop-shadow(0 -1px 0 color-mix(in srgb, white 18%, transparent)) drop-shadow(0 1px 0 color-mix(in srgb, white 18%, transparent)); }
	.tp5__handle--right { border-left: 0.4rem solid rgba(10, 10, 18, 0.85); transform: translate(0, -50%); filter: drop-shadow(1px 0 0 color-mix(in srgb, white 35%, transparent)) drop-shadow(0 -1px 0 color-mix(in srgb, white 18%, transparent)) drop-shadow(0 1px 0 color-mix(in srgb, white 18%, transparent)); }
	.tp5__sel-time { position: absolute; top: -0.1rem; transform: translateX(-50%); font-size: 0.52rem; font-weight: 700; color: color-mix(in srgb, white 55%, transparent); pointer-events: none; font-variant-numeric: tabular-nums; text-shadow: 0 0 4px rgba(0,0,0,0.8); }
	.tp5__sel-time--start { transform: translateX(-50%); }
	.tp5__sel-time--end { transform: translateX(-50%); }
	.tp5__hit { position: absolute; top: 0; bottom: 0; width: 1.5rem; transform: translateX(-50%); z-index: 25; cursor: ew-resize; background: none; border: none; padding: 0; font: inherit; }

	/* Ticks */
	.tp5__ticks { position: relative; height: 1.2rem; margin-bottom: 0.6rem; }
	.tp5__tick { position: absolute; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.08rem; }
	.tp5__tick-dot { width: 2px; height: 2px; border-radius: 999px; background: color-mix(in srgb, var(--text) 22%, transparent); }
	.tp5__tick-num { font-size: 0.52rem; font-weight: 600; color: color-mix(in srgb, var(--text) 30%, transparent); }
	.tp5__tick-dot--warm { background: #c4794a; width: 3px; height: 3px; }
	.tp5__tick-num--warm { color: color-mix(in srgb, #c4794a 60%, transparent); font-size: 0.48rem; }

	/* Readout */
	.tp5__readout { display: grid; gap: 0.2rem; margin-bottom: 0.6rem; }
	.tp5__readout-row1 { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 0.4rem; }
	.tp5__r-left, .tp5__r-right { display: flex; align-items: center; gap: 0.4rem; }
	.tp5__r-right { justify-content: flex-end; }
	.tp5__r-time { font-family: var(--font-display); font-size: 1.1rem; font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; flex-shrink: 0; }
	.tp5__r-line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 12%, transparent); min-width: 0.5rem; }
	.tp5__r-dur { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); white-space: nowrap; text-align: center; }
	.tp5__readout-row2 { display: flex; justify-content: space-between; }
	.tp5__r-wx { font-size: 0.7rem; font-weight: 500; color: color-mix(in srgb, var(--text) 45%, transparent); font-variant-numeric: tabular-nums; }
	.tp5__r-wx--rain { color: #60a5fa; }
	.tp5__r-wx--end { text-align: right; }

	/* Footer: crew + confirm in one card */
	.tp5__footer { padding: 0.65rem 0.75rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.6rem; background: color-mix(in srgb, var(--card-bg) 50%, transparent); }
	.tp5__crew { display: grid; gap: 0.25rem; margin-bottom: 0.55rem; }
	.tp5__crew-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: color-mix(in srgb, var(--text) 38%, transparent); transition: color 150ms; }
	.tp5__crew-row--on { color: color-mix(in srgb, var(--text) 68%, transparent); }
	.tp5__crew-dot { width: 0.4rem; height: 0.4rem; border-radius: 999px; background: var(--c); opacity: 0.5; flex-shrink: 0; }
	.tp5__crew-row--on .tp5__crew-dot { opacity: 1; }
	.tp5__crew-name { font-weight: 600; }
	.tp5__crew-time { margin-left: auto; font-size: 0.62rem; font-variant-numeric: tabular-nums; color: color-mix(in srgb, var(--text) 26%, transparent); }
	.tp5__crew-row--on .tp5__crew-time { color: color-mix(in srgb, var(--text) 45%, transparent); }

	.tp5__confirm { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.5rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.4rem; background: transparent; color: var(--text); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 160ms; }
	.tp5__confirm:hover { background: color-mix(in srgb, var(--text) 4%, transparent); border-color: color-mix(in srgb, var(--text) 20%, transparent); }
	.tp5__confirm-arrow { transition: transform 160ms; }
	.tp5__confirm:hover .tp5__confirm-arrow { transform: translateX(3px); }

	.tp5__set { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.6rem; border: 1px solid color-mix(in srgb, #3cbf8a 20%, transparent); border-radius: 0.4rem; background: color-mix(in srgb, #3cbf8a 4%, transparent); animation: tp5-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes tp5-pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
	.tp5__set-check { color: #3cbf8a; font-size: 0.82rem; font-weight: 700; }
	.tp5__set-text { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, #3cbf8a 70%, var(--text) 30%); font-variant-numeric: tabular-nums; }
	.tp5__set-change { margin-left: auto; padding: 0; border: none; background: none; font: inherit; font-size: 0.62rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
	.tp5__set-change:hover { color: color-mix(in srgb, var(--text) 58%, transparent); }

	@media (max-width: 30rem) { .tp5__card { padding: 0.85rem; } .tp5__lanes { grid-template-rows: 5rem 1.8rem; } .tp5__lanes--dry { grid-template-rows: 5rem; } }
</style>
