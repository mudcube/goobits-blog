<script lang="ts">
	import type { AdminBootstrap } from '@calendar/core'
	import { untrack } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { GripVertical } from '@lucide/svelte'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import { getActivityColor, getActivityIcon } from '@calendar/ui/shared'
	import { formatEventDayLabel } from '@calendar/ui/shared'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import AdminLoadingText from '@calendar/ui/admin/shared/AdminLoadingText.svelte'
	import Tooltip from '@calendar/ui/shared/Tooltip.svelte'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import { getAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
	import { withAdminRoute } from '@calendar/ui/config'

	const { data } = $props<{ data: { user: unknown | null; bootstrap?: AdminBootstrap | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	untrack(() => {
		if (data.bootstrap) dashboard.bootstrap(data.bootstrap)
	})
	const authed = $derived(!!data.user)
	const mockMode = $derived(isAdminMockMode($page.url))
	const adminMockCatalog = getAdminMockCatalog()
	let mockProgramOrder = $state<string[]>([])
	const rawProgramsSource = $derived(mockMode ? adminMockCatalog.programs : dashboard.programs)
	const baseProgramsSource = $derived(
		rawProgramsSource.toSorted((a, b) => {
			if (mockMode && mockProgramOrder.length > 0) {
				return mockProgramOrder.indexOf(a.slug) - mockProgramOrder.indexOf(b.slug)
			}
			return a.sortOrder - b.sortOrder
		})
	)
	const programsSource = $derived.by(() => {
		if (!previewOrder) return baseProgramsSource
		const lookup = new Map(baseProgramsSource.map((program) => [program.slug, program]))
		return previewOrder
			.map((slug) => lookup.get(slug))
			.filter((program): program is (typeof baseProgramsSource)[number] => !!program)
	})
	const eventsSource = $derived((mockMode ? adminMockCatalog.dashboardEvents : dashboard.events))
	const recentEventsSource = $derived((mockMode ? adminMockCatalog.dashboardRecentEvents : dashboard.recentEvents))
	let draggingSlug = $state<string | null>(null)
	let previewOrder = $state<string[] | null>(null)

	type EventCardExtra = {
		startsAt: string
		seatsTaken: number
		capacity: number
		participants?: { name?: string | null; displayName?: string | null }[]
	}

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	$effect(() => {
		if (!authed || mockMode) return
		if (data.bootstrap) return
		dashboard.loadPrograms()
		dashboard.loadEvents()
	})

	$effect(() => {
		if (!mockMode || mockProgramOrder.length > 0) return
		mockProgramOrder = adminMockCatalog.programs
			.toSorted((a, b) => a.sortOrder - b.sortOrder)
			.map((program) => program.slug)
	})

	function dayLabel(iso: string) {
		return formatEventDayLabel(iso)
	}

	function eventRoute(ev: { id?: number | string | null; activitySlug?: string | null }) {
		const idNum = Number(ev.id)
		if (Number.isFinite(idNum) && idNum > 0) {
			return withAdminRoute(`events/detail/${idNum}/`)
		}
		if (ev.activitySlug) return withAdminRoute(`events/program/${ev.activitySlug}/`)
		return withAdminRoute('events/')
	}

	function timeLabel(iso: string) {
		const date = new Date(iso)
		const minutes = date.getMinutes()
		if (minutes === 0) {
			return date.toLocaleTimeString(undefined, { hour: 'numeric' })
		}
		return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
	}

	function isPast(iso: string) {
		return new Date(iso).getTime() < Date.now()
	}

	function initialsFor(participant: { name?: string | null; displayName?: string | null } | undefined, index: number) {
		const raw = participant?.displayName || participant?.name
		if (!raw) return `#${index + 1}`
		const parts = raw.trim().split(/\s+/).filter(Boolean)
		const first = parts[0]?.charAt(0) ?? ''
		const second = parts[1]?.charAt(0) ?? ''
		return `${first}${second}`.toUpperCase() || raw.slice(0, 2).toUpperCase()
	}

	function eventCardExtra(item: { extra?: unknown }) {
		return item.extra as EventCardExtra
	}

	function baseOrder() {
		return baseProgramsSource.map((program) => program.slug)
	}

	function reorderArray(order: string[], from: number, to: number): string[] {
		if (from < 0 || to < 0 || from === to) return order
		const next = [...order]
		const [item] = next.splice(from, 1)
		if (!item) return order
		next.splice(to, 0, item)
		return next
	}

	async function persistOrder(order: string[]) {
		if (mockMode) {
			mockProgramOrder = order
			return
		}
		await dashboard.reorderPrograms(order)
	}

	function onDragStart(event: DragEvent, slug: string) {
		draggingSlug = slug
		previewOrder = baseOrder()
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move'
			event.dataTransfer.setData('text/plain', slug)
		}
	}

	function onDragOver(event: DragEvent, targetSlug: string) {
		if (!draggingSlug || !previewOrder) return
		event.preventDefault()
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
		if (draggingSlug === targetSlug) return
		const fromIndex = previewOrder.indexOf(draggingSlug)
		const toIndex = previewOrder.indexOf(targetSlug)
		if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
		previewOrder = reorderArray(previewOrder, fromIndex, toIndex)
	}

	function onDrop(event: DragEvent) {
		event.preventDefault()
		const finalOrder = previewOrder
		const sourceSlug = draggingSlug
		draggingSlug = null
		previewOrder = null
		if (!sourceSlug || !finalOrder) return
		const original = baseOrder()
		if (finalOrder.join('|') === original.join('|')) return
		void persistOrder(finalOrder)
	}

	function onDragEnd() {
		draggingSlug = null
		previewOrder = null
	}
</script>

{#if authed}
	<div class="social-events admin-content">
		<AdminPageHero
			eyebrow="Programs"
			title="Programs & Events"
			subtitle="Manage program pages and scheduled events."
		/>

		<h4>PROGRAMS{#if mockMode || dashboard.programsLoaded} ({programsSource.length}){/if}</h4>
		{#if !mockMode && !dashboard.programsLoaded}
			<AdminLoadingText text="Loading programs…" />
		{:else if programsSource.length === 0}
			<div class="social-events__empty calendar-ui-card">No programs yet.</div>
		{:else}
			<div class="social-events__programs">
				{#each programsSource as program, i (program.slug)}
					{@const ActivityIcon = getActivityIcon(program.label, program.slug)}
					{#if i > 0}<div class="social-events__program-divider"></div>{/if}
					<div
						class="social-events__program"
						class:social-events__program--dragging={draggingSlug === program.slug}
						draggable="true"
						role="listitem"
						ondragstart={(event) => onDragStart(event, program.slug)}
						ondragover={(event) => onDragOver(event, program.slug)}
						ondrop={onDrop}
						ondragend={onDragEnd}
					>
						<button
							type="button"
							class="social-events__program-main"
							onclick={() => goto(hrefWithMock(withAdminRoute(`events/program/${program.slug}/`)))}
							aria-label={`Open ${program.label}`}
						>
							<div
								class="social-events__program-icon"
								style={`--activity-color:${getActivityColor(program.label, program.slug)};`}
								aria-hidden="true"
							>
								<ActivityIcon size={14} strokeWidth={2.2} />
							</div>
							<div class="social-events__program-copy">
								<div class="social-events__program-label">{program.label}</div>
								<div class="social-events__program-detail">{program.enabled ? 'Live' : 'Draft'}</div>
							</div>
						</button>
						<Tooltip text="Drag to reorder" placement="left">
							<span class="social-events__program-grip" aria-hidden="true">
								<GripVertical size={16} strokeWidth={1.8} />
							</span>
						</Tooltip>
					</div>
				{/each}
			</div>
		{/if}

		<h4>UPCOMING</h4>
		{#if !mockMode && !dashboard.eventsLoaded}
			<AdminLoadingText text="Loading events…" />
		{:else}
			<AdminMetaCards
				items={eventsSource.map((ev) => {
					const past = isPast(ev.startsAt)
					const spotsLeft = Math.max(ev.capacity - ev.seatsTaken, 0)
					return {
						id: String(ev.id),
						label: ev.title,
						detail: `${dayLabel(ev.startsAt)} · ${ev.activityLabel} · ${past ? 'finished' : `${spotsLeft} spots left`}`,
						dotColor: getActivityColor(ev.activityLabel, ev.activitySlug || undefined),
						dotIcon: getActivityIcon(ev.activityLabel, ev.activitySlug || undefined),
						dimmed: past,
						onClick: () => goto(hrefWithMock(eventRoute(ev))),
						ariaLabel: `Open ${ev.title}`,
						extra: ev,
					}
				})}
				emptyText="No upcoming events yet."
			>
				{#snippet right(item)}
					{@const ev = eventCardExtra(item)}
					<div class="social-events__time">{timeLabel(ev.startsAt)}</div>
					<div class="social-events__people">
						<span class="social-events__avatar social-events__avatar--you" title="You">You</span>
						{#each (ev.participants || []).slice(0, 3) as participant, i (i)}
							<span class="social-events__avatar" title={participant.displayName || participant.name || ''}>{initialsFor(participant, i)}</span>
						{/each}
						<span class="social-events__count">
							{ev.seatsTaken}{isPast(ev.startsAt) ? ' went' : ` of ${ev.capacity}`}
						</span>
					</div>
				{/snippet}
			</AdminMetaCards>
		{/if}

		<h4>PAST</h4>
		{#if !mockMode && !dashboard.eventsLoaded}
			<AdminLoadingText text="Loading past events…" />
		{:else}
			<AdminMetaCards
				items={recentEventsSource.slice(0, 8).map((recent) => ({
					id: String(recent.id || recent.title),
					label: recent.title,
					detail: `${dayLabel(recent.startsAt)} · ${recent.seatsTaken} went`,
					dotColor: getActivityColor(recent.activityLabel, recent.activitySlug),
					dotIcon: getActivityIcon(recent.activityLabel, recent.activitySlug),
				}))}
				emptyText="No past events yet."
			/>
		{/if}
	</div>
{/if}

<style>
	.social-events {
		display: grid;
		gap: 1rem;
	}

	.social-events__programs {
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		background: var(--admin-card-bg);
		overflow: hidden;
	}

	.social-events__program-divider {
		height: 1px;
		background: color-mix(in srgb, var(--admin-card-border) 60%, transparent);
	}

	.social-events__program {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: stretch;
		min-height: 4rem;
		position: relative;
		transition: background 120ms ease, opacity 120ms ease;
	}

	.social-events__program--dragging {
		opacity: 0.4;
		background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
	}

	.social-events__program:hover {
		background: color-mix(in srgb, var(--admin-accent) 6%, transparent);
	}

	.social-events__program-main {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		min-width: 0;
		border: none;
		background: transparent;
		color: inherit;
		text-align: left;
		font: inherit;
		padding: 0.75rem 0.875rem;
		cursor: pointer;
	}

	.social-events__program-icon {
		--activity-color: var(--admin-accent);
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--activity-color) 14%, transparent);
		color: color-mix(in srgb, var(--activity-color) 88%, var(--text) 12%);
		border: 1px solid color-mix(in srgb, var(--activity-color) 28%, transparent);
	}

	.social-events__program-copy {
		min-width: 0;
	}

	.social-events__program-label {
		font-size: 0.875rem;
		font-weight: 650;
		line-height: 1.3;
	}

	.social-events__program-detail {
		margin-top: 0.1rem;
		font-size: 0.6875rem;
		line-height: 1.35;
		color: color-mix(in srgb, var(--text) 42%, transparent);
	}

	.social-events__program-grip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.85rem;
		color: var(--admin-text-faint);
		cursor: grab;
		touch-action: none;
	}

	.social-events__program-grip:active {
		cursor: grabbing;
	}

	.social-events__program:hover .social-events__program-grip {
		color: var(--admin-text-soft);
	}

	.social-events__empty {
		padding: 0.8rem 0.95rem;
		font-size: 0.8rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	.social-events__time {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--admin-text-soft);
		white-space: nowrap;
	}

	.social-events__people {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	:global(.social-events__avatar) {
		width: 1.3rem;
		height: 1.3rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		font-size: 0.48rem;
		font-weight: 700;
		background: color-mix(in srgb, var(--text) 8%, transparent);
		color: color-mix(in srgb, var(--text) 65%, transparent);
		flex-shrink: 0;
	}

	:global(.social-events__avatar--you) {
		background: color-mix(in srgb, var(--admin-accent) 20%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
	}

	:global(.social-events__count) {
		margin-left: 0.25rem;
		font-size: 0.68rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 45%, transparent);
	}

	@media (max-width: 720px) {
		.social-events__program {
			grid-template-columns: 1fr auto;
		}
	}

</style>
