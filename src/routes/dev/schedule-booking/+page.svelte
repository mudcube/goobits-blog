<script lang="ts">
	import { GripVertical } from '@lucide/svelte'
	import { PageShell } from '@miko/ui'
	import DevHero from '../DevHero.svelte'

	// ── Types ──
	type Activity = {
		slug: string; label: string; icon: string; maxDuration: number; capacity: number
		windowStart: number; windowEnd: number
	}
	type Booking = {
		userId: string; name: string; color: string; start: number; end: number; guests: number
	}
	type OpenDay = { date: Date; bookings: Booking[] }
	type Step = 'calendar' | 'day' | 'confirm' | 'done'

	// ── Mock config ──
	const ACTIVITIES: Activity[] = [
		{ slug: 'gym', label: 'Gym', icon: '💪', maxDuration: 2, capacity: 8, windowStart: 10, windowEnd: 20 },
		{ slug: 'circus', label: 'Circus', icon: '🎪', maxDuration: 2, capacity: 5, windowStart: 12, windowEnd: 18 },
		{ slug: 'adventure', label: 'Adventure', icon: '🏔️', maxDuration: 4, capacity: 6, windowStart: 8, windowEnd: 18 },
		{ slug: 'movies', label: 'Movies', icon: '🎬', maxDuration: 3, capacity: 8, windowStart: 19, windowEnd: 23 },
	]

	const PEOPLE = [
		{ userId: 'u-jen', name: 'Jen', color: '#d4748c' },
		{ userId: 'u-marco', name: 'Marco', color: '#4a9fd4' },
		{ userId: 'u-ava', name: 'Ava', color: '#7ac47a' },
		{ userId: 'u-tyler', name: 'Tyler', color: '#d8944a' },
	]

	function makeDate(daysFromNow: number) {
		const d = new Date()
		d.setDate(d.getDate() + daysFromNow)
		d.setHours(0, 0, 0, 0)
		return d
	}

	function buildOpenDays(activity: Activity): OpenDay[] {
		const days: OpenDay[] = []
		for (let i = 1; i <= 21; i++) {
			const d = makeDate(i)
			const dow = d.getDay()
			// Gym: Mon/Wed/Fri, Circus: Tue/Thu, Adventure: Sat, Movies: Fri/Sat
			const open =
				activity.slug === 'gym' ? [1, 3, 5].includes(dow) :
				activity.slug === 'circus' ? [2, 4].includes(dow) :
				activity.slug === 'adventure' ? dow === 6 :
				activity.slug === 'movies' ? [5, 6].includes(dow) : false
			if (!open) continue

			const bookings: Booking[] = []
			// Seed some mock bookings for earlier days
			if (i <= 7) {
				const ws = activity.windowStart
				bookings.push({ ...PEOPLE[0]!, start: ws + 2, end: ws + 4, guests: 0 })
				bookings.push({ ...PEOPLE[1]!, start: ws + 3, end: ws + 5, guests: 0 })
				if (i <= 3) bookings.push({ ...PEOPLE[2]!, start: ws + 2, end: ws + 3.5, guests: 1 })
			} else if (i <= 14) {
				bookings.push({ ...PEOPLE[3]!, start: activity.windowStart + 1, end: activity.windowStart + 3, guests: 0 })
			}
			days.push({ date: d, bookings })
		}
		return days
	}

	const breadcrumbItems = [
		{ label: 'Dev', href: '/dev/' },
		{ label: 'Schedule Booking', href: '/dev/schedule-booking/' },
		{ label: 'v1' }
	]

	const versions = [
		{ label: 'v1', href: '/dev/schedule-booking/', current: true },
		{ label: 'v2', href: '/dev/schedule-booking-v2/' }
	]

	// ── State ──
	let activeSlug = $state('gym')
	let step = $state<Step>('calendar')
	let selectedDay = $state<OpenDay | null>(null)
	let pickStart = $state(12)
	let pickEnd = $state(14)
	let guestCount = $state(0)
	let dragging = $state<'start' | 'end' | 'range' | null>(null)
	let dragOffset = 0
	let trackEl = $state<HTMLDivElement | null>(null)
	let animKey = $state(0)
	let direction = $state<'forward' | 'back'>('forward')

	const STEPS: Step[] = ['calendar', 'day', 'confirm', 'done']
	const stepIndex = $derived(STEPS.indexOf(step))

	const activity = $derived(ACTIVITIES.find(a => a.slug === activeSlug)!)
	const openDays = $derived(buildOpenDays(activity))

	// ── Calendar helpers ──
	const calendarMonth = $derived.by(() => {
		const now = new Date()
		return { year: now.getFullYear(), month: now.getMonth() }
	})

	const calendarDays = $derived.by(() => {
		const { year, month } = calendarMonth
		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const startPad = (firstDay.getDay() + 6) % 7 // Monday start
		const cells: Array<{ date: Date; inMonth: boolean; isToday: boolean; isOpen: boolean; isPast: boolean; bookingCount: number }> = []

		// Pad start
		for (let i = startPad - 1; i >= 0; i--) {
			const d = new Date(year, month, -i)
			cells.push({ date: d, inMonth: false, isToday: false, isOpen: false, isPast: true, bookingCount: 0 })
		}
		// Month days
		const today = new Date(); today.setHours(0,0,0,0)
		for (let day = 1; day <= lastDay.getDate(); day++) {
			const d = new Date(year, month, day)
			const isPast = d < today
			const match = openDays.find(od => od.date.getTime() === d.getTime())
			cells.push({
				date: d, inMonth: true, isToday: d.getTime() === today.getTime(),
				isOpen: !!match, isPast, bookingCount: match?.bookings.length ?? 0
			})
		}
		// Pad end
		const endPad = (7 - cells.length % 7) % 7
		for (let i = 1; i <= endPad; i++) {
			const d = new Date(year, month + 1, i)
			cells.push({ date: d, inMonth: false, isToday: false, isOpen: false, isPast: false, bookingCount: 0 })
		}
		return cells
	})

	const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

	// ── Daylight ──
	const SUNRISE = 6.53
	const SUNSET = 19.8

	// ── Time helpers ──
	const SNAP = 0.25
	function snap(v: number) { return Math.round(v / SNAP) * SNAP }
	function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
	function pct24(h: number) { return (h / 24) * 100 }

	function ft(h: number) {
		const hr = Math.floor(h) % 24
		const min = Math.round((h - Math.floor(h)) * 60)
		const sfx = hr >= 12 ? 'pm' : 'am'
		const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
		return min === 0 ? `${display} ${sfx}` : `${display}:${String(min).padStart(2, '0')} ${sfx}`
	}

	function fDur(d: number) {
		const h = Math.floor(d)
		const m = Math.round((d - h) * 60)
		if (h === 0) return `${m}m`
		if (m === 0) return h === 1 ? '1 hr' : `${h} hrs`
		return `${h}h ${m}m`
	}

	const duration = $derived(pickEnd - pickStart)

	const lightHint = $derived.by(() => {
		if (pickStart >= SUNRISE && pickEnd <= SUNSET) return { icon: '☀️', label: 'Daytime' }
		if (pickEnd <= SUNRISE || pickStart >= SUNSET) return { icon: '🌙', label: 'Evening' }
		return { icon: '🌤', label: 'Partial daylight' }
	})

	// ── Overlap computation ──
	const overlapping = $derived.by(() => {
		if (!selectedDay) return []
		return selectedDay.bookings.filter(b => b.start < pickEnd && b.end > pickStart)
	})

	const spotsUsedAtPick = $derived.by(() => {
		if (!selectedDay) return 0
		let max = 0
		// Check every 15-min increment in the picked window
		for (let t = pickStart; t < pickEnd; t += 0.25) {
			const count = selectedDay.bookings.reduce((sum, b) => {
				if (b.start <= t && b.end > t) return sum + 1 + b.guests
				return sum
			}, 0)
			if (count > max) max = count
		}
		return max
	})

	const spotsLeft = $derived(activity.capacity - spotsUsedAtPick)

	// ── Groups (bookings with identical times) ──
	const groups = $derived.by(() => {
		if (!selectedDay) return []
		const map = new Map<string, { start: number; end: number; people: Booking[] }>()
		for (const b of selectedDay.bookings) {
			const key = `${b.start}-${b.end}`
			const g = map.get(key) ?? { start: b.start, end: b.end, people: [] }
			g.people.push(b)
			map.set(key, g)
		}
		return [...map.values()].sort((a, b) => a.start - b.start)
	})

	// ── Quick durations ──
	const quickDurations = $derived.by(() => {
		const candidates = [0.5, 1, 1.5, 2, 3, 4]
		return candidates.filter(d => d <= activity.maxDuration)
	})

	// ── Drag logic ──
	function getHour(clientX: number) {
		if (!trackEl) return activity.windowStart
		const rect = trackEl.getBoundingClientRect()
		const ratio = (clientX - rect.left) / rect.width
		return snap(clamp(activity.windowStart + ratio * (activity.windowEnd - activity.windowStart), activity.windowStart, activity.windowEnd))
	}

	function onDown(event: PointerEvent, type: 'start' | 'end' | 'range') {
		event.preventDefault()
		event.stopPropagation()
		dragging = type
		if (type === 'range') dragOffset = getHour(event.clientX) - pickStart
		;(event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId)
	}

	function onMove(event: PointerEvent) {
		if (!dragging) return
		const hour = getHour(event.clientX)
		const minDur = 0.5
		if (dragging === 'start') {
			pickStart = snap(clamp(hour, activity.windowStart, pickEnd - minDur))
		} else if (dragging === 'end') {
			pickEnd = snap(clamp(hour, pickStart + minDur, Math.min(activity.windowEnd, pickStart + activity.maxDuration)))
		} else {
			let ns = snap(hour - dragOffset)
			ns = clamp(ns, activity.windowStart, activity.windowEnd - duration)
			pickStart = ns
			pickEnd = ns + duration
		}
	}

	function onUp() { dragging = null }

	function selectDuration(d: number) {
		const maxEnd = Math.min(activity.windowEnd, pickStart + activity.maxDuration)
		if (pickStart + d <= maxEnd) pickEnd = pickStart + d
	}

	// ── Navigation ──
	function selectDay(day: OpenDay) {
		selectedDay = day
		pickStart = activity.windowStart + 2
		pickEnd = Math.min(pickStart + 2, activity.windowEnd)
		guestCount = 0
		transition('day')
	}

	function joinGroup(g: { start: number; end: number }) {
		pickStart = g.start
		pickEnd = g.end
		transition('confirm')
	}

	function transition(next: Step) {
		const nextIdx = STEPS.indexOf(next)
		direction = nextIdx >= stepIndex ? 'forward' : 'back'
		animKey++
		step = next
	}

	function formatDate(d: Date) {
		return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
	}
