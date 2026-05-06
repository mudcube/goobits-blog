<script lang="ts">
	import { FormControl, FormField, NumberStepper } from '@miko/ui'
	import { AdminActionButton } from '@calendar/ui/admin'

	type Event = { time: string; capacity: number; recurring: boolean }

	const MONTH = 4 // May (0-indexed)
	const YEAR = 2026

	const monthDate = new Date(YEAR, MONTH, 1)
	const monthLabel = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
	const firstDayWeekday = monthDate.getDay()
	const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate()

	const events = $state<Record<number, Event>>({
		3: { time: '7:00 PM', capacity: 12, recurring: true },
		4: { time: '7:00 PM', capacity: 12, recurring: true },
		6: { time: '7:00 PM', capacity: 12, recurring: true },
		10: { time: '7:00 PM', capacity: 12, recurring: true },
		11: { time: '7:00 PM', capacity: 12, recurring: true },
		13: { time: '7:00 PM', capacity: 12, recurring: true },
		16: { time: '9:00 AM', capacity: 8, recurring: false },
		17: { time: '7:00 PM', capacity: 12, recurring: true },
		18: { time: '7:00 PM', capacity: 12, recurring: true },
		20: { time: '7:00 PM', capacity: 12, recurring: true }
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

	const draft = $state({
		time: '19:00',
		capacity: 12,
		repeat: false
	})

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

	function openDay(day: number) {
		const existing = events[day]
		if (existing) {
			const isPM = existing.time.includes('PM')
			const parts = existing.time.replace(/[^\d:]/g, '').split(':')
			const rawHour = Number(parts[0] ?? 0)
			const minute = parts[1] ?? '00'
			const hour24 = isPM && rawHour < 12 ? rawHour + 12 : !isPM && rawHour === 12 ? 0 : rawHour
			draft.time = `${String(hour24).padStart(2, '0')}:${minute.padStart(2, '0')}`
			draft.capacity = existing.capacity
			draft.repeat = existing.recurring
		} else {
			draft.time = program.defaultTime
			draft.capacity = program.defaultCapacity
			draft.repeat = false
		}
		selectedDay = day
		inspectorOpen = true
	}

	function backToProgram() {
		selectedDay = null
	}

	function dismissDay() {
		selectedDay = null
		inspectorOpen = false
	}

	function saveEvent() {
		if (selectedDay == null) return
		const [hhStr, mmStr] = draft.time.split(':')
		const hh = Number(hhStr ?? 0)
		const mm = Number(mmStr ?? 0)
		const period = hh >= 12 ? 'PM' : 'AM'
		const displayHour = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh
		const displayTime = `${displayHour}:${String(mm).padStart(2, '0')} ${period}`
		events[selectedDay] = { time: displayTime, capacity: draft.capacity, recurring: draft.repeat }
		dismissDay()
	}

	function removeEvent() {
		if (selectedDay == null) return
		delete events[selectedDay]
		dismissDay()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (inspectorView === 'day') backToProgram()
			else if (inspectorOpen) inspectorOpen = false
		}
	}
</script>

<svelte:head>
	<title>Program editor — inspector mockup</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="page">
	<header class="page__bar">
		<div class="page__crumb">
			<a href="/playground" class="page__back">← Playground</a>
			<span class="page__sep">/</span>
			<span>Program editor</span>
		</div>
		<button
			class="page__inspector-toggle"
			type="button"
			onclick={() => (inspectorOpen = !inspectorOpen)}
		>
			{inspectorOpen ? 'Close settings' : 'Settings'}
		</button>
	</header>

	<header class="program-head">
		<div class="program-head__icon" aria-hidden="true">🧘</div>
		<div class="program-head__text">
			<span class="program-head__eyebrow">Program</span>
			<h1 class="program-head__title">Morning Yoga</h1>
			<span class="program-head__sub">/{program.slug}</span>
		</div>
		<button class="program-head__save" type="button">Save</button>
	</header>

	<div class="layout">
		<section class="calendar-card">
			<header class="calendar-card__head">
				<div class="calendar-card__title">Schedule · {monthLabel}</div>
				<div class="calendar-card__nav">
					<button type="button" class="calendar-card__nav-btn" aria-label="Previous month">‹</button>
					<button type="button" class="calendar-card__nav-btn" aria-label="Next month">›</button>
				</div>
			</header>

			<div class="calendar">
				<div class="calendar__weekdays" aria-hidden="true">
					{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
						<span>{day}</span>
					{/each}
				</div>

				<div class="calendar__grid">
					{#each cells as cell, idx (idx)}
						{#if cell.day == null}
							<div class="calendar__cell calendar__cell--empty" aria-hidden="true"></div>
						{:else}
							{@const ev = events[cell.day]}
							{@const isSelected = selectedDay === cell.day}
							<button
								type="button"
								class="calendar__cell"
								class:calendar__cell--has-event={!!ev}
								class:calendar__cell--selected={isSelected}
								onclick={() => openDay(cell.day!)}
							>
								<span class="calendar__date">{cell.day}</span>
								{#if ev}
									<span class="calendar__chip" class:calendar__chip--once={!ev.recurring}>
										{ev.time}
									</span>
								{:else}
									<span class="calendar__chip-placeholder" aria-hidden="true">+</span>
								{/if}
							</button>
						{/if}
					{/each}
				</div>
			</div>
		</section>

		<aside
			class="inspector"
			class:inspector--open={inspectorOpen}
			class:inspector--day={inspectorView === 'day'}
			aria-label={inspectorView === 'day' ? 'Edit event' : 'Program settings'}
		>
			{#if inspectorView === 'program'}
				<header class="inspector__head">
					<span class="inspector__eyebrow">Inspector</span>
					<h2 class="inspector__title">Program</h2>
					<button
						type="button"
						class="inspector__close"
						aria-label="Close inspector"
						onclick={() => (inspectorOpen = false)}
					>✕</button>
				</header>

				<div class="inspector__body">
					<section class="ins-sec">
						<h3 class="ins-sec__title">Status</h3>
						<div class="ins-row">
							<div>
								<div class="ins-row__label">
									{program.enabled ? 'Live · accepting bookings' : 'Hidden · not accepting'}
								</div>
								<div class="ins-row__hint">Toggle to publish or unpublish.</div>
							</div>
							<button
								type="button"
								class="switch"
								class:switch--on={program.enabled}
								aria-pressed={program.enabled}
								aria-label={program.enabled ? 'Disable bookings' : 'Enable bookings'}
								onclick={() => (program.enabled = !program.enabled)}
							>
								<span></span>
							</button>
						</div>
					</section>

					<section class="ins-sec">
						<h3 class="ins-sec__title">Address</h3>
						<FormField label="URL path">
							<div class="ins-prefix-group">
								<span class="ins-prefix-group__prefix">/schedule/</span>
								<FormControl type="text" bind:value={program.slug} />
							</div>
						</FormField>
					</section>

					<section class="ins-sec">
						<h3 class="ins-sec__title">Hero</h3>
						<FormField label="Eyebrow">
							<FormControl type="text" bind:value={program.eyebrow} />
						</FormField>
						<FormField label="Title line 1">
							<FormControl type="text" bind:value={program.titleLine1} />
						</FormField>
						<FormField label="Title line 2">
							<FormControl type="text" bind:value={program.titleLine2} />
						</FormField>
						<FormField label="Subtitle">
							<FormControl type="text" bind:value={program.subtitle} />
						</FormField>
					</section>

					<section class="ins-sec">
						<h3 class="ins-sec__title">Defaults</h3>
						<div class="ins-defaults">
							<FormField label="Time">
								<FormControl type="time" step={900} bind:value={program.defaultTime} />
							</FormField>
							<FormField label="Capacity">
								<NumberStepper bind:value={program.defaultCapacity} min={1} max={50} ariaLabel="Default capacity" />
							</FormField>
						</div>
						<p class="ins-hint">Used when scheduling a new event from the calendar.</p>
					</section>

					<section class="ins-sec ins-sec--danger">
						<h3 class="ins-sec__title ins-sec__title--danger">Danger zone</h3>
						<p class="ins-hint">Permanently removes the program and its events.</p>
						<AdminActionButton variant="danger">Delete program</AdminActionButton>
					</section>
				</div>
			{:else}
				<header class="inspector__head inspector__head--day">
					<button
						type="button"
						class="inspector__back"
						aria-label="Back to program settings"
						onclick={backToProgram}
					>← Program</button>
					<div class="inspector__day-title">
						<span class="inspector__eyebrow">Event</span>
						<h2 class="inspector__title">{selectedLabel}</h2>
					</div>
				</header>

				<div class="inspector__body">
					<section class="ins-sec">
						<h3 class="ins-sec__title">When</h3>
						<div class="ins-defaults">
							<FormField label="Time">
								<FormControl type="time" step={900} bind:value={draft.time} />
							</FormField>
							<FormField label="Capacity">
								<NumberStepper bind:value={draft.capacity} min={1} max={50} ariaLabel="Capacity" />
							</FormField>
						</div>
					</section>

					<section class="ins-sec">
						<h3 class="ins-sec__title">Repeat</h3>
						<label class="ins-check">
							<input type="checkbox" bind:checked={draft.repeat} />
							<span>Repeat weekly</span>
						</label>
					</section>
				</div>

				<footer class="inspector__foot">
					{#if selectedDay != null && events[selectedDay]}
						<AdminActionButton variant="danger" onclick={removeEvent}>Remove</AdminActionButton>
					{:else}
						<AdminActionButton variant="subtle" onclick={dismissDay}>Cancel</AdminActionButton>
					{/if}
					<AdminActionButton variant="primary" onclick={saveEvent}>
						{selectedDay != null && events[selectedDay] ? 'Save' : 'Add event'}
					</AdminActionButton>
				</footer>
			{/if}
		</aside>

		{#if inspectorOpen}
			<button
				type="button"
				class="mobile-scrim"
				aria-label="Close inspector"
				onclick={() => {
					inspectorOpen = false
					backToProgram()
				}}
			></button>
		{/if}
	</div>
</div>

<style>
	.page {
		max-width: 76rem;
		margin: 0 auto;
		padding: 1rem 1.25rem 6rem;
		font-family: var(--font-ui-sans, var(--font-sans));
		color: var(--text);
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
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}

	.page__back {
		color: inherit;
		text-decoration: none;
	}

	.page__back:hover { color: var(--text); }

	.page__sep { opacity: 0.4; }

	.page__inspector-toggle {
		display: none;
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: transparent;
		color: var(--text);
		padding: 0.4rem 0.85rem;
		border-radius: 999px;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

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
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}

	.program-head__save {
		appearance: none;
		border: none;
		background: var(--text);
		color: var(--bg);
		padding: 0.55rem 1.1rem;
		border-radius: 999px;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 650;
		cursor: pointer;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 22rem;
		gap: 1.5rem;
		position: relative;
	}

	.calendar-card {
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 1rem;
		overflow: hidden;
	}

	.calendar-card__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.calendar-card__title {
		font-size: 0.85rem;
		font-weight: 650;
	}

	.calendar-card__nav { display: flex; gap: 0.25rem; }

	.calendar-card__nav-btn {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: transparent;
		color: var(--text);
		width: 28px;
		height: 28px;
		border-radius: 999px;
		font: inherit;
		font-size: 0.95rem;
		cursor: pointer;
		display: grid;
		place-items: center;
	}

	.calendar { padding: 0.5rem; position: relative; }

	.calendar__weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.25rem;
		padding: 0.4rem 0.4rem 0.55rem;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--admin-text-muted);
	}

	.calendar__weekdays span { text-align: center; }

	.calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.3rem;
	}

	.calendar__cell {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
		background: color-mix(in srgb, var(--text) 2%, transparent);
		border-radius: 0.65rem;
		min-height: 4.5rem;
		padding: 0.45rem 0.5rem 0.4rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.35rem;
		font: inherit;
		color: var(--text);
		cursor: pointer;
		transition: background 120ms, border-color 120ms, transform 120ms;
		position: relative;
	}

	.calendar__cell:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		border-color: color-mix(in srgb, var(--text) 18%, transparent);
	}

	.calendar__cell--empty {
		background: transparent;
		border: 1px dashed color-mix(in srgb, var(--text) 6%, transparent);
		cursor: default;
	}

	.calendar__cell--has-event {
		background: color-mix(in srgb, var(--admin-accent) 6%, var(--bg));
		border-color: color-mix(in srgb, var(--admin-accent) 26%, transparent);
	}

	.calendar__cell--selected {
		outline: 2px solid color-mix(in srgb, var(--admin-accent) 80%, transparent);
		outline-offset: -1px;
	}

	.calendar__date {
		font-size: 0.72rem;
		font-weight: 650;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}

	.calendar__cell--has-event .calendar__date { color: var(--text); }

	.calendar__chip {
		font-size: 0.66rem;
		font-weight: 600;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--admin-accent) 18%, var(--bg));
		color: color-mix(in srgb, var(--admin-accent) 90%, var(--text) 10%);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 36%, transparent);
	}

	.calendar__chip--once {
		background: color-mix(in srgb, var(--text) 8%, var(--bg));
		color: color-mix(in srgb, var(--text) 75%, transparent);
		border-color: color-mix(in srgb, var(--text) 18%, transparent);
	}

	.calendar__chip-placeholder {
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--text) 28%, transparent);
		opacity: 0;
		transition: opacity 120ms;
	}

	.calendar__cell:hover .calendar__chip-placeholder { opacity: 1; }

	/* Inspector */
	.inspector {
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 1rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-self: start;
		position: sticky;
		top: 1rem;
		max-height: calc(100vh - 2rem);
		overflow: auto;
	}

	.inspector__head {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.inspector__eyebrow {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--admin-text-muted);
	}

	.inspector__title {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		flex: 1;
		min-width: 0;
	}

	.inspector__close {
		display: none;
		appearance: none;
		border: none;
		background: transparent;
		font: inherit;
		font-size: 0.95rem;
		cursor: pointer;
		color: var(--admin-text-soft);
		width: 28px;
		height: 28px;
	}

	.inspector__body {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.ins-sec { display: grid; gap: 0.55rem; }

	.ins-sec__title {
		margin: 0;
		font-size: 0.62rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}

	.ins-sec--danger {
		padding-top: 1rem;
		border-top: 1px dashed color-mix(in srgb, var(--text) 12%, transparent);
	}

	.ins-sec__title--danger {
		color: var(--admin-danger-fg);
	}

	.ins-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.ins-row__label {
		font-size: 0.82rem;
		font-weight: 600;
	}

	.ins-row__hint {
		font-size: 0.7rem;
		color: var(--admin-text-muted);
		margin-top: 0.1rem;
	}

	.switch {
		appearance: none;
		width: 40px;
		height: 22px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 18%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		position: relative;
		cursor: pointer;
		transition: background 140ms;
		flex: none;
	}

	.switch span {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		border-radius: 999px;
		background: var(--bg);
		box-shadow: 0 1px 2px color-mix(in srgb, var(--text) 18%, transparent);
		transition: left 140ms;
	}

	.switch--on {
		background: color-mix(in srgb, var(--admin-accent) 80%, transparent);
	}

	.switch--on span { left: 20px; }

	.ins-prefix-group {
		display: flex;
		align-items: stretch;
		border: 1px solid var(--input-border, color-mix(in srgb, var(--text) 12%, transparent));
		border-radius: var(--radius-md, 0.55rem);
		overflow: hidden;
		background: var(--input-bg, var(--bg));
	}

	.ins-prefix-group__prefix {
		display: grid;
		place-items: center;
		padding: 0 0.6rem;
		font-size: var(--font-size-sm, 0.85rem);
		color: var(--muted, color-mix(in srgb, var(--text) 55%, transparent));
		background: color-mix(in srgb, var(--text) 4%, transparent);
		border-right: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		white-space: nowrap;
	}

	.ins-prefix-group :global(.ui-form-control) {
		border: none;
		flex: 1;
		min-width: 0;
		border-radius: 0;
	}

	.ins-defaults {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.5rem;
		align-items: end;
	}

	.ins-hint {
		margin: 0;
		font-size: 0.72rem;
		line-height: 1.4;
		color: var(--admin-text-muted);
	}

	.ins-check {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.82rem;
		cursor: pointer;
	}

	.ins-check input {
		width: 14px;
		height: 14px;
		accent-color: var(--admin-accent);
	}

	/* Day-view header + footer */
	.inspector__head--day {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.inspector__back {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: transparent;
		color: var(--admin-text-soft);
		padding: 0.3rem 0.55rem;
		border-radius: 999px;
		font: inherit;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		cursor: pointer;
		transition: background 120ms, color 120ms, border-color 120ms;
	}

	.inspector__back:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: var(--text);
		border-color: color-mix(in srgb, var(--text) 18%, transparent);
	}

	.inspector__day-title {
		display: grid;
		gap: 0.05rem;
		min-width: 0;
	}

	.inspector__day-title .inspector__title {
		font-size: 0.95rem;
	}

	.inspector__foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-top: 0.7rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
		margin-top: auto;
	}

	/* Compact form controls inside the inspector */
	.inspector :global(.ui-form-field) {
		gap: 0.3rem;
	}

	.inspector :global(.ui-form-label) {
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--admin-text-muted);
	}

	.inspector :global(.ui-form-control) {
		font-size: 0.85rem;
		padding: 0.45rem 0.65rem;
		border-radius: var(--admin-control-radius, 0.55rem);
		border-color: color-mix(in srgb, var(--text) 12%, transparent);
	}

	.inspector :global(.ui-form-control:focus) {
		border-color: var(--admin-accent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-accent) 22%, transparent);
	}

	.inspector :global(.ui-form-message) {
		font-size: 0.66rem;
		margin-top: 0.05rem;
	}

	.inspector :global(.ui-stepper) {
		border-radius: var(--admin-control-radius, 0.55rem);
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		overflow: hidden;
		display: inline-flex;
		align-items: stretch;
	}

	.inspector :global(.ui-stepper__button) {
		appearance: none;
		border: none;
		background: transparent;
		width: 2rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--admin-text-soft);
		cursor: pointer;
	}

	.inspector :global(.ui-stepper__button:hover) {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: var(--text);
	}

	.inspector :global(.ui-stepper__input.ui-form-control) {
		width: 2.4rem;
		text-align: center;
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.45rem 0;
		border: none;
		border-radius: 0;
		background: transparent;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.inspector :global(.ui-stepper__input.ui-form-control::-webkit-outer-spin-button),
	.inspector :global(.ui-stepper__input.ui-form-control::-webkit-inner-spin-button) {
		appearance: none;
		margin: 0;
	}

	.inspector :global(.ui-stepper__input.ui-form-control:focus) {
		box-shadow: none;
	}

	.mobile-scrim {
		position: fixed;
		inset: 0;
		border: none;
		padding: 0;
		background: color-mix(in srgb, var(--text) 32%, transparent);
		backdrop-filter: blur(2px);
		z-index: 40;
		cursor: pointer;
	}

	@media (max-width: 56em) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}

		.page__inspector-toggle { display: inline-flex; }

		.inspector {
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: min(22rem, 92vw);
			max-height: 100vh;
			border-radius: 0;
			border-left: 1px solid var(--admin-card-border);
			border-top: none;
			border-right: none;
			border-bottom: none;
			box-shadow: -16px 0 40px color-mix(in srgb, var(--text) 14%, transparent);
			transform: translateX(100%);
			transition: transform 220ms ease;
			z-index: 50;
		}

		.inspector--open { transform: translateX(0); }

		.inspector__close { display: grid; place-items: center; }
	}

	@media (max-width: 720px) {
		.calendar__cell { min-height: 3.5rem; }
		.program-head { grid-template-columns: auto 1fr; gap: 0.65rem; }
		.program-head__save { grid-column: 1 / -1; justify-self: stretch; }
	}
</style>
