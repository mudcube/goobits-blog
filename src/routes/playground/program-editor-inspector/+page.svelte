<script lang="ts">
	import AdminCalendar from '@calendar/ui/admin/dashboard/AdminCalendar.svelte'
	import { isoDay } from '@calendar/ui/booking/calendar-surface.svelte'
	import DayDialog from '@calendar/ui/admin/programs/editor/DayDialog.svelte'
	import { blankDraft, draftsEqual, type DayDraft } from '@calendar/ui/admin/programs/editor/day-dialog.types'

	type Event = { time: string; capacity: number; filled: number; recurring: boolean }

	const initialMonth = new Date(2026, 4, 1)
	let currentMonth = $state(initialMonth)

	const events = $state<Record<string, Event>>({
		'2026-05-03': { time: '7:00 PM', capacity: 12, filled: 9, recurring: true },
		'2026-05-04': { time: '7:00 PM', capacity: 12, filled: 12, recurring: true },
		'2026-05-06': { time: '7:00 PM', capacity: 12, filled: 7, recurring: true },
		'2026-05-10': { time: '7:00 PM', capacity: 12, filled: 11, recurring: true },
		'2026-05-11': { time: '7:00 PM', capacity: 12, filled: 8, recurring: true },
		'2026-05-13': { time: '7:00 PM', capacity: 12, filled: 4, recurring: true },
		'2026-05-16': { time: '9:00 AM', capacity: 8, filled: 5, recurring: false },
		'2026-05-17': { time: '7:00 PM', capacity: 12, filled: 10, recurring: true },
		'2026-05-18': { time: '7:00 PM', capacity: 12, filled: 6, recurring: true },
		'2026-05-20': { time: '7:00 PM', capacity: 12, filled: 3, recurring: true }
	})

	let selectedDayIso = $state<string | null>(null)
	let inspectorOpen = $state(false)
	let pendingDayIso = $state<string | null>(null)

	const program = $state({
		eyebrow: 'GYM',
		title: 'Hang out. Work out.\nWhatever.',
		subtitle: "Grab a time slot and let's do something fun together.",
		icon: '💪',
		slug: 'gym',
		enabled: true,
		defaultTime: '19:00',
		defaultCapacity: 12
	})

	let removeConfirmOpen = $state(false)

	const draft = $state<DayDraft>(blankDraft(program.defaultTime, program.defaultCapacity))
	let originalDraft = $state<DayDraft>(blankDraft(program.defaultTime, program.defaultCapacity))

	const isDraftDirty = $derived(!draftsEqual(draft, originalDraft))

	const selectedDate = $derived(selectedDayIso ? parseIso(selectedDayIso) : null)

	const selectedLabel = $derived(
		selectedDate
			? selectedDate.toLocaleDateString(undefined, {
					weekday: 'short',
					month: 'short',
					day: 'numeric'
				})
			: ''
	)

	const selectedEvent = $derived(selectedDayIso ? events[selectedDayIso] : undefined)
	const hasEventOnSelected = $derived(!!selectedEvent)

	function parseIso(iso: string) {
		const [y, m, d] = iso.split('-').map(Number)
		return new Date(y!, m! - 1, d!)
	}

	function emojiToTwemojiUrl(emoji: string) {
		const code = Array.from(emoji.replace(/️/g, ''))
			.map((ch) => ch.codePointAt(0)?.toString(16))
			.filter((part): part is string => !!part)
			.join('-')
		return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`
	}

	function isPast(date: Date) {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return date < today
	}

	function isToday(date: Date) {
		const today = new Date()
		return (
			date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate()
		)
	}

	function isActive(date: Date) {
		return date.getMonth() === currentMonth.getMonth()
	}

	function capacityForDay(date: Date) {
		const ev = events[isoDay(date)]
		if (!ev) return null
		return { filled: ev.filled, capacity: ev.capacity, recurring: ev.recurring }
	}

	function timeStringToInputValue(time: string) {
		const isPM = time.includes('PM')
		const parts = time.replace(/[^\d:]/g, '').split(':')
		const rawHour = Number(parts[0] ?? 0)
		const minute = parts[1] ?? '00'
		const hour24 = isPM && rawHour < 12 ? rawHour + 12 : !isPM && rawHour === 12 ? 0 : rawHour
		return `${String(hour24).padStart(2, '0')}:${minute.padStart(2, '0')}`
	}

	function loadDraft(iso: string): DayDraft {
		const existing = events[iso]
		if (existing) {
			return {
				time: timeStringToInputValue(existing.time),
				capacity: existing.capacity,
				repeat: existing.recurring,
				untilMode: 'ongoing',
				untilDate: ''
			}
		}
		return {
			time: program.defaultTime,
			capacity: program.defaultCapacity,
			repeat: false,
			untilMode: 'ongoing',
			untilDate: ''
		}
	}

	function applyDraft(iso: string) {
		const next = loadDraft(iso)
		draft.time = next.time
		draft.capacity = next.capacity
		draft.repeat = next.repeat
		draft.untilMode = next.untilMode
		draft.untilDate = next.untilDate
		originalDraft = { ...next }
		selectedDayIso = iso
		inspectorOpen = true
	}

	function openDay(date: Date) {
		const iso = isoDay(date)
		if (selectedDayIso != null && iso !== selectedDayIso && isDraftDirty) {
			pendingDayIso = iso
			return
		}
		applyDraft(iso)
	}

	function newEvent() {
		const target = new Date()
		target.setHours(0, 0, 0, 0)
		if (isPast(target)) target.setDate(target.getDate() + 1)
		openDay(target)
	}

	function confirmDiscard() {
		const next = pendingDayIso
		pendingDayIso = null
		if (next != null) applyDraft(next)
	}
	function cancelDiscard() { pendingDayIso = null }

	function dismissDay() {
		selectedDayIso = null
		pendingDayIso = null
		inspectorOpen = false
	}

	function saveEvent() {
		if (selectedDayIso == null) return
		const [hhStr, mmStr] = draft.time.split(':')
		const hh = Number(hhStr ?? 0)
		const mm = Number(mmStr ?? 0)
		const period = hh >= 12 ? 'PM' : 'AM'
		const displayHour = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh
		const displayTime = `${displayHour}:${String(mm).padStart(2, '0')} ${period}`
		const filled = events[selectedDayIso]?.filled ?? 0
		events[selectedDayIso] = {
			time: displayTime,
			capacity: draft.capacity,
			filled,
			recurring: draft.repeat
		}
		dismissDay()
	}

	function removeEvent() {
		if (selectedDayIso == null) return
		delete events[selectedDayIso]
		dismissDay()
	}

	function prevMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
	}
	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
	}

	function commitField(field: 'eyebrow' | 'title' | 'subtitle', value: string) {
		program[field] = value.trim()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (pendingDayIso != null) cancelDiscard()
			else if (inspectorOpen) dismissDay()
		}
	}
</script>

<svelte:head>
	<title>Program editor — playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="page social-admin">
	<header class="page__bar">
		<div class="page__crumb">
			<a href="/playground" class="page__back">← Playground</a>
			<span class="page__sep">/</span>
			<span>Program editor (mirror of /schedule/admin/events/program/&hellip;)</span>
		</div>
	</header>

	<div class="program-editor admin-content">
		<div class="program-editor__canvas-wrap">
			<div class="program-editor__canvas">
				<div class="program-editor__panel calendar-ui-card">
					<!-- Settings strip: publish toggle + URL slug -->
					<div class="program-editor__settings-strip">
						<button
							type="button"
							class="program-editor__publish-toggle"
							class:program-editor__publish-toggle--on={program.enabled}
							aria-pressed={program.enabled}
							aria-label={program.enabled ? 'Bookable. Click to hide.' : 'Hidden. Click to make bookable.'}
							onclick={() => (program.enabled = !program.enabled)}
						>
							<span class="program-editor__publish-thumb">
								<span class="program-editor__publish-icon" aria-hidden="true">{program.enabled ? '✓' : ''}</span>
							</span>
							<span class="program-editor__publish-label">
								{program.enabled ? 'Bookable' : 'Hidden'}
							</span>
						</button>

						<div class="program-editor__url-pill">
							<span class="program-editor__url-seg program-editor__url-host">miko.art/schedule/</span>
							<span class="program-editor__url-seg program-editor__url-slug-wrap">
								<input
									class="program-editor__url-slug"
									type="text"
									bind:value={program.slug}
									spellcheck="false"
									aria-label="URL slug"
								/>
							</span>
							<a
								class="program-editor__url-seg program-editor__url-open"
								href="https://miko.art/schedule/{program.slug}"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Open public page in a new tab"
							>
								<span aria-hidden="true">↗</span>
							</a>
						</div>
					</div>

					<section class="program-editor__hero">
						<div class="program-editor__hero-glow" aria-hidden="true"></div>

						<div class="program-editor__emoji-wrap">
							<button
								class="program-editor__emoji"
								type="button"
								title="Change icon"
								aria-label={`Current icon ${program.icon}`}
							>
								<img
									class="program-editor__emoji-glyph"
									src={emojiToTwemojiUrl(program.icon)}
									alt=""
									loading="lazy"
									decoding="async"
								/>
							</button>
						</div>

						<div
							class="program-editor__editable program-editor__eyebrow"
							contenteditable="true"
							spellcheck={false}
							onblur={(event) => commitField('eyebrow', event.currentTarget.textContent || '')}
						>
							{program.eyebrow}
						</div>

						<div class="program-editor__title-group">
							<div
								class="program-editor__editable program-editor__title"
								contenteditable="true"
								spellcheck={false}
								onblur={(event) => commitField('title', event.currentTarget.textContent || '')}
							>
								{program.title}
							</div>
						</div>

						<div
							class="program-editor__editable program-editor__subtitle"
							contenteditable="true"
							spellcheck={false}
							onblur={(event) => commitField('subtitle', event.currentTarget.textContent || '')}
						>
							{program.subtitle}
						</div>
					</section>

					<div class="program-editor__schedule-head">
						<h4 class="program-editor__schedule-title">Events</h4>
						<button
							type="button"
							class="program-editor__new-event"
							onclick={newEvent}
						>
							+ New event
						</button>
					</div>

					<AdminCalendar
						{currentMonth}
						selectedDateIso={selectedDayIso}
						onPrev={prevMonth}
						onNext={nextMonth}
						onSelect={(date: Date) => openDay(date)}
						{isPast}
						{isToday}
						{isActive}
						eventCapacity={capacityForDay}
						compact={true}
						interactive="all-future"
					/>
				</div>

				<p class="program-editor__hint">
					<span aria-hidden="true">💡</span>
					Click any day to schedule an event.
				</p>

				<footer class="program-editor__remove-footer">
					{#if !removeConfirmOpen}
						<button
							type="button"
							class="program-editor__remove-btn"
							onclick={() => (removeConfirmOpen = true)}
						>
							Remove this program
						</button>
					{:else}
						<div class="program-editor__remove-confirm">
							<span class="program-editor__remove-msg">Remove this program and all its events?</span>
							<div class="program-editor__remove-row">
								<button class="program-editor__remove-btn" type="button" onclick={() => (removeConfirmOpen = false)}>
									Keep program
								</button>
								<button class="program-editor__remove-btn program-editor__remove-btn--danger" type="button" onclick={() => (removeConfirmOpen = false)}>
									Yes, remove
								</button>
							</div>
						</div>
					{/if}
				</footer>
			</div>
		</div>
	</div>

	{#if inspectorOpen}
		<button
			type="button"
			class="scrim"
			aria-label="Close day editor"
			onclick={dismissDay}
		></button>
		<DayDialog
			{draft}
			{selectedDate}
			{selectedLabel}
			{hasEventOnSelected}
			filledOnSelected={selectedEvent?.filled ?? 0}
			capacityOnSelected={selectedEvent?.capacity ?? 0}
			pendingDay={pendingDayIso != null}
			onDismiss={dismissDay}
			onSave={saveEvent}
			onRemove={removeEvent}
			onCancelDiscard={cancelDiscard}
			onConfirmDiscard={confirmDiscard}
		/>
	{/if}
</div>

<style>
	.page.social-admin {
		display: block;
		grid-template-columns: none;
		grid-template-rows: none;
		min-width: 0;
		/* Match the editor's content-max so there's no empty void on either side. */
		max-width: var(--admin-content-max, 720px);
		margin: 0 auto;
		padding: 1rem 1.25rem 6rem;
		font-family: var(--font-ui-sans, var(--font-sans));
		color: var(--text);
		background: transparent;
		overflow-x: visible;

		/* Day-overlay control tokens (used by Inspector + chip primitives) */
		--ins-control-h: 2.25rem;
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
		--ins-control-fg-muted: color-mix(in srgb, var(--text) 70%, transparent);
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
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}

	.page__back { color: inherit; text-decoration: none; }
	.page__back:hover { color: var(--text); }
	.page__sep { opacity: 0.4; }

	/* === Production AdminProgramEditor styles, mirrored verbatim === */

	.program-editor {
		font-family: var(--font-ui-sans, var(--font-sans));
		--surface: color-mix(in srgb, var(--panel-bg) 88%, var(--text) 12%);
		--text-2: color-mix(in srgb, var(--text) 55%, transparent);
		--text-3: color-mix(in srgb, var(--text) 36%, transparent);
		--border: color-mix(in srgb, var(--text) 9%, transparent);
		--border-s: color-mix(in srgb, var(--text) 14%, transparent);
		--blue: var(--admin-accent);
		background:
			radial-gradient(
				ellipse 520px 360px at 52% 68px,
				color-mix(in srgb, #a78bfa 16%, transparent) 0%,
				transparent 72%
			),
			radial-gradient(
				ellipse 500px 320px at 78% 22%,
				color-mix(in srgb, #f0abfc 10%, transparent) 0%,
				transparent 72%
			),
			var(--bg);
		min-height: calc(100vh - 2.25rem);
		width: 100%;
		max-width: var(--admin-content-max, 720px);
		margin: 0 auto;
		overflow-x: clip;
		border-radius: 0.875rem;
		border: 1px solid var(--border);
	}

	.program-editor__canvas-wrap {
		border-bottom: 1px solid var(--border);
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 1rem;
		padding: 0 0 2rem 0;
		max-width: 100%;
	}

	.program-editor__canvas {
		width: 100%;
		max-width: 100%;
		position: relative;
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	/* Panel is transparent so .program-editor's radial gradients show through.
	 * Chained class beats the global `.social-admin .calendar-ui-card` rule. */
	.program-editor__panel.calendar-ui-card {
		width: 100%;
		padding: 1.1rem 1rem 1.65rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		background: transparent;
		box-shadow: none;
	}

	.program-editor__hero {
		position: relative;
		display: grid;
		justify-items: center;
		text-align: center;
		padding: clamp(2rem, 4vw, 3.5rem) 1rem clamp(1.4rem, 2.4vw, 2.1rem);
		margin: 0 auto;
		width: min(100%, 720px);
	}

	.program-editor__hero-glow {
		position: absolute;
		top: -7.5rem;
		left: 50%;
		transform: translateX(-50%);
		width: min(44rem, 100%);
		height: min(44rem, 100vw);
		border-radius: 50%;
		background: radial-gradient(
			circle,
			color-mix(in srgb, #c084fc 14%, transparent) 0%,
			color-mix(in srgb, #a78bfa 8%, transparent) 42%,
			transparent 72%
		);
		pointer-events: none;
		z-index: 0;
	}

	.program-editor__emoji-wrap {
		position: relative;
		margin-bottom: 0.5rem;
		z-index: 1;
	}

	.program-editor__emoji {
		line-height: 0;
		border-radius: 999px;
		padding: 0.42rem;
		border: 1px solid color-mix(in srgb, #7a5af8 24%, transparent);
		background: color-mix(in srgb, #efe7ff 74%, var(--bg) 26%);
		cursor: pointer;
	}

	.program-editor__emoji:hover {
		background: color-mix(in srgb, var(--bg) 80%, var(--text) 20%);
	}

	.program-editor__emoji-glyph {
		width: 2.1rem;
		height: 2.1rem;
		display: block;
	}

	.program-editor__editable {
		outline: none;
		border-radius: 0.7rem;
		padding: 0.2rem 0.75rem;
		text-align: center;
		transition:
			background 0.16s,
			box-shadow 0.16s;
		width: 100%;
		position: relative;
		z-index: 1;
		background-color: transparent;
	}

	.program-editor__editable:hover {
		background-color: color-mix(in srgb, var(--text) 3.5%, transparent);
	}

	.program-editor__editable:focus {
		background-color: color-mix(in srgb, var(--text) 5%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 18%, transparent);
	}

	.program-editor__eyebrow {
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		display: inline-block;
		width: auto;
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
		background-size: 100% 100%;
		background-repeat: no-repeat;
		color: transparent;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.55rem;
	}

	.program-editor__eyebrow:hover,
	.program-editor__eyebrow:focus {
		background-color: transparent;
		box-shadow: none;
	}

	.program-editor__title-group {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.program-editor__title-group::after {
		content: '';
		display: block;
		width: 60px;
		height: 2.5px;
		border-radius: 2px;
		margin-top: 0.75rem;
		background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #a78bfa);
		opacity: 0.35;
	}

	.program-editor__title {
		font-family: var(--font-display);
		font-size: clamp(2rem, 4.2vw, 3.45rem);
		font-weight: 500;
		letter-spacing: -0.035em;
		line-height: 1.08;
		white-space: pre-wrap;
	}

	.program-editor__subtitle {
		font-size: clamp(1rem, 1.55vw, 1.3rem);
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 68%, transparent);
		margin-top: 0.9rem;
		max-width: 520px;
		white-space: pre-wrap;
	}

	.program-editor__schedule-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		margin: 1.4rem 0 0.4rem;
		padding: 0 0.1rem;
	}

	.program-editor__schedule-title {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-2);
	}

	.program-editor__new-event {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--blue) 38%, transparent);
		background: color-mix(in srgb, var(--blue) 14%, var(--bg) 86%);
		color: color-mix(in srgb, var(--blue) 78%, var(--text) 22%);
		border-radius: 999px;
		padding: 0.36rem 0.85rem;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 650;
		cursor: pointer;
		transition: background 140ms, box-shadow 140ms;
	}

	.program-editor__new-event:hover {
		background: color-mix(in srgb, var(--blue) 22%, var(--bg) 78%);
		box-shadow: 0 2px 10px color-mix(in srgb, var(--blue) 22%, transparent);
	}

	.program-editor__hint {
		margin-top: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		text-align: center;
		font-size: 0.74rem;
		font-style: italic;
		color: var(--text-3);
		width: 100%;
	}

	/* Settings strip — publish toggle + URL slug */
	.program-editor__settings-strip {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.5rem 0.65rem;
		margin-bottom: 0.4rem;
		border-radius: 0.65rem;
		background: color-mix(in srgb, var(--text) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 9%, transparent);
		flex-wrap: wrap;
	}

	.program-editor__publish-toggle {
		appearance: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.18rem 0.6rem 0.18rem 0.18rem;
		border: 1px solid transparent;
		background: transparent;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text);
		cursor: pointer;
		border-radius: 999px;
		transition: background 140ms;
		flex: none;
	}

	.program-editor__publish-toggle:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
	}

	.program-editor__publish-thumb {
		position: relative;
		width: 36px;
		height: 22px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 18%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		display: inline-block;
		flex: none;
		transition: background 140ms;
	}

	.program-editor__publish-thumb::before {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		border-radius: 999px;
		background: var(--bg);
		box-shadow: 0 1px 2px color-mix(in srgb, var(--text) 18%, transparent);
		transition: left 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.program-editor__publish-toggle--on .program-editor__publish-thumb {
		background: color-mix(in srgb, var(--admin-accent) 80%, transparent);
	}

	.program-editor__publish-toggle--on .program-editor__publish-thumb::before {
		left: 16px;
	}

	.program-editor__publish-icon {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		display: grid;
		place-items: center;
		font-size: 0.62rem;
		font-weight: 800;
		line-height: 1;
		color: var(--admin-accent);
		opacity: 0;
		transition: opacity 140ms, left 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.program-editor__publish-toggle--on .program-editor__publish-icon {
		opacity: 1;
		left: 16px;
	}

	.program-editor__url-pill {
		display: flex;
		align-items: stretch;
		flex: 0 1 22rem;
		min-width: 12rem;
		height: 32px;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--bg);
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
		transition: border-color 140ms, box-shadow 140ms;
	}

	.program-editor__url-pill:hover {
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
	}

	.program-editor__url-pill:focus-within {
		border-color: color-mix(in srgb, var(--admin-accent) 50%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-accent) 18%, transparent);
	}

	.program-editor__url-seg {
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.program-editor__url-host {
		padding: 0 0.6rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		background: color-mix(in srgb, var(--text) 5%, transparent);
		border-right: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		white-space: nowrap;
	}

	.program-editor__url-slug-wrap {
		flex: 1;
		min-width: 0;
	}

	.program-editor__url-slug {
		width: 100%;
		appearance: none;
		border: 0;
		background: transparent;
		font: inherit;
		color: var(--text);
		font-weight: 600;
		padding: 0 0.55rem;
		margin: 0;
		min-width: 0;
		outline: none;
		line-height: 1;
	}

	.program-editor__url-open {
		min-width: 32px;
		justify-content: center;
		border-left: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		color: color-mix(in srgb, var(--text) 60%, transparent);
		text-decoration: none;
		transition: background 140ms, color 140ms;
	}

	.program-editor__url-open:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--admin-accent);
	}

	/* Quiet "Remove this program" footer */
	.program-editor__remove-footer {
		display: flex;
		justify-content: center;
		width: 100%;
		padding: 0.85rem 0.5rem 1.25rem;
		border-top: 1px dashed color-mix(in srgb, var(--text) 10%, transparent);
		margin-top: 0.5rem;
	}

	.program-editor__remove-btn {
		appearance: none;
		border: none;
		background: transparent;
		color: color-mix(in srgb, var(--admin-danger) 80%, var(--text) 20%);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 500;
		padding: 0.4rem 0.85rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background 140ms, color 140ms;
	}

	.program-editor__remove-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--admin-danger) 8%, transparent);
		color: var(--admin-danger);
	}

	.program-editor__remove-btn--danger {
		color: var(--admin-danger);
	}

	.program-editor__remove-confirm {
		display: grid;
		gap: 0.5rem;
		text-align: center;
	}

	.program-editor__remove-msg {
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}

	.program-editor__remove-row {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	@media (max-width: 480px) {
		.program-editor__settings-strip {
			flex-direction: column;
			align-items: stretch;
		}
		.program-editor__publish-toggle { align-self: flex-start; }
		.program-editor__url-pill { width: 100%; }
	}

	/* Day-edit overlay scrim — dims toward black so it works in both themes */
	.scrim {
		position: fixed;
		inset: 0;
		border: none;
		padding: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		z-index: 40;
		cursor: pointer;
	}
</style>
