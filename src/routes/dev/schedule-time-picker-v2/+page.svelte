<script lang="ts">
	import { GripVertical } from '@lucide/svelte'
	import { Hero, PageShell } from '@miko/ui'
	import { createMockWeatherProvider, describeWeatherCode, isPrecipitation } from '$lib/app/weather'

	const weather = createMockWeatherProvider()
	const day = weather.getDay('2026-02-25')!

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
		const pts = HOURLY.map(w => ({ x: pct(w.hour), y: 100 - ((w.temperature - TEMP_MIN) / TEMP_RANGE) * 80 }))
		if (pts.length === 0) return ''
		const first = pts[0]!
		const last = pts[pts.length - 1]!
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

	// Weather at start and end of selection
	function weatherAt(hour: number) {
		const exact = HOURLY.find(w => w.hour === Math.floor(hour))
		if (exact) return exact
		return HOURLY.reduce((a, b) => Math.abs(a.hour - hour) < Math.abs(b.hour - hour) ? a : b)
	}
	const wxStart = $derived(weatherAt(start))
	const wxEnd = $derived(weatherAt(end > start ? end - 1 : end))

	// Assign people to rows so overlapping bookings don't stack visually
	const peopleRows = $derived.by(() => {
		const rows: Array<Array<typeof OTHERS[number]>> = []
		for (const person of OTHERS) {
			let placed = false
			for (const row of rows) {
				const conflicts = row.some(p => p.start < person.end && p.end > person.start)
				if (!conflicts) { row.push(person); placed = true; break }
			}
			if (!placed) rows.push([person])
		}
		return rows
	})
	const peopleRowCount = $derived(peopleRows.length)

	let confirmed = $state(false)
	function confirm() { confirmed = true }
	function unconfirm() { confirmed = false }

	function pct(h: number) { return ((h - WINDOW_START) / (WINDOW_END - WINDOW_START)) * 100 }
	function snap(v: number) { return Math.round(v / SNAP) * SNAP }
	function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
	function ft(h: number) {
		const hr = Math.floor(h) % 24
		const min = Math.round((h - Math.floor(h)) * 60)
		const sfx = hr >= 12 ? 'p' : 'a'
		const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
		return min === 0 ? `${display}${sfx}` : `${display}:${String(min).padStart(2, '0')}${sfx}`
	}
	function ftShort(h: number) { const hr = Math.floor(h) % 24; if (hr === 0) return '12a'; if (hr < 12) return `${hr}`; if (hr === 12) return '12'; return `${hr - 12}` }
	function fDur(d: number) { const h = Math.floor(d); const m = Math.round((d - h) * 60); if (h === 0) return `${m}m`; if (m === 0) return `${h}h`; return `${h}h ${m}m` }

	function getHour(clientX: number) { if (!trackEl) return WINDOW_START; const rect = trackEl.getBoundingClientRect(); return snap(clamp(WINDOW_START + ((clientX - rect.left) / rect.width) * (WINDOW_END - WINDOW_START), WINDOW_START, WINDOW_END)) }

	function onDown(event: PointerEvent, type: 'start' | 'end' | 'range') { event.preventDefault(); event.stopPropagation(); dragging = type; if (type === 'range') dragOffset = getHour(event.clientX) - start; (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId) }
	function onMove(event: PointerEvent) {
		if (!dragging) return; const hour = getHour(event.clientX)
		if (dragging === 'start') { start = snap(clamp(hour, WINDOW_START, end - 0.5)) }
		else if (dragging === 'end') { end = snap(clamp(hour, start + 0.5, WINDOW_END)) }
		else { const dur = end - start; let ns = snap(hour - dragOffset); ns = clamp(ns, WINDOW_START, WINDOW_END - dur); start = ns; end = ns + dur }
	}
	function onUp() { dragging = null }

	const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21]

	// Rain area path (same approach as temp)
	function rainAreaPath() {
		const pts = HOURLY.map(w => ({ x: pct(w.hour), y: 100 - (Math.min(w.precipitation / MAX_PRECIP, 1) * 80) }))
		if (pts.length === 0) return ''
		const first = pts[0]!
		const last = pts[pts.length - 1]!
		return `M ${first.x},100 ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${last.x},100 Z`
	}

	const hasAnyRain = $derived(HOURLY.some(w => w.precipitation > 0))
</script>

<svelte:head><title>Time Picker v2 - Dev - MIKO.ART</title></svelte:head>
<svelte:window onpointermove={onMove} onpointerup={onUp} />

