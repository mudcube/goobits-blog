<script lang="ts">
	import { goto } from '$app/navigation'
	import { Lightbulb } from '@lucide/svelte'
	import { NumberStepper, TimeSelector } from '@miko/ui'
	import { onMount } from 'svelte'
	import type { createAdminDashboardController } from '../../dashboard/admin-dashboard-controller.svelte'
	import AdminCalendarWidget from '../../dashboard/AdminCalendarWidget.svelte'
	import AdminActionButton from '../../shared/AdminActionButton.svelte'
	import { mockDashboardEvents, mockPrograms } from '../../mock/admin-mock-data'
	import { createHistory } from '../../history/create-history'

	type DashboardController = ReturnType<typeof createAdminDashboardController>
	type ProgramDraft = DashboardController['programDraft']
	type ProgramEditorSnapshot = {
		programDraft: ProgramDraft
	}

	type ActiveDay = {
		time: string
		capacity: number
		repeatLabel?: string
		count: number
	}

	const {
		dashboard,
		authed,
		slug,
		mockMode,
		eventsHref
	} = $props<{
		dashboard: DashboardController
		authed: boolean
		slug: string
		mockMode: boolean
		eventsHref: string
	}>()

	let preview = $state(false)
	let settingsOpen = $state(false)
	let initialized = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null
	let autosaveReady = $state(false)
	let lastSavedSignature = $state('')
	let historyReady = false

	let emojiPickerOpen = $state(false)
	let currentMonth = $state(new Date())
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

	let activeDays = $state<Record<string, ActiveDay>>({})
	const eventsSource = $derived(mockMode ? mockDashboardEvents : dashboard.events)
	const programsSource = $derived(mockMode ? mockPrograms : dashboard.programs)
	const editorHistory = createHistory<ProgramEditorSnapshot>({
		maxEntries: 100,
		coalesceMs: 700
	})

	const emojiOptions = ['💪', '🏋️', '🎪', '🧘', '🤸', '🌈', '✨', '🎯', '🔥', '🎶']

	function emojiToTwemojiUrl(emoji: string) {
		const code = Array.from(emoji.replace(/\uFE0F/g, ''))
			.map((ch) => ch.codePointAt(0)?.toString(16))
			.filter((part): part is string => !!part)
			.join('-')
		return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`
	}

	$effect(() => {
		if (!authed || mockMode) return
		void dashboard.loadPrograms()
		void dashboard.loadEvents()
	})

	$effect(() => {
		if (!authed || initialized || programsSource.length === 0) return
		const found = programsSource.find((program: { slug: string }) => program.slug === slug)
		if (!found) {
			void goto(eventsHref)
			return
		}
		if (!mockMode) {
			dashboard.selectProgram(found.slug)
			if (!dashboard.programDraft.icon) {
				dashboard.programDraft = { ...dashboard.programDraft, icon: '💪' }
			}
		} else {
			dashboard.programDraft = {
				...dashboard.programDraft,
				slug: found.slug,
				label: found.label,
				activityName: found.activityName || found.label,
				pageTitle: found.pageTitle || found.label,
				eyebrow: found.eyebrow || found.label,
				heroTitleLine1: found.heroTitleLines[0] || dashboard.programDraft.heroTitleLine1,
				heroTitleLine2: found.heroTitleLines[1] || dashboard.programDraft.heroTitleLine2,
				heroSubtitle: found.heroSubtitle || dashboard.programDraft.heroSubtitle,
				icon: found.icon || dashboard.programDraft.icon,
				enabled: found.enabled,
				sortOrder: found.sortOrder,
				serviceStatusNote: found.serviceStatusNote || '',
				eyebrowClass: found.eyebrowClass || '',
				glowClass: found.glowClass || '',
				formGlowClass: found.formGlowClass || ''
			}
		}
		initialized = true
		resetEditorHistory()
	})

	$effect(() => {
		if (!authed || !initialized) return
		const map: Record<string, ActiveDay> = {}
		for (const ev of eventsSource) {
			if (ev.activitySlug !== slug) continue
			const d = new Date(ev.startsAt)
			if (
				d.getFullYear() !== currentMonth.getFullYear() ||
				d.getMonth() !== currentMonth.getMonth()
			) {
				continue
			}
			const dayKey = isoDay(d)
			if (map[dayKey]) {
				map[dayKey] = {
					...map[dayKey],
					count: (map[dayKey]?.count || 1) + 1
				}
				continue
			}
			map[dayKey] = {
				time: d.toLocaleTimeString(undefined, {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				}),
				capacity: ev.capacity,
				repeatLabel: `Every ${d.toLocaleDateString(undefined, { weekday: 'long' })}`,
				count: 1
			}
		}
		activeDays = map
	})

	$effect(() => {
		if (!popOpen || !selectedDayDate) return
		const dayKey = isoDay(selectedDayDate)
		if (!activeDays[dayKey]) return
		const current = activeDays[dayKey] as ActiveDay
		if (current.time === popTime && current.capacity === popCap) return
		activeDays = {
			...activeDays,
			[dayKey]: {
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

	function programSignature() {
		const draft = dashboard.programDraft
		return JSON.stringify({
			slug: draft.slug.trim(),
			label: draft.label.trim(),
			activityName: draft.activityName.trim(),
			pageTitle: draft.pageTitle.trim(),
			eyebrow: draft.eyebrow.trim(),
			heroTitleLine1: draft.heroTitleLine1.trim(),
			heroTitleLine2: draft.heroTitleLine2.trim(),
			heroSubtitle: draft.heroSubtitle.trim(),
			description: draft.description.trim(),
			icon: draft.icon.trim(),
			eyebrowClass: draft.eyebrowClass.trim(),
			glowClass: draft.glowClass.trim(),
			formGlowClass: draft.formGlowClass.trim(),
			serviceStatusNote: draft.serviceStatusNote.trim(),
			enabled: draft.enabled,
			sortOrder: Number(draft.sortOrder) || 0
		})
	}

	function editorSnapshot(): ProgramEditorSnapshot {
		return {
			programDraft: { ...dashboard.programDraft }
		}
	}

	function applyEditorSnapshot(snapshot: ProgramEditorSnapshot) {
		dashboard.programDraft = { ...snapshot.programDraft }
	}

	function resetEditorHistory() {
		editorHistory.clear(editorSnapshot())
		historyReady = true
	}

	function pushEditorHistory(scope: string) {
		if (!historyReady) {
			resetEditorHistory()
			return
		}
		editorHistory.push(editorSnapshot(), { scope })
	}

	function updateProgramField(field: keyof typeof dashboard.programDraft, value: string) {
		dashboard.programDraft = {
			...dashboard.programDraft,
			[field]: value
		}
	}

	function commitProgramField(field: keyof typeof dashboard.programDraft, value: string) {
		updateProgramField(field, value)
		pushEditorHistory(String(field))
	}

	function updateProgramDraft(patch: Partial<ProgramDraft>, scope: string) {
		dashboard.programDraft = {
			...dashboard.programDraft,
			...patch
		}
		pushEditorHistory(scope)
	}

	function updateTitle(value: string) {
		const lines = value
			.split(/\n+/)
			.map((line) => line.trim())
			.filter(Boolean)
		updateProgramField('heroTitleLine1', lines[0] || '')
		updateProgramField('heroTitleLine2', lines[1] || '')
		pushEditorHistory('heroTitle')
	}

	function combinedTitle() {
		const one = dashboard.programDraft.heroTitleLine1 || ''
		const two = dashboard.programDraft.heroTitleLine2 || ''
		return two ? `${one}\n${two}` : one
	}

	function isoDay(date: Date) {
		const y = date.getFullYear()
		const m = `${date.getMonth() + 1}`.padStart(2, '0')
		const d = `${date.getDate()}`.padStart(2, '0')
		return `${y}-${m}-${d}`
	}

	function isPast(date: Date) {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return date < today
	}

	function isToday(date: Date) {
		const now = new Date()
		return (
			date.getFullYear() === now.getFullYear() &&
			date.getMonth() === now.getMonth() &&
			date.getDate() === now.getDate()
		)
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
		selectedDayDate = dayDate
		const existing = activeDays[isoDay(dayDate)]
		popTime = existing?.time ?? '10:30'
		popCap = existing?.capacity ?? 8
		newMode = existing ? (existing.repeatLabel ? 'repeat' : 'once') : 'once'
		originalPopTime = popTime
		originalPopCap = popCap
		const eventForDay = eventsSource.find((ev: { activitySlug: string; startsAt: string; id: number }) => {
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
		if (left + popWidth / 2 > window.innerWidth - 24) {
			left = window.innerWidth - 24 - popWidth / 2
		}
		const goAbove = window.innerHeight - rect.bottom < 300
		popAbove = goAbove
		popTop = goAbove ? rect.top - 10 : rect.bottom + 10
		popBottom = goAbove ? window.innerHeight - rect.top + 10 : 0
		popLeft = left
		popOpen = true
	}

	function closePop() {
		popOpen = false
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
		if (mockMode) {
			const dayKey = isoDay(selectedDayDate)
			const nextDay: ActiveDay = {
				time: popTime,
				capacity: popCap,
				count: activeDays[dayKey]?.count || 1,
				...(newMode === 'repeat'
					? {
							repeatLabel: `Every ${selectedDayDate.toLocaleDateString(undefined, { weekday: 'long' })}`
						}
					: {})
			}
			activeDays = {
				...activeDays,
				[dayKey]: nextDay
			}
			flash('Mock mode: schedule preview updated')
			closePop()
			return
		}
		const [hours, minutes] = popTime.split(':').map((part) => Number.parseInt(part, 10))
		const safeHours = Number.isFinite(hours) ? (hours as number) : 10
		const safeMinutes = Number.isFinite(minutes) ? (minutes as number) : 30
		const start = new Date(selectedDayDate)
		start.setHours(safeHours, safeMinutes, 0, 0)
		const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
		const activity = dashboard.programDraft.slug || slug
		const title = dashboard.programDraft.label ? `${dashboard.programDraft.label} Session` : 'Session'

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
		if (mockMode) {
			if (!selectedDayDate) return
			const next = { ...activeDays }
			delete next[isoDay(selectedDayDate)]
			activeDays = next
			flash('Mock mode: removed from preview')
			closePop()
			return
		}
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
		if (!selectedDayDate) return
		const next = { ...activeDays }
		delete next[isoDay(selectedDayDate)]
		activeDays = next
		closePop()
	}

	async function persistExistingDayEdits() {
		if (mockMode) {
			flash('Mock mode: edits are preview-only')
			closePop()
			return
		}
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
		commitProgramField('icon', emoji)
		emojiPickerOpen = false
	}

	async function saveProgram() {
		if (mockMode) {
			flash('Mock mode: program save skipped')
			return
		}
		await dashboard.saveProgram()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		lastSavedSignature = programSignature()
		flash('Program saved')
	}

	async function deleteProgram() {
		if (mockMode) {
			flash('Mock mode: delete skipped')
			return
		}
		await dashboard.deleteProgram()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		void goto(eventsHref)
	}

	function onGlobalClick(event: MouseEvent) {
		const target = event.target as HTMLElement
		if (!target.closest('.program-editor__emoji-wrap')) {
			emojiPickerOpen = false
		}
		if (
			popOpen &&
			!target.closest('.program-editor__popover') &&
			!target.closest('.admin-calendar__day')
		) {
			closePop()
		}
	}

	function onGlobalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closePop()
			emojiPickerOpen = false
			return
		}
		if (event.isComposing || preview) return
		if (!isUndoShortcut(event) && !isRedoShortcut(event)) return
		if (isNativeUndoTarget(event.target)) return

		const snapshot = isRedoShortcut(event)
			? editorHistory.redo(editorSnapshot())
			: editorHistory.undo(editorSnapshot())
		if (!snapshot) return

		event.preventDefault()
		applyEditorSnapshot(snapshot)
		flash(isRedoShortcut(event) ? 'Redid change' : 'Undid change')
	}

	function isUndoShortcut(event: KeyboardEvent) {
		return (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z'
	}

	function isRedoShortcut(event: KeyboardEvent) {
		const key = event.key.toLowerCase()
		return (
			(event.metaKey || event.ctrlKey) &&
			((event.shiftKey && key === 'z') || (!event.metaKey && !event.shiftKey && key === 'y'))
		)
	}

	function isNativeUndoTarget(target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) return false
		if (target.closest('input, textarea, select')) return true
		if (target.isContentEditable) return true
		return !!target.closest('[contenteditable="true"]')
	}

	function handleSettingInput<K extends keyof ProgramDraft>(field: K, value: ProgramDraft[K]) {
		dashboard.programDraft = {
			...dashboard.programDraft,
			[field]: value
		}
	}

	function onTopbarToggleSettings() {
		settingsOpen = !settingsOpen
	}

	onMount(() => {
		const now = new Date()
		untilDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-30`
		window.addEventListener('admin-program-editor-toggle-settings', onTopbarToggleSettings)
		return () => {
			if (autosaveTimer) clearTimeout(autosaveTimer)
			window.removeEventListener('admin-program-editor-toggle-settings', onTopbarToggleSettings)
		}
	})

	$effect(() => {
		if (!authed || !initialized || mockMode) return
		const signature = programSignature()
		if (!autosaveReady) {
			lastSavedSignature = signature
			autosaveReady = true
			return
		}
		if (signature === lastSavedSignature) return
		if (autosaveTimer) clearTimeout(autosaveTimer)
		autosaveTimer = setTimeout(() => {
			void saveProgram()
		}, 700)
	})
