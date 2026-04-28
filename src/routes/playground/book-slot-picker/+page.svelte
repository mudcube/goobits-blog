<script lang="ts">
	import { CalendarPillButton, StepIndicator } from '@calendar/ui'
	import DevHero from '../DevHero.svelte'
	import type { Slot } from './+page.server'

	const { data } = $props<{ data: { slots: Slot[]; dateLabel: string } }>()

	let selectedId = $state<string | null>(null)

	function pick(id: string) {
		selectedId = id
	}

	function fmt(min: number) {
		const h24 = Math.floor(min / 60)
		const m = min % 60
		const h12 = h24 % 12 === 0 ? 12 : h24 % 12
		const ampm = h24 < 12 ? 'am' : 'pm'
		return `${h12}:${m.toString().padStart(2, '0')}${ampm}`
	}

	type Section = { id: string; label: string; slots: Slot[] }

	const sections = $derived.by<Section[]>(() => {
		const morning: Slot[] = []
		const afternoon: Slot[] = []
		const evening: Slot[] = []
		for (const s of data.slots as Slot[]) {
			const h = Math.floor(s.startMin / 60)
			if (h < 12) morning.push(s)
			else if (h < 17) afternoon.push(s)
			else evening.push(s)
		}
		const out: Section[] = []
		if (morning.length) out.push({ id: 'morning', label: 'Morning', slots: morning })
		if (afternoon.length) out.push({ id: 'afternoon', label: 'Afternoon', slots: afternoon })
		if (evening.length) out.push({ id: 'evening', label: 'Evening', slots: evening })
		return out
	})

	const selectedSlot = $derived(
		(data.slots as Slot[]).find((s) => s.id === selectedId) ?? null
	)

	function availableCount(slots: Slot[]) {
		return slots.filter((s) => s.available).length
	}
</script>

<svelte:head>
	<title>Slot Picker Prototype · Playground</title>
</svelte:head>

<div class="playground-page">
	<DevHero
		title="Slot Picker"
		subtitle="Fixed time slots — for restaurants, classes, and structured services."
		breadcrumbItems={[{ label: 'Playground', href: '/playground/' }, { label: 'Slot Picker' }]}
	/>

	<div class="playground-page__shell">
		<StepIndicator current={1} maxReached={1} labels={['Date', 'Time', 'Confirm']} />

		<header class="playground-page__head">
			<h2 class="playground-page__title">{data.dateLabel}</h2>
			<p class="playground-page__subtitle">Pick a time. Greyed slots are already booked.</p>
		</header>

		<div class="slot-sections">
			{#each sections as section (section.id)}
				<section class="slot-section">
					<header class="slot-section__head">
						<h4 class="slot-section__label">{section.label}</h4>
						<span class="slot-section__count">{availableCount(section.slots)} of {section.slots.length} open</span>
					</header>
					<div class="slot-section__container">
						<div class="slot-grid">
							{#each section.slots as slot (slot.id)}
								<CalendarPillButton
									variant={selectedId === slot.id ? 'primary' : 'secondary'}
									size="sm"
									disabled={!slot.available}
									onClick={() => pick(slot.id)}
									ariaLabel={`Pick ${fmt(slot.startMin)}`}
								>
									{fmt(slot.startMin)}
								</CalendarPillButton>
							{/each}
						</div>
					</div>
				</section>
			{/each}
		</div>

		{#if selectedSlot}
			<p class="playground-page__last-action">
				Picked <strong>{fmt(selectedSlot.startMin)}</strong> ({selectedSlot.durationMin} min) — next would confirm.
			</p>
		{/if}
	</div>
</div>

<style>
	.playground-page {
		max-width: 56rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}
	.playground-page__shell {
		margin-top: 1.5rem;
	}
	.playground-page__head {
		margin: 1.5rem 0 1rem;
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
	.slot-sections {
		display: grid;
		gap: 1.25rem;
	}
	.slot-section__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		margin: 0 0 0.45rem;
	}
	.slot-section__label {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}
	.slot-section__count {
		font-size: 0.7rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 45%, transparent);
	}
	.slot-section__container {
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		background: var(--admin-card-bg);
		padding: 0.75rem 0.875rem;
	}
	.slot-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
		gap: 0.5rem;
	}
	.playground-page__last-action {
		margin-top: 1.25rem;
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}
</style>
