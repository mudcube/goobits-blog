<script lang="ts">
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import { ChevronLeft, ChevronRight, Lightbulb } from '@lucide/svelte'
	import AdminActionButton from '@components/Admin/AdminActionButton.svelte'
	import AdminTimeSelector from '@components/Admin/AdminTimeSelector.svelte'
	import AdminNumberStepper from '@components/Admin/AdminNumberStepper.svelte'

	type ActiveDay = {
		time: string
		capacity: number
		repeatLabel?: string
		count: number
	}

	const { data } = $props<{ data: { user: unknown | null; slug: string } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const slug = $derived(data.slug)

	let preview = $state(false)
	let settingsOpen = $state(false)
	let initialized = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	let emojiPickerOpen = $state(false)
	let currentMonth = $state(new Date())
	let selectedDay = $state<number | null>(null)
	let selectedDayDate = $state<Date | null>(null)
	let popOpen = $state(false)
	let popTop = $state(0)
	let popLeft = $state(0)
	let popBottom = $state(0)
	let popAbove = $state(false)
	let selectedEventId = $state<number | null>(null)
	let originalPopTime = $state('')
	let originalPopCap = $state(0)
	let newMode = $state<'once' | 'repeat'>('once')
	let untilMode = $state<'ongoing' | 'date'>('ongoing')
	let untilDate = $state('')
	let popTime = $state('10:30')
	let popCap = $state(8)

	let activeDays = $state<Record<number, ActiveDay>>({})

	const emojiOptions = ['💪', '🏋️', '🎪', '🧘', '🤸', '🌈', '✨', '🎯', '🔥', '🎶']
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

	function emojiToTwemojiUrl(emoji: string) {
		const code = Array.from(emoji.replace(/\uFE0F/g, ''))
			.map((ch) => ch.codePointAt(0)?.toString(16))
			.filter((part): part is string => !!part)
			.join('-')
		return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`
	}

	$effect(() => {
		if (!authed) return
		void dashboard.loadPrograms()
		void dashboard.loadEvents()
	})

	$effect(() => {
		if (!authed || initialized || dashboard.programs.length === 0) return
		const found = dashboard.programs.find((program) => program.slug === slug)
		if (!found) {
			void goto('/admin/events/')
			return
		}
		dashboard.selectProgram(found.slug)
		if (!dashboard.programDraft.icon) {
			dashboard.programDraft = { ...dashboard.programDraft, icon: '💪' }
		}
		initialized = true
	})

	$effect(() => {
		if (!authed || !initialized) return
		const map: Record<number, ActiveDay> = {}
		for (const ev of dashboard.events) {
			if (ev.activitySlug !== slug) continue
			const d = new Date(ev.startsAt)
			if (d.getFullYear() !== currentMonth.getFullYear() || d.getMonth() !== currentMonth.getMonth()) continue
			const day = d.getDate()
			if (map[day]) {
				map[day] = {
					...map[day],
					count: (map[day]?.count || 1) + 1
				}
				continue
			}
			map[day] = {
				time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }),
				capacity: ev.capacity,
				repeatLabel: `Every ${d.toLocaleDateString(undefined, { weekday: 'long' })}`,
				count: 1
			}
		}
		activeDays = map
	})

	$effect(() => {
		if (!popOpen || !selectedDay || !activeDays[selectedDay]) return
		const current = activeDays[selectedDay] as ActiveDay
		if (current.time === popTime && current.capacity === popCap) return
		activeDays = {
			...activeDays,
			[selectedDay]: {
				...current,
				time: popTime,
				capacity: popCap
			}
		}
	})

	function flash(message: string, isError = false) {
		toast = message
		toastError = isError
		if (toastTimer) clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toast = ''
			toastError = false
		}, 2200)
	}

	function updateProgramField(field: keyof typeof dashboard.programDraft, value: string) {
		dashboard.programDraft = {
			...dashboard.programDraft,
			[field]: value
		}
	}

	function updateTitle(value: string) {
		const lines = value.split(/\n+/).map((line) => line.trim()).filter(Boolean)
		updateProgramField('heroTitleLine1', lines[0] || '')
		updateProgramField('heroTitleLine2', lines[1] || '')
	}

	function combinedTitle() {
		const one = dashboard.programDraft.heroTitleLine1 || ''
		const two = dashboard.programDraft.heroTitleLine2 || ''
		return two ? `${one}\n${two}` : one
	}

	function monthLabel() {
		return currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
	}

	function getCalendarDays() {
		const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
		const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
		const days: Array<{ date: Date; current: boolean }> = []

		const startDay = start.getDay()
		for (let i = 0; i < startDay; i += 1) {
			const d = new Date(start)
			d.setDate(d.getDate() - (startDay - i))
			days.push({ date: d, current: false })
		}

		for (let d = 1; d <= end.getDate(); d += 1) {
			days.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d), current: true })
		}

		const endDay = end.getDay()
		for (let i = 1; i < 7 - endDay; i += 1) {
			const d = new Date(end)
			d.setDate(d.getDate() + i)
			days.push({ date: d, current: false })
		}

		return days
	}

	function isPast(date: Date) {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return date < today
	}

	function isToday(date: Date) {
		const now = new Date()
		return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
	}

	function prevMonth() {
		const now = new Date()
		const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		if (prev.getFullYear() < now.getFullYear()) return
		if (prev.getFullYear() === now.getFullYear() && prev.getMonth() < now.getMonth()) return
		currentMonth = prev
		closePop()
	}

	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		closePop()
	}

	function openDay(dayDate: Date, dayEl: HTMLButtonElement) {
		if (isPast(dayDate)) return
		emojiPickerOpen = false
		selectedDay = dayDate.getDate()
		selectedDayDate = dayDate
		const existing = activeDays[selectedDay]
		popTime = existing?.time ?? '10:30'
		popCap = existing?.capacity ?? 8
		newMode = existing ? (existing.repeatLabel ? 'repeat' : 'once') : 'once'
		originalPopTime = popTime
		originalPopCap = popCap
		const eventForDay = dashboard.events.find((ev) => {
			if (ev.activitySlug !== slug) return false
			const d = new Date(ev.startsAt)
			return (
				d.getFullYear() === dayDate.getFullYear() &&
				d.getMonth() === dayDate.getMonth() &&
				d.getDate() === dayDate.getDate()
			)
		})
		selectedEventId = eventForDay?.id ?? null

		const rect = dayEl.getBoundingClientRect()
		const popWidth = 260
		let left = rect.left + rect.width / 2
		if (left - popWidth / 2 < 24) left = 24 + popWidth / 2
		if (left + popWidth / 2 > window.innerWidth - 24) left = window.innerWidth - 24 - popWidth / 2
		const goAbove = window.innerHeight - rect.bottom < 300
		popAbove = goAbove
		popTop = goAbove ? rect.top - 10 : rect.bottom + 10
		popBottom = goAbove ? window.innerHeight - rect.top + 10 : 0
		popLeft = left
		popOpen = true
	}

	function closePop() {
		popOpen = false
		selectedDay = null
		selectedDayDate = null
		selectedEventId = null
	}

	function computeRepeatWeeks(startDate: Date) {
		if (newMode !== 'repeat') return 0
		if (untilMode === 'ongoing') return 12
		const target = Date.parse(untilDate)
		if (!Number.isFinite(target)) return 12
		const diffMs = target - startDate.getTime()
		if (diffMs <= 0) return 0
		return Math.max(0, Math.min(52, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))))
	}

	async function persistDaySchedule() {
		if (!selectedDayDate) return
		const [hours, minutes] = popTime.split(':').map((part) => Number.parseInt(part, 10))
		const safeHours = Number.isFinite(hours) ? (hours as number) : 10
		const safeMinutes = Number.isFinite(minutes) ? (minutes as number) : 30
		const start = new Date(selectedDayDate)
		start.setHours(safeHours, safeMinutes, 0, 0)
		const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
		const activity = dashboard.programDraft.slug || slug
		const title = dashboard.programDraft.label
			? `${dashboard.programDraft.label} Session`
			: 'Session'

		dashboard.eventDraft = {
			...dashboard.eventDraft,
			activitySlug: activity,
			title,
			startsAt: start.toISOString(),
			endsAt: end.toISOString(),
			capacity: popCap,
			repeatWeeks: computeRepeatWeeks(start),
			costCents: dashboard.eventDraft.costCents || 0,
			currency: dashboard.eventDraft.currency || 'USD',
			paymentProvider: dashboard.eventDraft.paymentProvider || 'venmo',
			paymentHandle: dashboard.eventDraft.paymentHandle || '',
			paymentNoteTemplate: dashboard.eventDraft.paymentNoteTemplate || '',
			location: dashboard.eventDraft.location || '',
			note: dashboard.eventDraft.note || ''
		}

		await dashboard.createEvents()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Event schedule added')
		closePop()
	}

	async function removeDay() {
		if (selectedEventId) {
			await dashboard.deleteEvent(selectedEventId)
			if (dashboard.error) {
				flash(dashboard.error, true)
				return
			}
			flash('Event removed')
			closePop()
			return
		}
		if (!selectedDay) return
		const next = { ...activeDays }
		delete next[selectedDay]
		activeDays = next
		closePop()
	}

	async function persistExistingDayEdits() {
		if (!selectedEventId) {
			closePop()
			return
		}
		if (popCap !== originalPopCap) {
			await dashboard.updateEventCapacity(selectedEventId, popCap)
			if (dashboard.error) {
				flash(dashboard.error, true)
				return
			}
		}
		if (popTime !== originalPopTime) {
			flash('Time edit is preview-only in this panel', false)
		}
		closePop()
	}

	function pickEmoji(emoji: string) {
		updateProgramField('icon', emoji)
		emojiPickerOpen = false
	}

	async function saveProgram() {
		await dashboard.saveProgram()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Program saved')
	}

	async function deleteProgram() {
		await dashboard.deleteProgram()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		void goto('/admin/events/')
	}

	function onGlobalClick(event: MouseEvent) {
		const target = event.target as HTMLElement
		if (!target.closest('.program-editor__emoji-wrap')) {
			emojiPickerOpen = false
		}
	}

	function onGlobalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closePop()
			emojiPickerOpen = false
		}
	}

	function onTopbarToggleSettings() {
		settingsOpen = !settingsOpen
	}

	function onTopbarSave() {
		void saveProgram()
	}

	onMount(() => {
		const now = new Date()
		untilDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-30`
		window.addEventListener('admin-program-editor-toggle-settings', onTopbarToggleSettings)
		window.addEventListener('admin-program-editor-save', onTopbarSave)
		return () => {
			window.removeEventListener('admin-program-editor-toggle-settings', onTopbarToggleSettings)
			window.removeEventListener('admin-program-editor-save', onTopbarSave)
		}
	})
