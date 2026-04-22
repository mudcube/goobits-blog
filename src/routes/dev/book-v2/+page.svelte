<script lang="ts">
	import { Hero, PageShell } from '@miko/ui'
	import { GYM, buildOpenDays, weather } from './mock-data'
	import { ft, formatDate } from './time'
	import type { OpenDay, Person, Step } from './types'
	import SkyTrack from '../schedule-time-picker-v5/SkyTrack.svelte'
	import InlineClaim from './InlineClaim.svelte'
	import CrewCard from './CrewCard.svelte'
	import TimeReadout from './TimeReadout.svelte'
	import DoneScreen from './DoneScreen.svelte'

	const activity = GYM
	const openDays = buildOpenDays(activity)

	let step = $state<Step>('calendar')
	let selectedDay = $state<OpenDay | null>(null)
	let start = $state(12)
	let end = $state(14)
	let claimed = $state(false)
	let pendingDay = $state<OpenDay | null>(null)
	let animKey = $state(0)
	let direction = $state<'forward' | 'back'>('forward')
	let hasDragged = $state(false)

	const STEPS: Step[] = ['calendar', 'claim', 'day', 'done']
	const stepIndex = $derived(STEPS.indexOf(step))
	const overlapping = $derived(selectedDay ? selectedDay.bookings.filter(o => o.start < end && o.end > start) : [])

	const dayWeather = $derived.by(() => {
		if (!selectedDay) return null
		return weather.getDay(selectedDay.date.toISOString().split('T')[0]!)
	})
	const HOURLY = $derived(dayWeather?.hourly ?? [])
	const TEMP_HIGH = $derived(Math.max(...(HOURLY.length ? HOURLY.map(w => w.temperature) : [0])))
	const hasAnyRain = $derived(HOURLY.some(w => w.precipitation > 0))

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
	const calMonth = $derived.by(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() } })
	const calDays = $derived.by(() => {
		const { year, month } = calMonth
		const first = new Date(year, month, 1); const last = new Date(year, month + 1, 0)
		const pad = (first.getDay() + 6) % 7
		const cells: Array<{ date: Date; inMonth: boolean; isToday: boolean; isOpen: boolean; isPast: boolean; bookingCount: number }> = []
		for (let i = pad - 1; i >= 0; i--) cells.push({ date: new Date(year, month, -i), inMonth: false, isToday: false, isOpen: false, isPast: true, bookingCount: 0 })
		const today = new Date(); today.setHours(0, 0, 0, 0)
		for (let d = 1; d <= last.getDate(); d++) {
			const dt = new Date(year, month, d); const match = openDays.find(od => od.date.getTime() === dt.getTime())
			cells.push({ date: dt, inMonth: true, isToday: dt.getTime() === today.getTime(), isOpen: !!match, isPast: dt < today, bookingCount: match?.bookings.length ?? 0 })
		}
		const endPad = (7 - cells.length % 7) % 7
		for (let i = 1; i <= endPad; i++) cells.push({ date: new Date(year, month + 1, i), inMonth: false, isToday: false, isOpen: false, isPast: false, bookingCount: 0 })
		return cells
	})
	const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	function go(next: Step) { direction = STEPS.indexOf(next) >= stepIndex ? 'forward' : 'back'; animKey++; step = next }

	function tapDay(day: OpenDay) {
		pendingDay = day
		if (!claimed) return // claim form will slide open
		enterDay(day)
	}

	function enterDay(day: OpenDay) {
		selectedDay = day
		start = activity.windowStart + 2
		end = Math.min(start + 2, activity.windowEnd)
		hasDragged = false
		go('day')
	}

	function onClaim(_name: string) {
		claimed = true
		if (pendingDay) { enterDay(pendingDay); pendingDay = null }
	}

	function joinPerson(person: Person) {
		start = person.start; end = person.end
		go('done')
	}

	// Track when user drags (to show/hide confirm button)
	let prevStart = $state(start)
	let prevEnd = $state(end)
	$effect(() => {
		if (step === 'day' && (start !== prevStart || end !== prevEnd)) {
			hasDragged = true
			prevStart = start
			prevEnd = end
		}
	})
</script>

<svelte:head><title>Book v2 - Dev - MIKO.ART</title></svelte:head>

