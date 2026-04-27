<script lang="ts">
	import { PageShell } from '@miko/ui'
	import {
		StepIndicator, CalendarStep, TimeStep, SpotlightTour,
		ft, formatDate, buildMockOpenDays,
	} from '@calendar/ui'
	import type { OpenDay, Person, TourStep, Activity } from '@calendar/ui'
	import { Calendar, Apple, Mail, Download } from '@lucide/svelte'
	import { createMockWeatherProvider } from '$lib/app/weather'
	import DevHero from '../DevHero.svelte'
	import { onMount } from 'svelte'

	const GYM: Activity = {
		slug: 'gym', label: 'Rainbow Gym', icon: '💪',
		tagline: 'Hang out. Work out. Whatever.',
		windowStart: 10, windowEnd: 20, maxDuration: 2, capacity: 8,
	}
	const DEMO_PEOPLE: Person[] = [
		{ name: 'Jen', color: '#d4748c', start: 12, end: 14 },
		{ name: 'Tyler', color: '#d8944a', start: 13, end: 15 },
	]
	const weather = createMockWeatherProvider()

	let tourRef: SpotlightTour

	const tourSteps: TourStep[] = [
		{ phase: 0, selector: '.cs__grid', message: 'Pick a day that works — purple dots are open.' },
		{ phase: 1, selector: '.tr__times', message: 'This is your time — tap to type, or use arrow keys.' },
		{ phase: 1, selector: '.st__lanes', message: 'Drag the handles to resize, or grab the middle to slide.' },
		{ phase: 1, selector: '.cc__card', message: 'Tap a name to match their time.' },
		{ phase: 1, selector: '.ts__confirm', message: 'Happy with your time? Lock it in.', position: 'top' },
		{ phase: 2, selector: '.v6b__card', message: 'You\'re all set! Add it to your calendar if you\'d like.' },
	]

	function handleTourPhase(phase: number) {
		if (phase === 0) { goStep(0) }
		else if (phase === 1) {
			if (!selectedDay) {
				const day = openDays[2] ?? openDays[0]
				if (day) onSelectDay(day)
			} else { goStep(1) }
		} else if (phase === 2) { goStep(2) }
	}

	const activity = GYM
	const openDays = buildMockOpenDays(activity, DEMO_PEOPLE)

	let stepNum = $state(0)
	let selectedDay = $state<OpenDay | null>(null)
	let start = $state(12)
	let end = $state(14)
	let claimed = $state(true)
	let pendingDay = $state<OpenDay | null>(null)
	let animKey = $state(0)
	let direction = $state<'forward' | 'back' | 'none'>('none')
	let maxReached = $state(0)

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
		if (n > maxReached) maxReached = n
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
		if (step === stepNum) return
		if (step < stepNum) pendingDay = null
		goStep(step)
	}

	const stepLabels = $derived.by((): [string, string, string] => {
		const dayLabel = selectedDay ? formatDate(selectedDay.date) : 'Day'
		const timeLabel = stepNum >= 2 ? `${ft(start)}–${ft(end)}` : 'Time'
		return [dayLabel, timeLabel, 'Booked']
	})

	const crewNames = $derived(
		overlapping.length === 0 ? '' :
		overlapping.length === 1 ? overlapping[0]!.name :
		overlapping.map(p => p.name).join(', ')
	)

	/* --- Calendar helpers --- */
	function googleCalUrl() {
		if (!selectedDay) return '#'
		const p = (n: number) => String(n).padStart(2, '0')
		const y = selectedDay.date.getFullYear(); const m = p(selectedDay.date.getMonth() + 1); const d = p(selectedDay.date.getDate())
		const sh = p(Math.floor(start)); const sm = p(Math.round((start % 1) * 60))
		const eh = p(Math.floor(end)); const em = p(Math.round((end % 1) * 60))
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activity.label)}&dates=${y}${m}${d}T${sh}${sm}00/${y}${m}${d}T${eh}${em}00`
	}

	function outlookUrl() {
		if (!selectedDay) return '#'
		const p = (n: number) => String(n).padStart(2, '0')
		const y = selectedDay.date.getFullYear(); const m = p(selectedDay.date.getMonth() + 1); const d = p(selectedDay.date.getDate())
		const sh = p(Math.floor(start)); const sm = p(Math.round((start % 1) * 60))
		const eh = p(Math.floor(end)); const em = p(Math.round((end % 1) * 60))
		return `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(activity.label)}&startdt=${y}-${m}-${d}T${sh}:${sm}:00&enddt=${y}-${m}-${d}T${eh}:${em}:00`
	}

	function downloadIcs() {
		if (!selectedDay) return
		const p = (n: number) => String(n).padStart(2, '0')
		const y = selectedDay.date.getFullYear(); const m = p(selectedDay.date.getMonth() + 1); const d = p(selectedDay.date.getDate())
		const sh = p(Math.floor(start)); const sm = p(Math.round((start % 1) * 60))
		const eh = p(Math.floor(end)); const em = p(Math.round((end % 1) * 60))
		const tzId = Intl.DateTimeFormat().resolvedOptions().timeZone
		const dtStart = `${y}${m}${d}T${sh}${sm}00`; const dtEnd = `${y}${m}${d}T${eh}${em}00`
		const uid = `${dtStart}-${Math.random().toString(36).slice(2, 8)}@miko.art`
		const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//miko.art//book//EN','BEGIN:VEVENT',`UID:${uid}`,`DTSTART;TZID=${tzId}:${dtStart}`,`DTEND;TZID=${tzId}:${dtEnd}`,`SUMMARY:${activity.label}`,'DESCRIPTION:Booked via MIKO.ART','END:VEVENT','END:VCALENDAR'].join('\r\n')
		const blob = new Blob([ics], { type: 'text/calendar' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a'); a.href = url; a.download = 'gym-booking.ics'; a.click(); URL.revokeObjectURL(url)
	}

	/* --- Sparkles --- */
	let sparkleEl: HTMLDivElement | undefined
	const SPARKLE_COLORS = ['#c4b5fd', '#6ee7b7', '#a78bfa', '#4ade80', '#f9a8d4', '#fbbf24', '#818cf8', '#34d399']

	function spawnSparkles() {
		if (!sparkleEl) return
		sparkleEl.innerHTML = ''
		for (let i = 0; i < 8; i++) {
			const dot = document.createElement('div')
			dot.className = 'v6b__sparkle-dot'
			const color = SPARKLE_COLORS[i % SPARKLE_COLORS.length]
			const angle = (i / 8) * 360 + (Math.random() - 0.5) * 25
			const dist = 26 + Math.random() * 16
			const delay = i * 0.035
			dot.style.cssText = `background:${color};--angle:${angle}deg;--dist:${dist}px;animation-delay:${delay}s;`
			sparkleEl.appendChild(dot)
		}
		setTimeout(() => { if (sparkleEl) sparkleEl.innerHTML = '' }, 1200)
	}

	$effect(() => {
		if (stepNum === 2) {
			// Small delay so DOM is ready
			setTimeout(spawnSparkles, 50)
		}
	})

	const breadcrumbItems = [
		{ label: 'Playground', href: '/playground/' },
		{ label: 'Book' }
	]

	const versions = [
		{ label: 'v1', href: '/playground/book/' },
		{ label: 'v2', href: '/playground/book-v3/' },
		{ label: 'v3', href: '/playground/book-v6/', current: true }
	]
</script>

<svelte:head><title>Book v6 - Dev - MIKO.ART</title></svelte:head>

<PageShell className="bk6">
	<div class="bk6__inner">
		<DevHero
			title="Book"
			subtitle="No login wall. Calendar first. Crew tap = done."
			{breadcrumbItems}
			{versions}
		/>

		<StepIndicator current={stepNum} {maxReached} labels={stepLabels} onNavigate={onStepNav} />

		{#key animKey}
		<div class="bk6__step bk6__panel" class:bk6__step--fwd={direction === 'forward'} class:bk6__step--back={direction === 'back'}>
		<button type="button" class="bk6__help" data-tip="Take the tour" aria-label="Take a guided tour" onclick={() => tourRef.showPrompt()}>?</button>

		{#if stepNum === 0}
			<CalendarStep {activity} {calDays} weekdays={WEEKDAYS} {openDays} {claimed} bind:pendingDay {onSelectDay} {onClaim} monthLabel={calMonthLabel} {prevMonth} {nextMonth} />

		{:else if stepNum === 1 && selectedDay}
			{#if dayWeather}
				<TimeStep day={selectedDay} hourly={HOURLY} sunrise={dayWeather.sunrise} sunset={dayWeather.sunset} hasRain={hasAnyRain} {overlapping} bind:start bind:end onJoin={joinPerson} onConfirm={() => goStep(2)} />
			{:else}
				<TimeStep day={selectedDay} hourly={[]} sunrise={6} sunset={20} hasRain={false} {overlapping} bind:start bind:end onJoin={joinPerson} onConfirm={() => goStep(2)} />
			{/if}

		{:else if stepNum === 2 && selectedDay}
			<div class="v6b">
				<div class="v6b__sparkles" bind:this={sparkleEl}></div>

				<div class="v6b__check-wrap">
					<div class="v6b__check-glow"></div>
					<div class="v6b__check">✓</div>
				</div>
				<h2 class="v6b__title">Booked.</h2>

				<div class="v6b__card">
					<p class="v6b__detail">
						{formatDate(selectedDay.date)} &middot; {ft(start)}–{ft(end)}
					</p>
					{#if crewNames}
						<p class="v6b__crew">with {crewNames}</p>
					{/if}
				</div>

				<p class="v6b__greeting">See you there <img src="/media/page-icons/holidays-party.png" alt="" class="v6b__greeting-icon" loading="eager" decoding="async" /></p>

				<div class="v6b__cal-list">
					<a class="v6b__cal-option" href={googleCalUrl()} target="_blank" rel="noopener">
						<Calendar class="v6b__cal-icon" size={15} strokeWidth={2} />
						<span>Google Calendar</span>
					</a>
					<button type="button" class="v6b__cal-option" onclick={downloadIcs}>
						<Apple class="v6b__cal-icon" size={15} strokeWidth={2} />
						<span>Apple Calendar</span>
					</button>
					<a class="v6b__cal-option" href={outlookUrl()} target="_blank" rel="noopener">
						<Mail class="v6b__cal-icon" size={15} strokeWidth={2} />
						<span>Outlook</span>
					</a>
					<button type="button" class="v6b__cal-option" onclick={downloadIcs}>
						<Download class="v6b__cal-icon" size={15} strokeWidth={2} />
						<span>Other calendar</span>
					</button>
				</div>

				<div class="v6b__nav">
					<button type="button" class="v6b__nav-link" onclick={() => goStep(0)}>
						&larr; different day
					</button>
					<button type="button" class="v6b__nav-link" onclick={() => goStep(1)}>
						edit time &rarr;
					</button>
				</div>
			</div>
		{/if}

		</div>
		{/key}
	</div>
</PageShell>

<SpotlightTour bind:this={tourRef} steps={tourSteps} storageKey="book-v6-tour" currentPhase={stepNum} onPhaseRequest={handleTourPhase} />

<style>
	.bk6__inner {
		--book-accent: #a78bfa;
		--book-accent-dim: #8b5cf6;
		--book-accent-deep: #7a5af8;
		--book-success: #3cbf8a;
		--book-confirm: #22c55e;
		--book-confirm-hover: #16a34a;
		--book-danger: #f87171;
		--book-night: #0b1026;
		--book-night-deep: #080a14;
		--book-dot-green: #4ade80;
		--book-horizon-warm: #c4794a;
		--book-horizon-gold: #d4a85a;
		max-width: 28rem; margin: 0 auto; padding: 0 0.75rem; box-sizing: border-box; width: 100%;
	}
	.bk6__panel { position: relative; padding: 1rem; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; background: rgba(255, 255, 255, 0.02); }
	.bk6__help { position: absolute; top: 0.6rem; right: 0.6rem; width: 1.2rem; height: 1.2rem; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.22); background: transparent; color: rgba(255, 255, 255, 0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 180ms; padding: 0; font: inherit; font-size: 0.5rem; font-weight: 700; z-index: 2; }
	.bk6__help:hover { color: var(--text); border-color: rgba(255, 255, 255, 0.35); }
	.bk6__step--fwd { animation: bk6-fwd 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	.bk6__step--back { animation: bk6-back 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bk6-fwd { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
	@keyframes bk6-back { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

	/* --- Booked Step (v6) --- */
	.v6b { text-align: center; position: relative; }

	/* Sparkles */
	.v6b__sparkles {
		position: absolute;
		top: 1.2rem;
		left: 50%;
		width: 0; height: 0;
		pointer-events: none;
		z-index: 5;
	}

	:global(.v6b__sparkle-dot) {
		position: absolute;
		width: 5px; height: 5px;
		border-radius: 999px;
		opacity: 0;
		animation: v6b-spark 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes v6b-spark {
		0%  { opacity: 0; transform: translate(0, 0) scale(0); }
		40% { opacity: 1; transform: translate(calc(cos(var(--angle)) * var(--dist)), calc(sin(var(--angle)) * var(--dist) * -1)) scale(1); }
		100% { opacity: 0; transform: translate(calc(cos(var(--angle)) * var(--dist) * 1.3), calc(sin(var(--angle)) * var(--dist) * -1.3)) scale(0); }
	}

	/* Check */
	.v6b__check-wrap { position: relative; display: inline-block; margin-bottom: 0.65rem; }
	.v6b__check-glow { position: absolute; inset: -10px; border-radius: 999px; background: radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, transparent 70%); animation: v6b-glow 2.5s ease-in-out infinite alternate; }
	@keyframes v6b-glow { from { opacity: 0.5; transform: scale(0.9); } to { opacity: 1; transform: scale(1.08); } }

	.v6b__check {
		position: relative;
		display: inline-flex; align-items: center; justify-content: center;
		width: 2.8rem; height: 2.8rem;
		border-radius: 999px;
		background: rgba(74, 222, 128, 0.1);
		border: 1.5px solid rgba(74, 222, 128, 0.3);
		color: #4ade80;
		font-size: 1.2rem; font-weight: 700;
		animation: v6b-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes v6b-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

	/* Title */
	.v6b__title {
		margin: 0 0 0.6rem;
		font-family: var(--font-display, Georgia);
		font-size: 1.5rem; font-weight: 500;
		letter-spacing: -0.03em;
		color: var(--text, #fff);
	}

	/* Card */
	.v6b__card {
		padding: 0.5rem 0;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.v6b__detail { margin: 0; font-size: 0.82rem; color: rgba(255, 255, 255, 0.55); }
	.v6b__crew { margin: 0.1rem 0 0; font-size: 0.78rem; color: rgba(255, 255, 255, 0.35); }

	/* Greeting */
	.v6b__greeting {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		margin: 0.75rem 0 0;
		font-family: var(--font-display, Georgia);
		font-size: 0.95rem; font-weight: 400; font-style: italic;
		background: linear-gradient(135deg, #a78bfa, #6ee7b7);
		-webkit-background-clip: text; -webkit-text-fill-color: transparent;
		background-clip: text;
	}

	:global(.v6b__greeting-icon) {
		width: 1.1rem;
		height: 1.1rem;
		vertical-align: -0.1em;
		-webkit-text-fill-color: initial;
	}

	/* Calendar list */
	.v6b__cal-list {
		display: flex; flex-direction: column;
		margin-top: 1rem;
		border: 1px solid rgba(167, 139, 250, 0.12);
		border-radius: 0.6rem;
		overflow: hidden;
		background: rgba(167, 139, 250, 0.03);
	}

	.v6b__cal-option {
		display: flex; align-items: center; gap: 0.55rem;
		padding: 0.6rem 0.75rem;
		background: transparent; border: none;
		color: rgba(255, 255, 255, 0.5);
		font: inherit; font-size: 0.75rem; font-weight: 500;
		cursor: pointer; text-decoration: none; text-align: left;
		transition: background 150ms, color 150ms;
	}
	.v6b__cal-option:hover { background: rgba(167, 139, 250, 0.08); color: #c4b5fd; }
	.v6b__cal-option + .v6b__cal-option { border-top: 1px solid rgba(167, 139, 250, 0.08); }

	:global(.v6b__cal-icon) { flex-shrink: 0; opacity: 0.4; transition: opacity 150ms; }
	.v6b__cal-option:hover :global(.v6b__cal-icon) { opacity: 0.8; }

	/* Nav */
	.v6b__nav {
		display: flex; justify-content: space-between;
		margin-top: 0.85rem;
	}

	.v6b__nav-link {
		background: none; border: none;
		color: rgba(255, 255, 255, 0.25);
		font: inherit; font-size: 0.72rem; font-weight: 500;
		cursor: pointer; padding: 0.3rem 0;
		transition: color 150ms;
	}
	.v6b__nav-link:hover { color: rgba(255, 255, 255, 0.55); }

	/* Tooltip system */
	:global([data-tip]) { position: relative; }
	:global([data-tip])::after { content: attr(data-tip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(0.1rem); padding: 0.3rem 0.55rem; border-radius: 0.5rem; background: rgba(10, 10, 18, 0.92); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.85); font-size: 0.58rem; font-weight: 600; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.2s ease 0.4s, transform 0.2s ease 0.4s; z-index: 50; }
	:global([data-tip]):hover::after { opacity: 1; transform: translateX(-50%) translateY(-0.3rem); }
	:global([data-tip]):active::after { opacity: 0; transition-delay: 0s; }
	@media (pointer: coarse) { :global([data-tip])::after { display: none; } }
</style>
