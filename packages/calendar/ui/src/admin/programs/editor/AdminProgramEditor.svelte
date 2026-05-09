<script lang="ts">
	import { goto } from '$app/navigation'
	import { CalendarPlus, Lightbulb, Pause, Play, Trash2 } from '@lucide/svelte'
	import { onMount } from 'svelte'
	import type { createAdminDashboardController } from '../../dashboard/admin-dashboard-controller.svelte'
	import ConfirmModal from '../../shared/ConfirmModal.svelte'
	import ProgramHeroEdit from './ProgramHeroEdit.svelte'
	import ProgramScheduleSection from './ProgramScheduleSection.svelte'
	import UrlPill from './UrlPill.svelte'
	import { createDayScheduleController } from './day-schedule-controller.svelte'
	import { isUndoShortcut, isRedoShortcut, isNativeUndoTarget } from './editor-keyboard'
	import { createProgramEditorHistory } from './program-editor-history.svelte'
	import { getAdminMockCatalog } from '../../mock/catalog'

	type DashboardController = ReturnType<typeof createAdminDashboardController>
	type ProgramDraft = DashboardController['programDraft']

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
	let deleteConfirmOpen = $state(false)
	let initialized = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null
	let autosaveReady = $state(false)
	let lastSavedSignature = $state('')

	const adminMockCatalog = getAdminMockCatalog()
	const createMode = $derived(slug === 'new')
	const eventsSource = $derived(mockMode ? adminMockCatalog.dashboardEvents : dashboard.events)
	const programsSource = $derived(mockMode ? adminMockCatalog.programs : dashboard.programs)
	const editorHistory = createProgramEditorHistory({
		getDraft: () => dashboard.programDraft,
		setDraft: (draft) => {
			dashboard.programDraft = draft
		}
	})

	const dayController = createDayScheduleController({
		getDashboard: () => dashboard,
		getSlug: () => slug,
		getEventsSource: () => eventsSource,
		isReady: () => authed && initialized,
		isMockMode: () => mockMode,
		flash
	})


	$effect(() => {
		if (!authed || mockMode) return
		if (!dashboard.programsLoaded) void dashboard.loadPrograms()
		if (!dashboard.eventsLoaded) void dashboard.loadEvents()
	})

	$effect(() => {
		if (!authed || initialized) return
		if (createMode) {
			if (!mockMode) dashboard.newProgramDraft()
			else {
				dashboard.programDraft = {
					...dashboard.programDraft,
					slug: 'new-program',
					label: 'New Program',
					activityName: 'New Program',
					pageTitle: 'New Program',
					eyebrow: 'New Program',
					heroTitleLine1: 'Make it yours.',
					heroTitleLine2: '',
					heroSubtitle: 'Set up the page, save it as a draft, then click days to schedule events.',
					description: '',
					icon: '✨',
					enabled: false,
					sortOrder: programsSource.length + 10,
					serviceStatusNote: 'Draft'
				}
			}
			initialized = true
			editorHistory.reset()
			return
		}
		if (programsSource.length === 0) return
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
		editorHistory.reset()
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

	function pushEditorHistory(scope: string) {
		editorHistory.push(scope)
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

	async function saveProgram() {
		if (mockMode) {
			flash('Mock mode: program save skipped')
			return
		}
		const savedSlug = dashboard.programDraft.slug.trim()
		await dashboard.saveProgram()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		lastSavedSignature = editorHistory.signature()
		flash('Program saved')
		if (createMode && savedSlug) {
			void goto(`${eventsHref.replace(/\/events\/?$/, `/events/program/${savedSlug}/`)}`)
		}
	}

	function requestDeleteProgram() {
		deleteConfirmOpen = true
	}

	async function deleteProgram() {
		deleteConfirmOpen = false
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

	function onGlobalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dayController.closePop()
			return
		}
		if (event.isComposing || preview) return
		if (!isUndoShortcut(event) && !isRedoShortcut(event)) return
		if (isNativeUndoTarget(event.target)) return

		const isRedo = isRedoShortcut(event)
		const snapshot = isRedo ? editorHistory.redo() : editorHistory.undo()
		if (!snapshot) return

		event.preventDefault()
		flash(isRedo ? 'Redid change' : 'Undid change')
	}

	function handleSettingInput<K extends keyof ProgramDraft>(field: K, value: ProgramDraft[K]) {
		dashboard.programDraft = {
			...dashboard.programDraft,
			[field]: value
		}
	}

	onMount(() => {
		const now = new Date()
		// Default until-date for repeat = end of current month-ish
		dayController.popDraft.untilDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-30`
		return () => {
			if (autosaveTimer) clearTimeout(autosaveTimer)
		}
	})

	$effect(() => {
		if (!authed || !initialized || mockMode || createMode) return
		const signature = editorHistory.signature()
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

<svelte:window onkeydown={onGlobalKeydown} />

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

	<ConfirmModal
		open={deleteConfirmOpen}
		title="Remove this program?"
		body="{dashboard.programDraft?.label || dashboard.selectedProgramSlug || 'This program'} and its schedule will be deleted. This cannot be undone."
		confirmLabel="Yes, remove"
		busyLabel="Removing…"
		danger
		busy={dashboard.programDeleting}
		align="content"
		onCancel={() => (deleteConfirmOpen = false)}
		onConfirm={() => void deleteProgram()}
	/>

	<!-- Admin chrome: program-level actions. Outside the editor card
	 * because they aren't part of what users see on the public page.
	 * Pause/Resume + New event group on the left; Remove (destructive)
	 * on the far right. -->
	<div class="program-editor-chrome">
		<div class="program-editor-chrome__group">
			<button
				type="button"
				class="program-editor-chrome__btn"
				aria-pressed={!dashboard.programDraft.enabled}
				aria-label={dashboard.programDraft.enabled
					? 'Click to pause bookings'
					: 'Click to resume bookings'}
				onclick={() => updateProgramDraft({ enabled: !dashboard.programDraft.enabled }, 'enabled')}
			>
				{#if dashboard.programDraft.enabled}
					<Pause size={14} strokeWidth={2.2} fill="currentColor" />
					Pause
				{:else}
					<Play size={14} strokeWidth={2.2} fill="currentColor" />
					Resume
				{/if}
			</button>

			<button
				type="button"
				class="program-editor-chrome__btn program-editor-chrome__btn--accent"
				aria-label="Schedule a new event"
				onclick={() => {
					const target = new Date()
					target.setHours(0, 0, 0, 0)
					if (target < new Date(new Date().setHours(0, 0, 0, 0))) {
						target.setDate(target.getDate() + 1)
					}
					dayController.openDay(target)
				}}
			>
				<CalendarPlus size={14} strokeWidth={2.2} />
				New event
			</button>
		</div>

		<button
			type="button"
			class="program-editor-chrome__btn program-editor-chrome__btn--danger"
			onclick={requestDeleteProgram}
			disabled={dashboard.programDeleting}
		>
			<Trash2 size={14} strokeWidth={2.2} />
			{dashboard.programDeleting ? 'Removing…' : 'Remove'}
		</button>
	</div>

	<div class="program-editor admin-content">
		<div class="program-editor__canvas-wrap">
			<div class="program-editor__canvas">
				<div
					class="program-editor__panel calendar-ui-card"
					class:program-editor__panel--paused={!dashboard.programDraft.enabled}
				>
					{#if !dashboard.programDraft.enabled}
						<span class="program-editor__paused-badge" aria-label="Program paused">
							<span class="program-editor__paused-dot" aria-hidden="true"></span>
							Paused
						</span>
					{/if}
					<!-- URL is part of the editable preview — sits at the top
					 * of the dashed area so it reads as program identity. -->
					<div class="program-editor__url-row">
						<UrlPill
							slug={dashboard.programDraft.slug}
							onInput={(value) => handleSettingInput('slug', value)}
							onCommit={() => pushEditorHistory('slug')}
						/>
					</div>

					<ProgramHeroEdit
						icon={dashboard.programDraft.icon}
						eyebrow={dashboard.programDraft.eyebrow}
						title={combinedTitle()}
						subtitle={dashboard.programDraft.heroSubtitle}
						{preview}
						onCommitIcon={(value) => commitProgramField('icon', value)}
						onCommitEyebrow={(value) => commitProgramField('eyebrow', value)}
						onCommitTitle={updateTitle}
						onCommitSubtitle={(value) => commitProgramField('heroSubtitle', value)}
					/>

					<ProgramScheduleSection {dayController} {slug} {eventsSource} />
				</div>

				<p class="program-editor__hint">
					<Lightbulb class="program-editor__hint-icon" size={14} strokeWidth={1.9} aria-hidden="true" />
					<span>Click text to edit, click a day to schedule it.</span>
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.social-admin) {
		overflow-x: clip;
	}


	.program-editor {
		font-family: var(--font-ui-sans, var(--font-sans));
		/* NEVER add `--bg: var(--bg)` or `--text: var(--text)` here — those
		 * are cyclic references that CSS treats as invalid, collapsing every
		 * descendant's `var(--bg)` / `var(--text)` (and any color-mix using
		 * them) to transparent. Variables inherit by default; let them. */
		/* Two-stop atmospheric backdrop: accent purple top-left, pink top-right.
		 * The pink (#f0abfc) is hardcoded — sister to --admin-accent but we
		 * don't have a secondary brand token yet. */
		background:
			radial-gradient(
				ellipse 520px 360px at 52% 68px,
				color-mix(in srgb, var(--admin-accent) 16%, transparent) 0%,
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
		border: none;
	}

	.program-editor__canvas-wrap {
		border-bottom: 1px solid color-mix(in srgb, var(--text) 9%, transparent);
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

	/* The panel is transparent on top of `.program-editor`'s radial gradients
	 * so the colored backdrop shows through. The dashed border lives here
	 * (not on the outer .program-editor) so the hint below sits outside it.
	 * Chained class beats the global `.social-admin .calendar-ui-card`. */
	.program-editor__panel.calendar-ui-card {
		position: relative;
		width: 100%;
		padding: 1.1rem 1rem 1.65rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		background: transparent;
		border: 1px dashed color-mix(in srgb, var(--admin-accent) 38%, transparent);
		border-radius: 0.875rem;
		box-shadow: none;
		transition: opacity 220ms ease, filter 220ms ease, border-color 220ms ease;
	}

	/* Paused state — fade the whole panel (badge included) so the dim is
	 * uniform. The badge sits at full color saturation but rides the same
	 * opacity, which still reads clearly because the badge has its own
	 * solid bg + amber dot for explicit signal. The dashed accent border
	 * stays untouched so the editor's identity doesn't shift. */
	.program-editor__panel--paused.calendar-ui-card {
		opacity: 0.62;
		filter: saturate(0.6);
		transition: opacity 220ms ease, filter 220ms ease;
	}

	.program-editor__panel--paused.calendar-ui-card:hover,
	.program-editor__panel--paused.calendar-ui-card:focus-within {
		opacity: 0.92;
		filter: saturate(0.9);
	}

	.program-editor__paused-badge {
		position: absolute;
		top: 0.7rem;
		right: 0.85rem;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.2rem 0.55rem 0.2rem 0.45rem;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 75%, transparent);
		background: color-mix(in srgb, var(--bg) 88%, var(--text) 12%);
		border: 1px solid color-mix(in srgb, var(--text) 22%, transparent);
		border-radius: 999px;
		opacity: 1;
		filter: none;
		z-index: 2;
	}

	.program-editor__paused-dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--admin-warn, #d97706) 80%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-warn, #d97706) 18%, transparent);
	}

	/* Admin chrome bar — sits ABOVE the editor card, holds program-level
	 * actions (Pause/Resume + Remove). URL editing lives inside the
	 * dashed editor card now since it's part of the program identity. */
	.program-editor-chrome {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		max-width: var(--admin-content-max, 720px);
		margin: 0 auto 0.85rem;
		flex-wrap: wrap;
	}

	.program-editor-chrome__group {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.program-editor-chrome__btn {
		appearance: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 32px;
		border: 1px solid var(--admin-control-border, color-mix(in srgb, var(--admin-accent) 34%, transparent));
		background: var(--admin-control-bg, transparent);
		color: var(--admin-control-fg, var(--text));
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0 0.95rem;
		border-radius: var(--admin-control-radius, 0.625rem);
		cursor: pointer;
		flex: none;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.program-editor-chrome__btn:hover:not(:disabled) {
		background: var(--admin-control-bg-hover, color-mix(in srgb, var(--admin-accent) 14%, transparent));
		transform: translateY(-1px);
	}

	.program-editor-chrome__btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.program-editor-chrome__btn--accent {
		border-color: color-mix(in srgb, var(--admin-accent) 40%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 80%, var(--text) 20%);
		background: color-mix(in srgb, var(--admin-accent) 12%, var(--bg) 88%);
	}

	.program-editor-chrome__btn--accent:hover:not(:disabled) {
		background: color-mix(in srgb, var(--admin-accent) 22%, var(--bg) 78%);
		border-color: var(--admin-accent);
		box-shadow: 0 2px 10px color-mix(in srgb, var(--admin-accent) 22%, transparent);
	}

	.program-editor-chrome__btn--danger {
		border-color: color-mix(in srgb, var(--admin-danger) 40%, transparent);
		color: var(--admin-danger);
		background: transparent;
	}

	.program-editor-chrome__btn--danger:hover:not(:disabled) {
		background: color-mix(in srgb, var(--admin-danger) 12%, transparent);
		border-color: var(--admin-danger);
		color: var(--admin-danger-strong, var(--admin-danger));
	}

	/* URL row inside the editor panel — pill stands on its own,
	 * centered at the top of the dashed area. */
	.program-editor__url-row {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.program-editor__url-row :global(.url-pill) {
		flex: 0 1 22rem;
		min-width: 12rem;
	}

	/* URL pill styles live in UrlPill.svelte. */

	@media (max-width: 30em) {
		.program-editor-chrome { gap: 0.4rem; }
		.program-editor-chrome__btn { flex: 1; }
		.program-editor__url-row :global(.url-pill) { width: 100%; flex: 1 1 auto; }
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
		color: color-mix(in srgb, var(--text) 36%, transparent);
		width: 100%;
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	:global(.program-editor__hint-icon) {
		color: color-mix(in srgb, var(--admin-warn, #d97706) 56%, var(--admin-accent) 44%);
		opacity: 0.95;
		transform: translateY(-0.35px);
		flex-shrink: 0;
	}

	.program-editor__toast {
		bottom: 1rem;
		z-index: 9995;
	}

</style>
