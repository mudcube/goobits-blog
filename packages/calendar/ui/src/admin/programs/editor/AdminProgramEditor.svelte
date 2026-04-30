<script lang="ts">
	import { goto } from '$app/navigation'
	import { Lightbulb } from '@lucide/svelte'
	import { onMount } from 'svelte'
	import type { createAdminDashboardController } from '../../dashboard/admin-dashboard-controller.svelte'
	import AdminCalendar from '../../dashboard/AdminCalendar.svelte'
	import ProgramDayPopover from './ProgramDayPopover.svelte'
	import ProgramSettingsDrawer from './ProgramSettingsDrawer.svelte'
	import { getAdminMockCatalog } from '../../mock/catalog'
	import { createHistory } from '../../history/create-history'
	import { adminActionHandlers } from '../../shell/state'

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
	const adminMockCatalog = getAdminMockCatalog()
	const eventsSource = $derived(mockMode ? adminMockCatalog.dashboardEvents : dashboard.events)
	const programsSource = $derived(mockMode ? adminMockCatalog.programs : dashboard.programs)
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
		const selectedEvent = eventsSource.find((ev: { id: number }) => ev.id === selectedEventId) as
			| { title: string; startsAt: string; endsAt: string }
			| undefined
		if (popCap !== originalPopCap) {
			await dashboard.updateEventCapacity(selectedEventId, popCap)
			if (dashboard.error) {
				flash(dashboard.error, true)
				return
			}
		}
		if (popTime !== originalPopTime && selectedDayDate && selectedEvent) {
			const [hours, minutes] = popTime.split(':').map((part) => Number.parseInt(part, 10))
			const safeHours = Number.isFinite(hours) ? (hours as number) : 10
			const safeMinutes = Number.isFinite(minutes) ? (minutes as number) : 30
			const originalStartMs = new Date(selectedEvent.startsAt).getTime()
			const originalEndMs = new Date(selectedEvent.endsAt).getTime()
			const durationMs = Math.max(15 * 60 * 1000, originalEndMs - originalStartMs)
			const nextStart = new Date(selectedDayDate)
			nextStart.setHours(safeHours, safeMinutes, 0, 0)
			const nextEnd = new Date(nextStart.getTime() + durationMs)
			await dashboard.updateEventDetails(selectedEventId, {
				title: selectedEvent.title,
				startsAt: nextStart.toISOString(),
				endsAt: nextEnd.toISOString()
			})
			if (dashboard.error) {
				flash(dashboard.error, true)
				return
			}
		}
		if (popCap !== originalPopCap || popTime !== originalPopTime) flash('Event updated')
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
		if (!settingsOpen && popOpen) closePop()
		settingsOpen = !settingsOpen
	}

	onMount(() => {
		const now = new Date()
		untilDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-30`
		return () => {
			if (autosaveTimer) clearTimeout(autosaveTimer)
		}
	})

	$effect(() => {
		adminActionHandlers.update((handlers) => ({
			...handlers,
			onProgramEditorToggleSettings: onTopbarToggleSettings
		}))

		return () => {
			adminActionHandlers.update((handlers) => {
				const next = { ...handlers }
				delete next.onProgramEditorToggleSettings
				return next
			})
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
				<div class="program-editor__panel calendar-ui-card">
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

					<AdminCalendar
						{currentMonth}
						selectedDateIso={selectedDayDate ? isoDay(selectedDayDate) : null}
						onPrev={prevMonth}
						onNext={nextMonth}
						onSelect={(date, element) => openDay(date, element)}
						{isPast}
						{isToday}
						isActive={(date) => !!activeDays[isoDay(date)]}
						eventCount={(date) => activeDays[isoDay(date)]?.count || 0}
						eventTone={() => slug}
						compact={true}
					/>
				</div>

				{#if popOpen}
					<ProgramDayPopover
						selectedDayDate={selectedDayDate}
						activeDay={selectedDayDate ? (activeDays[isoDay(selectedDayDate)] ?? null) : null}
						{popLeft}
						{popTop}
						{popBottom}
						{popAbove}
						bind:newMode
						bind:untilMode
						bind:untilDate
						bind:popTime
						bind:popCap
						onClose={closePop}
						onAdd={() => void persistDaySchedule()}
						onRemove={() => void removeDay()}
						onDone={() => void persistExistingDayEdits()}
					/>
				{/if}

				<p class="program-editor__hint">
					<Lightbulb class="program-editor__hint-icon" size={14} strokeWidth={1.9} aria-hidden="true" />
					<span>Click text to edit, click a day to schedule it.</span>
				</p>
			</div>

			<ProgramSettingsDrawer
				open={settingsOpen}
				draft={dashboard.programDraft}
				programSaving={dashboard.programSaving}
				programDeleting={dashboard.programDeleting}
				onClose={() => (settingsOpen = false)}
				onPatch={updateProgramDraft}
				onFieldInput={handleSettingInput}
				onFieldCommit={(field) => pushEditorHistory(String(field))}
				onDelete={() => void deleteProgram()}
				onSave={() => void saveProgram()}
			/>
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

	.program-editor__toast {
		bottom: 1rem;
		z-index: 9995;
	}
</style>
