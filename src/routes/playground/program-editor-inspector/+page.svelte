<script lang="ts">
	import { AdminActionButton } from '@calendar/ui/admin'
	import Calendar from './Calendar.svelte'
	import Inspector from './Inspector.svelte'

	type Event = { time: string; capacity: number; filled: number; recurring: boolean }
	type DayDraft = { time: string; capacity: number; repeat: boolean }

	const MONTH = 4
	const YEAR = 2026

	const monthDate = new Date(YEAR, MONTH, 1)
	const monthLabel = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
	const firstDayWeekday = monthDate.getDay()
	const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate()

	const events = $state<Record<number, Event>>({
		3: { time: '7:00 PM', capacity: 12, filled: 9, recurring: true },
		4: { time: '7:00 PM', capacity: 12, filled: 12, recurring: true },
		6: { time: '7:00 PM', capacity: 12, filled: 7, recurring: true },
		10: { time: '7:00 PM', capacity: 12, filled: 11, recurring: true },
		11: { time: '7:00 PM', capacity: 12, filled: 8, recurring: true },
		13: { time: '7:00 PM', capacity: 12, filled: 4, recurring: true },
		16: { time: '9:00 AM', capacity: 8, filled: 5, recurring: false },
		17: { time: '7:00 PM', capacity: 12, filled: 10, recurring: true },
		18: { time: '7:00 PM', capacity: 12, filled: 6, recurring: true },
		20: { time: '7:00 PM', capacity: 12, filled: 3, recurring: true }
	})

	const cells = (() => {
		const list: Array<{ day: number | null; weekday: number }> = []
		for (let i = 0; i < firstDayWeekday; i++) list.push({ day: null, weekday: i })
		for (let d = 1; d <= daysInMonth; d++) {
			list.push({ day: d, weekday: (firstDayWeekday + d - 1) % 7 })
		}
		while (list.length % 7 !== 0) list.push({ day: null, weekday: list.length % 7 })
		return list
	})()

	let selectedDay = $state<number | null>(null)
	let inspectorOpen = $state(false)
	let pendingDay = $state<number | null>(null)
	let pulseDay = $state<number | null>(null)
	let pulseTimer: ReturnType<typeof setTimeout> | null = null
	const inspectorView = $derived<'program' | 'day'>(selectedDay != null ? 'day' : 'program')

	const program = $state({
		enabled: true,
		slug: 'morning-yoga',
		eyebrow: 'Morning',
		titleLine1: 'Find your',
		titleLine2: 'rhythm.',
		subtitle: '60-min flow for everyone',
		defaultTime: '19:00',
		defaultCapacity: 12
	})

	const draft = $state<DayDraft>({ time: '19:00', capacity: 12, repeat: false })
	let originalDraft = $state<DayDraft>({ time: '19:00', capacity: 12, repeat: false })

	const isDraftDirty = $derived(
		draft.time !== originalDraft.time ||
			draft.capacity !== originalDraft.capacity ||
			draft.repeat !== originalDraft.repeat
	)

	const selectedDate = $derived(
		selectedDay != null ? new Date(YEAR, MONTH, selectedDay) : null
	)

	const selectedLabel = $derived(
		selectedDate
			? selectedDate.toLocaleDateString(undefined, {
					weekday: 'short',
					month: 'short',
					day: 'numeric'
				})
			: ''
	)

	const hasEventOnSelected = $derived(selectedDay != null && !!events[selectedDay])

	const previewHref = $derived(`https://miko.art/schedule/${program.slug}`)

	function timeStringToInputValue(time: string) {
		const isPM = time.includes('PM')
		const parts = time.replace(/[^\d:]/g, '').split(':')
		const rawHour = Number(parts[0] ?? 0)
		const minute = parts[1] ?? '00'
		const hour24 = isPM && rawHour < 12 ? rawHour + 12 : !isPM && rawHour === 12 ? 0 : rawHour
		return `${String(hour24).padStart(2, '0')}:${minute.padStart(2, '0')}`
	}

	function loadDraft(day: number): DayDraft {
		const existing = events[day]
		if (existing) {
			return {
				time: timeStringToInputValue(existing.time),
				capacity: existing.capacity,
				repeat: existing.recurring
			}
		}
		return { time: program.defaultTime, capacity: program.defaultCapacity, repeat: false }
	}

	function applyDraft(day: number) {
		const next = loadDraft(day)
		draft.time = next.time
		draft.capacity = next.capacity
		draft.repeat = next.repeat
		originalDraft = { ...next }
		selectedDay = day
		inspectorOpen = true
	}

	function openDay(day: number) {
		if (selectedDay != null && day !== selectedDay && isDraftDirty) {
			pendingDay = day
			return
		}
		applyDraft(day)
	}

	function confirmDiscard() {
		const next = pendingDay
		pendingDay = null
		if (next != null) applyDraft(next)
	}

	function cancelDiscard() { pendingDay = null }

	function backToProgram() {
		selectedDay = null
		pendingDay = null
	}

	function dismissDay() {
		selectedDay = null
		pendingDay = null
		inspectorOpen = false
	}

	function flashPulse(day: number) {
		pulseDay = day
		if (pulseTimer) clearTimeout(pulseTimer)
		pulseTimer = setTimeout(() => {
			pulseDay = null
			pulseTimer = null
		}, 1500)
	}

	function saveEvent() {
		if (selectedDay == null) return
		const [hhStr, mmStr] = draft.time.split(':')
		const hh = Number(hhStr ?? 0)
		const mm = Number(mmStr ?? 0)
		const period = hh >= 12 ? 'PM' : 'AM'
		const displayHour = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh
		const displayTime = `${displayHour}:${String(mm).padStart(2, '0')} ${period}`
		const wasNew = !events[selectedDay]
		const filled = events[selectedDay]?.filled ?? 0
		events[selectedDay] = {
			time: displayTime,
			capacity: draft.capacity,
			filled,
			recurring: draft.repeat
		}
		if (wasNew) flashPulse(selectedDay)
		dismissDay()
	}

	function removeEvent() {
		if (selectedDay == null) return
		delete events[selectedDay]
		dismissDay()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (pendingDay != null) cancelDiscard()
			else if (inspectorView === 'day') backToProgram()
			else if (inspectorOpen) inspectorOpen = false
		}
	}

	function dayAriaLabel(day: number, ev: Event | undefined) {
		const date = new Date(YEAR, MONTH, day).toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		})
		if (!ev) return `${date}, no event — click to add`
		return `${date}, ${ev.time}, ${ev.filled} of ${ev.capacity} booked${ev.recurring ? ', recurring weekly' : ''}`
	}
