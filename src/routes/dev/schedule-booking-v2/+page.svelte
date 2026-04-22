<script lang="ts">
	import { GripVertical } from '@lucide/svelte'
	import { PageShell } from '@miko/ui'
	import DevHero from '../DevHero.svelte'

	type Activity = { slug: string; label: string; icon: string; maxDuration: number; capacity: number; windowStart: number; windowEnd: number }
	type Booking = { userId: string; name: string; color: string; start: number; end: number; guests: number }
	type OpenDay = { date: Date; bookings: Booking[] }
	type Step = 'calendar' | 'day' | 'confirm' | 'done'

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

	function makeDate(n: number) { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(0,0,0,0); return d }

	function buildOpenDays(act: Activity): OpenDay[] {
		const days: OpenDay[] = []
		for (let i = 1; i <= 21; i++) {
			const d = makeDate(i); const dow = d.getDay()
			const open = act.slug === 'gym' ? [1,3,5].includes(dow) : act.slug === 'circus' ? [2,4].includes(dow) : act.slug === 'adventure' ? dow === 6 : act.slug === 'movies' ? [5,6].includes(dow) : false
			if (!open) continue
			const bookings: Booking[] = []
			if (i <= 7) {
				const ws = act.windowStart
				bookings.push({ ...PEOPLE[0]!, start: ws+2, end: ws+4, guests: 0 })
				bookings.push({ ...PEOPLE[1]!, start: ws+3, end: ws+5, guests: 0 })
				if (i <= 3) bookings.push({ ...PEOPLE[2]!, start: ws+2, end: ws+3.5, guests: 1 })
			} else if (i <= 14) {
				bookings.push({ ...PEOPLE[3]!, start: act.windowStart+1, end: act.windowStart+3, guests: 0 })
			}
			days.push({ date: d, bookings })
		}
		return days
	}

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
	let showCustomTime = $state(false)

	const STEPS: Step[] = ['calendar', 'day', 'confirm', 'done']
	const stepIndex = $derived(STEPS.indexOf(step))
	const activity = $derived(ACTIVITIES.find(a => a.slug === activeSlug)!)
	const openDays = $derived(buildOpenDays(activity))
	const SUNRISE = 6.53; const SUNSET = 19.8
	const SNAP = 0.25
	const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
	const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

	const calendarMonth = $derived.by(() => { const now = new Date(); return { year: now.getFullYear(), month: now.getMonth() } })
	const calendarDays = $derived.by(() => {
		const { year, month } = calendarMonth
		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const startPad = (firstDay.getDay() + 6) % 7
		const cells: Array<{ date: Date; inMonth: boolean; isToday: boolean; isOpen: boolean; isPast: boolean; bookingCount: number }> = []
		for (let i = startPad - 1; i >= 0; i--) { const d = new Date(year, month, -i); cells.push({ date: d, inMonth: false, isToday: false, isOpen: false, isPast: true, bookingCount: 0 }) }
		const today = new Date(); today.setHours(0,0,0,0)
		for (let day = 1; day <= lastDay.getDate(); day++) {
			const d = new Date(year, month, day); const isPast = d < today; const match = openDays.find(od => od.date.getTime() === d.getTime())
			cells.push({ date: d, inMonth: true, isToday: d.getTime() === today.getTime(), isOpen: !!match, isPast, bookingCount: match?.bookings.length ?? 0 })
		}
		const endPad = (7 - cells.length % 7) % 7
		for (let i = 1; i <= endPad; i++) { const d = new Date(year, month + 1, i); cells.push({ date: d, inMonth: false, isToday: false, isOpen: false, isPast: false, bookingCount: 0 }) }
		return cells
	})

	function snap(v: number) { return Math.round(v / SNAP) * SNAP }
	function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
	function pctW(h: number) { return ((h - activity.windowStart) / (activity.windowEnd - activity.windowStart)) * 100 }

	function ft(h: number) { const hr = Math.floor(h) % 24; const min = Math.round((h - Math.floor(h)) * 60); const sfx = hr >= 12 ? 'pm' : 'am'; const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr; return min === 0 ? `${display} ${sfx}` : `${display}:${String(min).padStart(2, '0')} ${sfx}` }
	function fDur(d: number) { const h = Math.floor(d); const m = Math.round((d - h) * 60); if (h === 0) return `${m}m`; if (m === 0) return h === 1 ? '1 hr' : `${h} hrs`; return `${h}h ${m}m` }

	const duration = $derived(pickEnd - pickStart)
	const lightHint = $derived.by(() => { if (pickStart >= SUNRISE && pickEnd <= SUNSET) return '☀️'; if (pickEnd <= SUNRISE || pickStart >= SUNSET) return '🌙'; return '🌤' })

	const overlapping = $derived.by(() => { if (!selectedDay) return []; return selectedDay.bookings.filter(b => b.start < pickEnd && b.end > pickStart) })
	const spotsUsedAtPick = $derived.by(() => {
		if (!selectedDay) return 0; let max = 0
		for (let t = pickStart; t < pickEnd; t += 0.25) { const count = selectedDay.bookings.reduce((sum, b) => { if (b.start <= t && b.end > t) return sum + 1 + b.guests; return sum }, 0); if (count > max) max = count }
		return max
	})
	const spotsLeft = $derived(activity.capacity - spotsUsedAtPick)

	const groups = $derived.by(() => {
		if (!selectedDay) return []; const map = new Map<string, { start: number; end: number; people: Booking[] }>()
		for (const b of selectedDay.bookings) { const key = `${b.start}-${b.end}`; const g = map.get(key) ?? { start: b.start, end: b.end, people: [] }; g.people.push(b); map.set(key, g) }
		return [...map.values()].sort((a, b) => a.start - b.start)
	})

	function getHour(clientX: number) { if (!trackEl) return activity.windowStart; const rect = trackEl.getBoundingClientRect(); const ratio = (clientX - rect.left) / rect.width; return snap(clamp(activity.windowStart + ratio * (activity.windowEnd - activity.windowStart), activity.windowStart, activity.windowEnd)) }

	function onDown(event: PointerEvent, type: 'start' | 'end' | 'range') { event.preventDefault(); event.stopPropagation(); dragging = type; if (type === 'range') dragOffset = getHour(event.clientX) - pickStart; (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId) }
	function onMove(event: PointerEvent) {
		if (!dragging) return; const hour = getHour(event.clientX)
		if (dragging === 'start') { pickStart = snap(clamp(hour, activity.windowStart, pickEnd - 0.5)) }
		else if (dragging === 'end') { pickEnd = snap(clamp(hour, pickStart + 0.5, Math.min(activity.windowEnd, pickStart + activity.maxDuration))) }
		else { let ns = snap(hour - dragOffset); ns = clamp(ns, activity.windowStart, activity.windowEnd - duration); pickStart = ns; pickEnd = ns + duration }
	}
	function onUp() { dragging = null }

	function selectDay(day: OpenDay) { selectedDay = day; pickStart = activity.windowStart + 2; pickEnd = Math.min(pickStart + 2, activity.windowEnd); guestCount = 0; showCustomTime = false; go('day') }
	function joinGroup(g: { start: number; end: number }) { pickStart = g.start; pickEnd = g.end; go('confirm') }
	function go(next: Step) { const ni = STEPS.indexOf(next); direction = ni >= stepIndex ? 'forward' : 'back'; animKey++; step = next }
	function formatDate(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }
	function formatDateLong(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }

	function hourLabels() {
		const labels = []
		for (let h = activity.windowStart; h <= activity.windowEnd; h += 2) {
			labels.push({ hour: h, label: ft(h).replace(' ', '') })
		}
		return labels
	}

	const breadcrumbItems = [
		{ label: 'Dev', href: '/dev/' },
		{ label: 'Schedule Booking', href: '/dev/schedule-booking/' },
		{ label: 'v2' }
	]

	const versions = [
		{ label: 'v1', href: '/dev/schedule-booking/' },
		{ label: 'v2', href: '/dev/schedule-booking-v2/', current: true }
	]
