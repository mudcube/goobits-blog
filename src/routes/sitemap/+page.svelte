<script>
	import {
		BookOpen,
		CalendarClock,
		CalendarCog,
		Compass,
		FileText,
		Filter,
		Shield,
		Terminal,
		Wrench
	} from '@lucide/svelte'
	import {
		FilterChipGroup,
		PageShell,
		SearchToolbar,
		SegmentedControl,
		ShowcaseHero,
		ShowcaseSection,
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
	let collapsedCategories = $state({ 'Journal Posts': true })
	const description = 'A human-readable sitemap for MIKO.ART with public pages, journal entries, and optional internal routes.'
	const sortOptions = [
		{ value: 'path', label: 'Path' },
		{ value: 'name', label: 'Name' },
		{ value: 'modified', label: 'Recent' }
	]

	const availableTags = $derived(getSitemapAvailableTags(data.canViewInternalRoutes))

	const categoryMeta = {
		'Main Pages':     { tone: 'primary',   icon: Compass },
		'Journal Pages':  { tone: 'primary',   icon: BookOpen },
		'Journal Posts':  { tone: 'primary',   icon: FileText },
		'Scheduling':     { tone: 'primary',   icon: CalendarClock },
		'Admin Pages':    { tone: 'secondary', icon: Shield },
		'API Routes':     { tone: 'secondary', icon: Terminal },
		'Scheduling API': { tone: 'secondary', icon: CalendarCog },
		'Utility Pages':  { tone: 'secondary', icon: Wrench }
	}
	const categoryOrder = Object.keys(categoryMeta)

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
	image="/media/page-icons/sitemap-compass.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: '/sitemap/',
			title: 'Sitemap',
			description
		})
	]}
/>

<PageShell className="sitemap-page showcase-page showcase-page--sitemap">
	<div class="showcase-page__inner">
		<ShowcaseHero
			eyebrow="Sitemap"
			title="A friendly map of"
			titleAccent="everything here"
			icon="/media/page-icons/sitemap-compass.png"
			iconAlt="Compass icon"
			intro="A human-readable map of public pages, journal entries, and, when enabled locally, internal routes that shape the site."
			signalLabel={`${data.stats.total} routes indexed`}
		/>

		<ShowcaseSection
			title="Route Index"
			kicker={`${filteredCount} of ${data.stats.total} routes · grouped by surface`}
			filterLabel="View // Routes"
		>
			{#snippet toolbar()}
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

						<SegmentedControl
							className="sitemap-page__sort-toggle"
							options={sortOptions}
							bind:value={sortBy}
							ariaLabel="Sort routes"
						/>
					</div>
				</SearchToolbar>
			{/snippet}

			{#if filteredCount === 0}
				<p class="sitemap-page__empty">No routes match your filters.</p>
			{:else}
				{#each categoryOrder as category}
					{#if filteredGrouped[category]}
						<SitemapCategory
							{category}
							count={filteredGrouped[category].length}
							tone={categoryMeta[category].tone}
							icon={categoryMeta[category].icon}
							collapsed={Boolean(collapsedCategories[category])}
							onToggle={() => toggleCategory(category)}
							routes={filteredGrouped[category]}
							{getRouteTags}
							formatDate={formatDateMmDdYyyy}
						/>
					{/if}
				{/each}
			{/if}
		</ShowcaseSection>
	</div>
</PageShell>

<style>
	:global(.sitemap-page) {
		font-family: var(--font-ui-sans, var(--font-sans));
		/* Match the default page background — no wash. */
		--showcase-surface: var(--bg);
		--showcase-surface-low: var(--bg);
		--showcase-surface-high: var(--card-bg);
		--showcase-surface-highest: var(--card-bg);
		--showcase-surface-bright: var(--card-bg);
		--showcase-text: var(--text);
		--showcase-muted: color-mix(in srgb, var(--muted) 92%, var(--text));
		/* Green only shows through text, rails, and a faint hero glow. */
		--showcase-primary: #5d8c7b;
		--showcase-primary-dim: #3e675a;
		--showcase-secondary: #7a92aa;
		--showcase-outline-variant: color-mix(in srgb, var(--border) 72%, transparent);
		--showcase-glow-primary: rgba(93, 140, 123, 0.12);
		--showcase-glow-secondary: rgba(122, 146, 170, 0.06);
		--showcase-hero-shadow: transparent;
	}

	/* Breathing room before the footer — the section has no CTA below it.
	   Specificity must match showcase.css's `.ui-page-shell.ui-page-shell.showcase-page` override. */
	:global(.ui-page-shell.ui-page-shell.sitemap-page) {
		padding-bottom: var(--space-12);
	}

	:global(.sitemap-page .showcase-section) {
		padding-bottom: var(--space-10);
	}

	.sitemap-page__filters {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-4);
		align-items: center;
		margin-top: var(--space-3);
	}

	.sitemap-page__tag-filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.sitemap-page__filter-label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--font-size-xs);
		color: var(--showcase-muted);
	}

	.sitemap-page__empty {
		padding: var(--space-8) 0;
		text-align: center;
		color: var(--showcase-muted);
		font-size: var(--font-size-sm);
	}

	@media (max-width: 600px) {
		.sitemap-page__filters {
			grid-template-columns: 1fr;
		}
	}
</style>
