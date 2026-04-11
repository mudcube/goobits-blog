<script>
	import { Filter } from '@lucide/svelte'
	import {
		FilterChipGroup,
		FilterableCollection,
		PageContainer,
		PageShell,
		SearchToolbar,
		SegmentedControl,
		ShowcaseHero,
		SitemapCategory
	} from '@miko/ui'
	import { formatDateMmDdYyyy } from '$lib/utils/date'
	import {
		getFilteredSitemapCount,
		getFilteredSitemapGroups,
		getRouteTags,
		getSitemapAvailableTags
	} from '@src/domains/sitemap/viewmodel'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'

	const { data } = $props()

	let searchQuery = $state('')
	let selectedTags = $state([])
	let sortBy = $state('path')
	let collapsedCategories = $state({})
	const description = 'A human-readable sitemap for MIKO.ART with public pages and journal entries.'
	const sortOptions = [
		{ value: 'path', label: 'Path' },
		{ value: 'name', label: 'Name' },
		{ value: 'modified', label: 'Recent' }
	]

	const availableTags = $derived(getSitemapAvailableTags(data.showDevDiagnostics))

	const categoryOrder = [
		'Main Pages',
		'Journal Pages',
		'Journal Posts',
		'Admin Pages',
		'API Routes',
		'Utility Pages'
	]
	const accentColors = [
		'#ec4899',
		'#f59e0b',
		'#eab308',
		'#22c55e',
		'#14b8a6',
		'#3b82f6',
		'#8b5cf6',
		'#f43f5e',
		'#f97316'
	]

	function hashString(input) {
		let h = 0
		for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0
		return Math.abs(h)
	}

	function getAccentColor(category) {
		const idx = hashString(category || '') % accentColors.length
		return accentColors[idx]
	}
	function toggleCategory(category) {
		collapsedCategories[category] = !collapsedCategories[category]
	}

	const filteredGrouped = $derived(getFilteredSitemapGroups(data.grouped, searchQuery, selectedTags, sortBy))
	const filteredCount = $derived(getFilteredSitemapCount(filteredGrouped))
</script>

<Seo
	title="Sitemap"
	{description}
	path="/sitemap/"
	image="/media/sitemap-compass.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: '/sitemap/',
			title: 'Sitemap',
			description
		})
	]}
/>

<PageShell className="sitemap-page showcase-page showcase-page--sitemap">
	<div class="showcase-page__inner sitemap-page__inner">
		<ShowcaseHero
			eyebrow="Sitemap"
			title="A friendly map of"
			titleAccent="everything here"
			icon="/media/sitemap-compass.png"
			iconAlt="Compass icon"
			intro="A human-readable map of public pages, journal entries, and the standard routes that shape the site."
			signalLabel={`${data.stats.total} routes indexed`}
		/>

		<PageContainer className="sitemap-page__content">
			<FilterableCollection
				count={filteredCount}
				countLabel={`of ${data.stats.total} routes`}
				emptyMessage="No routes match your filters."
				onClear={() => { searchQuery = ''; selectedTags = [] }}
			>
				{#snippet toolbar()}
					<div class="sitemap-page__controls">
						<SearchToolbar bind:query={searchQuery} placeholder="Search routes..." ariaLabel="Search routes">
							<div class="sitemap-page__filters">
								<div class="sitemap-page__tag-filters">
									<span class="sitemap-page__filter-label">
										<Filter size={13} strokeWidth={2.2} />
										<span>Filters</span>
									</span>
									<FilterChipGroup
										className="sitemap-page__tag-filter-group"
										items={availableTags}
										bind:selected={selectedTags}
										multiple={true}
										ariaLabel="Sitemap filters"
									/>
								</div>

								<div class="sitemap-page__sort-view">
									<SegmentedControl
										className="sitemap-page__sort-toggle"
										options={sortOptions}
										bind:value={sortBy}
										ariaLabel="Sort routes"
									/>
								</div>
							</div>
						</SearchToolbar>
					</div>
				{/snippet}

				{#each categoryOrder as category}
					{#if filteredGrouped[category]}
						<SitemapCategory
							category={category}
							count={filteredGrouped[category].length}
							collapsed={Boolean(collapsedCategories[category])}
							onToggle={() => toggleCategory(category)}
							accent={getAccentColor(category)}
							routes={filteredGrouped[category]}
							getRouteTags={getRouteTags}
							formatDate={formatDateMmDdYyyy}
						/>
					{/if}
				{/each}
			</FilterableCollection>
		</PageContainer>
	</div>
</PageShell>

<style>
	:global(.sitemap-page) {
		--showcase-surface: color-mix(in srgb, var(--bg) 95%, #5d8c7b 5%);
		--showcase-surface-low: color-mix(in srgb, var(--bg) 91%, #5d8c7b 9%);
		--showcase-surface-high: color-mix(in srgb, var(--card-bg) 82%, #a7b8c9 18%);
		--showcase-surface-highest: color-mix(in srgb, var(--card-bg) 74%, #a7b8c9 26%);
		--showcase-surface-bright: color-mix(in srgb, var(--card-bg) 68%, #e6c7a1 32%);
		--showcase-text: var(--text);
		--showcase-muted: color-mix(in srgb, var(--muted) 92%, var(--text));
		--showcase-primary: #5d8c7b;
		--showcase-primary-dim: #3e675a;
		--showcase-secondary: #a7b8c9;
		--showcase-outline-variant: color-mix(in srgb, var(--border) 72%, transparent);
		--showcase-glow-primary: rgba(93, 140, 123, 0.08);
		--showcase-glow-secondary: rgba(167, 184, 201, 0.08);
		--showcase-hero-shadow: rgba(12, 18, 20, 0.08);
	}

	.sitemap-page__inner {
		--sitemap-controls-gap: 0.7rem;
		--sitemap-filters-gap: 0.6rem;
		--sitemap-tag-gap: 0.35rem;
		--sitemap-filter-label-gap: 0.3rem;
		--sitemap-filter-label-size: 0.78rem;
		--sitemap-sort-gap: 0.35rem;
	}

	.sitemap-page__controls {
		display: grid;
		gap: var(--sitemap-controls-gap);
		margin-bottom: 1.25rem;
	}

	:global(.sitemap-page__content) {
		width: 100%;
		max-width: var(--max-width);
		justify-self: center;
		padding-top: var(--space-6);
	}

	.sitemap-page__filters {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--sitemap-filters-gap);
		align-items: center;
		margin-top: 0.5rem;
	}

	.sitemap-page__tag-filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sitemap-tag-gap);
	}

	.sitemap-page__filter-label {
		display: inline-flex;
		align-items: center;
		gap: var(--sitemap-filter-label-gap);
		font-size: var(--sitemap-filter-label-size);
		color: var(--muted);
		margin-right: 0.35rem;
		padding-right: 0.1rem;
	}

	.sitemap-page__sort-view {
		display: flex;
		gap: var(--sitemap-sort-gap);
		justify-self: end;
	}

	@media (max-width: 600px) {
		.sitemap-page__filters {
			grid-template-columns: 1fr;
			align-items: stretch;
		}

		.sitemap-page__sort-view {
			justify-self: start;
		}
	}
</style>