</script>

<svelte:head>
	<title>Program editor — inspector mockup</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="page social-admin">
	<header class="page__bar">
		<div class="page__crumb">
			<a href="/playground" class="page__back">← Playground</a>
			<span class="page__sep">/</span>
			<span>Program editor</span>
		</div>
		<div class="page__inspector-toggle">
			<AdminActionButton
				variant="subtle"
				onclick={() => (inspectorOpen = !inspectorOpen)}
			>
				{inspectorOpen ? 'Close settings' : 'Settings'}
			</AdminActionButton>
		</div>
	</header>

	<header class="program-head">
		<div class="program-head__icon" aria-hidden="true">🧘</div>
		<div class="program-head__text">
			<span class="program-head__eyebrow">Program</span>
			<h1 class="program-head__title">Morning Yoga</h1>
			<span class="program-head__sub">/{program.slug}</span>
		</div>
		<div class="program-head__status" aria-live="polite">
			<span class="program-head__dot" aria-hidden="true"></span>
			<span>Saved · just now</span>
		</div>
	</header>

	<div class="layout">
		<Calendar
			{monthLabel}
			{cells}
			{events}
			{selectedDay}
			{pulseDay}
			{dayAriaLabel}
			onSelectDay={openDay}
		/>

		<Inspector
			{program}
			{draft}
			bind:open={inspectorOpen}
			view={inspectorView}
			{selectedDate}
			{selectedLabel}
			{hasEventOnSelected}
			{pendingDay}
			{previewHref}
			onBackToProgram={backToProgram}
			onDismissDay={dismissDay}
			onSaveEvent={saveEvent}
			onRemoveEvent={removeEvent}
			onCancelDiscard={cancelDiscard}
			onConfirmDiscard={confirmDiscard}
		/>

		{#if inspectorOpen}
			<button
				type="button"
				class="mobile-scrim"
				aria-label="Close settings panel"
				onclick={dismissDay}
			></button>
		{/if}
	</div>
</div>

<style>
	.page.social-admin {
		display: block;
		grid-template-columns: none;
		grid-template-rows: none;
		min-width: 0;
		max-width: 76rem;
		margin: 0 auto;
		padding: 1rem 1.25rem 6rem;
		font-family: var(--font-ui-sans, var(--font-sans));
		color: var(--text);
		background: transparent;
		overflow-x: visible;
		--admin-text-muted: color-mix(in srgb, var(--text) 62%, transparent);
		--admin-text-soft: color-mix(in srgb, var(--text) 70%, transparent);

		/* Shared control tokens — every interactive control in the aside uses these */
		--ins-control-h: 2.25rem; /* 36px */
		--ins-control-radius: var(--admin-control-radius, 0.625rem);
		--ins-control-pad-x: 0.7rem;
		--ins-control-font-size: 0.85rem;
		--ins-control-font-weight: 600;
		--ins-control-border: color-mix(in srgb, var(--text) 12%, transparent);
		--ins-control-border-hover: color-mix(in srgb, var(--text) 22%, transparent);
		--ins-control-border-focus: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		--ins-control-bg: var(--bg);
		--ins-control-bg-soft: color-mix(in srgb, var(--text) 5%, transparent);
		--ins-control-bg-soft-divider: color-mix(in srgb, var(--text) 10%, transparent);
		--ins-control-fg: var(--text);
		--ins-control-fg-muted: var(--admin-text-soft);
		--ins-control-focus-ring: 0 0 0 2px color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}

	.page__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.75rem;
	}

	.page__crumb {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		color: var(--admin-text-muted);
	}

	.page__back { color: inherit; text-decoration: none; }
	.page__back:hover { color: var(--text); }
	.page__sep { opacity: 0.4; }
	.page__inspector-toggle { display: none; }

	.program-head {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0 1.25rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		margin-bottom: 1.25rem;
	}

	.program-head__icon {
		font-size: 1.6rem;
		width: 2.6rem;
		height: 2.6rem;
		display: grid;
		place-items: center;
		border-radius: 0.85rem;
		background: color-mix(in srgb, var(--text) 6%, transparent);
	}

	.program-head__text { display: grid; gap: 0.1rem; min-width: 0; }

	.program-head__eyebrow {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--admin-text-muted);
	}

	.program-head__title {
		margin: 0;
		font-size: 1.3rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.program-head__sub {
		font-size: 0.78rem;
		color: var(--admin-text-muted);
	}

	.program-head__status {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.74rem;
		color: var(--admin-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.program-head__dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 999px;
		background: var(--admin-success, #34c759);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-success, #34c759) 22%, transparent);
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 22rem;
		gap: 1.5rem;
		position: relative;
	}

	.mobile-scrim { display: none; }

	@media (max-width: 56em) {
		.layout { grid-template-columns: minmax(0, 1fr); }

		.page__inspector-toggle { display: inline-flex; }

		.page__inspector-toggle :global(.admin-ui-btn) {
			min-height: 44px;
			padding-inline: 1.1rem;
		}

		.mobile-scrim {
			display: block;
			position: fixed;
			inset: 0;
			border: none;
			padding: 0;
			background: color-mix(in srgb, var(--text) 32%, transparent);
			backdrop-filter: blur(2px);
			z-index: 40;
			cursor: pointer;
		}
	}

	@media (max-width: 720px) {
		.program-head { grid-template-columns: auto 1fr; gap: 0.65rem; }
		.program-head__status { grid-column: 1 / -1; justify-self: end; }
	}
</style>
