<script lang="ts">
	import { PageShell } from '@miko/ui'
	import DevHero from '../DevHero.svelte'
	import { GYM, buildOpenDays, weather } from './mock-data'
	import { ft, formatDate } from './time'
	import type { OpenDay, Person } from './types'
	import StepIndicator from './StepIndicator.svelte'
	import CalendarStep from './CalendarStep.svelte'
	import TimeStep from './TimeStep.svelte'
	import BookedStep from './BookedStep.svelte'
	import SpotlightTour from './SpotlightTour.svelte'
	import type { TourStep } from './SpotlightTour.svelte'

	let tourRef: SpotlightTour

	const tourSteps: TourStep[] = [
		{ phase: 0, selector: '.cs__grid', message: 'Pick a day that works — purple dots are open.' },
		{ phase: 1, selector: '.tr__times', message: 'This is your time — tap to type, or use arrow keys.' },
		{ phase: 1, selector: '.st__lanes', message: 'Drag the handles to resize, or grab the middle to slide.' },
		{ phase: 1, selector: '.cc__card', message: 'Tap a name to match their time.' },
		{ phase: 1, selector: '.ts__confirm', message: 'Happy with your time? Lock it in.', position: 'top' },
		{ phase: 2, selector: '.bs__card', message: 'You\'re all set! Add it to your calendar if you\'d like.' },
	]

	function handleTourPhase(phase: number) {
		if (phase === 0) {
			goStep(0)
		} else if (phase === 1) {
			// Auto-select a day for the tour
			if (!selectedDay) {
				const day = openDays[2] ?? openDays[0]
				if (day) onSelectDay(day)
			} else {
				goStep(1)
			}
		} else if (phase === 2) {
			goStep(2)
		}
	}

	const activity = GYM
	const openDays = buildOpenDays(activity)

	let stepNum = $state(0)
	let selectedDay = $state<OpenDay | null>(null)
	let start = $state(12)
	let end = $state(14)
	let claimed = $state(true) // auto-filled for dev
	let pendingDay = $state<OpenDay | null>(null)
	let animKey = $state(0)
	let direction = $state<'forward' | 'back' | 'none'>('none')

	const overlapping = $derived(selectedDay ? selectedDay.bookings.filter(o => o.start < end && o.end > start) : [])

	const dayWeather = $derived.by(() => {
		if (!selectedDay) return null
		return weather.getDay(selectedDay.date.toISOString().split('T')[0]!)
	})
	const HOURLY = $derived(dayWeather?.hourly ?? [])
	const hasAnyRain = $derived(HOURLY.some(w => w.precipitation > 0))

	let calYear = $state(new Date().getFullYear())
	let calMonthIdx = $state(new Date().getMonth())

	function prevMonth() { if (calMonthIdx === 0) { calMonthIdx = 11; calYear-- } else { calMonthIdx-- } }
	function nextMonth() { if (calMonthIdx === 11) { calMonthIdx = 0; calYear++ } else { calMonthIdx++ } }

	const calMonthLabel = $derived(new Date(calYear, calMonthIdx).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
	const calDays = $derived.by(() => {
		const year = calYear; const month = calMonthIdx
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

	function goStep(n: number) {
		direction = n >= stepNum ? 'forward' : 'back'
		animKey++
		stepNum = n
	}

	function onSelectDay(day: OpenDay) {
		selectedDay = day
		start = activity.windowStart + 2
		end = Math.min(start + 2, activity.windowEnd)
		goStep(1)
	}

	function onClaim(_name: string) {
		claimed = true
		if (pendingDay) { onSelectDay(pendingDay); pendingDay = null }
	}

	function joinPerson(person: Person) {
		start = person.start; end = person.end
	}

	function onStepNav(step: number) {
		if (step < stepNum) { pendingDay = null; goStep(step) }
	}

	const stepLabels = $derived.by((): [string, string, string] => {
		const dayLabel = selectedDay ? formatDate(selectedDay.date) : 'Day'
		const timeLabel = stepNum >= 2 ? `${ft(start)}–${ft(end)}` : 'Time'
		return [dayLabel, timeLabel, 'Booked']
	})

	const breadcrumbItems = [
		{ label: 'Dev', href: '/dev/' },
		{ label: 'Book' }
	]

	const versions = [
		{ label: 'v1', href: '/dev/book-v1/' },
		{ label: 'v2', href: '/dev/book-v3/', current: true }
	]
</script>

<svelte:head><title>Book v2 - Dev - MIKO.ART</title></svelte:head>

<PageShell className="bk2">
	<div class="bk2__inner">
		<DevHero
			title="Book"
			subtitle="No login wall. Calendar first. Crew tap = done."
			{breadcrumbItems}
			{versions}
		/>

		<StepIndicator current={stepNum} labels={stepLabels} onNavigate={onStepNav} />

		{#key animKey}
		<div class="bk2__step bk2__panel" class:bk2__step--fwd={direction === 'forward'} class:bk2__step--back={direction === 'back'}>
		<button type="button" class="bk2__help" data-tip="Take the tour" onclick={() => tourRef.showPrompt()}>?</button>

		{#if stepNum === 0}
			<CalendarStep {activity} {calDays} weekdays={WEEKDAYS} {openDays} {claimed} bind:pendingDay {onSelectDay} {onClaim} monthLabel={calMonthLabel} {prevMonth} {nextMonth} />

		{:else if stepNum === 1 && selectedDay && dayWeather}
			<TimeStep day={selectedDay} hourly={HOURLY} sunrise={dayWeather.sunrise} sunset={dayWeather.sunset} hasRain={hasAnyRain} {overlapping} bind:start bind:end onJoin={joinPerson} onConfirm={() => goStep(2)} />

		{:else if stepNum === 2 && selectedDay}
			<BookedStep activityIcon={activity.icon} activityLabel={activity.label} date={selectedDay.date} {start} {end} {overlapping} capacity={8} onBack={() => goStep(0)} />
		{/if}

		</div>
		{/key}
	</div>
</PageShell>

<SpotlightTour bind:this={tourRef} steps={tourSteps} storageKey="book-v3-tour" currentPhase={stepNum} onPhaseRequest={handleTourPhase} />

<style>
	.bk2__inner { max-width: 28rem; margin: 0 auto; padding: 0 0.75rem; box-sizing: border-box; width: 100%; }
	.bk2__panel { position: relative; padding: 1rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.75rem; background: color-mix(in srgb, var(--panel-bg, var(--bg)) 60%, transparent); }
	.bk2__help { position: absolute; top: 0.6rem; right: 0.6rem; width: 1.2rem; height: 1.2rem; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--text) 22%, transparent); background: transparent; color: color-mix(in srgb, var(--text) 50%, transparent); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 180ms; padding: 0; font: inherit; font-size: 0.5rem; font-weight: 700; z-index: 2; }
	.bk2__help:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 35%, transparent); }
	.bk2__step--fwd { animation: bk2-fwd 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	.bk2__step--back { animation: bk2-back 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bk2-fwd { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
	@keyframes bk2-back { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

	/* Tooltip system */
	:global([data-tip]) { position: relative; }
	:global([data-tip])::after { content: attr(data-tip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(0.1rem); padding: 0.3rem 0.55rem; border-radius: 0.4rem; background: rgba(10, 10, 18, 0.92); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.85); font-size: 0.58rem; font-weight: 600; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.2s ease 0.4s, transform 0.2s ease 0.4s; z-index: 50; }
	:global([data-tip]):hover::after { opacity: 1; transform: translateX(-50%) translateY(-0.3rem); }
	:global([data-tip]):active::after { opacity: 0; transition-delay: 0s; }
	@media (pointer: coarse) { :global([data-tip])::after { display: none; } }
</style>
