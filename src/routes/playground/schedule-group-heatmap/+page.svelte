<script lang="ts">
	import DevHero from '../DevHero.svelte'
	import GroupHeatmap from './GroupHeatmap.svelte'
	import type { GroupDay, GroupPerson } from './types'

	type PageData = {
		days: GroupDay[]
		people: GroupPerson[]
		slotLen: number
		hourStart: number
		hourEnd: number
	}

	const { data }: { data: PageData } = $props()

	let selected = $state<string | null>(null)

	const selectedDetail = $derived.by(() => {
		const key = selected
		if (!key) return null
		const colonIdx = key.indexOf(':')
		if (colonIdx < 0) return null
		const dayId = key.slice(0, colonIdx)
		const min = Number(key.slice(colonIdx + 1))
		const day = data.days.find((d) => d.id === dayId)
		if (!day) return null
		const free = data.people.filter((p) => p.availableSlots.includes(key))
		return { day, min, free }
	})

	function fmt(min: number) {
		const h24 = Math.floor(min / 60)
		const m = min % 60
		const h12 = h24 % 12 === 0 ? 12 : h24 % 12
		const ampm = h24 < 12 || h24 === 24 ? 'am' : 'pm'
		return `${h12}:${m.toString().padStart(2, '0')}${ampm}`
	}
</script>

<svelte:head>
	<title>Group Availability Heatmap · Playground</title>
</svelte:head>

<div class="playground-page">
	<DevHero
		title="Group Availability Heatmap"
		subtitle="When can the whole group meet? Darker cells = more people free."
		breadcrumbItems={[{ label: 'Playground', href: '/playground/' }, { label: 'Group Heatmap' }]}
	/>

	<div class="playground-page__shell">
		<header class="playground-page__head">
			<h2 class="playground-page__title">Find the overlap</h2>
			<p class="playground-page__subtitle">
				Star marks the best available slot. Click a cell to see who's free.
			</p>
		</header>

		<GroupHeatmap
			days={data.days}
			people={data.people}
			hourStart={data.hourStart}
			hourEnd={data.hourEnd}
			slotLen={data.slotLen}
			bind:selected
		/>

		{#if selectedDetail}
			<aside class="picked">
				<h4 class="picked__title">
					{selectedDetail.day.dayLabel}, {selectedDetail.day.dateLabel} · {fmt(selectedDetail.min)}
				</h4>
				{#if selectedDetail.free.length === 0}
					<p class="picked__empty">No one is free at this time.</p>
				{:else}
					<p class="picked__count">
						<strong>{selectedDetail.free.length} of {data.people.length}</strong> free:
					</p>
					<ul class="picked__list">
						{#each selectedDetail.free as p}
							<li>
								<span class="picked__dot" style="background:{p.color};"></span>
								{p.name}
							</li>
						{/each}
					</ul>
				{/if}
			</aside>
		{/if}
	</div>
</div>

<style>
	.playground-page {
		max-width: 60rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}
	.playground-page__shell {
		margin-top: 1.5rem;
	}
	.playground-page__head {
		margin: 0 0 0.85rem;
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
	.picked {
		margin-top: 1.5rem;
		padding: 0.85rem 1rem;
		border: 1px solid color-mix(in srgb, var(--book-accent) 35%, transparent);
		background: color-mix(in srgb, var(--book-accent) 5%, transparent);
		border-radius: 0.625rem;
	}
	.picked__title {
		margin: 0 0 0.5rem;
		font-size: 0.9rem;
		font-weight: 650;
	}
	.picked__count {
		margin: 0 0 0.4rem;
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}
	.picked__list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.85rem;
	}
	.picked__list li {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.picked__dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 999px;
	}
	.picked__empty {
		margin: 0;
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--text) 55%, transparent);
		font-style: italic;
	}
</style>
