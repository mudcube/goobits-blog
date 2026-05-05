<script lang="ts">
	import { Hero } from '@miko/ui'
	import { ChevronRowCard } from '@calendar/ui/shared'

	type ParkingItem = { href: string; title: string; vibe: string; date?: string }

	let { data } = $props<{
		data: { items: ParkingItem[] }
	}>()

	const parkingItems = $derived(data.items)
	const heroCopy = $derived(
		parkingItems.length === 0
			? { title: "You're done.", subtitle: 'Good job. Nothing here needs fixing today.' }
			: {
					title: 'Pick what to play with.',
					subtitle: `${parkingItems.length} sketch${parkingItems.length === 1 ? '' : 'es'} parked below.`
				}
	)
</script>

<svelte:head>
	<title>Playground</title>
</svelte:head>

<div class="pg">
	<Hero
		title={heroCopy.title}
		subtitle={heroCopy.subtitle}
		icon="/media/page-icons/labs-flask.png"
		iconAlt="Flask"
		compact
		className="pg__hero"
	/>

	<section class="pg__future">
		<header class="pg__section-head">
			<span class="pg__eyebrow">🙈 Parking lot</span>
			<h2 class="pg__section-title">Future ideas</h2>
			<p class="pg__section-sub">Sketches for problems nobody has yet.</p>
		</header>

		{#if parkingItems.length === 0}
			<p class="pg__empty">Empty. Truly nothing parked.</p>
		{:else}
			<div class="pg__row-list">
				{#each parkingItems as item (item.href)}
					<ChevronRowCard href={item.href} ariaLabel={`Open ${item.title}`}>
						{#snippet start()}<span class="pg__dot" aria-hidden="true">·</span>{/snippet}
						<div class="pg__row">
							<span class="pg__row-name">{item.title}</span>
							<span class="pg__row-vibe">{item.vibe}</span>
						</div>
					</ChevronRowCard>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.pg {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1rem 1.25rem 4rem;
		display: grid;
		gap: 3rem;
	}

	:global(.pg__hero.ui-hero) {
		margin-bottom: 0;
	}

	.pg__future {
		display: grid;
		gap: 0.85rem;
		opacity: 0.72;
		filter: saturate(0.7);
		transition: opacity 220ms ease, filter 220ms ease;
	}
	.pg__future:hover {
		opacity: 0.95;
		filter: saturate(1);
	}
	.pg__section-head {
		display: grid;
		gap: 0.2rem;
		padding-bottom: 0.45rem;
		border-bottom: 1px dashed color-mix(in srgb, var(--text) 14%, transparent);
	}
	.pg__eyebrow {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}
	.pg__section-title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 650;
		letter-spacing: -0.005em;
		color: color-mix(in srgb, var(--text) 80%, transparent);
	}
	.pg__section-sub {
		margin: 0;
		font-size: 0.78rem;
		line-height: 1.5;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}
	.pg__row-list {
		display: grid;
		gap: 0.35rem;
	}
	.pg__dot {
		font-size: 1rem;
		color: color-mix(in srgb, var(--text) 32%, transparent);
		line-height: 1;
	}
	.pg__row {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}
	.pg__row-name {
		font-size: 0.82rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 75%, transparent);
	}
	.pg__row-vibe {
		font-size: 0.7rem;
		color: color-mix(in srgb, var(--text) 48%, transparent);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.pg__empty {
		margin: 0;
		padding: 1rem;
		text-align: center;
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--text) 50%, transparent);
		border: 1px dashed color-mix(in srgb, var(--text) 14%, transparent);
		border-radius: 0.625rem;
	}
</style>
