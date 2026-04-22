<script lang="ts">
	import { Sun, CloudRain } from '@lucide/svelte'
	import { Hero, PageShell } from '@miko/ui'
	import { createMockWeatherProvider, describeWeatherCode, isPrecipitation } from '$lib/app/weather'

	const weather = createMockWeatherProvider()
	const day = weather.getDay('2026-04-19')!

	const SNAP = 0.25
	const WINDOW_START = 0
	const WINDOW_END = 24
	const SUNRISE = day.sunrise
	const SUNSET = day.sunset
	const HOURLY = day.hourly

	const OTHERS = [
		{ name: 'Jen', color: '#d4748c', start: 12, end: 14 },
		{ name: 'Tyler', color: '#d8944a', start: 13, end: 15 }
	]

	const TEMP_MIN = Math.min(...HOURLY.map(w => w.temperature))
	const TEMP_MAX = Math.max(...HOURLY.map(w => w.temperature))
	const TEMP_RANGE = TEMP_MAX - TEMP_MIN || 1
	const MAX_PRECIP = 0.1

	function tempAreaPath() {
		const pts = HOURLY.map(w => ({ x: pct(w.hour), y: 100 - ((w.temperature - TEMP_MIN) / TEMP_RANGE) * 75 }))
		if (pts.length === 0) return ''
		const first = pts[0]!; const last = pts[pts.length - 1]!
		return `M ${first.x},100 ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${last.x},100 Z`
	}

	function tempLinePath() {
		const pts = HOURLY.map(w => ({ x: pct(w.hour), y: 100 - ((w.temperature - TEMP_MIN) / TEMP_RANGE) * 75 }))
		if (pts.length === 0) return ''
		return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
	}

	function rainAreaPath() {
		const pts = HOURLY.map(w => ({ x: pct(w.hour), y: 100 - (Math.min(w.precipitation / MAX_PRECIP, 1) * 80) }))
		if (pts.length === 0) return ''
		const first = pts[0]!; const last = pts[pts.length - 1]!
		return `M ${first.x},100 ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${last.x},100 Z`
	}

	let start = $state(12)
	let end = $state(14)
	let dragging = $state<'start' | 'end' | 'range' | null>(null)
	let trackEl = $state<HTMLDivElement | null>(null)
	let dragOffset = 0

	const duration = $derived(end - start)
	const timeOfDay = $derived.by(() => {
		const mid = (start + end) / 2
		if (mid < SUNRISE + 1) return 'dawn'
		if (mid < 12) return 'morning'
		if (mid < 14) return 'midday'
		if (mid < SUNSET - 1.5) return 'afternoon'
		if (mid < SUNSET + 0.5) return 'evening'
		return 'night'
	})

	const overlapping = $derived(OTHERS.filter(o => o.start < end && o.end > start))

	function weatherAt(hour: number) {
		const exact = HOURLY.find(w => w.hour === Math.floor(hour))
		if (exact) return exact
		return HOURLY.reduce((a, b) => Math.abs(a.hour - hour) < Math.abs(b.hour - hour) ? a : b)
	}
	const wxStart = $derived(weatherAt(start))
	const wxEnd = $derived(weatherAt(end > start ? end - 1 : end))

	const peopleRows = $derived.by(() => {
		const rows: Array<Array<typeof OTHERS[number]>> = []
		for (const person of OTHERS) {
			let placed = false
			for (const row of rows) {
				if (!row.some(p => p.start < person.end && p.end > person.start)) { row.push(person); placed = true; break }
			}
			if (!placed) rows.push([person])
		}
		return rows
	})
	let confirmed = $state(false)

	function pct(h: number) { return ((h - WINDOW_START) / (WINDOW_END - WINDOW_START)) * 100 }
	function snap(v: number) { return Math.round(v / SNAP) * SNAP }
	function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
	function ft(h: number) {
		const hr = Math.floor(h) % 24; const min = Math.round((h - Math.floor(h)) * 60)
		const sfx = hr >= 12 ? 'p' : 'a'; const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
		return min === 0 ? `${display}${sfx}` : `${display}:${String(min).padStart(2, '0')}${sfx}`
	}
	function ftShort(h: number) { const hr = Math.floor(h) % 24; if (hr === 0) return '12a'; if (hr < 12) return `${hr}`; if (hr === 12) return '12'; return `${hr - 12}` }
	function fDur(d: number) { const h = Math.floor(d); const m = Math.round((d - h) * 60); if (h === 0) return `${m}m`; if (m === 0) return `${h}h`; return `${h}h ${m}m` }

	function getHour(clientX: number) { if (!trackEl) return WINDOW_START; const rect = trackEl.getBoundingClientRect(); return snap(clamp(WINDOW_START + ((clientX - rect.left) / rect.width) * (WINDOW_END - WINDOW_START), WINDOW_START, WINDOW_END)) }
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
		if (dragging === 'start') { start = snap(clamp(hour - dragOffset, WINDOW_START, end - 0.25)) }
		else if (dragging === 'end') { end = snap(clamp(hour - dragOffset, start + 0.25, WINDOW_END)) }
		else { const dur = end - start; let ns = snap(hour - dragOffset); ns = clamp(ns, WINDOW_START, WINDOW_END - dur); start = ns; end = ns + dur }
	}
	function onUp() { dragging = null }

	const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]
	const hasAnyRain = $derived(HOURLY.some(w => w.precipitation > 0))

	// Dynamic sky gradient based on actual sunrise/sunset
	function skyGradient() {
		const r = (h: number) => `${(h / 24) * 100}%`
		const pre = SUNRISE - 1.5
		const rise = SUNRISE
		const riseEnd = SUNRISE + 0.75
		const setStart = SUNSET - 0.75
		const set = SUNSET
		const post = SUNSET + 1.5
		return `linear-gradient(90deg,
			#0a0c1a 0%,
			#0a0c1a ${r(pre)},
			#2d1f42 ${r(rise - 0.5)},
			#7a4a3a ${r(rise)},
			#d4944a ${r(riseEnd)},
			#8b7a55 ${r(riseEnd + 1)},
			#4a5a6a ${r(riseEnd + 2)},
			#344868 ${r(12 - 2)},
			#3a5070 ${r(12)},
			#344868 ${r(12 + 2)},
			#4a5a6a ${r(setStart - 2)},
			#8b7a55 ${r(setStart - 1)},
			#d4944a ${r(setStart)},
			#7a4a3a ${r(set)},
			#2d1f42 ${r(set + 0.5)},
			#0a0c1a ${r(post)},
			#0a0c1a 100%
		)`
	}