<PageShell className="tp2">
	<div class="tp2__inner">
		<Hero eyebrow="Dev" title="Time Picker v2" titleClass="tp2__hero-title" icon="/media/page-icons/labs-flask.png" iconAlt="Flask" subtitle="Three-lane track: sky, temperature, precipitation." compact />

		<div class="tp2__card">
			<div class="tp2__header">
				<span class="tp2__weekday">FRI</span>
				<h2 class="tp2__date">Feb 25</h2>
			</div>

			<!-- People lane (separate, above the weather track, stacked rows) -->
			{#if OTHERS.length > 0}
				<div class="tp2__people-lane" style="--rows:{peopleRowCount};">
					{#each peopleRows as row, rowIdx}
						{#each row as person}
							<div class="tp2__ppl-bar" class:tp2__ppl-bar--overlap={overlapping.includes(person)} style="left:{pct(person.start)}%; width:{pct(person.end) - pct(person.start)}%; --c:{person.color}; --row:{rowIdx};" title="{person.name} · {ft(person.start)}–{ft(person.end)}">
								<span class="tp2__ppl-name">{person.name}</span>
							</div>
						{/each}
					{/each}
				</div>
			{/if}

			<!-- Top ticks -->
			<div class="tp2__ticks tp2__ticks--top">
				{#each HOUR_TICKS as h}
					<span class="tp2__tick" style="left:{pct(h)}%;"><span class="tp2__tick-num">{ftShort(h)}</span><span class="tp2__tick-dot"></span></span>
				{/each}
			</div>

			<!-- Weather lanes (selection only spans these) -->
			<div class="tp2__lanes" bind:this={trackEl}>
				<!-- Lane 1: Sky (tallest) -->
				<div class="tp2__lane tp2__lane--sky">
					<div class="tp2__sky"></div>
					<div class="tp2__horizon"></div>
					<span class="tp2__lane-label">LIGHT</span>
				</div>

				<!-- Lane 2: Temperature (vertical color: blue bottom → amber top) -->
				<div class="tp2__lane tp2__lane--temp">
					<svg class="tp2__lane-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
						<defs>
							<linearGradient id="tp2-temp-vgrad" x1="0" x2="0" y1="1" y2="0">
								<stop offset="0%" stop-color="#3b6fa8" />
								<stop offset="35%" stop-color="#5a8ab0" />
								<stop offset="60%" stop-color="#b09060" />
								<stop offset="100%" stop-color="#d4944a" />
							</linearGradient>
						</defs>
						<path d={tempAreaPath()} fill="url(#tp2-temp-vgrad)" />
					</svg>
					{#each HOURLY.filter(w => w.hour % 4 === 0) as w}
						<span class="tp2__temp-num" style="left:{pct(w.hour)}%;">{w.temperature}°</span>
					{/each}
					<span class="tp2__lane-label">TEMP</span>
				</div>

				<!-- Lane 3: Rain (area graph) -->
				<div class="tp2__lane tp2__lane--rain">
					{#if hasAnyRain}
						<svg class="tp2__lane-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
							<defs>
								<linearGradient id="tp2-rain-grad" x1="0" x2="0" y1="0" y2="1">
									<stop offset="0%" stop-color="#60a5fa" />
									<stop offset="100%" stop-color="#2563eb" />
								</linearGradient>
							</defs>
							<path d={rainAreaPath()} fill="url(#tp2-rain-grad)" opacity="0.55" />
						</svg>
					{/if}
					<span class="tp2__lane-label">RAIN</span>
				</div>

				<!-- Selection spanning all lanes -->
				<div class="tp2__sel-vis">
					<div class="tp2__handle" style="left:{pct(start)}%;"><GripVertical size={10} strokeWidth={2.5} /></div>
					<div class="tp2__handle" style="left:{pct(end)}%;"><GripVertical size={10} strokeWidth={2.5} /></div>
				</div>
				<button type="button" class="tp2__sel" style="left:{pct(start)}%; width:{pct(end) - pct(start)}%;" onpointerdown={(e) => onDown(e, 'range')}>
					<span class="tp2__sel-label">{fDur(duration)}</span>
				</button>
				<button type="button" class="tp2__hit" style="left:{pct(start)}%;" onpointerdown={(e) => onDown(e, 'start')} aria-label="Adjust start time"></button>
				<button type="button" class="tp2__hit" style="left:{pct(end)}%;" onpointerdown={(e) => onDown(e, 'end')} aria-label="Adjust end time"></button>
			</div>

			<!-- Ticks -->
			<div class="tp2__ticks">
				{#each HOUR_TICKS as h}
					<span class="tp2__tick" style="left:{pct(h)}%;"><span class="tp2__tick-dot"></span><span class="tp2__tick-num">{ftShort(h)}</span></span>
				{/each}
				<span class="tp2__tick tp2__tick--sun" style="left:{pct(SUNRISE)}%;"><span class="tp2__tick-dot tp2__tick-dot--warm"></span><span class="tp2__tick-num tp2__tick-num--warm">rise</span></span>
				<span class="tp2__tick tp2__tick--sun" style="left:{pct(SUNSET)}%;"><span class="tp2__tick-dot tp2__tick-dot--warm"></span><span class="tp2__tick-num tp2__tick-num--warm">set</span></span>
			</div>

			<!-- Readout: start and end side by side -->
			<div class="tp2__readout">
				<div class="tp2__readout-edge">
					<span class="tp2__edge-time">{ft(start)}</span>
					<span class="tp2__edge-temp">{wxStart.temperature}°</span>
					<span class="tp2__edge-cond" class:tp2__edge-cond--rain={isPrecipitation(wxStart.weatherCode)}>{describeWeatherCode(wxStart.weatherCode)}</span>
					<span class="tp2__edge-wind">Wind {wxStart.windSpeed}</span>
				</div>
				<div class="tp2__readout-center">
					<span class="tp2__center-dur">{fDur(duration)}</span>
					<span class="tp2__center-tod">{timeOfDay}</span>
				</div>
				<div class="tp2__readout-edge tp2__readout-edge--end">
					<span class="tp2__edge-time">{ft(end)}</span>
					<span class="tp2__edge-temp">{wxEnd.temperature}°</span>
					<span class="tp2__edge-cond" class:tp2__edge-cond--rain={isPrecipitation(wxEnd.weatherCode)}>{describeWeatherCode(wxEnd.weatherCode)}</span>
					<span class="tp2__edge-wind">Wind {wxEnd.windSpeed}</span>
				</div>
			</div>

			{#if OTHERS.length > 0}
				<div class="tp2__divider"></div>
				<div class="tp2__people-detail">
					{#each OTHERS as other}
						<div class="tp2__person" class:tp2__person--on={overlapping.includes(other)}>
							<span class="tp2__person-dot" style="--c:{other.color};"></span>
							<span class="tp2__person-name">{other.name}</span>
							<span class="tp2__person-time">{ft(other.start)}–{ft(other.end)}</span>
						</div>
					{/each}
				</div>
			{/if}

			<div class="tp2__divider"></div>

			<!-- Inline confirm: subtle, not a loud button -->
			{#if !confirmed}
				<button type="button" class="tp2__set" onclick={confirm}>
					<span class="tp2__set-text">Confirm</span>
					<span class="tp2__set-arrow">→</span>
				</button>
			{:else}
				<div class="tp2__confirmed">
					<span class="tp2__confirmed-check">✓</span>
					<span class="tp2__confirmed-text">Set · {ft(start)}–{ft(end)}</span>
					<button type="button" class="tp2__confirmed-undo" onclick={unconfirm}>Change</button>
				</div>
			{/if}
		</div>
	</div>
</PageShell>

<style>
	.tp2__inner { max-width: 30rem; margin: 0 auto; }
	.tp2__card { padding: clamp(1.2rem, 3vw, 1.75rem); border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 1rem; background: linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 70%, transparent), color-mix(in srgb, var(--bg) 88%, transparent)); }
	.tp2__header { margin-bottom: 1.25rem; }
	.tp2__weekday { display: block; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; color: color-mix(in srgb, var(--text) 40%, transparent); margin-bottom: 0.2rem; }
	.tp2__date { margin: 0; font-family: var(--font-display); font-size: clamp(1.8rem, 5vw, 2.4rem); font-weight: 500; letter-spacing: -0.04em; line-height: 1; }

	/* ── Lanes container ── */
	/* ── People lane (separate from track, stacked rows) ── */
	.tp2__people-lane {
		position: relative;
		height: calc(var(--rows) * 1.1rem + 0.15rem);
		margin-bottom: 3px;
		border-radius: 0.4rem;
		overflow: hidden;
		background: #08090e;
		border: 1px solid color-mix(in srgb, var(--text) 6%, transparent);
	}

	.tp2__lanes {
		position: relative;
		display: grid;
		grid-template-rows: 5rem 1.8rem 1.8rem;
		gap: 1px;
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--text) 6%, transparent);
		touch-action: none;
		margin-bottom: 0.5rem;
		background: color-mix(in srgb, var(--text) 4%, transparent);
	}

	.tp2__lane { position: relative; overflow: hidden; }

	.tp2__lane-label {
		position: absolute; top: 0.2rem; left: 0.35rem;
		font-size: 0.4rem; font-weight: 700; letter-spacing: 0.1em;
		color: color-mix(in srgb, white 20%, transparent);
		z-index: 6; pointer-events: none;
	}

	.tp2__ppl-bar {
		position: absolute;
		top: calc(var(--row) * 1.1rem + 0.1rem);
		height: calc(1.1rem - 0.15rem);
		border-radius: 0.25rem;
		background: color-mix(in srgb, var(--c) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--c) 22%, transparent);
		display: flex; align-items: center; padding: 0 0.3rem;
		transition: opacity 150ms;
		opacity: 0.5;
		cursor: default;
	}
	.tp2__ppl-bar--overlap { opacity: 1; }
	.tp2__ppl-name {
		font-size: 0.48rem; font-weight: 700;
		color: color-mix(in srgb, var(--c) 75%, transparent);
		white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}

	/* ── Sky lane ── */
	.tp2__lane--sky { background: #080a14; }
	.tp2__sky { position: absolute; inset: 0; background: linear-gradient(90deg, #0a0c1a 0%, #12132a 8%, #1a1535 14%, #2d1f42 18%, #4a2a4a 22%, #7a4a3a 26%, #c4794a 29%, #d4944a 31%, #8b7a55 34%, #4a5a6a 38%, #3a4a62 42%, #344868 48%, #3a5070 52%, #344868 58%, #3a4a62 62%, #4a5a6a 68%, #8b7a55 72%, #d4944a 74%, #c4794a 76%, #7a4a3a 79%, #4a2a4a 82%, #2d1f42 86%, #1a1535 90%, #12132a 94%, #0a0c1a 100%); }
	.tp2__horizon { position: absolute; left: 0; right: 0; top: 62%; height: 1px; background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, #c4794a 15%, transparent) 20%, color-mix(in srgb, #d4a85a 25%, transparent) 35%, color-mix(in srgb, #d4a85a 20%, transparent) 50%, color-mix(in srgb, #d4a85a 25%, transparent) 65%, color-mix(in srgb, #c4794a 15%, transparent) 80%, transparent 100%); box-shadow: 0 0 8px color-mix(in srgb, #c4794a 12%, transparent); }

	/* ── Temp lane (vertical gradient: blue bottom → amber top) ── */
	.tp2__lane--temp { background: #0a0c14; }
	.tp2__lane-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
	.tp2__temp-num {
		position: absolute; top: 50%; transform: translate(-50%, -50%);
		font-size: 0.5rem; font-weight: 700; font-variant-numeric: tabular-nums;
		color: color-mix(in srgb, white 45%, transparent);
		z-index: 5; pointer-events: none;
		text-shadow: 0 1px 3px rgba(0,0,0,0.6);
	}

	/* ── Rain lane (area graph) ── */
	.tp2__lane--rain { background: #080a10; }

	/* ── Selection ── */
	.tp2__sel {
		position: absolute; top: 0; bottom: 0;
		background: color-mix(in srgb, white 3%, transparent);
		border-left: 1px solid color-mix(in srgb, white 20%, transparent);
		border-right: 1px solid color-mix(in srgb, white 20%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, white 3%, transparent), 0 0 24px color-mix(in srgb, #a78bfa 8%, transparent);
		cursor: grab; z-index: 12;
		display: flex; align-items: center; justify-content: center;
		padding: 0; font: inherit; border-radius: 0;
	}
	.tp2__sel-label { font-size: 0.7rem; font-weight: 600; color: color-mix(in srgb, white 70%, transparent); pointer-events: none; user-select: none; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }

	.tp2__sel-vis { pointer-events: none; position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 15; }
	.tp2__handle {
		position: absolute; top: 50%; width: 0.9rem; height: 0.9rem; border-radius: 999px;
		background: color-mix(in srgb, var(--bg) 80%, white 20%);
		border: 1.5px solid color-mix(in srgb, white 40%, transparent);
		transform: translate(-50%, -50%); box-shadow: 0 1px 6px rgba(0,0,0,0.5);
		display: flex; align-items: center; justify-content: center;
		color: color-mix(in srgb, white 55%, transparent);
	}
	.tp2__hit {
		position: absolute; top: 0; bottom: 0; width: 1.5rem; transform: translateX(-50%);
		z-index: 25; cursor: ew-resize; background: none; border: none; padding: 0; font: inherit;
	}

	/* ── Ticks (top and bottom) ── */
	.tp2__ticks { position: relative; height: 1.3rem; margin-bottom: 0.15rem; }
	.tp2__ticks--top { margin-bottom: 0.15rem; margin-top: 0; }
	.tp2__ticks--top .tp2__tick { flex-direction: column-reverse; }
	.tp2__tick { position: absolute; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
	.tp2__tick-dot { width: 2px; height: 2px; border-radius: 999px; background: color-mix(in srgb, var(--text) 22%, transparent); }
	.tp2__tick-num { font-size: 0.52rem; font-weight: 600; color: color-mix(in srgb, var(--text) 28%, transparent); }
	.tp2__tick-dot--warm { background: #c4794a; width: 3px; height: 3px; }
	.tp2__tick-num--warm { color: color-mix(in srgb, #c4794a 60%, transparent); font-size: 0.48rem; }

	/* ── Readout: start/end side by side ── */
	.tp2__readout { display: grid; grid-template-columns: 1fr auto 1fr; gap: 0.5rem; align-items: start; margin-bottom: 0; }
	.tp2__readout-edge { display: grid; gap: 0.15rem; }
	.tp2__readout-edge--end { text-align: right; }
	.tp2__edge-time { font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
	.tp2__edge-temp { font-family: var(--font-display); font-size: 1rem; font-weight: 500; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: color-mix(in srgb, var(--text) 75%, transparent); }
	.tp2__edge-cond { font-size: 0.68rem; font-weight: 600; color: color-mix(in srgb, var(--text) 50%, transparent); }
	.tp2__edge-cond--rain { color: #60a5fa; }
	.tp2__edge-wind { font-size: 0.58rem; color: color-mix(in srgb, var(--text) 30%, transparent); }
	.tp2__readout-center { text-align: center; padding-top: 0.15rem; }
	.tp2__center-dur { display: block; font-size: 0.82rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.tp2__center-tod { display: block; font-size: 0.62rem; font-weight: 500; color: color-mix(in srgb, var(--text) 32%, transparent); text-transform: lowercase; }

	.tp2__divider { height: 1px; background: color-mix(in srgb, var(--text) 8%, transparent); box-shadow: 0 0 6px color-mix(in srgb, #a78bfa 4%, transparent); margin: 1rem 0; }

	/* ── People detail ── */
	.tp2__people-detail { display: grid; gap: 0.35rem; }
	.tp2__person { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 42%, transparent); transition: color 150ms; }
	.tp2__person--on { color: color-mix(in srgb, var(--text) 72%, transparent); }
	.tp2__person-dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; background: var(--c); opacity: 0.6; flex-shrink: 0; }
	.tp2__person--on .tp2__person-dot { opacity: 1; }
	.tp2__person-name { font-weight: 600; }
	.tp2__person-time { margin-left: auto; font-size: 0.68rem; font-variant-numeric: tabular-nums; color: color-mix(in srgb, var(--text) 30%, transparent); }
	.tp2__person--on .tp2__person-time { color: color-mix(in srgb, var(--text) 50%, transparent); }

	/* ── Inline confirm ── */
	.tp2__set {
		width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
		padding: 0.7rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		border-radius: 0.5rem; background: transparent; color: var(--text);
		font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer;
		transition: all 180ms;
	}
	.tp2__set:hover { background: color-mix(in srgb, var(--text) 5%, transparent); border-color: color-mix(in srgb, var(--text) 22%, transparent); }
	.tp2__set-text { letter-spacing: 0.02em; }
	.tp2__set-arrow { font-size: 1rem; transition: transform 180ms; }
	.tp2__set:hover .tp2__set-arrow { transform: translateX(3px); }

	.tp2__confirmed {
		display: flex; align-items: center; gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid color-mix(in srgb, #3cbf8a 22%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, #3cbf8a 4%, transparent);
	}
	.tp2__confirmed-check { color: #3cbf8a; font-size: 0.9rem; font-weight: 700; }
	.tp2__confirmed-text { font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, #3cbf8a 75%, var(--text) 25%); font-variant-numeric: tabular-nums; }
	.tp2__confirmed-undo {
		margin-left: auto; padding: 0; border: none; background: none;
		font: inherit; font-size: 0.68rem; font-weight: 600;
		color: color-mix(in srgb, var(--text) 42%, transparent);
		cursor: pointer; text-decoration: underline;
		text-underline-offset: 2px;
	}
	.tp2__confirmed-undo:hover { color: color-mix(in srgb, var(--text) 65%, transparent); }

	@media (max-width: 30rem) {
		.tp2__card { padding: 1rem; }
		.tp2__lanes { grid-template-rows: 4rem 1.5rem 1.5rem; }
		.tp2__readout { grid-template-columns: 1fr auto 1fr; gap: 0.3rem; }
		.tp2__edge-time { font-size: 1rem; }
		.tp2__edge-temp { font-size: 0.85rem; }
	}
</style>
