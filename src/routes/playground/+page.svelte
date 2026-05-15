<script lang="ts">
	import { Hero } from '@goobits/ui'
	import { ChevronRowCard } from '@calendar/ui/shared'

	type ParkingItem = { href: string; title: string; vibe: string; date?: string }

	let { data } = $props<{
		data: { items: ParkingItem[] }
	}>()

	type Featured = {
		eyebrow: string
		title: string
		blurb: string
		tags: string[]
	}

	const featuredMeta: Record<string, Featured> = {}

	const currentHrefs = new Set<string>(Object.keys(featuredMeta))
	const isCurrentItem = (item: ParkingItem) => currentHrefs.has(item.href)
	const currentItems = $derived(data.items.filter(isCurrentItem))
	const parkingItems = $derived(data.items.filter((item: ParkingItem) => !isCurrentItem(item)))
	const heroCopy = $derived(
		data.items.length === 0
			? { title: "You're done.", subtitle: 'Good job. Nothing here needs fixing today.' }
			: {
					title: 'Pick what to play with.',
					subtitle: `${currentItems.length} current, ${parkingItems.length} future.`
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

	<section class="pg__current">
		<header class="pg__section-head">
			<span class="pg__eyebrow">Now</span>
			<h2 class="pg__section-title">Current work</h2>
			<p class="pg__section-sub">Sketches actively informing the scheduling product.</p>
		</header>

		<div class="pg__current-list">
			{#each currentItems as item (item.href)}
				{@const meta = featuredMeta[item.href]}
				{#if meta}
					<a class="pg__featured" href={item.href} aria-label={`Open ${meta.title}`}>
						<div class="pg__featured-glow" aria-hidden="true"></div>
						<div class="pg__featured-content">
							<header class="pg__featured-head">
								<span class="pg__featured-eyebrow">
									<span class="pg__featured-pulse" aria-hidden="true"></span>
									{meta.eyebrow}
								</span>
								<h3 class="pg__featured-title">{meta.title}</h3>
							</header>
							<p class="pg__featured-blurb">{meta.blurb}</p>
							<footer class="pg__featured-foot">
								<ul class="pg__featured-tags">
									{#each meta.tags as tag}
										<li>{tag}</li>
									{/each}
								</ul>
								<span class="pg__featured-cta" aria-hidden="true">Open <span class="pg__featured-arrow">→</span></span>
							</footer>
						</div>
					</a>
				{:else}
					<ChevronRowCard href={item.href} ariaLabel={`Open ${item.title}`}>
						{#snippet start()}<span class="pg__dot pg__dot--current" aria-hidden="true">·</span>{/snippet}
						<div class="pg__row">
							<span class="pg__row-name">{item.title}</span>
							<span class="pg__row-vibe">{item.vibe}</span>
						</div>
					</ChevronRowCard>
				{/if}
			{/each}
		</div>
	</section>

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

	.pg__current {
		display: grid;
		gap: 0.85rem;
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

	.pg__current-list {
		display: grid;
		gap: 0.6rem;
	}

	.pg__featured {
		position: relative;
		display: block;
		border-radius: 1.1rem;
		padding: 1.25rem 1.4rem 1.15rem;
		text-decoration: none;
		color: inherit;
		overflow: hidden;
		isolation: isolate;
		background:
			linear-gradient(
				135deg,
				color-mix(in srgb, var(--brand-primary) 9%, var(--bg)) 0%,
				color-mix(in srgb, var(--brand-primary) 3%, var(--bg)) 100%
			);
		border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent);
		box-shadow: 0 1px 0 color-mix(in srgb, var(--text) 4%, transparent);
		transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
			box-shadow 200ms ease,
			border-color 200ms ease;
	}

	.pg__featured:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--brand-primary) 48%, transparent);
		box-shadow:
			0 12px 32px -10px color-mix(in srgb, var(--brand-primary) 30%, transparent),
			0 1px 0 color-mix(in srgb, var(--text) 6%, transparent);
	}

	.pg__featured-glow {
		position: absolute;
		inset: -40% -20% auto auto;
		width: 60%;
		height: 120%;
		background: radial-gradient(
			closest-side,
			color-mix(in srgb, var(--brand-primary) 22%, transparent) 0%,
			transparent 70%
		);
		filter: blur(8px);
		pointer-events: none;
		z-index: -1;
	}

	.pg__featured-content {
		display: grid;
		gap: 0.65rem;
	}

	.pg__featured-head { display: grid; gap: 0.3rem; }

	.pg__featured-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--brand-primary) 80%, var(--text) 20%);
	}

	.pg__featured-pulse {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 999px;
		background: var(--brand-primary);
		box-shadow: 0 0 0 0 color-mix(in srgb, var(--brand-primary) 60%, transparent);
		animation: pg-pulse 1.8s ease-out infinite;
	}

	@keyframes pg-pulse {
		0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--brand-primary) 50%, transparent); }
		70% { box-shadow: 0 0 0 0.55rem color-mix(in srgb, var(--brand-primary) 0%, transparent); }
		100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--brand-primary) 0%, transparent); }
	}

	.pg__featured-title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--text);
		text-wrap: balance;
	}

	.pg__featured-blurb {
		margin: 0;
		font-size: 0.82rem;
		line-height: 1.55;
		color: color-mix(in srgb, var(--text) 70%, transparent);
		text-wrap: pretty;
	}

	.pg__featured-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.2rem;
	}

	.pg__featured-tags {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.pg__featured-tags li {
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--brand-primary) 12%, var(--bg));
		color: color-mix(in srgb, var(--brand-primary) 75%, var(--text) 25%);
		border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
	}

	.pg__featured-cta {
		font-size: 0.78rem;
		font-weight: 650;
		color: color-mix(in srgb, var(--brand-primary) 90%, var(--text) 10%);
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.pg__featured-arrow {
		display: inline-block;
		transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.pg__featured:hover .pg__featured-arrow {
		transform: translateX(3px);
	}
	.pg__dot {
		font-size: 1rem;
		color: color-mix(in srgb, var(--text) 32%, transparent);
		line-height: 1;
	}
	.pg__dot--current {
		color: var(--brand-primary);
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
