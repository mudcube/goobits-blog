<script lang="ts">
	import { Hero, PageShell } from '@miko/ui'
	import DevBreadcrumb from '../DevBreadcrumb.svelte'
	import { describeWeatherCode, isPrecipitation } from '$lib/app/weather'
	import { GYM, buildOpenDays, getWeatherForDate, type OpenDay, type Person } from './mock-data'
	import { ft, fDur, formatDate } from './time'
	import SkyTrack from '../schedule-time-picker-v5/SkyTrack.svelte'

	type Step = 'calendar' | 'day' | 'done'

	const activity = GYM
	const openDays = buildOpenDays(activity)

	let step = $state<Step>('calendar')
	let selectedDay = $state<OpenDay | null>(null)
	let start = $state(12)
	let end = $state(14)
	let guestName = $state('')
	let claimed = $state(false)
	let animKey = $state(0)
	let direction = $state<'forward' | 'back'>('forward')

	const STEPS: Step[] = ['calendar', 'day', 'done']
	const stepIndex = $derived(STEPS.indexOf(step))
	const duration = $derived(end - start)
	const overlapping = $derived(selectedDay ? selectedDay.bookings.filter(o => o.start < end && o.end > start) : [])

	// Weather for selected day
	const dayWeather = $derived.by(() => {
		if (!selectedDay) return null
		const iso = selectedDay.date.toISOString().split('T')[0]!
		return getWeatherForDate(iso)
	})
	const HOURLY = $derived(dayWeather?.hourly ?? [])
	const TEMP_HIGH = $derived(Math.max(...(HOURLY.length ? HOURLY.map(w => w.temperature) : [0])))
	const hasAnyRain = $derived(HOURLY.some(w => w.precipitation > 0))

	function weatherAt(hour: number) {
		if (!HOURLY.length) return null
		const exact = HOURLY.find(w => w.hour === Math.floor(hour))
		return exact ?? HOURLY.reduce((a, b) => Math.abs(a.hour - hour) < Math.abs(b.hour - hour) ? a : b)
	}
	const wxStart = $derived(weatherAt(start))
	const wxEnd = $derived(weatherAt(end > start ? end - 1 : end))

	// People rows
	const peopleRows = $derived.by(() => {
		if (!selectedDay) return []
		const rows: Person[][] = []
		for (const person of selectedDay.bookings) {
			let placed = false
			for (const row of rows) { if (!row.some(p => p.start < person.end && p.end > person.start)) { row.push(person); placed = true; break } }
			if (!placed) rows.push([person])
		}
		return rows
	})

	// Calendar
	const calendarMonth = $derived.by(() => { const now = new Date(); return { year: now.getFullYear(), month: now.getMonth() } })
	const calendarDays = $derived.by(() => {
		const { year, month } = calendarMonth
		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const startPad = (firstDay.getDay() + 6) % 7
		const cells: Array<{ date: Date; inMonth: boolean; isToday: boolean; isOpen: boolean; isPast: boolean; bookingCount: number }> = []
		for (let i = startPad - 1; i >= 0; i--) { const d = new Date(year, month, -i); cells.push({ date: d, inMonth: false, isToday: false, isOpen: false, isPast: true, bookingCount: 0 }) }
		const today = new Date(); today.setHours(0, 0, 0, 0)
		for (let day = 1; day <= lastDay.getDate(); day++) {
			const d = new Date(year, month, day); const isPast = d < today; const match = openDays.find(od => od.date.getTime() === d.getTime())
			cells.push({ date: d, inMonth: true, isToday: d.getTime() === today.getTime(), isOpen: !!match, isPast, bookingCount: match?.bookings.length ?? 0 })
		}
		const endPad = (7 - cells.length % 7) % 7
		for (let i = 1; i <= endPad; i++) { const d = new Date(year, month + 1, i); cells.push({ date: d, inMonth: false, isToday: false, isOpen: false, isPast: false, bookingCount: 0 }) }
		return cells
	})
	const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

	// Navigation
	function go(next: Step) { const ni = STEPS.indexOf(next); direction = ni >= stepIndex ? 'forward' : 'back'; animKey++; step = next }

	function selectDay(day: OpenDay) {
		if (!claimed) return // show claim form
		selectedDay = day
		start = activity.windowStart + 2
		end = Math.min(start + 2, activity.windowEnd)
		go('day')
	}

	function joinPerson(person: Person) {
		start = person.start; end = person.end
		go('done')
	}

	function trySelectDay(day: OpenDay) {
		if (!claimed) { pendingDay = day; return }
		selectDay(day)
	}

	let pendingDay = $state<OpenDay | null>(null)

	function claimAndContinue() {
		if (!guestName.trim()) return
		claimed = true
		if (pendingDay) { selectDay(pendingDay); pendingDay = null }
	}