<PageShell className="bk2">
	<div class="bk2__inner">
		<Hero eyebrow="Dev" title="Book" icon="/media/page-icons/labs-flask.png" iconAlt="Flask" subtitle="No login wall. Calendar first. Crew tap = done." compact />
		<nav class="bk2__versions"><a href="/dev/book/">v1</a><a href="/dev/book-v2/" aria-current="page">v2</a></nav>

		{#key animKey}
		<div class="bk2__step" class:bk2__step--fwd={direction === 'forward'} class:bk2__step--back={direction === 'back'}>

		{#if step === 'calendar' || (step === 'claim' && !claimed)}
			<!-- Activity + Calendar -->
			<div class="bk2__hero">
				<span class="bk2__icon">{activity.icon}</span>
				<h2 class="bk2__name">{activity.label}</h2>
				<p class="bk2__tagline">{activity.tagline}</p>
			</div>

			<div class="bk2__cal-head">{#each WEEKDAYS as w}<span>{w}</span>{/each}</div>
			<div class="bk2__cal" class:bk2__cal--dimmed={!!pendingDay && !claimed}>
				{#each calDays as cell}
					<button type="button" class="bk2__cell" class:bk2__cell--other={!cell.inMonth} class:bk2__cell--past={cell.isPast} class:bk2__cell--today={cell.isToday} class:bk2__cell--open={cell.isOpen} class:bk2__cell--picked={pendingDay && cell.date.getTime() === pendingDay.date.getTime()} disabled={!cell.isOpen || cell.isPast} onclick={() => { const m = openDays.find(od => od.date.getTime() === cell.date.getTime()); if (m) tapDay(m) }}>
						<span class="bk2__num">{cell.date.getDate()}</span>
						{#if cell.isOpen && !cell.isPast}
							<span class="bk2__dots"><span class="bk2__dot"></span>{#if cell.bookingCount > 0}<span class="bk2__dot bk2__dot--grn"></span>{/if}</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Claim: slides open when pendingDay exists and not claimed -->
			{#if !claimed}
				<InlineClaim day={pendingDay?.date ?? null} {onClaim} />
			{/if}

		{:else if step === 'day' && selectedDay && dayWeather}
			<!-- Day view -->
			<button type="button" class="bk2__back" onclick={() => { pendingDay = null; go('calendar') }}>← {formatDate(selectedDay.date)}</button>

			<p class="bk2__day-summary">{formatDate(selectedDay.date).toUpperCase()} · {TEMP_HIGH}° · {hasAnyRain ? 'RAIN' : 'DRY'}</p>

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

			<TimeReadout {start} {end} hourly={HOURLY} />

			<CrewCard bookings={selectedDay.bookings} {overlapping} onJoin={joinPerson} />

			<!-- Confirm only if user dragged their own time -->
			{#if hasDragged}
				<button type="button" class="bk2__confirm" onclick={() => go('done')}>
					<span>I'm in · {ft(start)}–{ft(end)}</span><span class="bk2__arrow">→</span>
				</button>
			{/if}

		{:else if step === 'done' && selectedDay}
			<DoneScreen
				activityIcon={activity.icon}
				activityLabel={activity.label}
				date={selectedDay.date}
				{start} {end}
				{overlapping}
				onBack={() => { pendingDay = null; go('calendar') }}
			/>
		{/if}

		</div>
		{/key}
	</div>
</PageShell>

<style>
	.bk2__inner { max-width: 28rem; margin: 0 auto; }
	.bk2__versions { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; }
	.bk2__versions a { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); text-decoration: none; padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); }
	.bk2__versions a:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.bk2__versions a[aria-current="page"] { color: #a78bfa; border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, transparent); }

	.bk2__step--fwd { animation: bk2-fwd 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	.bk2__step--back { animation: bk2-back 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bk2-fwd { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
	@keyframes bk2-back { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

	/* Activity hero */
	.bk2__hero { text-align: center; margin-bottom: 1.25rem; }
	.bk2__icon { font-size: 2rem; display: block; margin-bottom: 0.3rem; }
	.bk2__name { margin: 0; font-family: var(--font-display); font-size: 1.5rem; font-weight: 500; letter-spacing: -0.03em; }
	.bk2__tagline { margin: 0.2rem 0 0; font-size: 0.8rem; color: color-mix(in srgb, var(--text) 52%, transparent); }

	/* Calendar */
	.bk2__cal-head { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.2rem; }
	.bk2__cal-head span { text-align: center; font-size: 0.58rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 40%, transparent); }
	.bk2__cal { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.22rem; transition: opacity 0.25s; }
	.bk2__cal--dimmed { opacity: 0.5; }
	.bk2__cell { position: relative; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.55rem; background: color-mix(in srgb, var(--panel-bg) 75%, transparent); font: inherit; cursor: pointer; padding: 0; transition: all 140ms; }
	.bk2__cell:hover:not(:disabled) { border-color: color-mix(in srgb, var(--text) 18%, transparent); transform: translateY(-1px); }
	.bk2__cell:disabled { cursor: default; }
	.bk2__cell--other { opacity: 0.2; }
	.bk2__cell--past { opacity: 0.3; }
	.bk2__cell--today { border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.bk2__cell--open { border-color: color-mix(in srgb, #a78bfa 28%, transparent); background: color-mix(in srgb, #a78bfa 5%, var(--panel-bg) 95%); }
	.bk2__cell--picked { border-color: #a78bfa; background: color-mix(in srgb, #a78bfa 12%, var(--panel-bg) 88%); opacity: 1 !important; }
	.bk2__num { position: absolute; top: 0.35rem; right: 0.4rem; font-size: 0.75rem; font-weight: 600; }
	.bk2__dots { position: absolute; bottom: 0.32rem; left: 0.4rem; display: flex; gap: 0.16rem; }
	.bk2__dot { width: 0.26rem; height: 0.26rem; border-radius: 999px; background: #a78bfa; }
	.bk2__dot--grn { background: #4ade80; }

	/* Day view */
	.bk2__back { display: inline-block; margin-bottom: 0.5rem; padding: 0; border: none; background: none; color: color-mix(in srgb, var(--text) 55%, transparent); font: inherit; font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: color 140ms; }
	.bk2__back:hover { color: var(--text); }
	.bk2__day-summary { margin: 0 0 0.65rem; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 58%, transparent); }

	/* Confirm (only when dragged) */
	.bk2__confirm { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.6rem; border: none; border-radius: 0.5rem; background: var(--gradient-action); color: #fff; font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 14px color-mix(in srgb, #7a5af8 20%, transparent); transition: all 150ms; margin-top: 0.35rem; animation: bk2-fwd 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
	.bk2__confirm:hover { box-shadow: 0 4px 20px color-mix(in srgb, #7a5af8 30%, transparent); transform: translateY(-1px); }
	.bk2__arrow { transition: transform 150ms; }
	.bk2__confirm:hover .bk2__arrow { transform: translateX(3px); }

	@media (max-width: 30rem) { .bk2__cell { border-radius: 0.4rem; } .bk2__num { font-size: 0.65rem; top: 0.25rem; right: 0.3rem; } }
</style>