</script>

<svelte:window onclick={onGlobalClick} onkeydown={onGlobalKeydown} />

{#if authed}
	{#if toast}
		<div
			class="program-editor__toast admin-ui-toast"
			class:admin-ui-toast--error={toastError}
			role="status"
		>
			{#if !toastError}✓{/if}{toast}
		</div>
	{/if}

	<div class="program-editor admin-content">
		<div class="program-editor__canvas-wrap">
			<div class="program-editor__canvas">
				<div class="program-editor__panel admin-ui-card">
					<section class="program-editor__hero">
						<div class="program-editor__hero-glow" aria-hidden="true"></div>

						<div class="program-editor__emoji-wrap">
							<button
								class="program-editor__emoji"
								type="button"
								title="Change icon"
								aria-label={`Current icon ${dashboard.programDraft.icon || '💪'}`}
								onclick={() => (emojiPickerOpen = !emojiPickerOpen)}
							>
								<img
									class="program-editor__emoji-glyph"
									src={emojiToTwemojiUrl(dashboard.programDraft.icon || '💪')}
									alt=""
									loading="lazy"
									decoding="async"
								/>
							</button>
							{#if emojiPickerOpen}
								<div class="program-editor__emoji-picker">
									{#each emojiOptions as emoji}
										<button
											type="button"
											class="program-editor__emoji-option"
											aria-label={`Use ${emoji}`}
											onclick={() => pickEmoji(emoji)}
										>
											<img
												class="program-editor__emoji-option-glyph"
												src={emojiToTwemojiUrl(emoji)}
												alt=""
												loading="lazy"
												decoding="async"
											/>
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<div
							class="program-editor__editable program-editor__eyebrow"
							contenteditable={!preview}
							spellcheck={false}
							onblur={(event) =>
								commitProgramField('eyebrow', event.currentTarget.textContent || '')}
						>
							{dashboard.programDraft.eyebrow || 'Program'}
						</div>

							<div class="program-editor__title-group">
								<div
									class="program-editor__editable program-editor__title"
									contenteditable={!preview}
									spellcheck={false}
									onblur={(event) => updateTitle(event.currentTarget.textContent || '')}
								>
									{combinedTitle() || 'Hang out. Work out.\nWhatever.'}
								</div>
							</div>

						<div
							class="program-editor__editable program-editor__subtitle"
							contenteditable={!preview}
							spellcheck={false}
							onblur={(event) =>
								commitProgramField('heroSubtitle', event.currentTarget.textContent || '')}
						>
							{dashboard.programDraft.heroSubtitle ||
								"Grab a time slot and let's do something fun together."}
						</div>
					</section>

					<AdminCalendarWidget
						{currentMonth}
						selectedDateIso={selectedDayDate ? isoDay(selectedDayDate) : null}
						onPrev={prevMonth}
						onNext={nextMonth}
						onSelect={(date: Date, element: HTMLButtonElement) => openDay(date, element)}
						{isPast}
						{isToday}
						isActive={(date: Date) => !!activeDays[isoDay(date)]}
						eventCount={(date: Date) => activeDays[isoDay(date)]?.count || 0}
						eventTone={() => slug}
						compact={true}
					/>
				</div>

				{#if popOpen}
					<div
						class="program-editor__popover"
						style={`left:${popLeft}px; ${popAbove ? `bottom:${popBottom}px` : `top:${popTop}px`}; transform:translateX(-50%);`}
					>
						<div
							class="program-editor__popover-arrow"
							class:program-editor__popover-arrow--above={popAbove}
						></div>
						<div class="program-editor__popover-title">
							{#if selectedDayDate}
								{selectedDayDate.toLocaleDateString(undefined, {
									weekday: 'long',
									month: 'short',
									day: 'numeric'
								})}
							{/if}
						</div>

						{#if selectedDayDate && !activeDays[isoDay(selectedDayDate)]}
							<div class="program-editor__opt-row">
								<button
									type="button"
									class="program-editor__opt"
									class:program-editor__opt--on={newMode === 'once'}
									onclick={() => (newMode = 'once')}
								>
									Just this day
								</button>
								<button
									type="button"
									class="program-editor__opt"
									class:program-editor__opt--on={newMode === 'repeat'}
									onclick={() => (newMode = 'repeat')}
								>
									Repeat weekly
								</button>
							</div>

							{#if newMode === 'repeat'}
								<div class="program-editor__until">
									<button
										type="button"
										class:program-editor__until-btn--on={untilMode === 'ongoing'}
										class="program-editor__until-btn"
										onclick={() => (untilMode = 'ongoing')}
									>
										Ongoing
									</button>
									<button
										type="button"
										class:program-editor__until-btn--on={untilMode === 'date'}
										class="program-editor__until-btn"
										onclick={() => (untilMode = 'date')}
									>
										Pick date
									</button>
								</div>
								{#if untilMode === 'date'}
									<input
										class="ui-form-control program-editor__input"
										type="date"
										bind:value={untilDate}
									/>
								{/if}
							{/if}

							<div class="program-editor__fields">
								<label>
									<span>Time</span>
									<TimeSelector bind:value={popTime} />
								</label>
								<label>
									<span>Capacity</span>
									<NumberStepper bind:value={popCap} min={1} max={50} />
								</label>
							</div>
							<div class="program-editor__actions">
								<AdminActionButton variant="subtle" onclick={closePop}>Cancel</AdminActionButton>
								<AdminActionButton variant="primary" onclick={() => void persistDaySchedule()}
									>Add</AdminActionButton
								>
							</div>
						{:else}
							<div class="program-editor__fields">
								<label>
									<span>Time</span>
									<TimeSelector bind:value={popTime} />
								</label>
								<label>
									<span>Capacity</span>
									<NumberStepper bind:value={popCap} min={1} max={50} />
								</label>
							</div>
							{#if selectedDayDate && activeDays[isoDay(selectedDayDate)]?.repeatLabel}
								<div class="program-editor__override">
									<div class="program-editor__override-label">Part of repeating schedule</div>
									<div class="program-editor__override-text">
										Changes here apply to this day preview only. Save a new schedule to persist.
									</div>
								</div>
							{/if}
							<div class="program-editor__actions program-editor__actions--split">
								<AdminActionButton variant="danger" onclick={() => void removeDay()}
									>Remove</AdminActionButton
								>
								<AdminActionButton
									variant="primary"
									onclick={() => void persistExistingDayEdits()}
								>
									Done
								</AdminActionButton>
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
					<div class="program-editor__settings-body">
						<div class="program-editor__toggle-row">
							<span>Accepting bookings</span>
							<button
								type="button"
								aria-label={dashboard.programDraft.enabled ? 'Disable bookings' : 'Enable bookings'}
								class="program-editor__switch"
								class:program-editor__switch--on={dashboard.programDraft.enabled}
								onclick={() =>
									updateProgramDraft(
										{ enabled: !dashboard.programDraft.enabled },
										'enabled'
									)}
							>
								<span></span>
							</button>
						</div>
						<label
							><span>URL path</span><input
								class="ui-form-control"
								type="text"
								value={dashboard.programDraft.slug}
								oninput={(event) => handleSettingInput('slug', event.currentTarget.value)}
								onblur={() => pushEditorHistory('slug')}
							/></label
						>
						<label
							><span>Sort order</span><input
								class="ui-form-control ui-form-control--number"
								type="number"
								value={dashboard.programDraft.sortOrder}
								oninput={(event) =>
									handleSettingInput(
										'sortOrder',
										Number.isFinite(event.currentTarget.valueAsNumber)
											? event.currentTarget.valueAsNumber
											: 0
									)}
								onblur={() => pushEditorHistory('sortOrder')}
							/></label
						>
						<label
							><span>Status note</span><input
								class="ui-form-control"
								type="text"
								value={dashboard.programDraft.serviceStatusNote}
								oninput={(event) =>
									handleSettingInput('serviceStatusNote', event.currentTarget.value)}
								onblur={() => pushEditorHistory('serviceStatusNote')}
							/></label
						>
						<label
							><span>Page title</span><input
								class="ui-form-control"
								type="text"
								value={dashboard.programDraft.pageTitle}
								oninput={(event) => handleSettingInput('pageTitle', event.currentTarget.value)}
								onblur={() => pushEditorHistory('pageTitle')}
							/></label
						>
						<label
							><span>Activity name</span><input
								class="ui-form-control"
								type="text"
								value={dashboard.programDraft.activityName}
								oninput={(event) => handleSettingInput('activityName', event.currentTarget.value)}
								onblur={() => pushEditorHistory('activityName')}
							/></label
						>
						<label
							><span>Eyebrow class</span><input
								class="ui-form-control"
								type="text"
								value={dashboard.programDraft.eyebrowClass}
								oninput={(event) => handleSettingInput('eyebrowClass', event.currentTarget.value)}
								onblur={() => pushEditorHistory('eyebrowClass')}
							/></label
						>
						<label
							><span>Glow class</span><input
								class="ui-form-control"
								type="text"
								value={dashboard.programDraft.glowClass}
								oninput={(event) => handleSettingInput('glowClass', event.currentTarget.value)}
								onblur={() => pushEditorHistory('glowClass')}
							/></label
						>
						<label
							><span>Form glow class</span><input
								class="ui-form-control"
								type="text"
								value={dashboard.programDraft.formGlowClass}
								oninput={(event) => handleSettingInput('formGlowClass', event.currentTarget.value)}
								onblur={() => pushEditorHistory('formGlowClass')}
							/></label
						>
						<div class="program-editor__settings-actions">
							<AdminActionButton
								variant="danger"
								onclick={() => void deleteProgram()}
								disabled={dashboard.programDeleting}
							>
								{dashboard.programDeleting ? 'Deleting…' : 'Delete'}
							</AdminActionButton>
							<AdminActionButton
								variant="primary"
								onclick={() => void saveProgram()}
								disabled={dashboard.programSaving}
							>
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
		--popover-surface: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
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

	.program-editor__panel {
		width: 100%;
		padding: 1.1rem 1rem 1.65rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		background: linear-gradient(
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

	.program-editor__emoji:hover {
		background: color-mix(in srgb, var(--bg) 80%, var(--text) 20%);
	}

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
		z-index: 9992;
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

	.program-editor__emoji-option:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
	}

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

	.program-editor__popover {
		position: fixed;
		width: 306px;
		--popover-surface: var(--popover-surface, color-mix(in srgb, var(--bg) 94%, var(--text) 6%));
		--popover-control-bg: color-mix(in srgb, #faf6ff 88%, var(--popover-surface) 12%);
		--popover-control-border: var(--border-s);
		--popover-control-text: var(--text);
		background-image: none;
		background-color: var(--popover-surface);
		border: 1px solid var(--popover-control-border);
		border-radius: 1rem;
		box-shadow:
			0 30px 65px color-mix(in srgb, black 24%, transparent),
			0 8px 20px color-mix(in srgb, black 14%, transparent);
		padding: 1rem;
		z-index: 9991 !important;
		color: var(--text);
		opacity: 1;
		backdrop-filter: none;
	}

	.program-editor__popover :global(.ui-form-control) {
		background: var(--popover-control-bg);
		border-color: var(--popover-control-border);
		color: var(--popover-control-text);
	}

	.program-editor__popover :global(.ui-form-control:focus) {
		border-color: color-mix(in srgb, #7a5af8 56%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, #7a5af8 22%, transparent);
	}

	.program-editor__popover :global(.ui-form-select__chevron) {
		color: var(--text-3);
	}

	.program-editor__popover :global(.ui-stepper__button) {
		background: var(--popover-control-bg);
		border-color: var(--popover-control-border);
		color: var(--popover-control-text);
	}

	.program-editor__popover :global(.ui-stepper__button:hover) {
		background: color-mix(in srgb, var(--text) 6%, var(--popover-control-bg) 94%);
	}

	.program-editor__popover :global(.ui-time-selector__period) {
		border-color: var(--popover-control-border);
	}

	.program-editor__popover :global(.ui-time-selector__period-button) {
		background: var(--popover-control-bg);
		color: var(--popover-control-text);
		border-right-color: var(--popover-control-border);
	}

	.program-editor__popover :global(.ui-time-selector__period-button--active) {
		background: var(--blue-soft);
		color: var(--text);
	}

	.program-editor__popover-arrow {
		position: absolute;
		width: 10px;
		height: 10px;
		background: var(--popover-surface);
		border-left: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
		border-top: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
		top: -6px;
		left: 50%;
		transform: translateX(-50%) rotate(45deg);
		z-index: 1;
	}

	.program-editor__popover-arrow--above {
		top: auto;
		bottom: -6px;
		transform: translateX(-50%) rotate(225deg);
	}

	.program-editor__popover-title {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text);
		margin-bottom: 0.8rem;
	}

	.program-editor__opt-row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.35rem;
		margin-bottom: 0.8rem;
	}

	.program-editor__opt {
		border: 1px solid var(--popover-control-border);
		background: var(--popover-control-bg);
		padding: 0.52rem 0.65rem;
		border-radius: 0.5rem;
		text-align: center;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		color: var(--text);
	}

	.program-editor__opt:hover {
		background: color-mix(in srgb, var(--text) 6%, var(--popover-control-bg) 94%);
		color: var(--text);
	}

	.program-editor__opt--on {
		background: var(--blue-soft);
		border-color: color-mix(in srgb, var(--blue) 72%, transparent);
		color: var(--text);
	}

	.program-editor__until {
		display: flex;
		gap: 0.35rem;
		margin-bottom: 0.6rem;
	}

	.program-editor__until-btn {
		font-size: 0.7rem;
		padding: 0.3rem 0.55rem;
		border-radius: 0.4rem;
		border: 1px solid var(--popover-control-border);
		background: var(--popover-control-bg);
		color: var(--text);
		cursor: pointer;
	}

	.program-editor__until-btn--on {
		background: var(--blue-soft);
		border-color: color-mix(in srgb, var(--blue) 72%, transparent);
		color: var(--text);
	}

	.program-editor__fields {
		display: grid;
		gap: 0.55rem;
		margin-bottom: 0.9rem;
	}

	.program-editor__fields label {
		display: grid;
		gap: 0.2rem;
	}

	.program-editor__fields label span {
		font-size: 0.66rem;
		font-weight: 700;
		color: var(--text-3);
	}

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

	.program-editor__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.45rem;
	}

	.program-editor__actions--split {
		justify-content: space-between;
		align-items: center;
	}

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
		top: calc(2.5rem + 1px);
		border: none;
		background: color-mix(in srgb, var(--text) 68%, transparent);
		z-index: 9993 !important;
	}

	.program-editor__settings {
		position: fixed;
		top: calc(2.5rem + 1px);
		right: 0;
		bottom: 0;
		width: min(20rem, 90vw);
		height: calc(100vh - 2.5rem - 1px);
		border-left: 1px solid var(--border);
		background-color: var(--surface);
		background-image: none;
		z-index: 9994 !important;
		display: flex;
		flex-direction: column;
		color: var(--text);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.program-editor__settings-body {
		padding: 0.95rem 0.9rem;
		display: grid;
		gap: 0.55rem;
		overflow: auto;
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.program-editor__settings-body label {
		display: grid;
		gap: 0.2rem;
	}

	.program-editor__settings-body label span {
		font-size: 0.66rem;
		font-weight: 700;
		color: var(--text-3);
	}

	.program-editor__toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.program-editor__toggle-row span {
		font-size: 0.75rem;
		font-weight: 600;
	}

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

	.program-editor__switch--on {
		background: color-mix(in srgb, var(--text) 70%, var(--bg) 30%);
	}

	.program-editor__switch--on span {
		left: 23px;
	}

	.program-editor__settings-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.5rem;
	}

	.program-editor__toast {
		bottom: 1rem;
		z-index: 9995;
	}

	@media (max-width: 1080px) {
		.program-editor__settings-overlay {
			top: calc(2.5rem + 1px);
		}

		.program-editor__settings {
			width: min(20rem, 90vw);
			top: calc(2.5rem + 1px);
			height: calc(100vh - 2.5rem - 1px);
		}
	}
</style>
