<script lang="ts">
	import { goto } from '$app/navigation'
	import type { createAdminDashboardController } from '../../dashboard/admin-dashboard-controller.svelte'
	import { withAdminRoute } from '@calendar/ui/config'
	import type { AdminProgramsResponse } from '@calendar/ui/api/admin'
	import AdminPageHero from '../../shared/AdminPageHero.svelte'
	import AdminMetaCards from '../../shared/AdminMetaCards.svelte'
	import AdminGroupedCard from '../../shared/AdminGroupedCard.svelte'
	import AdminActionButton from '../../shared/AdminActionButton.svelte'
	import { getActivityColor, getActivityIcon } from '../../../shared'
	import { getAdminMockCatalog } from '../../mock/catalog'

	type AdminProgram = AdminProgramsResponse['programs'][number]

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

	const programsSource = $derived(mockMode ? adminMockCatalog.programs : dashboard.programs)

	let selectedActivitySlug = $state('')
	let createTitle = $state('')
	let createSubtitle = $state('')
	let createStartsAt = $state('')
	let createEndsAt = $state('')
	let createCapacity = $state(6)
	let createCostDollars = $state(0)
	let titleTouched = $state(false)
	let subtitleTouched = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	const canCreate = $derived(
		!!selectedActivitySlug &&
			createTitle.trim().length > 0 &&
			!!createStartsAt &&
			!!createEndsAt &&
			new Date(createEndsAt).getTime() > new Date(createStartsAt).getTime()
	)

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
		if (!titleTouched) createTitle = `${label} Session`
		if (!subtitleTouched) createSubtitle = `${label} session`
		if (!createStartsAt || !createEndsAt) {
			const starts = new Date()
			starts.setDate(starts.getDate() + 1)
			starts.setHours(10, 0, 0, 0)
			const ends = new Date(starts)
			ends.setHours(11, 0, 0, 0)
			createStartsAt = toLocalDateTimeInput(starts)
			createEndsAt = toLocalDateTimeInput(ends)
		}
		if (!createCapacity) createCapacity = dashboard.capacity
	}

	async function submitCreate() {
		if (!canCreate) return
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

	function cancel() {
		void goto(hrefWithMock(withAdminRoute('events/')))
	}
</script>

{#if authed}
	<div class="admin-new-event admin-content">
		{#if toast}
			<div
				class="admin-new-event__toast admin-ui-toast"
				class:admin-ui-toast--error={toastError}
				role="status"
			>
				{#if !toastError}✓{/if}{toast}
			</div>
		{/if}

		<AdminPageHero
			eyebrow="Events"
			title="New event"
			subtitle="Pick a program, set a time, and publish."
		>
			{#snippet actions()}
				<AdminActionButton variant="subtle" onclick={cancel}>Cancel</AdminActionButton>
				<AdminActionButton
					variant="primary"
					disabled={!canCreate || (!mockMode && dashboard.eventsCreating)}
					onclick={() => void submitCreate()}
				>
					{dashboard.eventsCreating ? 'Creating…' : 'Create'}
				</AdminActionButton>
			{/snippet}
		</AdminPageHero>

		<h4>PROGRAM</h4>
		<AdminMetaCards
			items={programsSource.map((program: AdminProgram) => {
				const isSelected = selectedActivitySlug === program.slug
				const base = {
					id: String(program.slug),
					label: program.label,
					dotColor: getActivityColor(program.label, program.slug),
					dotIcon: getActivityIcon(program.label, program.slug),
					onClick: () => selectCreateActivity(program.slug, program.label),
					ariaLabel: `Pick ${program.label}`
				}
				return isSelected
					? { ...base, statusBadge: { tone: 'success' as const, text: 'Selected' } }
					: { ...base, detail: program.enabled ? 'Live' : 'Draft' }
			})}
			emptyText="No programs yet."
		/>

		{#if selectedActivitySlug}
			<h4>DETAILS</h4>
			<AdminGroupedCard>
				<label class="admin-new-event__row">
					<span>Title</span>
					<input
						class="ui-form-control"
						type="text"
						bind:value={createTitle}
						oninput={() => (titleTouched = true)}
					/>
				</label>
				<label class="admin-new-event__row">
					<span>Subtitle</span>
					<input
						class="ui-form-control"
						type="text"
						bind:value={createSubtitle}
						oninput={() => (subtitleTouched = true)}
					/>
				</label>
			</AdminGroupedCard>

			<h4>SCHEDULE & CAPACITY</h4>
			<AdminGroupedCard>
				<label class="admin-new-event__row">
					<span>Starts</span>
					<input class="ui-form-control" type="datetime-local" bind:value={createStartsAt} />
				</label>
				<label class="admin-new-event__row">
					<span>Ends</span>
					<input class="ui-form-control" type="datetime-local" bind:value={createEndsAt} />
				</label>
				<label class="admin-new-event__row">
					<span>Spots</span>
					<input
						class="ui-form-control ui-form-control--number"
						type="number"
						min="2"
						max="20"
						bind:value={createCapacity}
					/>
				</label>
				<label class="admin-new-event__row">
					<span>Cost ($)</span>
					<input
						class="ui-form-control ui-form-control--number"
						type="number"
						min="0"
						step="1"
						bind:value={createCostDollars}
					/>
				</label>
			</AdminGroupedCard>
		{/if}
	</div>
{/if}

<style>
	.admin-new-event {
		display: grid;
		gap: 1rem;
	}

	.admin-new-event__row {
		display: grid;
		grid-template-columns: 8rem 1fr;
		align-items: center;
		gap: 0.875rem;
		padding: 0.65rem 0.875rem;
	}

	.admin-new-event__row > span {
		font-size: 0.78rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.admin-new-event__toast {
		bottom: 1rem;
	}

	@media (max-width: 720px) {
		.admin-new-event__row {
			grid-template-columns: 1fr;
			gap: 0.35rem;
		}
	}
</style>
