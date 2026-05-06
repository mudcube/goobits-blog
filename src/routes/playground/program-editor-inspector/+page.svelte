<script lang="ts">
	import { tick } from 'svelte'
	import { fade } from 'svelte/transition'
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
		<div class="program-head__status" aria-live="polite">
			<span class="program-head__dot" aria-hidden="true"></span>
			<span>Saved · just now</span>
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
										<span class="calendar__chip-text">
											{#if isFull}Full{:else}{ev.filled}/{ev.capacity}{/if}
										</span>
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
			{#key inspectorView}
				<div class="inspector__view" in:fade={{ duration: 140 }}>
			{#if inspectorView === 'program'}
				<header class="inspector__head inspector__head--minimal">
					<h2 class="inspector__title sr-only" tabindex="-1" bind:this={programHeadingEl}>Program settings</h2>
					<button
						type="button"
						class="inspector__close"
						aria-label="Close settings panel"
						onclick={() => (inspectorOpen = false)}
					>✕</button>
				</header>

				<div class="inspector__body">
					<div class="inline-row">
						<button
							type="button"
							class="switch"
							class:switch--on={program.enabled}
							aria-pressed={program.enabled}
							aria-label={program.enabled
								? 'Bookable. Click to hide.'
								: 'Hidden. Click to make bookable.'}
							onclick={() => (program.enabled = !program.enabled)}
						>
							<span class="switch__thumb">
								<span class="switch__icon" aria-hidden="true">{program.enabled ? '✓' : ''}</span>
							</span>
						</button>
						<span class="inline-row__label">
							{program.enabled ? 'Bookable' : 'Hidden'}
						</span>
					</div>

					<hr class="ins-divider" />

					<div class="url-pill">
						<span class="url-pill__host">miko.art/schedule/</span>
						<input
							class="url-pill__slug"
							type="text"
							bind:value={program.slug}
							aria-label="URL slug"
						/>
						<a
							class="url-pill__open"
							href="https://miko.art/schedule/{program.slug}"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Open public page in a new tab"
						>
							<span aria-hidden="true">↗</span>
						</a>
					</div>

					<hr class="ins-divider" />

					<section class="hero-edit" aria-label="Public-page hero">
						<div class="hero-edit__emoji" aria-hidden="true">
							<span class="hero-edit__emoji-glyph">🧘</span>
						</div>
						<input
							class="inline-edit hero-edit__eyebrow"
							type="text"
							bind:value={program.eyebrow}
							placeholder="Eyebrow"
							aria-label="Hero eyebrow"
						/>
						<div class="hero-edit__title-group">
							<input
								class="inline-edit hero-edit__title"
								type="text"
								bind:value={program.titleLine1}
								placeholder="Title line 1"
								aria-label="Hero title line 1"
							/>
							<input
								class="inline-edit hero-edit__title"
								type="text"
								bind:value={program.titleLine2}
								placeholder="Title line 2"
								aria-label="Hero title line 2"
							/>
						</div>
						<input
							class="inline-edit hero-edit__sub"
							type="text"
							bind:value={program.subtitle}
							placeholder="Subtitle"
							aria-label="Hero subtitle"
						/>
						<p class="hero-edit__caption">
							This is your public page hero. <a class="hero-edit__caption-link" href="https://miko.art/schedule/{program.slug}" target="_blank" rel="noopener noreferrer">Preview ↗</a>
						</p>
					</section>

					<hr class="ins-divider" />

					<section class="ins-block">
						<div class="ins-block__head">
							<h3 class="ins-block__title">Defaults for new events</h3>
							<p class="ins-hint">When you click a day to schedule, these are the starting values.</p>
						</div>
						<div class="value-row">
							<label class="value-chip">
								<span class="value-chip__icon" aria-hidden="true">🕒</span>
								<input
									class="value-chip__input value-chip__input--time"
									type="time"
									step={900}
									bind:value={program.defaultTime}
									aria-label="Default time"
								/>
							</label>
							<div class="value-stepper" role="group" aria-label="Default capacity">
								<button
									type="button"
									class="value-stepper__btn"
									aria-label="Fewer spots"
									onclick={() => (program.defaultCapacity = Math.max(1, program.defaultCapacity - 1))}
								>−</button>
								<span class="value-stepper__value">
									{program.defaultCapacity}
									<span class="value-stepper__unit">spots</span>
								</span>
								<button
									type="button"
									class="value-stepper__btn"
									aria-label="More spots"
									onclick={() => (program.defaultCapacity = Math.min(50, program.defaultCapacity + 1))}
								>+</button>
							</div>
						</div>
					</section>

					<hr class="ins-divider" />

					<section class="ins-block">
						<div class="ins-block__head">
							<h3 class="ins-block__title">Remove this program</h3>
							<p class="ins-hint">Takes the program and its events offline. Bookings are canceled.</p>
						</div>
						{#if !deleteConfirmOpen}
							<button
								type="button"
								class="ins-remove-btn"
								onclick={() => (deleteConfirmOpen = true)}
							>
								Remove program
							</button>
						{:else}
							<div class="ins-confirm">
								<p class="ins-confirm__msg">Are you sure? This can't be undone.</p>
								<div class="ins-confirm-row">
									<AdminActionButton variant="subtle" onclick={() => (deleteConfirmOpen = false)}>
										Keep program
									</AdminActionButton>
									<AdminActionButton variant="danger" onclick={deleteProgram}>
										Yes, remove
									</AdminActionButton>
								</div>
							</div>
						{/if}
					</section>

					<p class="inspector__footer-meta">Edited 2h ago by Miko</p>
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
						<h2 class="inspector__title" tabindex="-1" bind:this={dayHeadingEl}>{selectedLabel}</h2>
						<span class="inspector__meta">
							{selectedDay != null && events[selectedDay] ? 'Editing this class' : 'Schedule a class'}
						</span>
					</div>
				</header>

				{#if pendingDay != null}
					<div class="ins-discard" role="alertdialog" aria-label="Unsaved changes">
						<p class="ins-discard__title">You have unsaved edits</p>
						<p class="ins-hint">Your changes to {selectedLabel} aren't saved yet.</p>
						<div class="ins-confirm-row">
							<AdminActionButton variant="subtle" onclick={cancelDiscard}>Keep editing</AdminActionButton>
							<AdminActionButton variant="danger" onclick={confirmDiscard}>Switch anyway</AdminActionButton>
						</div>
					</div>
				{:else}
					<div class="inspector__body">
						<section class="ins-block">
							<div class="ins-block__head">
								<h3 class="ins-block__title">When and how big</h3>
							</div>
							<div class="value-row">
								<label class="value-chip">
									<span class="value-chip__icon" aria-hidden="true">🕒</span>
									<input
										class="value-chip__input value-chip__input--time"
										type="time"
										step={900}
										bind:value={draft.time}
										aria-label="Time"
									/>
								</label>
								<div class="value-stepper" role="group" aria-label="Capacity">
									<button
										type="button"
										class="value-stepper__btn"
										aria-label="Fewer spots"
										onclick={() => (draft.capacity = Math.max(1, draft.capacity - 1))}
									>−</button>
									<span class="value-stepper__value">
										{draft.capacity}
										<span class="value-stepper__unit">spots</span>
									</span>
									<button
										type="button"
										class="value-stepper__btn"
										aria-label="More spots"
										onclick={() => (draft.capacity = Math.min(50, draft.capacity + 1))}
									>+</button>
								</div>
							</div>
						</section>

						<label class="ins-check">
							<input type="checkbox" bind:checked={draft.repeat} />
							<span>Repeat every {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long' }) : 'week'}</span>
						</label>
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
				</div>
			{/key}
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

	.inspector__head--minimal {
		justify-content: flex-end;
		padding-bottom: 0;
		border-bottom: none;
	}

	.inspector__meta {
		font-size: 0.7rem;
		color: var(--admin-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.inspector__footer-meta {
		margin: 0.6rem 0 0;
		padding-top: 0.6rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 7%, transparent);
		font-size: 0.7rem;
		color: var(--admin-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.inspector__view {
		display: contents;
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

	.ins-divider {
		border: none;
		border-top: 1px solid color-mix(in srgb, var(--text) 7%, transparent);
		margin: 0.1rem 0;
	}

	/* Inline-edit primitives */
	.inline-edit {
		appearance: none;
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		font: inherit;
		padding: 0.15rem 0.35rem;
		border-radius: 0.45rem;
		min-width: 0;
		transition: background 120ms, border-color 120ms, color 120ms;
	}

	.inline-edit:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		cursor: text;
	}

	.inline-edit:focus,
	.inline-edit:focus-visible {
		outline: none;
		background: color-mix(in srgb, var(--admin-accent) 6%, transparent);
		border-color: color-mix(in srgb, var(--admin-accent) 40%, transparent);
		cursor: text;
	}

	.inline-edit::placeholder {
		color: var(--admin-text-muted);
		font-style: italic;
		opacity: 0.65;
	}

	/* Inline rows for status (still uses inline-row pattern) */
	.inline-row {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		min-width: 0;
		flex-wrap: nowrap;
	}

	.inline-row__label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text);
	}

	/* URL pill — single rounded surface containing host + slug + open link */
	.url-pill {
		display: flex;
		align-items: center;
		gap: 0;
		padding: 0.3rem 0.4rem 0.3rem 0.75rem;
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		background: color-mix(in srgb, var(--text) 3%, transparent);
		border-radius: 999px;
		font-size: 0.85rem;
		font-variant-numeric: tabular-nums;
		min-width: 0;
		transition: border-color 140ms, background 140ms;
	}

	.url-pill:hover { border-color: color-mix(in srgb, var(--text) 18%, transparent); }

	.url-pill:focus-within {
		border-color: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 6%, transparent);
	}

	.url-pill__host {
		color: var(--admin-text-soft);
		white-space: nowrap;
	}

	.url-pill__slug {
		appearance: none;
		border: none;
		background: transparent;
		font: inherit;
		color: var(--text);
		font-weight: 600;
		padding: 0 0.1rem;
		flex: 1;
		min-width: 4rem;
		outline: none;
	}

	.url-pill__open {
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 999px;
		color: var(--admin-text-muted);
		text-decoration: none;
		font-size: 0.78rem;
		flex: none;
		transition: background 140ms, color 140ms;
	}

	.url-pill__open:hover {
		background: color-mix(in srgb, var(--text) 8%, transparent);
		color: var(--admin-accent);
	}

	/* Value row — pill chip for time + stepper for spots */
	.value-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.value-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.85rem;
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		background: color-mix(in srgb, var(--text) 3%, transparent);
		border-radius: 999px;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition: border-color 140ms, background 140ms;
	}

	.value-chip:hover { border-color: color-mix(in srgb, var(--text) 18%, transparent); }

	.value-chip:focus-within {
		border-color: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 6%, transparent);
	}

	.value-chip__icon {
		font-size: 0.85rem;
		opacity: 0.7;
	}

	.value-chip__input {
		appearance: none;
		border: none;
		background: transparent;
		font: inherit;
		color: var(--text);
		font-size: 0.92rem;
		font-weight: 600;
		padding: 0;
		outline: none;
		min-width: 0;
	}

	.value-chip__input--time {
		width: 5.5rem;
	}

	.value-chip__input::-webkit-calendar-picker-indicator {
		opacity: 0.5;
		cursor: pointer;
		transition: opacity 140ms;
	}

	.value-chip__input::-webkit-calendar-picker-indicator:hover {
		opacity: 1;
	}

	/* Stepper chip */
	.value-stepper {
		display: inline-flex;
		align-items: stretch;
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		background: color-mix(in srgb, var(--text) 3%, transparent);
		border-radius: 999px;
		overflow: hidden;
	}

	.value-stepper__btn {
		appearance: none;
		border: none;
		background: transparent;
		color: var(--admin-text-soft);
		font: inherit;
		font-size: 1rem;
		font-weight: 700;
		width: 2rem;
		min-height: 2rem;
		cursor: pointer;
		transition: background 140ms, color 140ms;
	}

	.value-stepper__btn:hover {
		background: color-mix(in srgb, var(--text) 7%, transparent);
		color: var(--text);
	}

	.value-stepper__btn:active {
		background: color-mix(in srgb, var(--admin-accent) 14%, transparent);
		color: var(--admin-accent);
	}

	.value-stepper__value {
		display: inline-flex;
		align-items: baseline;
		gap: 0.35rem;
		padding: 0 0.3rem;
		font-size: 0.92rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--text);
		min-width: 3.6rem;
		justify-content: center;
		align-self: center;
	}

	.value-stepper__unit {
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--admin-text-soft);
	}

	/* Hero edit — mirrors the public-page hero treatment */
	.hero-edit {
		position: relative;
		padding: 1.4rem 1rem 1.1rem;
		border-radius: 0.95rem;
		background:
			radial-gradient(
				ellipse at top,
				color-mix(in srgb, var(--admin-accent) 14%, transparent) 0%,
				transparent 60%
			),
			color-mix(in srgb, var(--admin-accent) 4%, var(--bg) 96%);
		border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
		display: grid;
		justify-items: center;
		gap: 0.3rem;
		min-width: 0;
		text-align: center;
		overflow: hidden;
	}

	.hero-edit__emoji {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: color-mix(in srgb, var(--text) 88%, var(--bg) 12%);
		box-shadow: 0 6px 18px -8px color-mix(in srgb, black 38%, transparent);
		margin-bottom: 0.35rem;
	}

	.hero-edit__emoji-glyph {
		font-size: 1.15rem;
		line-height: 1;
	}

	.hero-edit__eyebrow {
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.74rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-align: center;
		max-width: 100%;
		background-image: linear-gradient(
			90deg,
			#ff6b6b 0%,
			#feca57 20%,
			#48dbfb 40%,
			#ff9ff3 60%,
			#a78bfa 80%,
			#48dbfb 100%
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
	}

	.hero-edit__eyebrow::placeholder {
		-webkit-text-fill-color: var(--admin-text-muted);
		color: var(--admin-text-muted);
	}

	.hero-edit__title-group {
		display: grid;
		justify-items: center;
		gap: 0.05rem;
		width: 100%;
		position: relative;
		padding-bottom: 0.7rem;
	}

	.hero-edit__title-group::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 48px;
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #a78bfa);
		opacity: 0.4;
	}

	.hero-edit__title {
		font-family: var(--font-display, var(--font-serif, serif));
		font-size: 1.45rem;
		font-weight: 500;
		line-height: 1.08;
		letter-spacing: -0.035em;
		color: var(--text);
		width: 100%;
		text-align: center;
	}

	.hero-edit__sub {
		margin-top: 0.45rem;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 0.86rem;
		line-height: 1.45;
		color: color-mix(in srgb, var(--text) 68%, transparent);
		width: 100%;
		text-align: center;
	}

	.hero-edit__caption {
		margin: 0.55rem 0 0;
		font-size: 0.7rem;
		color: var(--admin-text-muted);
	}

	.hero-edit__caption-link {
		color: var(--admin-text-soft);
		text-decoration: none;
		font-weight: 600;
		transition: color 140ms;
	}

	.hero-edit__caption-link:hover { color: var(--admin-accent); }

	/* Soft section block (defaults / remove) */
	.ins-block {
		display: grid;
		gap: 0.55rem;
	}

	.ins-block__head {
		display: grid;
		gap: 0.15rem;
	}

	.ins-block__title {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 650;
		letter-spacing: -0.005em;
		color: var(--text);
	}

	/* Remove button — outlined danger, calmer than solid */
	.ins-remove-btn {
		appearance: none;
		justify-self: start;
		border: 1px solid var(--admin-danger-border, color-mix(in srgb, var(--admin-danger) 30%, transparent));
		background: transparent;
		color: var(--admin-danger-fg);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.4rem 0.85rem;
		border-radius: var(--admin-control-radius, 0.55rem);
		cursor: pointer;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.ins-remove-btn:hover {
		background: var(--admin-danger-bg-faint, color-mix(in srgb, var(--admin-danger) 8%, var(--bg) 92%));
		border-color: color-mix(in srgb, var(--admin-danger) 50%, transparent);
		color: var(--admin-danger);
	}

	.ins-confirm {
		display: grid;
		gap: 0.55rem;
		padding: 0.7rem 0.8rem;
		border-radius: 0.7rem;
		background: var(--admin-danger-bg-faint, color-mix(in srgb, var(--admin-danger) 8%, var(--bg) 92%));
		border: 1px solid color-mix(in srgb, var(--admin-danger) 24%, transparent);
	}

	.ins-confirm__msg {
		margin: 0;
		font-size: 0.82rem;
		color: var(--text);
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
		.program-head__status { grid-column: 1 / -1; justify-self: end; }
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
