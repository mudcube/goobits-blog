<script lang="ts">
	import { goto } from '$app/navigation'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import AdminWysiwygWorkspace from '$lib/admin/AdminWysiwygWorkspace.svelte'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)

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

	const activityEmojis: Record<string, string> = {
		gym: '💪',
		circus: '🎪',
		movie: '🎬',
		movies: '🎬',
		hike: '🏔️',
		adventure: '🏔️',
		social: '🍺'
	}

	const activityColors: Record<string, string> = {
		gym: '#6366f1',
		circus: '#ec4899',
		movie: '#f59e0b',
		movies: '#f59e0b',
		hike: '#10b981',
		adventure: '#10b981',
		social: '#8b5cf6'
	}

	$effect(() => {
		if (!authed) return
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
		const key = (slug || label || '').toLowerCase().trim()
		return activityEmojis[key] || '✨'
	}

	function colorForActivity(label: string, slug?: string) {
		const key = (slug || label || '').toLowerCase().trim()
		return activityColors[key] || '#64748b'
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
		createTitle = label === 'Gym'
			? 'Leg Day Crew'
			: label === 'Movies'
				? 'Movie Night'
				: label === 'Adventure'
					? 'Trail Run'
					: label === 'Circus'
						? 'Open Gym'
						: `${label} Hangout`
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
		if (!selectedActivitySlug || !createTitle || !createStartsAt || !createEndsAt) return
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
		void goto('/admin/events/')
	}
</script>

{#if authed}
	{#if toast}
		<div class="social-events__toast" class:social-events__toast--error={toastError} role="status">
			{#if !toastError}✓ {/if}{toast}
		</div>
	{/if}

	<div class="social-events__editor social-events__editor--shell">
		<AdminWysiwygWorkspace
			backLabel="Events"
			modeLabel={preview ? 'Preview' : 'Editing'}
			preview={preview}
			primaryLabel={dashboard.eventsCreating ? 'Creating…' : 'Create'}
			primaryDisabled={dashboard.eventsCreating}
			drawerOpen={!!selectedActivitySlug && drawerOpen}
			onBack={() => goto('/admin/events/')}
			onToggleSettings={() => (drawerOpen = !drawerOpen)}
			onTogglePreview={() => (preview = !preview)}
			onPrimary={() => { void submitCreate() }}
			onCloseDrawer={() => (drawerOpen = false)}
		>
			{#snippet canvas()}
				<div class="social-events__canvas">
					<div class="social-events__picker-grid">
						{#each dashboard.enabledPrograms as program}
							<button type="button" class="social-events__picker-card" class:social-events__picker-card--active={selectedActivitySlug === program.slug} style={`--activity-color: ${colorForActivity(program.label, program.slug)}`} onclick={() => selectCreateActivity(program.slug, program.label)}>
								<span>{emojiForActivity(program.label, program.slug)}</span>
								<span>{program.label}</span>
							</button>
						{/each}
					</div>
					{#if selectedActivitySlug}
						<div class="social-events__hero-icon-wrap">
							<span class="social-events__hero-icon">{emojiForActivity('', selectedActivitySlug)}</span>
						</div>
						<div class="social-events__editable social-events__hero-title" contenteditable={!preview} spellcheck={false} onblur={(event) => (createTitle = event.currentTarget.textContent || '')}>{createTitle || 'New Event'}</div>
						<div class="social-events__editable social-events__hero-sub" contenteditable={!preview} spellcheck={false} onblur={(event) => (createSubtitle = event.currentTarget.textContent || '')}>{createSubtitle || 'Describe this session'}</div>
					{/if}
				</div>
			{/snippet}
			{#snippet drawer()}
				<div class="social-events__drawer-head">
					<strong>Event settings</strong>
					<button type="button" onclick={() => (drawerOpen = false)}>✕</button>
				</div>
				<div class="social-events__drawer-body">
					<label><span>Starts</span><input type="datetime-local" bind:value={createStartsAt} /></label>
					<label><span>Ends</span><input type="datetime-local" bind:value={createEndsAt} /></label>
					<label><span>Spots</span><input type="number" min="2" max="20" bind:value={createCapacity} /></label>
					<label><span>Cost ($)</span><input type="number" min="0" step="1" bind:value={createCostDollars} /></label>
				</div>
			{/snippet}
		</AdminWysiwygWorkspace>
	</div>
{/if}

<style>
	.social-events__editor {
		max-width: 760px;
		margin: 0 auto;
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
		max-width: 36rem;
		margin: 0 auto;
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
		background: color-mix(in srgb, var(--bg) 95%, var(--text) 5%);
		padding: 0.75rem 0.45rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		cursor: pointer;
	}
	.social-events__picker-card--active {
		border-color: color-mix(in srgb, var(--activity-color) 72%, transparent);
		background: color-mix(in srgb, var(--activity-color) 10%, var(--bg) 90%);
	}
	.social-events__hero-icon-wrap { display: flex; justify-content: center; }
	.social-events__hero-icon { font-size: 2.6rem; line-height: 1; }
	.social-events__editable { outline: none; border-radius: 8px; padding: 0.2rem 0.5rem; text-align: center; }
	.social-events__editable:hover { background: color-mix(in srgb, var(--text) 5%, transparent); }
	.social-events__editable:focus { background: color-mix(in srgb, var(--text) 7%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--text) 16%, transparent); }
	.social-events__hero-title { font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--text); }
	.social-events__hero-sub { max-width: 24rem; margin: 0 auto; font-size: 0.95rem; line-height: 1.45; color: color-mix(in srgb, var(--text) 64%, transparent); }
	.social-events__drawer-head { padding: 0.8rem 0.95rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent); }
	.social-events__drawer-head strong { font-size: 0.83rem; color: var(--text); }
	.social-events__drawer-head button { width: 28px; height: 28px; border-radius: 8px; border: none; background: transparent; color: color-mix(in srgb, var(--text) 58%, transparent); cursor: pointer; }
	.social-events__drawer-body { padding: 0.9rem; display: grid; gap: 0.65rem; overflow: auto; }
	.social-events__drawer-body label { display: grid; gap: 0.2rem; }
	.social-events__drawer-body label span { font-size: 0.69rem; font-weight: 600; color: color-mix(in srgb, var(--text) 58%, transparent); }
	.social-events__drawer-body input { width: 100%; min-height: 34px; padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid color-mix(in srgb, var(--text) 15%, transparent); background: var(--bg); color: var(--text); font: inherit; }
	.social-events__toast { position: fixed; left: 50%; bottom: 1rem; transform: translateX(-50%); padding: 0.5rem 1rem; border-radius: 999px; background: color-mix(in srgb, #10b981 88%, var(--bg) 12%); color: var(--bg); font-size: 0.8rem; font-weight: 700; z-index: 140; }
	.social-events__toast--error { background: color-mix(in srgb, #ef4444 85%, var(--bg) 15%); }
	@media (max-width: 720px) {
		.social-events__picker-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>