</script>

<svelte:window onclick={onGlobalClick} onkeydown={onGlobalKeydown} />

{#if authed}
	{#if toast}
		<div class="program-editor__toast" class:program-editor__toast--error={toastError} role="status">
			{#if !toastError}✓ {/if}{toast}
		</div>
	{/if}

	<div class="program-editor">
		<div class="program-editor__canvas-wrap">
			<div class="program-editor__canvas">
				<div class="program-editor__panel admin-ui-card">
					<section class="program-editor__hero">
						<div class="program-editor__hero-glow" aria-hidden="true"></div>

						<div class="program-editor__emoji-wrap">
							<button class="program-editor__emoji" type="button" title="Change icon" aria-label={`Current icon ${dashboard.programDraft.icon || '💪'}`} onclick={() => (emojiPickerOpen = !emojiPickerOpen)}>
								<img class="program-editor__emoji-glyph" src={emojiToTwemojiUrl(dashboard.programDraft.icon || '💪')} alt="" loading="lazy" decoding="async" />
							</button>
							{#if emojiPickerOpen}
								<div class="program-editor__emoji-picker">
									{#each emojiOptions as emoji}
										<button type="button" class="program-editor__emoji-option" aria-label={`Use ${emoji}`} onclick={() => pickEmoji(emoji)}>
											<img class="program-editor__emoji-option-glyph" src={emojiToTwemojiUrl(emoji)} alt="" loading="lazy" decoding="async" />
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<div
							class="program-editor__editable program-editor__eyebrow"
							contenteditable={!preview}
							spellcheck={false}
							onblur={(event) => updateProgramField('eyebrow', event.currentTarget.textContent || '')}
						>{dashboard.programDraft.eyebrow || 'Rainbow Gym'}</div>

						<div class="program-editor__title-group">
							<div
								class="program-editor__editable program-editor__title"
								contenteditable={!preview}
								spellcheck={false}
								onblur={(event) => updateTitle(event.currentTarget.textContent || '')}
							>{combinedTitle() || 'Hang out. Work out.\nWhatever.'}</div>
						</div>

						<div
							class="program-editor__editable program-editor__subtitle"
							contenteditable={!preview}
							spellcheck={false}
							onblur={(event) => updateProgramField('heroSubtitle', event.currentTarget.textContent || '')}
						>{dashboard.programDraft.heroSubtitle || "Grab a time slot and let's do something fun together."}</div>
					</section>

					<div class="program-editor__calendar">
						<div class="program-editor__calendar-head">
							<div class="program-editor__calendar-nav">
								<button type="button" class="program-editor__arrow" onclick={prevMonth} aria-label="Previous month">
									<ChevronLeft size={18} strokeWidth={2} />
								</button>
							</div>
							<span class="program-editor__calendar-title">{monthLabel()}</span>
							<div class="program-editor__calendar-nav">
								<button type="button" class="program-editor__arrow" onclick={nextMonth} aria-label="Next month">
									<ChevronRight size={18} strokeWidth={2} />
								</button>
							</div>
						</div>
						<div class="program-editor__weekdays">
							{#each weekDays as wd}<span>{wd}</span>{/each}
						</div>
						<div class="program-editor__grid">
							{#each getCalendarDays() as day}
								{@const dayNum = day.date.getDate()}
								<button
									type="button"
									class="program-editor__day"
									class:program-editor__day--past={isPast(day.date)}
									class:program-editor__day--today={isToday(day.date)}
									class:program-editor__day--active={!!activeDays[dayNum] && day.current && !isPast(day.date)}
									class:program-editor__day--selected={selectedDay === dayNum}
									disabled={!day.current || isPast(day.date)}
									onclick={(event) => openDay(day.date, event.currentTarget as HTMLButtonElement)}
								>
									<span class="program-editor__day-num">{dayNum}</span>
									{#if activeDays[dayNum] && day.current && !isPast(day.date)}
										<span class="program-editor__dots">
											{#each Array.from({ length: Math.min(activeDays[dayNum]?.count || 1, 3) }) as _, i (i)}
												<span class="program-editor__dot"></span>
											{/each}
										</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				</div>

				{#if popOpen}
					<button class="program-editor__overlay" type="button" onclick={closePop} aria-label="Close"></button>
					<div
						class="program-editor__popover"
						style={`left:${popLeft}px; ${popAbove ? `bottom:${popBottom}px` : `top:${popTop}px`}; transform:translateX(-50%);`}
					>
						<div class="program-editor__popover-arrow" class:program-editor__popover-arrow--above={popAbove}></div>
						<div class="program-editor__popover-title">
							{#if selectedDayDate}{selectedDayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}{/if}
						</div>

						{#if selectedDay && !activeDays[selectedDay]}
							<div class="program-editor__opt-row">
								<button type="button" class="program-editor__opt" class:program-editor__opt--on={newMode === 'once'} onclick={() => (newMode = 'once')}>Just this day</button>
								<button type="button" class="program-editor__opt" class:program-editor__opt--on={newMode === 'repeat'} onclick={() => (newMode = 'repeat')}>Repeat weekly</button>
							</div>

							{#if newMode === 'repeat'}
								<div class="program-editor__until">
									<button type="button" class:program-editor__until-btn--on={untilMode === 'ongoing'} class="program-editor__until-btn" onclick={() => (untilMode = 'ongoing')}>Ongoing</button>
									<button type="button" class:program-editor__until-btn--on={untilMode === 'date'} class="program-editor__until-btn" onclick={() => (untilMode = 'date')}>Pick date</button>
								</div>
								{#if untilMode === 'date'}
									<input class="program-editor__input" type="date" bind:value={untilDate} />
								{/if}
							{/if}

							<div class="program-editor__fields">
								<label>
									<span>Time</span>
									<AdminTimeSelector bind:value={popTime} />
								</label>
								<label>
									<span>Capacity</span>
									<AdminNumberStepper bind:value={popCap} min={1} max={50} />
								</label>
							</div>
							<div class="program-editor__actions">
								<AdminActionButton variant="subtle" onclick={closePop}>Cancel</AdminActionButton>
								<AdminActionButton variant="primary" onclick={() => void persistDaySchedule()}>Add</AdminActionButton>
							</div>
						{:else}
							<div class="program-editor__fields">
								<label>
									<span>Time</span>
									<AdminTimeSelector bind:value={popTime} />
								</label>
								<label>
									<span>Capacity</span>
									<AdminNumberStepper bind:value={popCap} min={1} max={50} />
								</label>
							</div>
							{#if selectedDay && activeDays[selectedDay]?.repeatLabel}
								<div class="program-editor__override">
									<div class="program-editor__override-label">Part of repeating schedule</div>
									<div class="program-editor__override-text">Changes here apply to this day preview only. Save a new schedule to persist.</div>
								</div>
							{/if}
							<div class="program-editor__actions program-editor__actions--split">
								<AdminActionButton variant="danger" onclick={() => void removeDay()}>Remove</AdminActionButton>
								<AdminActionButton variant="primary" onclick={() => void persistExistingDayEdits()}>Done</AdminActionButton>
							</div>
						{/if}
					</div>
				{/if}

					<p class="program-editor__hint">
						<Lightbulb class="program-editor__hint-icon" size={14} strokeWidth={1.9} aria-hidden="true" />
						<span>Click text to edit, click a day to schedule it.</span>
					</p>
			</div>

				{#if settingsOpen}
					<button
						type="button"
						class="program-editor__settings-overlay"
						aria-label="Close settings"
						onclick={() => (settingsOpen = false)}
					></button>
					<aside class="program-editor__settings">
						<div class="program-editor__settings-head">
							<strong>Program settings</strong>
							<button type="button" class="admin-ui-btn" onclick={() => (settingsOpen = false)}>Close</button>
						</div>
						<div class="program-editor__settings-body">
							<div class="program-editor__toggle-row">
								<span>Accepting bookings</span>
							<button type="button" aria-label={dashboard.programDraft.enabled ? 'Disable bookings' : 'Enable bookings'} class="program-editor__switch" class:program-editor__switch--on={dashboard.programDraft.enabled} onclick={() => (dashboard.programDraft = { ...dashboard.programDraft, enabled: !dashboard.programDraft.enabled })}><span></span></button>
						</div>
							<label><span>URL path</span><input class="admin-ui-input" type="text" bind:value={dashboard.programDraft.slug} /></label>
							<label><span>Sort order</span><input class="admin-ui-input" type="number" bind:value={dashboard.programDraft.sortOrder} /></label>
							<label><span>Status note</span><input class="admin-ui-input" type="text" bind:value={dashboard.programDraft.serviceStatusNote} /></label>
							<label><span>Page title</span><input class="admin-ui-input" type="text" bind:value={dashboard.programDraft.pageTitle} /></label>
							<label><span>Activity name</span><input class="admin-ui-input" type="text" bind:value={dashboard.programDraft.activityName} /></label>
							<label><span>Eyebrow class</span><input class="admin-ui-input" type="text" bind:value={dashboard.programDraft.eyebrowClass} /></label>
							<label><span>Glow class</span><input class="admin-ui-input" type="text" bind:value={dashboard.programDraft.glowClass} /></label>
							<label><span>Form glow class</span><input class="admin-ui-input" type="text" bind:value={dashboard.programDraft.formGlowClass} /></label>
							<div class="program-editor__settings-actions">
								<AdminActionButton variant="danger" onclick={() => void deleteProgram()} disabled={dashboard.programDeleting}>
									{dashboard.programDeleting ? 'Deleting…' : 'Delete'}
								</AdminActionButton>
								<AdminActionButton variant="primary" onclick={() => void saveProgram()} disabled={dashboard.programSaving}>
									{dashboard.programSaving ? 'Saving…' : 'Save'}
								</AdminActionButton>
							</div>
						</div>
					</aside>
				{/if}
		</div>
	</div>
{/if}

<style>
	:global(.social-admin) {
		overflow-x: clip;
	}

	.program-editor {
		font-family: var(--font-sans);
		--bg: var(--bg);
		--surface: color-mix(in srgb, var(--panel-bg) 88%, var(--text) 12%);
		--text: var(--text);
		--text-2: color-mix(in srgb, var(--text) 55%, transparent);
		--text-3: color-mix(in srgb, var(--text) 36%, transparent);
		--border: color-mix(in srgb, var(--text) 9%, transparent);
		--border-s: color-mix(in srgb, var(--text) 14%, transparent);
		--green: #34c759;
		--green-soft: color-mix(in srgb, #34c759 12%, transparent);
		--green-text: color-mix(in srgb, #34c759 70%, var(--text));
		--blue: color-mix(in srgb, var(--link) 72%, #7a5af8 28%);
		--blue-soft: color-mix(in srgb, #0071e3 12%, transparent);
		--red: #ff3b30;
		--elev-surface-1: color-mix(in srgb, var(--text) 86%, var(--bg) 14%);
		--elev-surface-2: color-mix(in srgb, var(--text) 82%, var(--bg) 18%);
		--elev-border: color-mix(in srgb, var(--blue) 52%, transparent);
		--elev-text: color-mix(in srgb, var(--bg) 94%, transparent);
		--elev-subtext: color-mix(in srgb, var(--bg) 74%, transparent);
		--elev-control: color-mix(in srgb, var(--text) 76%, var(--bg) 24%);
		--elev-control-hover: color-mix(in srgb, var(--text) 72%, var(--bg) 28%);
		--elev-control-active: color-mix(in srgb, var(--blue) 44%, var(--text) 56%);
		background:
			radial-gradient(ellipse 520px 360px at 52% 68px, color-mix(in srgb, #a78bfa 16%, transparent) 0%, transparent 72%),
			radial-gradient(ellipse 500px 320px at 78% 22%, color-mix(in srgb, #f0abfc 10%, transparent) 0%, transparent 72%),
			var(--bg);
		min-height: calc(100vh - 2.25rem);
		width: 100%;
		overflow-x: clip;
		border-radius: 0.9rem;
		border: 1px solid var(--border);
	}

	.program-editor__canvas-wrap {
		border-bottom: 1px solid var(--border);
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 1.25rem;
		padding: clamp(1rem, 2.8vw, 2.5rem) clamp(0.75rem, 2vw, 2rem) 3rem;
		max-width: 100%;
	}

	.program-editor__canvas {
		width: min(100%, 860px);
		max-width: 860px;
		position: relative;
		flex: 1 1 860px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.program-editor__panel {
		width: 100%;
		padding: 1.1rem 1rem 1.65rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, #efe7ff 78%, var(--bg) 22%) 0%,
				color-mix(in srgb, #f8f4ff 86%, var(--bg) 14%) 100%
			);
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
	.program-editor__emoji:hover { background: color-mix(in srgb, var(--bg) 80%, var(--text) 20%); }
	.program-editor__emoji-glyph {
		width: 2.1rem;
		height: 2.1rem;
		display: block;
	}

	.program-editor__emoji-picker {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 50%;
		transform: translateX(-50%);
		background: var(--surface);
		border: 1px solid var(--border-s);
		border-radius: 0.875rem;
		padding: 0.6rem;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
		z-index: 24;
	}
	.program-editor__emoji-option {
		width: 34px;
		height: 34px;
		border: none;
		border-radius: 0.5rem;
		background: transparent;
		padding: 0;
		cursor: pointer;
	}
	.program-editor__emoji-option:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
	.program-editor__emoji-option-glyph {
		width: 1.35rem;
		height: 1.35rem;
		display: block;
		margin: 0 auto;
	}

	.program-editor__editable {
		outline: none;
		border-radius: 0.7rem;
		padding: 0.2rem 0.75rem;
		text-align: center;
		transition: background 0.16s, box-shadow 0.16s;
		width: 100%;
		position: relative;
		z-index: 1;
	}
	.program-editor__editable:hover { background: color-mix(in srgb, var(--text) 3.5%, transparent); }
	.program-editor__editable:focus { background: color-mix(in srgb, var(--text) 5%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 18%, transparent); }

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

	.program-editor__calendar {
		width: min(100%, 900px);
		margin: 0 auto;
		border: 1px solid color-mix(in srgb, #7a5af8 22%, transparent);
		border-radius: 1.3rem;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, #f4ecff 74%, var(--bg) 26%) 0%,
				color-mix(in srgb, #f9f5ff 86%, var(--bg) 14%) 100%
			);
		padding: 1.25rem 1.15rem 1rem;
	}
	.program-editor__calendar-head { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1.2rem; }
	.program-editor__calendar-title { font-size: clamp(1.2rem, 2.1vw, 1.65rem); font-weight: 650; color: var(--text); min-width: 12rem; text-align: center; }
	.program-editor__calendar-nav { display: flex; gap: 0.25rem; }
	.program-editor__arrow {
		width: 40px;
		height: 40px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: color-mix(in srgb, #efe7ff 74%, var(--bg) 26%);
		cursor: pointer;
		color: var(--text-2);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}
	.program-editor__arrow:hover { background: color-mix(in srgb, #e8dbff 82%, var(--bg) 18%); color: color-mix(in srgb, #5b3ee6 84%, var(--text) 16%); }
	.program-editor__weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.55rem; }
	.program-editor__weekdays span {
		text-align: right;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-3);
		padding: 0.35rem 0.5rem 0.35rem 0;
		font-family: var(--font-ui-sans, var(--font-sans));
	}
	.program-editor__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.4rem; }
	.program-editor__day {
		position: relative;
		aspect-ratio: 1;
		border-radius: 1rem;
		display: block;
		cursor: pointer;
		border: 1.5px solid transparent;
		background: transparent;
		padding: 0;
		appearance: none;
		-webkit-appearance: none;
	}
	.program-editor__day:hover:not(.program-editor__day--past) { background: color-mix(in srgb, var(--text) 5%, transparent); }
	.program-editor__day-num {
		position: absolute;
		top: 0.68rem;
		right: 0.68rem;
		left: auto;
		font-size: 1rem;
		font-weight: 500;
		color: var(--text);
		line-height: 1;
		font-family: var(--font-ui-sans, var(--font-sans));
		font-variant-numeric: tabular-nums;
	}
	.program-editor__dots {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		height: 0.35rem;
		position: absolute;
		left: 50%;
		bottom: 0.35rem;
		transform: translateX(-50%);
	}
	.program-editor__dot {
		width: 0.28rem;
		height: 0.28rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--blue) 75%, var(--text) 25%);
	}
	.program-editor__day--past { opacity: 0.25; pointer-events: none; }
	.program-editor__day--today .program-editor__day-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		background: color-mix(in srgb, #a78bfa 34%, transparent);
		top: 0.48rem;
		right: 0.46rem;
		left: auto;
	}
	.program-editor__day--active .program-editor__day-num { color: var(--text); font-weight: 600; }
	.program-editor__day--selected {
		border-color: color-mix(in srgb, #7a5af8 58%, transparent);
		background: color-mix(in srgb, #7a5af8 18%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, #7a5af8 20%, transparent);
	}
	.program-editor__day--selected .program-editor__day-num { color: color-mix(in srgb, #5b3ee6 86%, var(--text) 14%); font-weight: 700; }
	.program-editor__day--selected .program-editor__dot { background: color-mix(in srgb, #6d4df0 86%, var(--text) 14%); }

	.program-editor__overlay {
		position: fixed;
		inset: 0;
		border: none;
		background: transparent;
		z-index: 20;
	}
	.program-editor__popover {
		position: fixed;
		width: 306px;
		--popover-surface: var(--elev-surface-1);
		--popover-control-bg: var(--elev-control);
		--popover-control-border: var(--elev-border);
		--popover-control-text: var(--elev-text);
		background: linear-gradient(180deg, var(--elev-surface-2) 0%, var(--elev-surface-1) 100%);
		border: 1px solid var(--elev-border);
		border-radius: 1rem;
		box-shadow:
			0 30px 65px color-mix(in srgb, black 24%, transparent),
			0 8px 20px color-mix(in srgb, black 14%, transparent);
		padding: 1rem;
		z-index: 21;
		color: var(--elev-text);
	}
	.program-editor__popover :global(.admin-ui-input) {
		background: var(--popover-control-bg);
		border-color: var(--popover-control-border);
		color: var(--popover-control-text);
	}
	.program-editor__popover :global(.admin-ui-input:focus) {
		border-color: color-mix(in srgb, #7a5af8 56%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, #7a5af8 22%, transparent);
	}
	.program-editor__popover :global(.admin-select__control) {
		background: var(--popover-control-bg);
	}
	.program-editor__popover :global(.admin-select__chevron) {
		color: var(--elev-subtext);
	}
	.program-editor__popover :global(.admin-stepper__btn) {
		background: var(--elev-control);
		border-color: var(--popover-control-border);
		color: var(--popover-control-text);
	}
	.program-editor__popover :global(.admin-stepper__btn:hover) {
		background: var(--elev-control-hover);
	}
	.program-editor__popover :global(.admin-time__period) {
		border-color: var(--popover-control-border);
	}
	.program-editor__popover :global(.admin-time__period-btn) {
		background: var(--elev-control);
		color: var(--popover-control-text);
		border-right-color: var(--popover-control-border);
	}
	.program-editor__popover :global(.admin-time__period-btn--on) {
		background: var(--elev-control-active);
		color: var(--elev-text);
	}
	.program-editor__popover :global(.admin-action-btn--subtle) {
		background: var(--elev-control);
		border-color: var(--popover-control-border);
		color: var(--popover-control-text);
	}
	.program-editor__popover :global(.admin-action-btn--subtle:hover:not(:disabled)) {
		background: var(--elev-control-hover);
	}
	.program-editor__popover-arrow {
		position: absolute;
		width: 10px;
		height: 10px;
		background: var(--elev-surface-1);
		border-left: 1px solid var(--elev-border);
		border-top: 1px solid var(--elev-border);
		top: -6px;
		left: 50%;
		transform: translateX(-50%) rotate(45deg);
	}
	.program-editor__popover-arrow--above {
		top: auto;
		bottom: -6px;
		transform: translateX(-50%) rotate(225deg);
	}
	.program-editor__popover-title { font-size: 0.82rem; font-weight: 700; color: var(--elev-text); margin-bottom: 0.8rem; }
	.program-editor__opt-row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.35rem;
		margin-bottom: 0.8rem;
	}
	.program-editor__opt {
		border: 1px solid var(--elev-border);
		background: var(--elev-control);
		padding: 0.52rem 0.65rem;
		border-radius: 0.5rem;
		text-align: center;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		color: var(--elev-text);
	}
	.program-editor__opt:hover { background: var(--elev-control-hover); color: var(--elev-text); }
	.program-editor__opt--on {
		background: var(--elev-control-active);
		border-color: color-mix(in srgb, var(--blue) 72%, transparent);
		color: var(--elev-text);
	}

	.program-editor__until { display: flex; gap: 0.35rem; margin-bottom: 0.6rem; }
	.program-editor__until-btn {
		font-size: 0.7rem;
		padding: 0.3rem 0.55rem;
		border-radius: 0.4rem;
		border: 1px solid var(--elev-border);
		background: var(--elev-control);
		color: var(--elev-text);
		cursor: pointer;
	}
	.program-editor__until-btn--on { background: var(--elev-control-active); border-color: color-mix(in srgb, var(--blue) 72%, transparent); color: var(--elev-text); }

	.program-editor__fields { display: grid; gap: 0.55rem; margin-bottom: 0.9rem; }
	.program-editor__fields label { display: grid; gap: 0.2rem; }
	.program-editor__fields label span { font-size: 0.66rem; font-weight: 700; color: var(--elev-subtext); }
	.program-editor__input {
		font-size: 0.8rem;
		padding: 0.48rem 0.65rem;
		border-radius: 0.5rem;
		border: 1px solid color-mix(in srgb, #7a5af8 24%, transparent);
		background: color-mix(in srgb, #faf6ff 88%, var(--surface) 12%);
		color: var(--text);
		outline: none;
	}
	.program-editor__input:focus {
		border-color: color-mix(in srgb, #7a5af8 56%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, #7a5af8 22%, transparent);
	}
	.program-editor__override {
		margin-bottom: 0.8rem;
		padding: 0.6rem;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--blue) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--blue) 16%, transparent);
	}
	.program-editor__override-label {
		font-size: 0.66rem;
		font-weight: 700;
		color: var(--blue);
		margin-bottom: 0.2rem;
	}
	.program-editor__override-text {
		font-size: 0.7rem;
		color: var(--text-2);
		line-height: 1.35;
	}

	.program-editor__actions { display: flex; justify-content: flex-end; gap: 0.45rem; }
	.program-editor__actions--split { justify-content: space-between; align-items: center; }
	.program-editor__hint {
		margin-top: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.28rem;
		text-align: center;
		font-size: 0.74rem;
		font-style: italic;
		color: var(--text-3);
		width: 100%;
		font-family: var(--font-ui-sans, var(--font-sans));
	}
	:global(.program-editor__hint-icon) {
		color: color-mix(in srgb, #f5b700 56%, var(--blue) 44%);
		opacity: 0.95;
		transform: translateY(-0.35px);
		flex-shrink: 0;
	}

	.program-editor__settings-overlay {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		top: 2.5rem;
		border: none;
		background: color-mix(in srgb, var(--text) 68%, transparent);
		z-index: 39;
	}
	.program-editor__settings {
		position: fixed;
		top: 2.5rem;
		right: 0;
		bottom: 0;
		width: min(24rem, 94vw);
		height: calc(100vh - 2.5rem);
		border-left: 1px solid var(--elev-border);
		background: linear-gradient(180deg, var(--elev-surface-2) 0%, var(--elev-surface-1) 100%);
		z-index: 40;
		display: flex;
		flex-direction: column;
		color: var(--elev-text);
	}
	.program-editor__settings-head {
		padding: 0.8rem 0.95rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--elev-border);
	}
	.program-editor__settings-head strong { font-size: 0.8rem; color: var(--elev-text); }
	.program-editor__settings :global(.admin-ui-btn) {
		background: var(--elev-control);
		border-color: var(--elev-border);
		color: var(--elev-text);
	}
	.program-editor__settings :global(.admin-ui-btn:hover:not(:disabled)) {
		background: var(--elev-control-hover);
	}
	.program-editor__settings :global(.admin-action-btn--primary),
	.program-editor__settings :global(.admin-ui-btn--primary) {
		background: color-mix(in srgb, #6d4df0 90%, transparent);
		border-color: color-mix(in srgb, #6d4df0 90%, transparent);
		color: #fff;
	}
	.program-editor__settings :global(.admin-action-btn--danger),
	.program-editor__settings :global(.admin-ui-btn--danger) {
		background: color-mix(in srgb, #ef4444 86%, transparent);
		border-color: color-mix(in srgb, #ef4444 58%, transparent);
		color: #fff;
	}
	.program-editor__settings-body {
		padding: 0.8rem 0.9rem;
		display: grid;
		gap: 0.55rem;
		overflow: auto;
	}
	.program-editor__settings-body label { display: grid; gap: 0.2rem; }
	.program-editor__settings-body label span { font-size: 0.66rem; font-weight: 700; color: var(--elev-subtext); }
	.program-editor__settings-body :global(.admin-ui-input) {
		background: var(--elev-control);
		border-color: var(--elev-border);
		color: var(--elev-text);
	}
	.program-editor__settings-body :global(.admin-ui-input:focus) {
		border-color: color-mix(in srgb, var(--blue) 72%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 28%, transparent);
	}
	.program-editor__toggle-row { display: flex; align-items: center; justify-content: space-between; }
	.program-editor__toggle-row span { font-size: 0.75rem; font-weight: 600; }
	.program-editor__switch {
		width: 46px;
		height: 26px;
		border: 1px solid var(--border-s);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 20%, transparent);
		cursor: pointer;
		position: relative;
	}
	.program-editor__switch span {
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 999px;
		top: 3px;
		left: 4px;
		background: var(--bg);
		transition: left 120ms ease;
	}
	.program-editor__switch--on { background: color-mix(in srgb, var(--text) 70%, var(--bg) 30%); }
	.program-editor__switch--on span { left: 23px; }
	.program-editor__settings-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }

	.program-editor__toast {
		position: fixed;
		left: 50%;
		bottom: 1rem;
		transform: translateX(-50%);
		padding: 0.5rem 1rem;
		border-radius: 999px;
		background: color-mix(in srgb, #10b981 88%, var(--bg) 12%);
		color: var(--bg);
		font-size: 0.8rem;
		font-weight: 700;
		z-index: 120;
	}
	.program-editor__toast--error { background: color-mix(in srgb, #ef4444 86%, var(--bg) 14%); }

	@media (max-width: 1080px) {
		.program-editor__settings-overlay {
			top: 2.5rem;
		}
		.program-editor__settings {
			width: min(22rem, 94vw);
			top: 2.5rem;
			height: calc(100vh - 2.5rem);
		}
	}
</style>