</script>

<svelte:head>
	<title>Schedule Booking Flow - Dev - MIKO.ART</title>
</svelte:head>

<svelte:window onpointermove={onMove} onpointerup={onUp} />

<PageShell className="sbk">
	<div class="sbk__inner">
		<DevHero
			title="Schedule Booking"
			subtitle="Open slot booking flow: calendar → day → time → confirm."
			{breadcrumbItems}
			{versions}
		/>

		<!-- Activity tabs -->
		<div class="sbk__tabs">
			{#each ACTIVITIES as act}
				<button
					type="button"
					class="sbk__tab"
					class:sbk__tab--active={activeSlug === act.slug}
					onclick={() => { activeSlug = act.slug; step = 'calendar'; selectedDay = null; animKey++ }}
				>
					<span class="sbk__tab-icon">{act.icon}</span>
					{act.label}
				</button>
			{/each}
		</div>

		<div class="sbk__frame">
			<!-- Breadcrumbs -->
			<nav class="sbk__crumbs" aria-label="Booking steps">
				<button type="button" class="sbk__crumb" class:sbk__crumb--active={step === 'calendar'} class:sbk__crumb--done={stepIndex > 0} disabled={step === 'calendar'} onclick={() => transition('calendar')}>
					Calendar
				</button>
				{#if stepIndex >= 1}
					<span class="sbk__crumb-sep">›</span>
					<button type="button" class="sbk__crumb" class:sbk__crumb--active={step === 'day'} class:sbk__crumb--done={stepIndex > 1} disabled={step === 'day'} onclick={() => transition('day')}>
						{selectedDay ? selectedDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Day'}
					</button>
				{/if}
				{#if stepIndex >= 2}
					<span class="sbk__crumb-sep">›</span>
					<button type="button" class="sbk__crumb" class:sbk__crumb--active={step === 'confirm'} class:sbk__crumb--done={stepIndex > 2} disabled={step === 'confirm'} onclick={() => transition('confirm')}>
						{ft(pickStart)} – {ft(pickEnd)}
					</button>
				{/if}
				{#if stepIndex >= 3}
					<span class="sbk__crumb-sep">›</span>
					<span class="sbk__crumb sbk__crumb--active">Booked ✓</span>
				{/if}
			</nav>

			{#key animKey}
				<div class="sbk__step" class:sbk__step--forward={direction === 'forward'} class:sbk__step--back={direction === 'back'}>

					{#if step === 'calendar'}
						<!-- ═══ STEP 1: CALENDAR ═══ -->
						<div class="sbk__cal-head">
							<h2 class="sbk__cal-month">{MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}</h2>
							<p class="sbk__cal-hint">{activity.icon} {activity.label} · max {fDur(activity.maxDuration)} · {activity.capacity} people</p>
						</div>

						<div class="sbk__cal-weekdays">
							{#each WEEKDAYS as wd}
								<span>{wd}</span>
							{/each}
						</div>

						<div class="sbk__cal-grid">
							{#each calendarDays as cell}
								<button
									type="button"
									class="sbk__cal-day"
									class:sbk__cal-day--other={!cell.inMonth}
									class:sbk__cal-day--past={cell.isPast}
									class:sbk__cal-day--today={cell.isToday}
									class:sbk__cal-day--open={cell.isOpen}
									disabled={!cell.isOpen || cell.isPast}
									onclick={() => {
										const match = openDays.find(od => od.date.getTime() === cell.date.getTime())
										if (match) selectDay(match)
									}}
								>
									<span class="sbk__cal-num">{cell.date.getDate()}</span>
									{#if cell.isOpen && !cell.isPast}
										<span class="sbk__cal-dots">
											<span class="sbk__cal-dot"></span>
											{#if cell.bookingCount > 0}
												<span class="sbk__cal-dot sbk__cal-dot--people"></span>
											{/if}
										</span>
									{/if}
								</button>
							{/each}
						</div>

					{:else if step === 'day' && selectedDay}
						<!-- ═══ STEP 2: DAY VIEW ═══ -->
						<div class="sbk__day-head">
							<h2 class="sbk__day-date">{formatDate(selectedDay.date)}</h2>
							<p class="sbk__day-window">{activity.icon} {activity.label} · open {ft(activity.windowStart)} – {ft(activity.windowEnd)}</p>
							<p class="sbk__day-sun">🌅 {ft(SUNRISE)} · 🌇 {ft(SUNSET)}</p>
						</div>

						<!-- Daylight track with bookings -->
						<div class="sbk__track-section">
							<div class="sbk__track" bind:this={trackEl}>
								<!-- Sky layers -->
								<div class="sbk__sky sbk__sky--base"></div>
								<div class="sbk__sky sbk__sky--day" style="left:{pct24(SUNRISE + 0.5)}%; width:{pct24(SUNSET - SUNRISE - 1)}%;"></div>
								<div class="sbk__sky sbk__sky--sunrise" style="left:{pct24(SUNRISE - 0.25)}%; width:{pct24(1.25)}%;"></div>
								<div class="sbk__sky sbk__sky--sunset" style="left:{pct24(SUNSET - 0.75)}%; width:{pct24(2.25)}%;"></div>

								<!-- Window bounds -->
								<div class="sbk__window-mask sbk__window-mask--left" style="width:{pct24(activity.windowStart)}%;"></div>
								<div class="sbk__window-mask sbk__window-mask--right" style="left:{pct24(activity.windowEnd)}%; width:{pct24(24 - activity.windowEnd)}%;"></div>

								<!-- Existing bookings -->
								{#each selectedDay.bookings as booking}
									<div
										class="sbk__booking-block"
										style="left:{pct24(booking.start)}%; width:{pct24(booking.end - booking.start)}%;"
										title="{booking.name} · {ft(booking.start)} – {ft(booking.end)}"
									>
										<span class="sbk__booking-avatar" style="--c:{booking.color};">{booking.name[0]}</span>
									</div>
								{/each}

								<!-- Your drag range -->
								<button
									type="button"
									class="sbk__pick-range"
									style="left:{pct24(pickStart)}%; width:{pct24(pickEnd - pickStart)}%;"
									onpointerdown={(e) => onDown(e, 'range')}
								>
									<span>{fDur(duration)}</span>
								</button>

								<!-- Handles -->
								<button type="button" class="sbk__handle" style="left:{pct24(pickStart)}%;" onpointerdown={(e) => onDown(e, 'start')}>
									<GripVertical size={11} strokeWidth={2.4} />
								</button>
								<button type="button" class="sbk__handle" style="left:{pct24(pickEnd)}%;" onpointerdown={(e) => onDown(e, 'end')}>
									<GripVertical size={11} strokeWidth={2.4} />
								</button>
							</div>

							<!-- Labels -->
							<div class="sbk__track-labels">
								<span style="left:{pct24(activity.windowStart)}%;">{ft(activity.windowStart)}</span>
								<span style="left:{pct24(12)}%;">Noon</span>
								<span style="left:{pct24(activity.windowEnd)}%;">{ft(activity.windowEnd)}</span>
							</div>
						</div>

						<!-- Selection summary -->
						<div class="sbk__pick-summary">
							<h3>{ft(pickStart)} – {ft(pickEnd)}</h3>
							<p>{fDur(duration)} · {lightHint.icon} {lightHint.label} · {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left</p>
						</div>

						<!-- Duration selector -->
						<div class="sbk__durations">
							{#each quickDurations as d}
								<button
									type="button"
									class="sbk__dur"
									class:sbk__dur--active={Math.abs(duration - d) < 0.01}
									onclick={() => selectDuration(d)}
								>{fDur(d)}</button>
							{/each}
						</div>

						<!-- Existing groups -->
						{#if groups.length > 0}
							<div class="sbk__groups">
								<p class="sbk__groups-label">Join a crew</p>
								{#each groups as g}
									<button type="button" class="sbk__group-card" onclick={() => joinGroup(g)}>
										<div class="sbk__group-people">
											{#each g.people as p}
												<span class="sbk__group-avatar" style="--c:{p.color};">{p.name[0]}</span>
											{/each}
											<span class="sbk__group-names">{g.people.map(p => p.name).join(', ')}</span>
										</div>
										<div class="sbk__group-time">{ft(g.start)} – {ft(g.end)}</div>
										<div class="sbk__group-action">Join →</div>
									</button>
								{/each}
							</div>
						{/if}

						<button type="button" class="sbk__primary-btn" onclick={() => transition('confirm')} disabled={spotsLeft <= 0}>
							{spotsLeft <= 0 ? 'Full at this time' : 'Next →'}
						</button>

					{:else if step === 'confirm' && selectedDay}
						<!-- ═══ STEP 3: CONFIRM ═══ -->
						<div class="sbk__confirm-summary">
							<span class="sbk__confirm-icon">{activity.icon}</span>
							<h2>{activity.label}</h2>
							<p class="sbk__confirm-date">{formatDate(selectedDay.date)}</p>
							<p class="sbk__confirm-time">{ft(pickStart)} – {ft(pickEnd)}</p>
							<p class="sbk__confirm-meta">{lightHint.icon} {lightHint.label} · {fDur(duration)}</p>
						</div>

						{#if overlapping.length > 0}
							<div class="sbk__confirm-overlap">
								<p>You'll be there with:</p>
								{#each overlapping as person}
									<div class="sbk__confirm-person">
										<span class="sbk__group-avatar" style="--c:{person.color};">{person.name[0]}</span>
										<span>{person.name}</span>
										<span class="sbk__confirm-person-time">{ft(person.start)} – {ft(person.end)}</span>
									</div>
								{/each}
							</div>
						{/if}

						<div class="sbk__guest-picker">
							<p>Bringing anyone?</p>
							<div class="sbk__guest-options">
								{#each [0, 1, 2] as g}
									<button
										type="button"
										class="sbk__guest-opt"
										class:sbk__guest-opt--active={guestCount === g}
										onclick={() => guestCount = g}
									>{g === 0 ? 'Just me' : `+${g}`}</button>
								{/each}
							</div>
						</div>

						<button type="button" class="sbk__primary-btn" onclick={() => transition('done')}>
							I'm in ✦
						</button>

					{:else if step === 'done' && selectedDay}
						<!-- ═══ STEP 4: DONE ═══ -->
						<div class="sbk__done">
							<div class="sbk__done-check">✓</div>
							<h2>You're in.</h2>
							<p class="sbk__done-detail">{activity.icon} {activity.label} · {formatDate(selectedDay.date)}</p>
							<p class="sbk__done-time">{ft(pickStart)} – {ft(pickEnd)}</p>
							{#if overlapping.length > 0}
								<p class="sbk__done-crew">{overlapping.map(p => p.name).join(' and ')} will be there too 🤙</p>
							{/if}
							<button type="button" class="sbk__secondary-btn" onclick={() => transition('calendar')}>
								Back to calendar
							</button>
						</div>
					{/if}

				</div>
			{/key}
		</div>
	</div>
</PageShell>


<style>
	.sbk__inner { max-width: 40rem; margin: 0 auto; }
	.sbk__tabs { display: flex; gap: 0.35rem; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
	.sbk__tab { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 0.85rem; border: 1px solid color-mix(in srgb, var(--border) 50%, transparent); border-radius: 0.625rem; background: transparent; color: color-mix(in srgb, var(--text) 60%, transparent); font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 150ms ease; }
	.sbk__tab:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
	.sbk__tab--active { background: var(--gradient-action); border-color: transparent; color: #fff; }
	.sbk__tab-icon { font-size: 0.95rem; }
	.sbk__frame { padding: clamp(1.25rem, 3vw, 2rem); border: 1px solid color-mix(in srgb, var(--border) 60%, transparent); border-radius: 1.25rem; background: radial-gradient(circle at top, color-mix(in srgb, #3b82f6 6%, transparent), transparent 32%), linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 80%, transparent), color-mix(in srgb, var(--bg) 92%, transparent)); box-shadow: 0 24px 64px color-mix(in srgb, var(--text) 6%, transparent); min-height: 28rem; }
	.sbk__step--forward { animation: sbk-slide-left 0.32s cubic-bezier(0.16, 1, 0.3, 1); }
	.sbk__step--back { animation: sbk-slide-right 0.32s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes sbk-slide-left { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
	@keyframes sbk-slide-right { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
	.sbk__crumbs { display: flex; align-items: center; gap: 0.35rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
	.sbk__crumb { padding: 0; border: none; background: none; font: inherit; font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); cursor: pointer; transition: color 150ms ease; }
	.sbk__crumb:hover:not(:disabled) { color: color-mix(in srgb, var(--text) 70%, transparent); }
	.sbk__crumb:disabled { cursor: default; }
	.sbk__crumb--active { color: var(--text); }
	.sbk__crumb--done { color: #a78bfa; }
	.sbk__crumb-sep { font-size: 0.72rem; color: color-mix(in srgb, var(--text) 25%, transparent); }
	.sbk__cal-head { margin-bottom: 1.25rem; }
	.sbk__cal-month { margin: 0; font-family: var(--font-display); font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 500; letter-spacing: -0.03em; }
	.sbk__cal-hint { margin: 0.3rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 50%, transparent); }
	.sbk__cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.35rem; }
	.sbk__cal-weekdays span { text-align: center; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 40%, transparent); }
	.sbk__cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.3rem; }
	.sbk__cal-day { position: relative; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.75rem; background: color-mix(in srgb, var(--panel-bg) 80%, transparent); font: inherit; cursor: pointer; padding: 0; transition: all 150ms ease; }
	.sbk__cal-day:hover:not(:disabled) { border-color: color-mix(in srgb, var(--text) 20%, transparent); background: color-mix(in srgb, var(--panel-bg) 95%, transparent); transform: translateY(-1px); }
	.sbk__cal-day:disabled { cursor: default; }
	.sbk__cal-day--other { opacity: 0.25; }
	.sbk__cal-day--past { opacity: 0.35; }
	.sbk__cal-day--today { border-color: color-mix(in srgb, var(--text) 28%, transparent); }
	.sbk__cal-day--open { border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, var(--panel-bg) 94%); }
	.sbk__cal-num { position: absolute; top: 0.5rem; right: 0.55rem; font-size: 0.82rem; font-weight: 600; }
	.sbk__cal-dots { position: absolute; bottom: 0.45rem; left: 0.55rem; display: flex; gap: 0.2rem; }
	.sbk__cal-dot { width: 0.32rem; height: 0.32rem; border-radius: 999px; background: #a78bfa; }
	.sbk__cal-dot--people { background: #4ade80; }
	.sbk__day-head { margin-bottom: 1.25rem; }
	.sbk__day-date { margin: 0; font-family: var(--font-display); font-size: clamp(1.5rem, 3.5vw, 2rem); font-weight: 500; letter-spacing: -0.03em; }
	.sbk__day-window { margin: 0.3rem 0 0; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.sbk__day-sun { margin: 0.2rem 0 0; font-size: 0.75rem; color: color-mix(in srgb, var(--text) 40%, transparent); }
	.sbk__track-section { position: relative; margin: 1.25rem 0 1.5rem; padding-bottom: 1.5rem; }
	.sbk__track { position: relative; height: 3.5rem; border-radius: 0.85rem; border: 1px solid #1a1c24; overflow: hidden; touch-action: none; }
	.sbk__sky { position: absolute; top: 0; bottom: 0; }
	.sbk__sky--base { inset: 0; background: #080a14; border-radius: inherit; }
	.sbk__sky--day { background: linear-gradient(180deg, #1a2a4a, #162040, #141c38); opacity: 0.5; }
	.sbk__sky--sunrise { background: linear-gradient(90deg, #4a2a4a, #8b4a3a, #c4794a, #d4944a); opacity: 0.35; }
	.sbk__sky--sunset { background: linear-gradient(90deg, #c4794a, #8b4a3a, #4a2a4a, #1a1228, transparent); opacity: 0.35; }
	.sbk__window-mask { position: absolute; top: 0; bottom: 0; background: rgba(0,0,0,0.55); z-index: 3; }
	.sbk__window-mask--left { left: 0; border-radius: 0.85rem 0 0 0.85rem; }
	.sbk__window-mask--right { border-radius: 0 0.85rem 0.85rem 0; }
	.sbk__booking-block { position: absolute; top: 0.3rem; bottom: 0.3rem; border-radius: 0.45rem; background: color-mix(in srgb, var(--c, #888) 12%, transparent); border: 1px solid color-mix(in srgb, var(--c, #888) 25%, transparent); z-index: 5; display: flex; align-items: center; padding-left: 0.3rem; }
	.sbk__booking-avatar, .sbk__group-avatar { width: 1.2rem; height: 1.2rem; border-radius: 999px; background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); border: 1px solid color-mix(in srgb, var(--c) 30%, transparent); display: inline-flex; align-items: center; justify-content: center; font-size: 0.42rem; font-weight: 700; flex-shrink: 0; }
	.sbk__pick-range { position: absolute; top: 0.2rem; bottom: 0.2rem; border-radius: 0.5rem; background: linear-gradient(135deg, #a78bfa12, #818cf812); border: 1.5px solid #a78bfa40; cursor: grab; z-index: 10; display: flex; align-items: center; justify-content: center; padding: 0; font: inherit; }
	.sbk__pick-range span { font-size: 0.65rem; font-weight: 700; color: #c4b5fd; pointer-events: none; user-select: none; }
	.sbk__handle { position: absolute; top: 50%; width: 1.1rem; height: 1.1rem; border-radius: 999px; background: #14161e; border: 2px solid #a78bfa; cursor: ew-resize; transform: translate(-50%, -50%); z-index: 20; box-shadow: 0 2px 8px rgba(167, 139, 250, 0.3); display: flex; align-items: center; justify-content: center; padding: 0; font: inherit; color: #a78bfa; }
	.sbk__track-labels { position: relative; height: 1.1rem; margin-top: 0.3rem; }
	.sbk__track-labels span { position: absolute; transform: translateX(-50%); font-size: 0.6rem; color: color-mix(in srgb, var(--text) 35%, transparent); font-weight: 500; }
	.sbk__pick-summary { margin-bottom: 1rem; }
	.sbk__pick-summary h3 { margin: 0; font-family: var(--font-display); font-size: clamp(1.8rem, 5vw, 2.3rem); letter-spacing: -0.04em; font-weight: 500; }
	.sbk__pick-summary p { margin: 0.3rem 0 0; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.sbk__durations { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
	.sbk__dur { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1.5px solid #1a1c24; background: #10111a; color: #666; font: inherit; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 150ms ease; }
	.sbk__dur--active { border-color: #a78bfa30; background: #a78bfa0a; color: #c4b5fd; }
	.sbk__groups { margin-bottom: 1.25rem; }
	.sbk__groups-label { margin: 0 0 0.5rem; font-size: 0.72rem; font-weight: 650; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 45%, transparent); }
	.sbk__group-card { width: 100%; display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 0.75rem; padding: 0.75rem 0.85rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.75rem; background: color-mix(in srgb, var(--panel-bg) 75%, transparent); cursor: pointer; font: inherit; color: inherit; text-align: left; transition: all 150ms ease; margin-bottom: 0.35rem; }
	.sbk__group-card:hover { border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, var(--panel-bg)); }
	.sbk__group-people { display: flex; align-items: center; gap: 0.35rem; }
	.sbk__group-names { font-size: 0.8rem; font-weight: 600; }
	.sbk__group-time { font-size: 0.75rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.sbk__group-action { font-size: 0.75rem; font-weight: 600; color: #a78bfa; }
	.sbk__primary-btn { width: 100%; padding: 0.8rem; border: none; border-radius: 0.625rem; background: var(--gradient-action); color: #fff; font: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 16px color-mix(in srgb, #7a5af8 25%, transparent); transition: all 150ms ease; }
	.sbk__primary-btn:hover:not(:disabled) { box-shadow: 0 4px 24px color-mix(in srgb, #7a5af8 35%, transparent); transform: translateY(-1px); }
	.sbk__primary-btn:disabled { opacity: 0.45; cursor: default; }
	.sbk__secondary-btn { width: 100%; padding: 0.75rem; border: 1px solid color-mix(in srgb, var(--text) 20%, transparent); border-radius: 0.625rem; background: transparent; color: var(--text); font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 150ms ease; }
	.sbk__secondary-btn:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
	.sbk__confirm-summary { text-align: center; margin-bottom: 1.5rem; }
	.sbk__confirm-icon { font-size: 2.2rem; display: block; margin-bottom: 0.5rem; }
	.sbk__confirm-summary h2 { margin: 0; font-family: var(--font-display); font-size: 1.6rem; font-weight: 500; letter-spacing: -0.03em; }
	.sbk__confirm-date { margin: 0.3rem 0 0; font-size: 0.88rem; color: color-mix(in srgb, var(--text) 65%, transparent); }
	.sbk__confirm-time { margin: 0.15rem 0 0; font-family: var(--font-display); font-size: 1.3rem; font-weight: 500; letter-spacing: -0.02em; }
	.sbk__confirm-meta { margin: 0.3rem 0 0; font-size: 0.8rem; color: color-mix(in srgb, var(--text) 50%, transparent); }
	.sbk__confirm-overlap { margin-bottom: 1.25rem; }
	.sbk__confirm-overlap p:first-child { margin: 0 0 0.5rem; font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.sbk__confirm-person { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; font-size: 0.82rem; }
	.sbk__confirm-person-time { margin-left: auto; font-size: 0.75rem; color: color-mix(in srgb, var(--text) 45%, transparent); }
	.sbk__guest-picker { margin-bottom: 1.25rem; }
	.sbk__guest-picker p { margin: 0 0 0.5rem; font-size: 0.82rem; font-weight: 600; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.sbk__guest-options { display: flex; gap: 0.3rem; }
	.sbk__guest-opt { padding: 0.45rem 0.9rem; border-radius: 0.5rem; border: 1.5px solid #1a1c24; background: #10111a; color: #666; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
	.sbk__guest-opt--active { border-color: #a78bfa30; background: #a78bfa0a; color: #c4b5fd; }
	.sbk__done { text-align: center; padding: 2rem 0; }
	.sbk__done-check { width: 3rem; height: 3rem; border-radius: 999px; background: #3cbf8a12; border: 1px solid #3cbf8a30; color: #3cbf8a; display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; }
	.sbk__done h2 { margin: 0; font-family: var(--font-display); font-size: 1.8rem; font-weight: 500; letter-spacing: -0.03em; }
	.sbk__done-detail { margin: 0.5rem 0 0; font-size: 0.88rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.sbk__done-time { margin: 0.15rem 0 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.02em; }
	.sbk__done-crew { margin: 0.75rem 0 1.5rem; font-size: 0.85rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	@media (max-width: 30rem) { .sbk__frame { padding: 1rem; } .sbk__cal-day { border-radius: 0.55rem; } .sbk__cal-num { font-size: 0.72rem; top: 0.35rem; right: 0.4rem; } }
</style>