</script>

<svelte:head><title>Book - Dev - MIKO.ART</title></svelte:head>

<PageShell className="bk">
	<div class="bk__inner">
		<DevBreadcrumb />
		<Hero eyebrow="Dev" title="Book" icon="/media/page-icons/labs-flask.png" iconAlt="Flask" subtitle="Complete flow: link → calendar → time → booked." compact />
		<nav class="bk__versions"><a href="/dev/book/" aria-current="page">v1</a><a href="/dev/book-v2/">v2</a></nav>

		{#key animKey}
		<div class="bk__step" class:bk__step--fwd={direction === 'forward'} class:bk__step--back={direction === 'back'}>

		{#if step === 'calendar'}
			<!-- Activity header -->
			<div class="bk__activity">
				<span class="bk__activity-icon">{activity.icon}</span>
				<h2 class="bk__activity-name">{activity.label}</h2>
				<p class="bk__activity-tagline">{activity.tagline}</p>
			</div>

			<!-- Calendar -->
			<div class="bk__cal-weekdays">{#each WEEKDAYS as w}<span>{w}</span>{/each}</div>
			<div class="bk__cal-grid">
				{#each calendarDays as cell}
					<button type="button" class="bk__day" class:bk__day--other={!cell.inMonth} class:bk__day--past={cell.isPast} class:bk__day--today={cell.isToday} class:bk__day--open={cell.isOpen} disabled={!cell.isOpen || cell.isPast} onclick={() => { const m = openDays.find(od => od.date.getTime() === cell.date.getTime()); if (m) trySelectDay(m) }}>
						<span class="bk__day-num">{cell.date.getDate()}</span>
						{#if cell.isOpen && !cell.isPast}
							<span class="bk__day-dots"><span class="bk__dot"></span>{#if cell.bookingCount > 0}<span class="bk__dot bk__dot--grn"></span>{/if}</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Inline claim form (only if not claimed yet) -->
			{#if !claimed}
				<div class="bk__claim" class:bk__claim--active={!!pendingDay}>
					<p class="bk__claim-label">{pendingDay ? 'Enter your name to book:' : 'To book, just enter your name:'}</p>
					<form class="bk__claim-form" onsubmit={(e) => { e.preventDefault(); claimAndContinue() }}>
						<input class="bk__claim-input" type="text" placeholder="Your name" maxlength="60" autocomplete="name" bind:value={guestName} />
						<button type="submit" class="bk__claim-btn" disabled={!guestName.trim()}>Go →</button>
					</form>
					<p class="bk__claim-hint">Already have an account? <button type="button" class="bk__claim-link" onclick={() => claimed = true}>Sign in</button></p>
				</div>
			{/if}

		{:else if step === 'day' && selectedDay && dayWeather}
			<!-- Day view with SkyTrack -->
			<button type="button" class="bk__back" onclick={() => go('calendar')}>← {MONTH_NAMES[calendarMonth.month]}</button>

			<p class="bk__day-header">{formatDate(selectedDay.date)} · {TEMP_HIGH}° · {hasAnyRain ? 'Rain' : 'Dry'}</p>

			<SkyTrack
				sunrise={dayWeather.sunrise}
				sunset={dayWeather.sunset}
				hourly={HOURLY}
				hasRain={hasAnyRain}
				{peopleRows}
				{overlapping}
				bind:start
				bind:end
			/>

			<!-- Readout -->
			<div class="bk__readout">
				<div class="bk__readout-row1">
					<span class="bk__r-left"><span class="bk__r-time">{ft(start)}</span><span class="bk__r-line"></span></span>
					<span class="bk__r-dur">{fDur(duration)}</span>
					<span class="bk__r-right"><span class="bk__r-line"></span><span class="bk__r-time">{ft(end)}</span></span>
				</div>
				{#if wxStart && wxEnd}
					<div class="bk__readout-row2">
						<span class="bk__r-wx" class:bk__r-wx--rain={isPrecipitation(wxStart.weatherCode)}>{wxStart.temperature}° {describeWeatherCode(wxStart.weatherCode).toLowerCase()}</span>
						<span class="bk__r-wx bk__r-wx--end" class:bk__r-wx--rain={isPrecipitation(wxEnd.weatherCode)}>{wxEnd.temperature}° {describeWeatherCode(wxEnd.weatherCode).toLowerCase()}</span>
					</div>
				{/if}
			</div>

			<!-- Crew: tap to join -->
			{#if selectedDay.bookings.length > 0}
				<div class="bk__crew">
					{#each selectedDay.bookings as person}
						<button type="button" class="bk__crew-row" class:bk__crew-row--on={overlapping.some(o => o.name === person.name)} onclick={() => joinPerson(person)}>
							<span class="bk__crew-dot" style="--c:{person.color};"></span>
							<span class="bk__crew-name">{person.name}</span>
							<span class="bk__crew-time">{ft(person.start)}–{ft(person.end)}</span>
							<span class="bk__crew-join">Join →</span>
						</button>
					{/each}
				</div>
			{/if}

			<button type="button" class="bk__confirm" onclick={() => go('done')}>
				<span>I'm in · {ft(start)}–{ft(end)}</span><span class="bk__confirm-arrow">→</span>
			</button>

		{:else if step === 'done' && selectedDay}
			<!-- Done -->
			<div class="bk__done">
				<div class="bk__done-badge">✓</div>
				<h2 class="bk__done-title">You're in.</h2>
				<p class="bk__done-detail">{activity.icon} {activity.label} · {formatDate(selectedDay.date)}</p>
				<p class="bk__done-time">{ft(start)} – {ft(end)}</p>
				{#if overlapping.length > 0}
					<p class="bk__done-crew">{overlapping.map(p => p.name).join(' and ')} will be there too 🤙</p>
				{/if}
				<button type="button" class="bk__done-btn" onclick={() => go('calendar')}>Back to calendar</button>
			</div>
		{/if}

		</div>
		{/key}
	</div>
</PageShell>

<style>
	.bk__inner { max-width: 28rem; margin: 0 auto; }
	.bk__versions { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; }
	.bk__versions a { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); text-decoration: none; padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); }
	.bk__versions a:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.bk__versions a[aria-current="page"] { color: #a78bfa; border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, transparent); }

	.bk__step--fwd { animation: bk-fwd 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	.bk__step--back { animation: bk-back 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bk-fwd { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
	@keyframes bk-back { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

	/* Activity header */
	.bk__activity { text-align: center; margin-bottom: 1.25rem; }
	.bk__activity-icon { font-size: 2rem; display: block; margin-bottom: 0.3rem; }
	.bk__activity-name { margin: 0; font-family: var(--font-display); font-size: 1.6rem; font-weight: 500; letter-spacing: -0.03em; }
	.bk__activity-tagline { margin: 0.25rem 0 0; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 55%, transparent); }

	/* Calendar */
	.bk__cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.25rem; }
	.bk__cal-weekdays span { text-align: center; font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 40%, transparent); }
	.bk__cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; margin-bottom: 1rem; }
	.bk__day { position: relative; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.6rem; background: color-mix(in srgb, var(--panel-bg) 75%, transparent); font: inherit; cursor: pointer; padding: 0; transition: all 140ms ease; }
	.bk__day:hover:not(:disabled) { border-color: color-mix(in srgb, var(--text) 18%, transparent); transform: translateY(-1px); }
	.bk__day:disabled { cursor: default; }
	.bk__day--other { opacity: 0.2; }
	.bk__day--past { opacity: 0.3; }
	.bk__day--today { border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.bk__day--open { border-color: color-mix(in srgb, #a78bfa 28%, transparent); background: color-mix(in srgb, #a78bfa 5%, var(--panel-bg) 95%); }
	.bk__day-num { position: absolute; top: 0.4rem; right: 0.45rem; font-size: 0.78rem; font-weight: 600; }
	.bk__day-dots { position: absolute; bottom: 0.35rem; left: 0.45rem; display: flex; gap: 0.18rem; }
	.bk__dot { width: 0.28rem; height: 0.28rem; border-radius: 999px; background: #a78bfa; }
	.bk__dot--grn { background: #4ade80; }

	/* Claim form */
	.bk__claim { padding: 0.85rem 1rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.75rem; background: color-mix(in srgb, var(--card-bg) 60%, transparent); transition: border-color 200ms; }
	.bk__claim--active { border-color: color-mix(in srgb, #a78bfa 25%, transparent); }
	.bk__claim-label { margin: 0 0 0.5rem; font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.bk__claim-form { display: flex; gap: 0.35rem; }
	.bk__claim-input { flex: 1; padding: 0.5rem 0.65rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.4rem; background: color-mix(in srgb, var(--bg) 80%, transparent); color: var(--text); font: inherit; font-size: 0.82rem; }
	.bk__claim-input:focus { outline: none; border-color: color-mix(in srgb, #a78bfa 35%, transparent); }
	.bk__claim-btn { padding: 0.5rem 0.85rem; border: none; border-radius: 0.4rem; background: var(--gradient-action); color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
	.bk__claim-btn:disabled { opacity: 0.4; cursor: default; }
	.bk__claim-hint { margin: 0.4rem 0 0; font-size: 0.65rem; color: color-mix(in srgb, var(--text) 38%, transparent); }
	.bk__claim-link { padding: 0; border: none; background: none; color: #a78bfa; font: inherit; font-size: 0.65rem; font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }

	/* Day view */
	.bk__back { display: inline-block; margin-bottom: 0.75rem; padding: 0; border: none; background: none; color: color-mix(in srgb, var(--text) 50%, transparent); font: inherit; font-size: 0.75rem; font-weight: 500; cursor: pointer; }
	.bk__back:hover { color: var(--text); }
	.bk__day-header { margin: 0 0 0.75rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: color-mix(in srgb, var(--text) 62%, transparent); }

	/* Readout */
	.bk__readout { display: grid; gap: 0.2rem; margin-bottom: 0.6rem; }
	.bk__readout-row1 { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 0.4rem; }
	.bk__r-left, .bk__r-right { display: flex; align-items: center; gap: 0.4rem; }
	.bk__r-right { justify-content: flex-end; }
	.bk__r-time { font-family: var(--font-display); font-size: 1.1rem; font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; flex-shrink: 0; }
	.bk__r-line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 12%, transparent); min-width: 0.5rem; }
	.bk__r-dur { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 60%, transparent); white-space: nowrap; text-align: center; }
	.bk__readout-row2 { display: flex; justify-content: space-between; }
	.bk__r-wx { font-size: 0.7rem; font-weight: 500; color: color-mix(in srgb, var(--text) 60%, transparent); font-variant-numeric: tabular-nums; }
	.bk__r-wx--rain { color: #60a5fa; }
	.bk__r-wx--end { text-align: right; }

	/* Crew (tappable to join) */
	.bk__crew { display: grid; gap: 0.3rem; margin-bottom: 0.6rem; }
	.bk__crew-row { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.65rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, var(--card-bg) 50%, transparent); font: inherit; color: inherit; cursor: pointer; text-align: left; transition: all 150ms; font-size: 0.75rem; }
	.bk__crew-row:hover { border-color: color-mix(in srgb, #a78bfa 25%, transparent); background: color-mix(in srgb, #a78bfa 4%, transparent); }
	.bk__crew-row--on { border-color: color-mix(in srgb, #a78bfa 20%, transparent); }
	.bk__crew-dot { width: 0.4rem; height: 0.4rem; border-radius: 999px; background: var(--c); flex-shrink: 0; }
	.bk__crew-name { font-weight: 600; }
	.bk__crew-time { font-size: 0.65rem; color: color-mix(in srgb, var(--text) 45%, transparent); font-variant-numeric: tabular-nums; }
	.bk__crew-join { margin-left: auto; font-size: 0.68rem; font-weight: 600; color: #a78bfa; }

	/* Confirm */
	.bk__confirm { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem; border: none; border-radius: 0.5rem; background: var(--gradient-action); color: #fff; font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 14px color-mix(in srgb, #7a5af8 20%, transparent); transition: all 150ms; }
	.bk__confirm:hover { box-shadow: 0 4px 20px color-mix(in srgb, #7a5af8 30%, transparent); transform: translateY(-1px); }
	.bk__confirm-arrow { transition: transform 150ms; }
	.bk__confirm:hover .bk__confirm-arrow { transform: translateX(3px); }

	/* Done */
	.bk__done { text-align: center; padding: 2rem 0; }
	.bk__done-badge { width: 3rem; height: 3rem; border-radius: 999px; background: color-mix(in srgb, #3cbf8a 8%, transparent); border: 1px solid color-mix(in srgb, #3cbf8a 22%, transparent); color: #3cbf8a; display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; }
	.bk__done-title { margin: 0; font-family: var(--font-display); font-size: 1.6rem; font-weight: 500; letter-spacing: -0.03em; }
	.bk__done-detail { margin: 0.4rem 0 0; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.bk__done-time { margin: 0.1rem 0 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 500; }
	.bk__done-crew { margin: 0.6rem 0 1.25rem; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.bk__done-btn { width: 100%; padding: 0.6rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
	.bk__done-btn:hover { background: color-mix(in srgb, var(--text) 4%, transparent); }

	@media (max-width: 30rem) { .bk__day { border-radius: 0.45rem; } .bk__day-num { font-size: 0.68rem; top: 0.3rem; right: 0.35rem; } }
</style>