</script>

<svelte:head><title>Time Picker v3 - Dev - MIKO.ART</title></svelte:head>
<svelte:window onpointermove={onMove} onpointerup={onUp} />

<PageShell className="tp3">
	<div class="tp3__inner">
		<Hero eyebrow="Dev" title="Time Picker" icon="/media/page-icons/labs-flask.png" iconAlt="Flask" subtitle="Drag a time window across the day with weather and daylight cues." compact />
		<nav class="tp3__versions"><a href="/dev/schedule-time-picker/">v1</a><a href="/dev/schedule-time-picker-v2/">v2</a><a href="/dev/schedule-time-picker-v3/" aria-current="page">v3</a><a href="/dev/schedule-time-picker-v4/">v4</a><a href="/dev/schedule-time-picker-v5/">v5</a></nav>

		<div class="tp3__card">
			<div class="tp3__header">
				<span class="tp3__weekday">SAT</span>
				<h2 class="tp3__date">Apr 19</h2>
			</div>

			<!-- People strip (above track) -->
			{#if OTHERS.length > 0}
				<div class="tp3__people-strip" style="--rows:{peopleRows.length};">
					{#each peopleRows as row, rowIdx}
						{#each row as person}
							<div class="tp3__ppl" class:tp3__ppl--on={overlapping.includes(person)} style="left:{pct(person.start)}%; width:{pct(person.end) - pct(person.start)}%; --c:{person.color}; --row:{rowIdx};" title="{person.name} · {ft(person.start)}–{ft(person.end)}">
								<span class="tp3__ppl-name">{person.name}</span>
							</div>
						{/each}
					{/each}
				</div>
			{/if}

			<!-- Track: two lanes -->
			<div class="tp3__track-area">
				<div class="tp3__labels">
					<span class="tp3__label" style="grid-row: 1;"><Sun size={12} strokeWidth={1.8} /></span>
					<span class="tp3__label" style="grid-row: 2;"><CloudRain size={12} strokeWidth={1.8} /></span>
				</div>

				<div class="tp3__lanes" bind:this={trackEl}>
					<!-- Lane 1: Sky + Temp (combined) -->
					<div class="tp3__lane tp3__lane--main">
						<div class="tp3__sky" style="background:{skyGradient()};"></div>
						<div class="tp3__horizon"></div>

						<!-- Temp curve overlaid on sky -->
						<svg class="tp3__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
							<defs>
								<linearGradient id="tp3-tg" x1="0" x2="0" y1="1" y2="0">
									<stop offset="0%" stop-color="#3b6fa880" />
									<stop offset="40%" stop-color="#5a8ab080" />
									<stop offset="65%" stop-color="#b0906080" />
									<stop offset="100%" stop-color="#d4944a80" />
								</linearGradient>
							</defs>
							<path d={tempAreaPath()} fill="url(#tp3-tg)" />
							<polyline d={tempLinePath()} fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.4" />
						</svg>

						{#each HOURLY.filter(w => w.hour % 4 === 0) as w}
							<span class="tp3__temp-num" style="left:{pct(w.hour)}%; bottom:{((w.temperature - TEMP_MIN) / TEMP_RANGE) * 55 + 15}%;">{w.temperature}°</span>
						{/each}
					</div>

					<!-- Lane 2: Rain -->
					<div class="tp3__lane tp3__lane--rain">
						{#if hasAnyRain}
							<svg class="tp3__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
								<defs>
									<linearGradient id="tp3-rg" x1="0" x2="0" y1="0" y2="1">
										<stop offset="0%" stop-color="#60a5fa" />
										<stop offset="100%" stop-color="#2563eb" />
									</linearGradient>
								</defs>
								<path d={rainAreaPath()} fill="url(#tp3-rg)" opacity="0.55" />
							</svg>
						{:else}
							<span class="tp3__no-rain">Dry</span>
						{/if}
					</div>

					<!-- Selection -->
					<div class="tp3__sel-vis">
						<div class="tp3__handle tp3__handle--left" style="left:{pct(start)}%;"></div>
						<div class="tp3__handle tp3__handle--right" style="left:{pct(end)}%;"></div>
					</div>
					<div class="tp3__mask tp3__mask--left" style="width:{pct(start)}%;"></div>
					<div class="tp3__mask tp3__mask--right" style="left:{pct(end)}%; width:{100 - pct(end)}%;"></div>
					<button type="button" class="tp3__sel" style="left:{pct(start)}%; width:{pct(end) - pct(start)}%;" onpointerdown={(e) => onDown(e, 'range')} aria-label="Move selected time range">
						</button>
					<button type="button" class="tp3__hit" style="left:{pct(start)}%;" onpointerdown={(e) => onDown(e, 'start')} aria-label="Adjust start time"></button>
					<button type="button" class="tp3__hit" style="left:{pct(end)}%;" onpointerdown={(e) => onDown(e, 'end')} aria-label="Adjust end time"></button>
				</div>
			</div>

			<!-- Hour ticks (below rain) -->
			<div class="tp3__ticks">
				{#each HOUR_TICKS.filter(h => Math.abs(h - SUNRISE) > 1.5 && Math.abs(h - SUNSET) > 1.5) as h}
					<span class="tp3__tick" style="left:{pct(h)}%;"><span class="tp3__tick-dot"></span><span class="tp3__tick-num">{ftShort(h)}</span></span>
				{/each}
				<span class="tp3__tick tp3__tick--sun" style="left:{pct(SUNRISE)}%;"><span class="tp3__tick-dot tp3__tick-dot--warm"></span><span class="tp3__tick-num tp3__tick-num--warm">{ft(SUNRISE)}</span></span>
				<span class="tp3__tick tp3__tick--sun" style="left:{pct(SUNSET)}%;"><span class="tp3__tick-dot tp3__tick-dot--warm"></span><span class="tp3__tick-num tp3__tick-num--warm">{ft(SUNSET)}</span></span>
			</div>

			<!-- Readout -->
			<div class="tp3__readout">
				<div class="tp3__readout-edge">
					<span class="tp3__edge-time">{ft(start)}</span>
					<span class="tp3__edge-temp">{wxStart.temperature}°</span>
					<span class="tp3__edge-cond" class:tp3__edge-cond--rain={isPrecipitation(wxStart.weatherCode)}>{describeWeatherCode(wxStart.weatherCode)}</span>
					<span class="tp3__edge-wind">Wind {wxStart.windSpeed} mph</span>
				</div>
				<div class="tp3__readout-center">
					<span class="tp3__center-dur">{fDur(duration)}</span>
					<span class="tp3__center-tod">{timeOfDay}</span>
				</div>
				<div class="tp3__readout-edge tp3__readout-edge--end">
					<span class="tp3__edge-time">{ft(end)}</span>
					<span class="tp3__edge-temp">{wxEnd.temperature}°</span>
					<span class="tp3__edge-cond" class:tp3__edge-cond--rain={isPrecipitation(wxEnd.weatherCode)}>{describeWeatherCode(wxEnd.weatherCode)}</span>
					<span class="tp3__edge-wind">Wind {wxEnd.windSpeed} mph</span>
				</div>
			</div>

			{#if OTHERS.length > 0}
				<div class="tp3__divider"></div>
				<div class="tp3__people-detail">
					{#each OTHERS as other}
						<div class="tp3__person" class:tp3__person--on={overlapping.includes(other)}>
							<span class="tp3__person-dot" style="--c:{other.color};"></span>
							<span class="tp3__person-name">{other.name}</span>
							<span class="tp3__person-time">{ft(other.start)}–{ft(other.end)}</span>
						</div>
					{/each}
				</div>
			{/if}

			<div class="tp3__divider"></div>

			{#if !confirmed}
				<button type="button" class="tp3__set" onclick={() => confirmed = true}>
					<span>Confirm</span><span class="tp3__set-arrow">→</span>
				</button>
			{:else}
				<div class="tp3__confirmed">
					<span class="tp3__confirmed-check">✓</span>
					<span class="tp3__confirmed-text">Set · {ft(start)}–{ft(end)}</span>
					<button type="button" class="tp3__confirmed-undo" onclick={() => confirmed = false}>Change</button>
				</div>
			{/if}
		</div>
	</div>
</PageShell>

<style>
	.tp3__inner { max-width: 30rem; margin: 0 auto; }
	.tp3__versions { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; }
	.tp3__versions a { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); text-decoration: none; padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); }
	.tp3__versions a:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.tp3__versions a[aria-current="page"] { color: #a78bfa; border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, transparent); }
	.tp3__card { padding: clamp(1.2rem, 3vw, 1.75rem); border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 1rem; background: linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 70%, transparent), color-mix(in srgb, var(--bg) 88%, transparent)); }
	.tp3__header { margin-bottom: 1rem; }
	.tp3__weekday { display: block; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; color: color-mix(in srgb, var(--text) 40%, transparent); margin-bottom: 0.15rem; }
	.tp3__date { margin: 0; font-family: var(--font-display); font-size: clamp(1.8rem, 5vw, 2.4rem); font-weight: 500; letter-spacing: -0.04em; line-height: 1; }

	/* ── Ticks (top only) ── */
	.tp3__ticks { position: relative; height: 1.2rem; margin-bottom: 0.75rem; margin-left: 1.4rem; }
	.tp3__tick { position: absolute; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.08rem; }
	.tp3__tick-dot { width: 2px; height: 2px; border-radius: 999px; background: color-mix(in srgb, var(--text) 22%, transparent); }
	.tp3__tick-num { font-size: 0.52rem; font-weight: 600; color: color-mix(in srgb, var(--text) 30%, transparent); }
	.tp3__tick-dot--warm { background: #c4794a; width: 3px; height: 3px; }
	.tp3__tick-num--warm { color: color-mix(in srgb, #c4794a 60%, transparent); font-size: 0.48rem; }

	/* ── Track area: labels + lanes side by side ── */
	.tp3__track-area { display: grid; grid-template-columns: 1.4rem 1fr; margin-bottom: 0.25rem; }

	/* ── People strip ── */
	.tp3__people-strip {
		position: relative;
		height: calc(var(--rows, 1) * 1.1rem + 0.2rem);
		margin-left: 1.4rem;
		margin-bottom: 3px;
		border-radius: 0.4rem;
		overflow: hidden;
		background: #08090e;
		border: 1px solid color-mix(in srgb, var(--text) 6%, transparent);
	}

	.tp3__labels {
		display: grid;
		grid-template-rows: 5.5rem 2.2rem;
		gap: 1px;
		padding-right: 0.25rem;
	}
	.tp3__label {
		color: color-mix(in srgb, var(--text) 22%, transparent);
		display: flex; align-items: center; justify-content: flex-end;
	}

	.tp3__lanes {
		position: relative; display: grid;
		grid-template-rows: 5.5rem 2.2rem;
		gap: 1px; border-radius: 0.65rem; overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--text) 6%, transparent);
		touch-action: none;
		background: color-mix(in srgb, var(--text) 4%, transparent);
	}

	.tp3__lane { position: relative; overflow: hidden; }

	/* ── Combined sky+temp lane ── */
	.tp3__lane--main { background: #080a14; }
	.tp3__sky { position: absolute; inset: 0; background: linear-gradient(90deg, #0a0c1a 0%, #12132a 8%, #1a1535 14%, #2d1f42 18%, #4a2a4a 22%, #7a4a3a 26%, #c4794a 29%, #d4944a 31%, #8b7a55 34%, #4a5a6a 38%, #3a4a62 42%, #344868 48%, #3a5070 52%, #344868 58%, #3a4a62 62%, #4a5a6a 68%, #8b7a55 72%, #d4944a 74%, #c4794a 76%, #7a4a3a 79%, #4a2a4a 82%, #2d1f42 86%, #1a1535 90%, #12132a 94%, #0a0c1a 100%); }
	.tp3__horizon { position: absolute; left: 0; right: 0; top: 60%; height: 1px; background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, #c4794a 12%, transparent) 22%, color-mix(in srgb, #d4a85a 20%, transparent) 38%, color-mix(in srgb, #d4a85a 16%, transparent) 50%, color-mix(in srgb, #d4a85a 20%, transparent) 62%, color-mix(in srgb, #c4794a 12%, transparent) 78%, transparent 100%); box-shadow: 0 0 5px color-mix(in srgb, #c4794a 8%, transparent); }

	.tp3__ppl {
		position: absolute;
		top: calc(var(--row, 0) * 1.1rem + 0.1rem);
		height: calc(1.1rem - 0.15rem);
		border-radius: 0.25rem;
		background: color-mix(in srgb, var(--c) 14%, transparent);
		border: 1px solid color-mix(in srgb, var(--c) 25%, transparent);
		display: flex; align-items: center; padding: 0 0.3rem;
		z-index: 5; opacity: 0.5; transition: opacity 150ms; cursor: default;
	}
	.tp3__ppl--on { opacity: 1; }
	.tp3__ppl-name { font-size: 0.48rem; font-weight: 700; color: color-mix(in srgb, var(--c) 80%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

	/* ── Temp lane ── */
	.tp3__svg { position: absolute; inset: 0; width: 100%; height: 100%; }
	.tp3__temp-num {
		position: absolute; transform: translateX(-50%);
		font-size: 0.52rem; font-weight: 700; font-variant-numeric: tabular-nums;
		color: color-mix(in srgb, white 55%, transparent);
		z-index: 5; pointer-events: none;
		text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6);
	}

	/* ── Rain lane ── */
	.tp3__lane--rain { background: #080a10; }
	.tp3__no-rain { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.48rem; font-weight: 600; color: color-mix(in srgb, var(--text) 18%, transparent); letter-spacing: 0.06em; }

	/* ── Masks ── */
	.tp3__mask { position: absolute; top: 0; bottom: 0; background: rgba(4, 4, 10, 0.55); z-index: 8; pointer-events: none; }
	.tp3__mask--left { left: 0; border-radius: 0.65rem 0 0 0.65rem; }
	.tp3__mask--right { border-radius: 0 0.65rem 0.65rem 0; }

	/* ── Selection ── */
	.tp3__sel {
		position: absolute; top: 0; bottom: 0;
		background: color-mix(in srgb, white 3%, transparent);
		border-left: 1px solid color-mix(in srgb, white 20%, transparent);
		border-right: 1px solid color-mix(in srgb, white 20%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, white 3%, transparent), 0 0 20px color-mix(in srgb, #a78bfa 6%, transparent);
		cursor: grab; z-index: 12; display: flex; align-items: center; justify-content: center;
		padding: 0; font: inherit; border-radius: 0;
	}
	.tp3__sel-vis { pointer-events: none; position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 15; }
	.tp3__handle {
		position: absolute; top: 50%; transform: translateY(-50%);
		width: 0; height: 0;
		border-top: 0.55rem solid transparent;
		border-bottom: 0.55rem solid transparent;
		filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
	}
	.tp3__handle--left {
		border-right: 0.4rem solid rgba(10, 10, 18, 0.85);
		border-left: none;
		transform: translate(-100%, -50%);
		filter: drop-shadow(-1px 0 0 color-mix(in srgb, white 35%, transparent)) drop-shadow(0 -1px 0 color-mix(in srgb, white 18%, transparent)) drop-shadow(0 1px 0 color-mix(in srgb, white 18%, transparent));
	}
	.tp3__handle--right {
		border-left: 0.4rem solid rgba(10, 10, 18, 0.85);
		border-right: none;
		transform: translate(0, -50%);
		filter: drop-shadow(1px 0 0 color-mix(in srgb, white 35%, transparent)) drop-shadow(0 -1px 0 color-mix(in srgb, white 18%, transparent)) drop-shadow(0 1px 0 color-mix(in srgb, white 18%, transparent));
	}
	.tp3__hit { position: absolute; top: 0; bottom: 0; width: 1.5rem; transform: translateX(-50%); z-index: 25; cursor: ew-resize; background: none; border: none; padding: 0; font: inherit; }

	/* ── Readout ── */
	.tp3__readout { display: grid; grid-template-columns: 1fr auto 1fr; gap: 0.5rem; align-items: start; }
	.tp3__readout-edge { display: grid; gap: 0.12rem; }
	.tp3__readout-edge--end { text-align: right; }
	.tp3__edge-time { font-family: var(--font-display); font-size: 1.15rem; font-weight: 500; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
	.tp3__edge-temp { font-family: var(--font-display); font-size: 0.95rem; font-weight: 500; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: color-mix(in srgb, var(--text) 72%, transparent); }
	.tp3__edge-cond { font-size: 0.65rem; font-weight: 600; color: color-mix(in srgb, var(--text) 48%, transparent); }
	.tp3__edge-cond--rain { color: #60a5fa; }
	.tp3__edge-wind { font-size: 0.55rem; color: color-mix(in srgb, var(--text) 28%, transparent); }
	.tp3__readout-center { text-align: center; padding-top: 0.1rem; }
	.tp3__center-dur { display: block; font-size: 0.8rem; font-weight: 600; color: color-mix(in srgb, var(--text) 52%, transparent); }
	.tp3__center-tod { display: block; font-size: 0.58rem; font-weight: 500; color: color-mix(in srgb, var(--text) 30%, transparent); }

	.tp3__divider { height: 1px; background: color-mix(in srgb, var(--text) 8%, transparent); box-shadow: 0 0 6px color-mix(in srgb, #a78bfa 3%, transparent); margin: 0.85rem 0; }

	/* ── People detail ── */
	.tp3__people-detail { display: grid; gap: 0.3rem; }
	.tp3__person { display: flex; align-items: center; gap: 0.45rem; font-size: 0.75rem; color: color-mix(in srgb, var(--text) 40%, transparent); transition: color 150ms; }
	.tp3__person--on { color: color-mix(in srgb, var(--text) 70%, transparent); }
	.tp3__person-dot { width: 0.45rem; height: 0.45rem; border-radius: 999px; background: var(--c); opacity: 0.55; flex-shrink: 0; }
	.tp3__person--on .tp3__person-dot { opacity: 1; }
	.tp3__person-name { font-weight: 600; }
	.tp3__person-time { margin-left: auto; font-size: 0.65rem; font-variant-numeric: tabular-nums; color: color-mix(in srgb, var(--text) 28%, transparent); }
	.tp3__person--on .tp3__person-time { color: color-mix(in srgb, var(--text) 48%, transparent); }

	/* ── Confirm ── */
	.tp3__set {
		width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
		padding: 0.65rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		border-radius: 0.5rem; background: transparent; color: var(--text);
		font: inherit; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 180ms;
	}
	.tp3__set:hover { background: color-mix(in srgb, var(--text) 5%, transparent); border-color: color-mix(in srgb, var(--text) 22%, transparent); }
	.tp3__set-arrow { font-size: 1rem; transition: transform 180ms; }
	.tp3__set:hover .tp3__set-arrow { transform: translateX(3px); }

	.tp3__confirmed {
		display: flex; align-items: center; gap: 0.5rem;
		padding: 0.55rem 0.7rem;
		border: 1px solid color-mix(in srgb, #3cbf8a 22%, transparent);
		border-radius: 0.5rem; background: color-mix(in srgb, #3cbf8a 4%, transparent);
		animation: tp3-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes tp3-pop { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
	.tp3__confirmed-check { color: #3cbf8a; font-size: 0.85rem; font-weight: 700; }
	.tp3__confirmed-text { font-size: 0.75rem; font-weight: 600; color: color-mix(in srgb, #3cbf8a 72%, var(--text) 28%); font-variant-numeric: tabular-nums; }
	.tp3__confirmed-undo { margin-left: auto; padding: 0; border: none; background: none; font: inherit; font-size: 0.65rem; font-weight: 600; color: color-mix(in srgb, var(--text) 40%, transparent); cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
	.tp3__confirmed-undo:hover { color: color-mix(in srgb, var(--text) 62%, transparent); }

	@media (max-width: 30rem) {
		.tp3__card { padding: 1rem; }
		.tp3__track-area { grid-template-columns: 1.2rem 1fr; }
		.tp3__lanes { grid-template-rows: 4.5rem 1.8rem; }
		.tp3__labels { grid-template-rows: 4.5rem 1.8rem; }
		.tp3__ticks { margin-left: 1.2rem; }
		.tp3__people-strip { margin-left: 1.2rem; }
		.tp3__readout { gap: 0.3rem; }
		.tp3__edge-time { font-size: 0.95rem; }
	}
</style>
