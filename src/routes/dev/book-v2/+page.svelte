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

	const activity = GYM
	const openDays = buildOpenDays(activity)

	let stepNum = $state(0)
	let selectedDay = $state<OpenDay | null>(null)
	let start = $state(12)
	let end = $state(14)
	let claimed = $state(true) // auto-filled for dev
	let pendingDay = $state<OpenDay | null>(null)
	let animKey = $state(0)
	let direction = $state<'forward' | 'back'>('forward')

	const overlapping = $derived(selectedDay ? selectedDay.bookings.filter(o => o.start < end && o.end > start) : [])

	const dayWeather = $derived.by(() => {
		if (!selectedDay) return null
		return weather.getDay(selectedDay.date.toISOString().split('T')[0]!)
	})
	const HOURLY = $derived(dayWeather?.hourly ?? [])
	const hasAnyRain = $derived(HOURLY.some(w => w.precipitation > 0))

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
		{ label: 'Book', href: '/dev/book/' },
		{ label: 'v2' }
	]

	const versions = [
		{ label: 'v1', href: '/dev/book/' },
		{ label: 'v2', href: '/dev/book-v2/', current: true }
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

		{#if stepNum === 0}
			<CalendarStep {activity} {calDays} weekdays={WEEKDAYS} {openDays} {claimed} bind:pendingDay {onSelectDay} {onClaim} />

		{:else if stepNum === 1 && selectedDay && dayWeather}
			<TimeStep day={selectedDay} hourly={HOURLY} sunrise={dayWeather.sunrise} sunset={dayWeather.sunset} hasRain={hasAnyRain} {overlapping} bind:start bind:end onJoin={joinPerson} onConfirm={() => goStep(2)} />

		{:else if stepNum === 2 && selectedDay}
			<BookedStep activityIcon={activity.icon} activityLabel={activity.label} date={selectedDay.date} {start} {end} {overlapping} onBack={() => goStep(0)} />
		{/if}

		</div>
		{/key}
	</div>
</PageShell>

<style>
	.bk2__inner { max-width: 28rem; margin: 0 auto; padding: 0 0.75rem; box-sizing: border-box; width: 100%; }
	.bk2__panel { padding: 1rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.75rem; background: color-mix(in srgb, var(--panel-bg, var(--bg)) 60%, transparent); }
	.bk2__step--fwd { animation: bk2-fwd 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	.bk2__step--back { animation: bk2-back 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bk2-fwd { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
	@keyframes bk2-back { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
</style>
