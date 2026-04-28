<script lang="ts">
	import { untrack } from 'svelte'
	import { CalendarPillButton } from '@calendar/ui'
	import DevHero from '../DevHero.svelte'
	import WeeklyTimeGrid from './WeeklyTimeGrid.svelte'
	import type { RecurringSlot } from './+page.server'

	const { data } = $props<{ data: { slots: RecurringSlot[]; hourStart: number; hourEnd: number } }>()

	let mode = $state<'browse' | 'author'>('browse')
	let slots = $state<RecurringSlot[]>(untrack(() => [...data.slots]))
	let selectedId = $state<string | null>(null)
	let nextId = $state(untrack(() => slots.length + 1))

	function addSlot(day: number, startMin: number) {
		const id = `s-new-${nextId++}`
		slots = [
			...slots,
			{
				id,
				day,
				startMin,
				durationMin: 60,
				title: 'New class',
				color: '#7a5af8'
			}
		]
		selectedId = id
	}

	const selectedSlot = $derived(slots.find((s) => s.id === selectedId) ?? null)
</script>

<svelte:head>
	<title>Recurring Grid Prototype · Playground</title>
</svelte:head>

<div class="playground-page">
	<DevHero
		title="Recurring Grid"
		subtitle="Weekly schedule for classes — author mode for the studio, browse mode for students."
		breadcrumbItems={[{ label: 'Playground', href: '/playground/' }, { label: 'Recurring Grid' }]}
	/>

	<div class="playground-page__shell">
		<header class="playground-page__head">
			<h2 class="playground-page__title">Weekly schedule</h2>
			<p class="playground-page__subtitle">
				{mode === 'author' ? 'Click any empty cell to add a class.' : 'Click a class to pick it.'}
			</p>
		</header>

		<div class="mode-toggle">
			<CalendarPillButton
				variant={mode === 'browse' ? 'primary' : 'secondary'}
				size="sm"
				onClick={() => (mode = 'browse')}
			>Browse</CalendarPillButton>
			<CalendarPillButton
				variant={mode === 'author' ? 'primary' : 'secondary'}
				size="sm"
				onClick={() => (mode = 'author')}
			>Author</CalendarPillButton>
		</div>

		<WeeklyTimeGrid
			{slots}
			hourStart={data.hourStart}
			hourEnd={data.hourEnd}
			{mode}
			bind:selectedId
			onAddSlot={addSlot}
		/>

		{#if selectedSlot}
			<p class="playground-page__last-action">
				Picked <strong>{selectedSlot.title}</strong> on day {selectedSlot.day} starting {Math.floor(selectedSlot.startMin / 60)}:{(selectedSlot.startMin % 60).toString().padStart(2, '0')}.
			</p>
		{/if}
	</div>
</div>

<style>
	.playground-page {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}
	.playground-page__shell {
		margin-top: 1.5rem;
	}
	.playground-page__head {
		margin: 0 0 0.75rem;
	}
	.playground-page__title {
		margin: 0 0 0.25rem;
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.playground-page__subtitle {
		margin: 0;
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}
	.mode-toggle {
		display: inline-flex;
		gap: 0.4rem;
		margin: 0 0 0.85rem;
	}
	.playground-page__last-action {
		margin-top: 1rem;
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}
</style>
