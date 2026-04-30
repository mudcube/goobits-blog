<script lang="ts">
	import { goto } from '$app/navigation'
	import type { createAdminDashboardController } from '../../dashboard/admin-dashboard-controller.svelte'
	import { withAdminRoute } from '@calendar/ui/config'
	import AdminWysiwygWorkspace from './AdminWysiwygWorkspace.svelte'
	import { getActivityColor, getActivityEmoji } from '../../../shared'
	import { getAdminMockCatalog } from '../../mock/catalog'

	type DashboardController = ReturnType<typeof createAdminDashboardController>

	const {
		dashboard,
		authed,
		mockMode,
		hrefWithMock
	} = $props<{
		dashboard: DashboardController
		authed: boolean
		mockMode: boolean
		hrefWithMock: (path: string) => string
	}>()
	const adminMockCatalog = getAdminMockCatalog()

	const programsSource = $derived(
		mockMode ? adminMockCatalog.programs.filter((program) => program.enabled) : dashboard.enabledPrograms
	)

	let selectedActivitySlug = $state('')
	let createTitle = $state('')
	let createSubtitle = $state('')
	let createStartsAt = $state('')
	let createEndsAt = $state('')
	let createCapacity = $state(6)
	let createCostDollars = $state(0)
	let preview = $state(false)
	let drawerOpen = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	$effect(() => {
		if (!authed || mockMode) return
		dashboard.loadPrograms()
		dashboard.loadEvents()
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

	function emojiForActivity(label: string, slug?: string) {
		return getActivityEmoji(label, slug)
	}

	function colorForActivity(label: string, slug?: string) {
		return getActivityColor(label, slug)
	}

	function toLocalDateTimeInput(date: Date) {
		const y = date.getFullYear()
		const m = `${date.getMonth() + 1}`.padStart(2, '0')
		const d = `${date.getDate()}`.padStart(2, '0')
		const hh = `${date.getHours()}`.padStart(2, '0')
		const mm = `${date.getMinutes()}`.padStart(2, '0')
		return `${y}-${m}-${d}T${hh}:${mm}`
	}

	function selectCreateActivity(slug: string, label: string) {
		selectedActivitySlug = slug
		createTitle = `${label} Session`
		createSubtitle = `${label} session`
		const starts = new Date()
		starts.setDate(starts.getDate() + 1)
		starts.setHours(10, 0, 0, 0)
		const ends = new Date(starts)
		ends.setHours(11, 0, 0, 0)
		createStartsAt = toLocalDateTimeInput(starts)
		createEndsAt = toLocalDateTimeInput(ends)
		createCapacity = dashboard.capacity
	}

	async function submitCreate() {
		if (!selectedActivitySlug) {
			flash('Pick a program before creating the event', true)
			return
		}
		if (!createTitle.trim()) {
			flash('Add an event title before creating the event', true)
			return
		}
		if (!createStartsAt || !createEndsAt) {
			flash('Add start and end times before creating the event', true)
			drawerOpen = true
			return
		}
		if (new Date(createEndsAt).getTime() <= new Date(createStartsAt).getTime()) {
			flash('End time must be after start time', true)
			drawerOpen = true
			return
		}
		if (mockMode) {
			flash('Mock mode: event created in preview')
			void goto(hrefWithMock(withAdminRoute(`events/program/${selectedActivitySlug}/`)))
			return
		}
		dashboard.eventDraft = {
			...dashboard.eventDraft,
			activitySlug: selectedActivitySlug,
			title: createTitle,
			note: createSubtitle,
			startsAt: new Date(createStartsAt).toISOString(),
			endsAt: new Date(createEndsAt).toISOString(),
			capacity: createCapacity,
			costCents: Math.max(0, Math.round(createCostDollars * 100))
		}
		await dashboard.createEvents()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		void goto(hrefWithMock(withAdminRoute('events/')))
	}
</script>

{#if authed}
	{#if toast}
		<div
			class="social-events__toast admin-ui-toast"
			class:admin-ui-toast--error={toastError}
			role="status"
		>
			{#if !toastError}✓{/if}{toast}
		</div>
	{/if}

	<div class="social-events__editor social-events__editor--shell admin-content">
		<AdminWysiwygWorkspace
			backLabel="Events"
			modeLabel={preview ? 'Preview' : 'Editing'}
			{preview}
			primaryLabel={dashboard.eventsCreating ? 'Creating…' : 'Create'}
			primaryDisabled={!mockMode && dashboard.eventsCreating}
			drawerOpen={!!selectedActivitySlug && drawerOpen}
			onBack={() => goto(hrefWithMock(withAdminRoute('events/')))}
			onToggleSettings={() => (drawerOpen = !drawerOpen)}
			onTogglePreview={() => (preview = !preview)}
			onPrimary={() => {
				void submitCreate()
			}}
			onCloseDrawer={() => (drawerOpen = false)}
		>
			{#snippet canvas()}
				<div class="social-events__canvas">
					<div class="social-events__picker-grid">
						{#each programsSource as program}
							<button
								type="button"
								class="social-events__picker-card calendar-ui-card calendar-ui-card--interactive"
								class:social-events__picker-card--active={selectedActivitySlug === program.slug}
								style={`--activity-color: ${colorForActivity(program.label, program.slug)}`}
								onclick={() => selectCreateActivity(program.slug, program.label)}
							>
								<span>{emojiForActivity(program.label, program.slug)}</span>
								<span>{program.label}</span>
							</button>
						{/each}
					</div>
					{#if selectedActivitySlug}
						<div class="social-events__hero-icon-wrap">
							<span class="social-events__hero-icon">{emojiForActivity('', selectedActivitySlug)}</span>
						</div>
						<div
							class="social-events__editable social-events__hero-title"
							contenteditable={!preview}
							spellcheck={false}
							onblur={(event) => (createTitle = event.currentTarget.textContent || '')}
						>
							{createTitle || 'New Event'}
						</div>
						<div
							class="social-events__editable social-events__hero-sub"
							contenteditable={!preview}
							spellcheck={false}
							onblur={(event) => (createSubtitle = event.currentTarget.textContent || '')}
						>
							{createSubtitle || 'Describe this session'}
						</div>
					{/if}
				</div>
			{/snippet}
			{#snippet drawer()}
				<div class="social-events__drawer-head admin-ui-drawer-head">
					<strong>Event settings</strong>
					<button
						type="button"
						class="admin-ui-drawer-close"
						onclick={() => (drawerOpen = false)}
					>
						✕
					</button>
				</div>
				<div class="social-events__drawer-body admin-ui-drawer-body">
					<label
						><span>Starts</span><input
							class="ui-form-control"
							type="datetime-local"
							bind:value={createStartsAt}
						/></label
					>
					<label
						><span>Ends</span><input
							class="ui-form-control"
							type="datetime-local"
							bind:value={createEndsAt}
						/></label
					>
					<label
						><span>Spots</span><input
							class="ui-form-control ui-form-control--number"
							type="number"
							min="2"
							max="20"
							bind:value={createCapacity}
						/></label
					>
					<label
						><span>Cost ($)</span><input
							class="ui-form-control ui-form-control--number"
							type="number"
							min="0"
							step="1"
							bind:value={createCostDollars}
						/></label
					>
				</div>
			{/snippet}
		</AdminWysiwygWorkspace>
	</div>
{/if}

<style>
	.social-events__editor {
		max-width: none;
		margin: 0;
	}

	.social-events__editor--shell {
		min-height: calc(100vh - 8rem);
		border-radius: 20px;
		background: var(--bg);
		border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
		padding: 1.25rem;
		box-shadow: 0 20px 60px color-mix(in srgb, black 14%, transparent);
	}

	.social-events__canvas {
		max-width: none;
		width: 100%;
		margin: 0;
		padding: 0.4rem 0 1rem;
		display: grid;
		gap: 0.8rem;
	}

	.social-events__picker-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin-bottom: 0.8rem;
	}

	.social-events__picker-card {
		border-radius: 12px;
		border: 2px solid color-mix(in srgb, var(--text) 16%, transparent);
		background: var(--admin-card-bg);
		padding: 0.75rem 0.45rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.social-events__picker-card--active {
		border-color: var(--admin-selected-border);
		background: var(--admin-selected-bg);
	}

	.social-events__hero-icon-wrap {
		display: flex;
		justify-content: flex-start;
	}

	.social-events__hero-icon {
		font-size: 2.6rem;
		line-height: 1;
	}

	.social-events__editable {
		outline: none;
		border-radius: 8px;
		padding: 0.2rem 0.5rem;
		text-align: left;
	}

	.social-events__editable:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
	}

	.social-events__editable:focus {
		background: color-mix(in srgb, var(--text) 7%, transparent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--text) 16%, transparent);
	}

	.social-events__hero-title {
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: var(--text);
	}

	.social-events__hero-sub {
		max-width: 24rem;
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.45;
		color: color-mix(in srgb, var(--text) 64%, transparent);
	}

	.social-events__drawer-body input {
		width: 100%;
	}

	.social-events__toast {
		bottom: 1rem;
	}

	@media (max-width: 720px) {
		.social-events__picker-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
