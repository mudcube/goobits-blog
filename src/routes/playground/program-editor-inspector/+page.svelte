<script lang="ts">
	import { tick } from 'svelte'
	import { FormControl, FormField, NumberStepper } from '@miko/ui'
	import { AdminActionButton } from '@calendar/ui/admin'

	type Event = { time: string; capacity: number; filled: number; recurring: boolean }
	type DayDraft = { time: string; capacity: number; repeat: boolean }

	const MONTH = 4 // May (0-indexed)
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
	let deleteConfirmOpen = $state(false)
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

	const ids = {
		slug: 'fld-slug',
		eyebrow: 'fld-eyebrow',
		titleLine1: 'fld-title1',
		titleLine2: 'fld-title2',
		subtitle: 'fld-subtitle',
		defaultTime: 'fld-default-time',
		draftTime: 'fld-draft-time'
	}

	let programHeadingEl: HTMLElement | undefined = $state()
	let dayHeadingEl: HTMLElement | undefined = $state()

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

	function cancelDiscard() {
		pendingDay = null
	}

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

	function deleteProgram() {
		// mockup: nothing destructive
		deleteConfirmOpen = false
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (pendingDay != null) cancelDiscard()
			else if (deleteConfirmOpen) deleteConfirmOpen = false
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

	$effect(() => {
		// move focus to the relevant heading when the inspector view changes
		if (!inspectorOpen && inspectorView === 'program') return
		tick().then(() => {
			if (inspectorView === 'day') dayHeadingEl?.focus()
			else if (inspectorOpen) programHeadingEl?.focus()
		})
	})
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
		<div class="program-head__save">
			<AdminActionButton variant="primary">Save</AdminActionButton>
		</div>
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
							{@const isPulsing = pulseDay === cell.day}
							{@const isFull = ev != null && ev.filled >= ev.capacity}
							<button
								type="button"
								class="calendar__cell"
								class:calendar__cell--has-event={!!ev}
								class:calendar__cell--full={isFull}
								class:calendar__cell--selected={isSelected}
								class:calendar__cell--pulse={isPulsing}
								aria-label={dayAriaLabel(cell.day, ev)}
								onclick={() => openDay(cell.day!)}
							>
								<span class="calendar__date">{cell.day}</span>
								{#if ev}
									<span
										class="calendar__chip"
										class:calendar__chip--once={!ev.recurring}
										class:calendar__chip--full={isFull}
									>
										<span class="calendar__chip-bar" aria-hidden="true">
											<span
												class="calendar__chip-fill"
												style="width: {Math.min(100, (ev.filled / ev.capacity) * 100)}%"
											></span>
										</span>
										<span class="calendar__chip-text">{ev.filled}/{ev.capacity}</span>
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
			role="region"
			aria-label="Settings panel"
		>
			{#if inspectorView === 'program'}
				<header class="inspector__head">
					<span class="inspector__eyebrow">Inspector</span>
					<h2 class="inspector__title" tabindex="-1" bind:this={programHeadingEl}>Program</h2>
					<button
						type="button"
						class="inspector__close"
						aria-label="Close settings panel"
						onclick={() => (inspectorOpen = false)}
					>✕</button>
				</header>

				<div class="inspector__body">
					<section class="ins-sec ins-sec--row">
						<button
							type="button"
							class="switch"
							class:switch--on={program.enabled}
							aria-pressed={program.enabled}
							aria-label={program.enabled ? 'Currently live, click to disable bookings' : 'Currently hidden, click to enable bookings'}
							onclick={() => (program.enabled = !program.enabled)}
						>
							<span class="switch__thumb">
								<span class="switch__icon" aria-hidden="true">{program.enabled ? '✓' : ''}</span>
							</span>
						</button>
						<div class="ins-status__copy">
							<div class="ins-status__label">
								{program.enabled ? 'Live · accepting bookings' : 'Hidden · not accepting'}
							</div>
							<div class="ins-status__hint">Toggle to publish or unpublish.</div>
						</div>
					</section>

					<hr class="ins-divider" />

					<section class="ins-sec">
						<FormField label="URL path" forId={ids.slug}>
							<div class="ins-prefix-group">
								<span class="ins-prefix-group__prefix">/schedule/</span>
								<FormControl id={ids.slug} type="text" bind:value={program.slug} />
							</div>
						</FormField>
					</section>

					<hr class="ins-divider" />

					<section class="ins-sec">
						<div class="hero-preview" aria-hidden="true">
							<span class="hero-preview__eyebrow">{program.eyebrow || 'Eyebrow'}</span>
							<div class="hero-preview__title">
								{program.titleLine1 || 'Title line 1'}
								<br />
								<span class="hero-preview__title-2">{program.titleLine2 || 'Title line 2'}</span>
							</div>
							<p class="hero-preview__sub">{program.subtitle || 'Subtitle goes here'}</p>
						</div>
						<FormField label="Eyebrow" forId={ids.eyebrow}>
							<FormControl id={ids.eyebrow} type="text" bind:value={program.eyebrow} />
						</FormField>
						<div class="ins-defaults">
							<FormField label="Title line 1" forId={ids.titleLine1}>
								<FormControl id={ids.titleLine1} type="text" bind:value={program.titleLine1} />
							</FormField>
							<FormField label="Title line 2" forId={ids.titleLine2}>
								<FormControl id={ids.titleLine2} type="text" bind:value={program.titleLine2} />
							</FormField>
						</div>
						<FormField label="Subtitle" forId={ids.subtitle}>
							<FormControl id={ids.subtitle} type="text" bind:value={program.subtitle} />
						</FormField>
					</section>

					<hr class="ins-divider" />

					<section class="ins-sec">
						<p class="ins-sec__lede">New event defaults</p>
						<div class="ins-defaults">
							<FormField label="Time" forId={ids.defaultTime}>
								<FormControl id={ids.defaultTime} type="time" step={900} bind:value={program.defaultTime} />
							</FormField>
							<FormField label="Capacity">
								<NumberStepper bind:value={program.defaultCapacity} min={1} max={50} ariaLabel="Default capacity" />
							</FormField>
						</div>
						<p class="ins-hint">Used when scheduling new events. Doesn't change events already on the calendar.</p>
					</section>

					<section class="ins-sec ins-sec--danger">
						<h3 class="ins-sec__title ins-sec__title--danger">Danger zone</h3>
						{#if !deleteConfirmOpen}
							<p class="ins-hint">Permanently removes the program and its events.</p>
							<AdminActionButton variant="danger" onclick={() => (deleteConfirmOpen = true)}>
								Delete program
							</AdminActionButton>
						{:else}
							<p class="ins-hint">This can't be undone. All upcoming events will also be removed.</p>
							<div class="ins-confirm-row">
								<AdminActionButton variant="subtle" onclick={() => (deleteConfirmOpen = false)}>
									Cancel
								</AdminActionButton>
								<AdminActionButton variant="danger" onclick={deleteProgram}>
									Yes, delete
								</AdminActionButton>
							</div>
						{/if}
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
						<h2 class="inspector__title" tabindex="-1" bind:this={dayHeadingEl}>{selectedLabel}</h2>
					</div>
				</header>

				{#if pendingDay != null}
					<div class="ins-discard" role="alertdialog" aria-label="Unsaved changes">
						<p class="ins-discard__title">Discard your changes?</p>
						<p class="ins-hint">You have unsaved edits to {selectedLabel}.</p>
						<div class="ins-confirm-row">
							<AdminActionButton variant="subtle" onclick={cancelDiscard}>Keep editing</AdminActionButton>
							<AdminActionButton variant="danger" onclick={confirmDiscard}>Discard changes</AdminActionButton>
						</div>
					</div>
				{:else}
					<div class="inspector__body">
						<section class="ins-sec">
							<div class="ins-defaults">
								<FormField label="Time" forId={ids.draftTime}>
									<FormControl id={ids.draftTime} type="time" step={900} bind:value={draft.time} />
								</FormField>
								<FormField label="Capacity">
									<NumberStepper bind:value={draft.capacity} min={1} max={50} ariaLabel="Capacity" />
								</FormField>
							</div>
						</section>

						<section class="ins-sec">
							<label class="ins-check">
								<input type="checkbox" bind:checked={draft.repeat} />
								<span>Repeat weekly</span>
							</label>
						</section>
					</div>

					<footer class="inspector__foot">
						<AdminActionButton variant="subtle" onclick={dismissDay}>Cancel</AdminActionButton>
						<div class="inspector__foot-right">
							{#if selectedDay != null && events[selectedDay]}
								<AdminActionButton variant="danger" onclick={removeEvent}>Remove</AdminActionButton>
							{/if}
							<AdminActionButton variant="primary" onclick={saveEvent}>
								{selectedDay != null && events[selectedDay] ? 'Save' : 'Add event'}
							</AdminActionButton>
						</div>
					</footer>
				{/if}
			{/if}
		</aside>

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
		/* Bump muted text contrast for WCAG AA on tinted card surfaces */
		--admin-text-muted: color-mix(in srgb, var(--text) 62%, transparent);
		--admin-text-soft: color-mix(in srgb, var(--text) 70%, transparent);
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

	.page__back {
		color: inherit;
		text-decoration: none;
	}

	.page__back:hover { color: var(--text); }

	.page__sep { opacity: 0.4; }

	.page__inspector-toggle {
		display: none;
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
		color: var(--admin-text-muted);
	}

	.program-head__save { display: inline-flex; }

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
		border: 1px solid var(--admin-calendar-arrow-border, color-mix(in srgb, var(--text) 22%, transparent));
		background: var(--admin-calendar-arrow-bg, transparent);
		color: var(--admin-calendar-arrow-fg, var(--admin-text-soft));
		width: 28px;
		height: 28px;
		border-radius: 999px;
		font: inherit;
		font-size: 0.95rem;
		cursor: pointer;
		display: grid;
		place-items: center;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.calendar-card__nav-btn:hover {
		background: var(--admin-calendar-arrow-hover-bg, color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%));
		color: var(--admin-calendar-arrow-hover-fg, var(--admin-accent));
		border-color: color-mix(in srgb, var(--admin-accent) 36%, transparent);
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
		min-height: 4rem;
		padding: 0.45rem 0.5rem 0.4rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
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

	.calendar__cell--full {
		background: color-mix(in srgb, var(--admin-warn) 8%, var(--bg));
		border-color: color-mix(in srgb, var(--admin-warn) 30%, transparent);
	}

	.calendar__cell--selected {
		outline: 2px solid color-mix(in srgb, var(--admin-accent) 80%, transparent);
		outline-offset: -1px;
	}

	.calendar__cell--pulse {
		animation: cell-pulse 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	@keyframes cell-pulse {
		0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--admin-accent) 50%, transparent); }
		60% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--admin-accent) 0%, transparent); }
		100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--admin-accent) 0%, transparent); }
	}

	.calendar__date {
		font-size: 0.72rem;
		font-weight: 650;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}

	.calendar__cell--has-event .calendar__date { color: var(--text); }

	.calendar__chip {
		display: grid;
		gap: 0.2rem;
		font-size: 0.66rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--admin-accent) 92%, var(--text) 8%);
	}

	.calendar__chip--once {
		color: var(--admin-text-soft);
	}

	.calendar__chip--full {
		color: color-mix(in srgb, var(--admin-warn-strong) 88%, var(--text) 12%);
	}

	.calendar__chip-bar {
		height: 3px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--admin-accent) 16%, transparent);
		overflow: hidden;
	}

	.calendar__chip--once .calendar__chip-bar {
		background: color-mix(in srgb, var(--text) 10%, transparent);
	}

	.calendar__chip--full .calendar__chip-bar {
		background: color-mix(in srgb, var(--admin-warn) 18%, transparent);
	}

	.calendar__chip-fill {
		display: block;
		height: 100%;
		background: var(--admin-accent);
		border-radius: 999px;
		transition: width 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.calendar__chip--once .calendar__chip-fill {
		background: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.calendar__chip--full .calendar__chip-fill {
		background: var(--admin-warn);
	}

	.calendar__chip-text {
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.01em;
	}

	.calendar__chip-placeholder {
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--text) 28%, transparent);
		opacity: 0;
		transition: opacity 120ms;
		align-self: center;
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
		gap: 0.85rem;
		align-self: start;
		position: sticky;
		top: 1rem;
		max-height: calc(100vh - 2rem);
		overflow: auto;
		overscroll-behavior: contain;
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
		font-size: 0.92rem;
		font-weight: 700;
		flex: 1;
		min-width: 0;
		outline: none;
	}

	.inspector__title:focus-visible {
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--admin-accent) 60%, transparent);
		text-underline-offset: 4px;
	}

	.inspector__close {
		display: none;
		appearance: none;
		border: 1px solid var(--admin-button-border, color-mix(in srgb, var(--text) 14%, transparent));
		background: transparent;
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		color: var(--admin-text-soft);
		width: 32px;
		height: 32px;
		border-radius: 999px;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.inspector__close:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: var(--text);
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
	}

	.inspector__body {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.ins-sec { display: grid; gap: 0.6rem; }

	.ins-sec--row {
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 0.75rem;
	}

	.ins-sec__lede {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 650;
		letter-spacing: -0.005em;
		color: var(--text);
	}

	.ins-divider {
		border: none;
		border-top: 1px solid color-mix(in srgb, var(--text) 7%, transparent);
		margin: 0.1rem 0;
	}

	.ins-sec--danger {
		margin-top: 0.4rem;
		padding-top: 0.85rem;
		border-top: 1px dashed color-mix(in srgb, var(--admin-danger) 28%, transparent);
	}

	.ins-sec__title {
		margin: 0;
		font-size: 0.62rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--admin-text-muted);
	}

	.ins-sec__title--danger {
		color: var(--admin-danger-fg);
	}

	.ins-status__copy { display: grid; gap: 0.1rem; min-width: 0; }

	.ins-status__label {
		font-size: 0.85rem;
		font-weight: 600;
	}

	.ins-status__hint {
		font-size: 0.72rem;
		color: var(--admin-text-muted);
	}

	.switch {
		appearance: none;
		width: 44px;
		height: 26px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 18%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		position: relative;
		cursor: pointer;
		transition: background 140ms;
		flex: none;
		padding: 0;
	}

	.switch__thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		border-radius: 999px;
		background: var(--bg);
		box-shadow: 0 1px 2px color-mix(in srgb, var(--text) 18%, transparent);
		transition: left 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
		display: grid;
		place-items: center;
	}

	.switch__icon {
		font-size: 0.65rem;
		font-weight: 800;
		line-height: 1;
		color: var(--admin-accent);
		opacity: 0;
		transition: opacity 140ms;
	}

	.switch--on {
		background: color-mix(in srgb, var(--admin-accent) 80%, transparent);
	}

	.switch--on .switch__thumb { left: 20px; }

	.switch--on .switch__icon { opacity: 1; }

	.ins-prefix-group {
		display: flex;
		align-items: stretch;
		border: 1px solid var(--input-border, color-mix(in srgb, var(--text) 12%, transparent));
		border-radius: var(--admin-control-radius, 0.55rem);
		overflow: hidden;
		background: var(--input-bg, var(--bg));
	}

	.ins-prefix-group__prefix {
		display: grid;
		place-items: center;
		padding: 0 0.75rem;
		font-size: var(--font-size-sm, 0.85rem);
		color: var(--admin-text-muted);
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
		gap: 0.55rem;
		align-items: end;
	}

	.ins-hint {
		margin: 0;
		font-size: 0.74rem;
		line-height: 1.45;
		color: var(--admin-text-muted);
	}

	.ins-check {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0.35rem 0;
	}

	.ins-check input {
		width: 18px;
		height: 18px;
		accent-color: var(--admin-accent);
		flex: none;
	}

	.ins-confirm-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	/* Hero preview */
	.hero-preview {
		padding: 0.85rem 0.95rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--admin-accent) 5%, var(--bg) 95%);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}

	.hero-preview__eyebrow {
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--admin-accent) 80%, var(--text) 20%);
	}

	.hero-preview__title {
		font-family: var(--font-display, var(--font-serif, serif));
		font-size: 1.1rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.01em;
		color: var(--text);
	}

	.hero-preview__title-2 {
		display: inline-block;
		color: var(--admin-accent);
	}

	.hero-preview__sub {
		margin: 0.15rem 0 0;
		font-size: 0.78rem;
		line-height: 1.4;
		color: var(--admin-text-soft);
	}

	/* Discard prompt */
	.ins-discard {
		padding: 0.85rem 0.95rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--admin-warn) 8%, var(--bg) 92%);
		border: 1px solid color-mix(in srgb, var(--admin-warn) 28%, transparent);
		display: grid;
		gap: 0.4rem;
	}

	.ins-discard__title {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 700;
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
		border: 1px solid var(--admin-control-border);
		background: var(--admin-control-bg);
		color: var(--admin-control-fg);
		padding: 0.36rem 0.75rem;
		border-radius: var(--admin-control-radius, 0.55rem);
		font: inherit;
		font-size: 0.76rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		cursor: pointer;
		transition: background 140ms, color 140ms, border-color 140ms, transform 140ms;
		flex: none;
	}

	.inspector__back:hover {
		background: var(--admin-control-bg-hover);
		transform: translateY(-1px);
	}

	.inspector__day-title {
		display: grid;
		gap: 0.05rem;
		min-width: 0;
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

	.inspector__foot-right {
		display: flex;
		gap: 0.4rem;
	}

	/* Compact form controls inside the inspector */
	.inspector :global(.ui-form-field) {
		gap: 0.3rem;
	}

	.inspector :global(.ui-form-label) {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.04em;
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
		display: none;
	}

	@media (max-width: 56em) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}

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
			padding: 1.1rem 1rem;
		}

		.inspector--open { transform: translateX(0); }

		.inspector__close { display: grid; place-items: center; }

		.inspector__back { min-height: 36px; }
	}

	@media (max-width: 720px) {
		.calendar__cell { min-height: 4rem; }
		.program-head { grid-template-columns: auto 1fr; gap: 0.65rem; }
		.program-head__save { grid-column: 1 / -1; justify-self: end; }
	}

	@media (max-width: 24em) {
		.inspector {
			width: 100vw;
			max-width: 100vw;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.calendar__cell--pulse { animation: none; }
		.calendar__chip-fill,
		.switch__thumb,
		.switch__icon,
		.inspector,
		.inspector__back { transition: none; }
	}
</style>