</script>

<svelte:head><title>Schedule Booking v2 - Dev - MIKO.ART</title></svelte:head>
<svelte:window onpointermove={onMove} onpointerup={onUp} />

<PageShell className="sbk">
	<div class="sbk__inner">
		<DevHero
			title="Booking v2"
			subtitle="Join-first flow with hero track."
			{breadcrumbItems}
			{versions}
		/>

		<div class="sbk__tabs">
			{#each ACTIVITIES as act}
				<button type="button" class="sbk__tab" class:sbk__tab--active={activeSlug === act.slug} onclick={() => { activeSlug = act.slug; step = 'calendar'; selectedDay = null; animKey++ }}>
					<span class="sbk__tab-icon">{act.icon}</span> {act.label}
				</button>
			{/each}
		</div>

		<div class="sbk__frame">
			<!-- Breadcrumb trail -->
			<nav class="sbk__crumbs">
				<button type="button" class="sbk__crumb" class:sbk__crumb--active={step === 'calendar'} class:sbk__crumb--past={stepIndex > 0} disabled={step === 'calendar'} onclick={() => go('calendar')}>{activity.icon} {activity.label}</button>
				{#if stepIndex >= 1 && selectedDay}
					<span class="sbk__crumb-sep">›</span>
					<button type="button" class="sbk__crumb" class:sbk__crumb--active={step === 'day'} class:sbk__crumb--past={stepIndex > 1} disabled={step === 'day'} onclick={() => go('day')}>{formatDate(selectedDay.date)}</button>
				{/if}
				{#if stepIndex >= 2}
					<span class="sbk__crumb-sep">›</span>
					<button type="button" class="sbk__crumb" class:sbk__crumb--active={step === 'confirm'} class:sbk__crumb--past={stepIndex > 2} disabled={step === 'confirm'} onclick={() => go('confirm')}>{ft(pickStart)}–{ft(pickEnd)}</button>
				{/if}
				{#if stepIndex >= 3}
					<span class="sbk__crumb-sep">›</span>
					<span class="sbk__crumb sbk__crumb--active">✓</span>
				{/if}
			</nav>

			{#key animKey}
			<div class="sbk__step" class:sbk__step--fwd={direction === 'forward'} class:sbk__step--back={direction === 'back'}>

			{#if step === 'calendar'}
				<h2 class="sbk__title">{MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}</h2>
				<div class="sbk__cal-weekdays">{#each WEEKDAYS as w}<span>{w}</span>{/each}</div>
				<div class="sbk__cal-grid">
					{#each calendarDays as cell}
						<button type="button" class="sbk__day" class:sbk__day--other={!cell.inMonth} class:sbk__day--past={cell.isPast} class:sbk__day--today={cell.isToday} class:sbk__day--open={cell.isOpen} disabled={!cell.isOpen || cell.isPast} onclick={() => { const m = openDays.find(od => od.date.getTime() === cell.date.getTime()); if (m) selectDay(m) }}>
							<span class="sbk__day-num">{cell.date.getDate()}</span>
							{#if cell.isOpen && !cell.isPast}
								<span class="sbk__day-dots">
									<span class="sbk__dot"></span>
									{#if cell.bookingCount > 0}<span class="sbk__dot sbk__dot--grn"></span>{/if}
								</span>
							{/if}
						</button>
					{/each}
				</div>

			{:else if step === 'day' && selectedDay}
				<p class="sbk__day-meta">{formatDateLong(selectedDay.date)} · {ft(activity.windowStart)}–{ft(activity.windowEnd)}</p>

				<!-- Join existing groups first -->
				{#if groups.length > 0}
					<div class="sbk__groups">
						{#each groups as g}
							<button type="button" class="sbk__group" onclick={() => joinGroup(g)}>
								<div class="sbk__group-left">
									<div class="sbk__group-avatars">{#each g.people as p}<span class="sbk__av" style="--c:{p.color};">{p.name[0]}</span>{/each}</div>
									<div>
										<div class="sbk__group-names">{g.people.map(p => p.name).join(', ')}</div>
										<div class="sbk__group-time">{ft(g.start)}–{ft(g.end)} · {fDur(g.end - g.start)}</div>
									</div>
								</div>
								<div class="sbk__group-join">Join</div>
							</button>
						{/each}
					</div>
				{:else}
					<p class="sbk__empty">Nobody's here yet. You're setting the pace.</p>
				{/if}

				<!-- Custom time toggle -->
				{#if !showCustomTime && groups.length > 0}
					<button type="button" class="sbk__toggle-custom" onclick={() => showCustomTime = true}>Pick a different time</button>
				{/if}

				{#if showCustomTime || groups.length === 0}
					<!-- Hero track: only the bookable window -->
					<div class="sbk__track-wrap">
						<div class="sbk__track" bind:this={trackEl}>
							<!-- Sky: sunrise/day/sunset mapped to window -->
							<div class="sbk__sky-base"></div>
							{#if SUNRISE > activity.windowStart || SUNSET < activity.windowEnd}
								<div class="sbk__sky-day" style="left:{clamp(pctW(Math.max(SUNRISE + 0.5, activity.windowStart)), 0, 100)}%; width:{clamp(pctW(Math.min(SUNSET - 0.5, activity.windowEnd)) - pctW(Math.max(SUNRISE + 0.5, activity.windowStart)), 0, 100)}%;"></div>
							{/if}

							<!-- Existing bookings -->
							{#each selectedDay.bookings as b}
								<div class="sbk__bk" style="left:{pctW(b.start)}%; width:{pctW(b.end) - pctW(b.start)}%;" title="{b.name}">
									<span class="sbk__av sbk__av--sm" style="--c:{b.color};">{b.name[0]}</span>
									<span class="sbk__bk-name">{b.name}</span>
								</div>
							{/each}

							<!-- Your range -->
							<button type="button" class="sbk__range" style="left:{pctW(pickStart)}%; width:{pctW(pickEnd) - pctW(pickStart)}%;" onpointerdown={(e) => onDown(e, 'range')}>
								<span class="sbk__range-label">{fDur(duration)}</span>
							</button>
							<button type="button" class="sbk__handle" style="left:{pctW(pickStart)}%;" onpointerdown={(e) => onDown(e, 'start')}><GripVertical size={10} strokeWidth={2.4} /></button>
							<button type="button" class="sbk__handle" style="left:{pctW(pickEnd)}%;" onpointerdown={(e) => onDown(e, 'end')}><GripVertical size={10} strokeWidth={2.4} /></button>
						</div>
						<!-- Hour labels for the window only -->
						<div class="sbk__hours">
							{#each hourLabels() as hl}
								<span style="left:{pctW(hl.hour)}%;">{hl.label}</span>
							{/each}
						</div>
					</div>

					<div class="sbk__pick-info">
						<span class="sbk__pick-time">{ft(pickStart)}–{ft(pickEnd)}</span>
						<span class="sbk__pick-meta">{lightHint} {fDur(duration)} · {spotsLeft} left</span>
					</div>

					<button type="button" class="sbk__primary" onclick={() => go('confirm')} disabled={spotsLeft <= 0}>
						{spotsLeft <= 0 ? 'Full at this time' : 'Next →'}
					</button>
				{/if}

			{:else if step === 'confirm' && selectedDay}
				<div class="sbk__confirm">
					<span class="sbk__confirm-icon">{activity.icon}</span>
					<h2>{activity.label}</h2>
					<p class="sbk__confirm-date">{formatDateLong(selectedDay.date)}</p>
					<p class="sbk__confirm-time">{ft(pickStart)} – {ft(pickEnd)}</p>
					<p class="sbk__confirm-meta">{lightHint} {fDur(duration)}</p>
				</div>

				{#if overlapping.length > 0}
					<div class="sbk__with">
						<p class="sbk__with-label">You'll be there with</p>
						{#each overlapping as p}
							<div class="sbk__with-row"><span class="sbk__av" style="--c:{p.color};">{p.name[0]}</span> <span>{p.name}</span> <span class="sbk__with-time">{ft(p.start)}–{ft(p.end)}</span></div>
						{/each}
					</div>
				{/if}

				<div class="sbk__guests">
					<p>Bringing anyone?</p>
					<div class="sbk__guests-row">
						{#each [0,1,2] as g}<button type="button" class="sbk__guest-btn" class:sbk__guest-btn--on={guestCount === g} onclick={() => guestCount = g}>{g === 0 ? 'Just me' : `+${g}`}</button>{/each}
					</div>
				</div>

				<button type="button" class="sbk__primary" onclick={() => go('done')}>I'm in ✦</button>

			{:else if step === 'done' && selectedDay}
				<div class="sbk__done">
					<div class="sbk__done-badge">✓</div>
					<h2>You're in.</h2>
					<p>{activity.icon} {activity.label} · {formatDate(selectedDay.date)}</p>
					<p class="sbk__done-time">{ft(pickStart)} – {ft(pickEnd)}</p>
					{#if overlapping.length > 0}
						<p class="sbk__done-crew">{overlapping.map(p => p.name).join(' and ')} will be there too 🤙</p>
					{/if}
					<button type="button" class="sbk__secondary" onclick={() => go('calendar')}>Back to calendar</button>
				</div>
			{/if}

			</div>
			{/key}
		</div>
	</div>
</PageShell>

<style>
	.sbk__inner { max-width: 32rem; margin: 0 auto; }

	.sbk__tabs { display: flex; gap: 0.3rem; justify-content: center; margin-bottom: 1.2rem; flex-wrap: wrap; }
	.sbk__tab { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.42rem 0.75rem; border: 1px solid color-mix(in srgb, var(--border) 45%, transparent); border-radius: 0.5rem; background: transparent; color: color-mix(in srgb, var(--text) 55%, transparent); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 140ms ease; }
	.sbk__tab:hover { background: color-mix(in srgb, var(--text) 5%, transparent); }
	.sbk__tab--active { background: var(--gradient-action); border-color: transparent; color: #fff; }
	.sbk__tab-icon { font-size: 0.88rem; }

	.sbk__frame { padding: clamp(1rem, 2.5vw, 1.5rem); border: 1px solid color-mix(in srgb, var(--border) 50%, transparent); border-radius: 1rem; background: linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 75%, transparent), color-mix(in srgb, var(--bg) 90%, transparent)); min-height: 24rem; overflow: hidden; }

	.sbk__crumbs { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 1rem; }
	.sbk__crumb { padding: 0; border: none; background: none; font: inherit; font-size: 0.68rem; font-weight: 600; color: color-mix(in srgb, var(--text) 35%, transparent); cursor: pointer; transition: color 140ms; }
	.sbk__crumb:hover:not(:disabled) { color: color-mix(in srgb, var(--text) 65%, transparent); }
	.sbk__crumb:disabled { cursor: default; }
	.sbk__crumb--active { color: color-mix(in srgb, var(--text) 80%, transparent); }
	.sbk__crumb--past { color: #a78bfa; }
	.sbk__crumb-sep { font-size: 0.62rem; color: color-mix(in srgb, var(--text) 20%, transparent); user-select: none; }

	.sbk__step--fwd { animation: sbk-fwd 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
	.sbk__step--back { animation: sbk-back 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes sbk-fwd { from { opacity: 0; transform: translateX(36px); } to { opacity: 1; transform: translateX(0); } }
	@keyframes sbk-back { from { opacity: 0; transform: translateX(-36px); } to { opacity: 1; transform: translateX(0); } }

	/* Calendar */
	.sbk__title { margin: 0 0 0.75rem; font-family: var(--font-display); font-size: clamp(1.4rem, 3.5vw, 1.9rem); font-weight: 500; letter-spacing: -0.03em; }
	.sbk__cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.25rem; }
	.sbk__cal-weekdays span { text-align: center; font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: color-mix(in srgb, var(--text) 35%, transparent); }
	.sbk__cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; }
	.sbk__day { position: relative; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.6rem; background: color-mix(in srgb, var(--panel-bg) 75%, transparent); font: inherit; cursor: pointer; padding: 0; transition: all 140ms ease; }
	.sbk__day:hover:not(:disabled) { border-color: color-mix(in srgb, var(--text) 18%, transparent); transform: translateY(-1px); }
	.sbk__day:disabled { cursor: default; }
	.sbk__day--other { opacity: 0.2; }
	.sbk__day--past { opacity: 0.3; }
	.sbk__day--today { border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.sbk__day--open { border-color: color-mix(in srgb, #a78bfa 28%, transparent); background: color-mix(in srgb, #a78bfa 5%, var(--panel-bg) 95%); }
	.sbk__day-num { position: absolute; top: 0.4rem; right: 0.45rem; font-size: 0.78rem; font-weight: 600; }
	.sbk__day-dots { position: absolute; bottom: 0.35rem; left: 0.45rem; display: flex; gap: 0.18rem; }
	.sbk__dot { width: 0.28rem; height: 0.28rem; border-radius: 999px; background: #a78bfa; }
	.sbk__dot--grn { background: #4ade80; }

	/* Day view */
	.sbk__day-meta { margin: 0 0 1rem; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.sbk__empty { margin: 0 0 1rem; font-size: 0.85rem; font-style: italic; color: color-mix(in srgb, var(--text) 42%, transparent); }

	/* Groups (join-first) */
	.sbk__groups { display: grid; gap: 0.35rem; margin-bottom: 1rem; }
	.sbk__group { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.7rem 0.85rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.75rem; background: color-mix(in srgb, var(--panel-bg) 70%, transparent); cursor: pointer; font: inherit; color: inherit; text-align: left; transition: all 140ms ease; }
	.sbk__group:hover { border-color: color-mix(in srgb, #a78bfa 28%, transparent); background: color-mix(in srgb, #a78bfa 5%, var(--panel-bg)); }
	.sbk__group-left { display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
	.sbk__group-avatars { display: flex; }
	.sbk__group-avatars .sbk__av { margin-left: -0.3rem; }
	.sbk__group-avatars .sbk__av:first-child { margin-left: 0; }
	.sbk__group-names { font-size: 0.82rem; font-weight: 600; }
	.sbk__group-time { font-size: 0.72rem; color: color-mix(in srgb, var(--text) 50%, transparent); margin-top: 0.1rem; }
	.sbk__group-join { font-size: 0.78rem; font-weight: 600; color: #a78bfa; flex-shrink: 0; }

	.sbk__toggle-custom { display: block; width: 100%; margin-bottom: 1rem; padding: 0.55rem; border: 1px dashed color-mix(in srgb, var(--text) 18%, transparent); border-radius: 0.6rem; background: none; color: color-mix(in srgb, var(--text) 48%, transparent); font: inherit; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 140ms; }
	.sbk__toggle-custom:hover { border-color: color-mix(in srgb, var(--text) 30%, transparent); color: color-mix(in srgb, var(--text) 70%, transparent); }

	/* Hero track — only bookable window, taller */
	.sbk__track-wrap { position: relative; margin-bottom: 1rem; padding-bottom: 1.2rem; }
	.sbk__track { position: relative; height: 5.5rem; border-radius: 0.85rem; border: 1px solid #1a1c24; overflow: hidden; touch-action: none; }
	.sbk__sky-base { position: absolute; inset: 0; background: #0c0e18; border-radius: inherit; }
	.sbk__sky-day { position: absolute; top: 0; bottom: 0; background: linear-gradient(180deg, #1e2e52, #182444, #151e3c); opacity: 0.55; }

	.sbk__bk { position: absolute; top: 0.35rem; bottom: 0.35rem; border-radius: 0.45rem; background: color-mix(in srgb, var(--c, #888) 10%, transparent); border: 1px solid color-mix(in srgb, var(--c, #888) 22%, transparent); z-index: 4; display: flex; align-items: center; gap: 0.3rem; padding: 0 0.4rem; overflow: hidden; }
	.sbk__bk-name { font-size: 0.55rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); white-space: nowrap; }

	.sbk__av { width: 1.3rem; height: 1.3rem; border-radius: 999px; background: color-mix(in srgb, var(--c) 14%, transparent); color: var(--c); border: 1px solid color-mix(in srgb, var(--c) 28%, transparent); display: inline-flex; align-items: center; justify-content: center; font-size: 0.44rem; font-weight: 700; flex-shrink: 0; }
	.sbk__av--sm { width: 1.6rem; height: 1.6rem; font-size: 0.5rem; }

	.sbk__range { position: absolute; top: 0.25rem; bottom: 0.25rem; border-radius: 0.5rem; background: linear-gradient(135deg, #a78bfa14, #818cf814); border: 1.5px solid #a78bfa44; cursor: grab; z-index: 10; display: flex; align-items: center; justify-content: center; padding: 0; font: inherit; }
	.sbk__range-label { font-size: 0.7rem; font-weight: 700; color: #c4b5fd; pointer-events: none; user-select: none; }
	.sbk__handle { position: absolute; top: 50%; width: 1rem; height: 1rem; border-radius: 999px; background: #14161e; border: 2px solid #a78bfa; cursor: ew-resize; transform: translate(-50%, -50%); z-index: 20; box-shadow: 0 2px 6px rgba(167, 139, 250, 0.3); display: flex; align-items: center; justify-content: center; padding: 0; font: inherit; color: #a78bfa; }

	.sbk__hours { position: relative; height: 1rem; margin-top: 0.25rem; }
	.sbk__hours span { position: absolute; transform: translateX(-50%); font-size: 0.55rem; color: color-mix(in srgb, var(--text) 30%, transparent); font-weight: 500; }

	.sbk__pick-info { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 1rem; }
	.sbk__pick-time { font-family: var(--font-display); font-size: 1.3rem; font-weight: 500; letter-spacing: -0.03em; }
	.sbk__pick-meta { font-size: 0.78rem; color: color-mix(in srgb, var(--text) 50%, transparent); }

	/* Buttons */
	.sbk__primary { width: 100%; padding: 0.72rem; border: none; border-radius: 0.5rem; background: var(--gradient-action); color: #fff; font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 14px color-mix(in srgb, #7a5af8 22%, transparent); transition: all 140ms; }
	.sbk__primary:hover:not(:disabled) { box-shadow: 0 4px 20px color-mix(in srgb, #7a5af8 32%, transparent); transform: translateY(-1px); }
	.sbk__primary:disabled { opacity: 0.4; cursor: default; }
	.sbk__secondary { width: 100%; padding: 0.65rem; border: 1px solid color-mix(in srgb, var(--text) 18%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
	.sbk__secondary:hover { background: color-mix(in srgb, var(--text) 5%, transparent); }

	/* Confirm */
	.sbk__confirm { text-align: center; margin-bottom: 1.25rem; }
	.sbk__confirm-icon { font-size: 2rem; display: block; margin-bottom: 0.4rem; }
	.sbk__confirm h2 { margin: 0; font-family: var(--font-display); font-size: 1.4rem; font-weight: 500; letter-spacing: -0.02em; }
	.sbk__confirm-date { margin: 0.2rem 0 0; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.sbk__confirm-time { margin: 0.1rem 0 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 500; }
	.sbk__confirm-meta { margin: 0.2rem 0 0; font-size: 0.75rem; color: color-mix(in srgb, var(--text) 45%, transparent); }

	.sbk__with { margin-bottom: 1rem; }
	.sbk__with-label { margin: 0 0 0.4rem; font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 50%, transparent); }
	.sbk__with-row { display: flex; align-items: center; gap: 0.45rem; padding: 0.3rem 0; font-size: 0.78rem; }
	.sbk__with-time { margin-left: auto; font-size: 0.7rem; color: color-mix(in srgb, var(--text) 40%, transparent); }

	.sbk__guests { margin-bottom: 1rem; }
	.sbk__guests p { margin: 0 0 0.4rem; font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.sbk__guests-row { display: flex; gap: 0.25rem; }
	.sbk__guest-btn { padding: 0.38rem 0.75rem; border-radius: 0.45rem; border: 1.5px solid #1a1c24; background: #10111a; color: #666; font: inherit; font-size: 0.72rem; font-weight: 600; cursor: pointer; }
	.sbk__guest-btn--on { border-color: #a78bfa30; background: #a78bfa0a; color: #c4b5fd; }

	/* Done */
	.sbk__done { text-align: center; padding: 1.5rem 0; }
	.sbk__done-badge { width: 2.5rem; height: 2.5rem; border-radius: 999px; background: #3cbf8a10; border: 1px solid #3cbf8a28; color: #3cbf8a; display: inline-flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem; }
	.sbk__done h2 { margin: 0; font-family: var(--font-display); font-size: 1.5rem; font-weight: 500; letter-spacing: -0.02em; }
	.sbk__done p { margin: 0.3rem 0 0; font-size: 0.82rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.sbk__done-time { font-family: var(--font-display); font-size: 1.1rem; font-weight: 500; color: var(--text); }
	.sbk__done-crew { margin-top: 0.5rem; margin-bottom: 1.25rem; }

	@media (max-width: 30rem) { .sbk__frame { padding: 0.85rem; } .sbk__day { border-radius: 0.45rem; } .sbk__day-num { font-size: 0.68rem; top: 0.3rem; right: 0.35rem; } .sbk__track { height: 4.5rem; } }
</style>
