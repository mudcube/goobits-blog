<script>
  import { AppWindow, Palette, Pipette, Wrench } from "@lucide/svelte";
  import { PageShell, ResultsEmpty, SearchField, ShowcaseHero } from "@miko/ui";
  import { slugify } from "$lib/utils/collections";
  import { formatDateMonthDay } from "$lib/utils/date";
  import {
    formatJournalLabel,
    filterAndSortJournalPosts,
    getFirstCategory,
    getJournalCategories,
    getJournalYearOrder,
    groupJournalPostsByYear,
  } from "@src/domains/journal/viewmodel";
  import { Seo, buildWebPageJsonLd } from "$lib/app/seo";

  let { data } = $props();
  const description =
    "Journal entries from Miko Meow about creative coding, design tools, music experiments, product work, and web development.";

  let searchQuery = $state("");
  let selectedCategory = $state("all");
  let sortBy = $state("newest");
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "title", label: "Title" },
  ];

  const availableCategories = $derived(getJournalCategories(data.posts));
  const categoryIcons = {
    apps: AppWindow,
    "code-art": Palette,
    colrd: Pipette,
    diy: Wrench,
  };
  const heroCategories = $derived(
    availableCategories.slice(0, 4).map((category) => ({
      label: formatJournalLabel(category),
      href: `/journal/category/${slugify(category)}`,
      icon: categoryIcons[category] ?? AppWindow,
    })),
  );
  const filteredPosts = $derived(
    filterAndSortJournalPosts(
      data.posts,
      searchQuery,
      selectedCategory,
      sortBy,
    ),
  );
  const groupedByYear = $derived(groupJournalPostsByYear(filteredPosts));
  const yearOrder = $derived(getJournalYearOrder(groupedByYear));
</script>

<Seo
  title="Creative Coding Journal"
  {description}
  path="/journal/"
  image="/media/journal-journaling.png"
  jsonLd={[
    buildWebPageJsonLd({
      path: "/journal/",
      title: "Creative Coding Journal",
      description,
      type: "CollectionPage",
    }),
  ]}
/>

<PageShell className="journal-page showcase-page showcase-page--journal">
  <div class="showcase-page__inner journal-page__inner">
    <ShowcaseHero
      eyebrow="Journal"
      title="Ideas, process, and"
      titleAccent="notes"
      icon="/media/journal-journaling.png"
      iconAlt="Journal icon"
      intro="Thoughts on creative coding, design tools, music experiments, product work, and the small breakthroughs that happen while building."
      signalLabel="Field Notes No. 027"
      chips={heroCategories}
    />

    <section class="journal-page__toolbar" aria-label="Journal filters">
      <SearchField
        className="journal-page__search"
        inputClassName="journal-page__search-input"
        placeholder="Search posts..."
        ariaLabel="Search posts"
        bind:query={searchQuery}
      />

      <label class="journal-page__select">
        <span class="journal-page__select-label">Category</span>
        <select
          class="ui-form-control ui-form-control--pill ui-form-control--select journal-page__select-control"
          bind:value={selectedCategory}
          aria-label="Category"
        >
          <option value="all">All categories</option>
          {#each availableCategories as category}
            <option value={category}>{formatJournalLabel(category)}</option>
          {/each}
        </select>
      </label>

      <div class="journal-page__sort" role="tablist" aria-label="Sort posts">
        {#each sortOptions as option}
          <button
            type="button"
            role="tab"
            class={`journal-page__sort-button ${sortBy === option.value ? "journal-page__sort-button--active" : ""}`}
            aria-selected={sortBy === option.value}
            onclick={() => (sortBy = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </section>

    {#if filteredPosts.length === 0}
      <ResultsEmpty
        message="No posts match your filters."
        onAction={() => {
          searchQuery = "";
          selectedCategory = "all";
          sortBy = "newest";
        }}
      />
    {:else}
      <p class="journal-page__count">
        {filteredPosts.length}
        {filteredPosts.length === 1 ? "entry" : "entries"}
      </p>

      {#each yearOrder as year}
        <section
          class="journal-page__year-group"
          aria-label={`Posts from ${year}`}
        >
          <h2 class="journal-page__year">{year}</h2>
          <ol class="journal-page__list">
            {#each groupedByYear[year] as post}
              <li class="journal-page__item">
                <article class="journal-page__row">
                  <div class="journal-page__date">
                    {formatDateMonthDay(post.date)}
                  </div>

                  <h3 class="journal-page__post-title">
                    <a href={`/${post.urlPath}`}>{post.metadata.fm.title}</a>
                  </h3>

                  <div class="journal-page__meta">
                    {#if getFirstCategory(post)}
                      <a
                        class="journal-page__tag"
                        href={`/journal/category/${slugify(getFirstCategory(post))}`}
                      >
                        {formatJournalLabel(getFirstCategory(post))}
                      </a>
                    {/if}
                  </div>
                </article>
              </li>
            {/each}
          </ol>
        </section>
      {/each}
    {/if}
  </div>
</PageShell>

<style>
  :global(.ui-page-shell.showcase-page--journal) {
    --showcase-surface: color-mix(in srgb, var(--bg) 94%, var(--brand-primary) 6%);
    --showcase-surface-low: color-mix(in srgb, var(--bg) 88%, var(--brand-primary) 12%);
    --showcase-surface-high: color-mix(in srgb, var(--card-bg) 76%, var(--brand-primary) 24%);
    --showcase-surface-highest: color-mix(in srgb, var(--card-bg) 64%, var(--brand-primary) 36%);
    --showcase-surface-bright: color-mix(in srgb, var(--card-bg) 56%, var(--brand-primary) 44%);
    --showcase-text: var(--text);
    --showcase-muted: var(--muted);
    --showcase-primary: #ffd084;
    --showcase-primary-dim: #e49a38;
    --showcase-secondary: #b8d8ff;
    --showcase-outline-variant: color-mix(in srgb, var(--border) 68%, transparent);
  }

  .journal-page__toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
  }

  :global(.journal-page__search) {
    flex: 1 1 240px;
    min-width: 180px;
  }

  :global(.journal-page__search-input) {
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);
  }

  .journal-page__select {
    display: grid;
    gap: 0.25rem;
  }

  .journal-page__select-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: color-mix(in srgb, var(--muted) 92%, var(--text));
    font-family: var(--font-sans);
  }

  .journal-page__select-control {
    font-family: var(--font-sans);
    font-size: var(--font-size-xs);
    color: color-mix(in srgb, var(--muted) 92%, var(--text));
    padding: 0.6rem 0.95rem;
    cursor: pointer;
  }

  .journal-page__sort {
    display: inline-flex;
    align-items: center;
    border: 1.5px solid color-mix(in srgb, var(--border) 70%, transparent);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }

  .journal-page__sort-button {
    border: none;
    background: transparent;
    color: color-mix(in srgb, var(--muted) 92%, var(--text));
    font-family: var(--font-sans);
    font-size: var(--font-size-xs);
    padding: 0.6rem 0.95rem;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .journal-page__sort-button--active {
    background: var(--text);
    color: var(--bg);
  }

  .journal-page__count {
    margin: 1rem 0 0.5rem;
    font-size: var(--font-size-xs);
    color: color-mix(in srgb, var(--muted) 92%, var(--text));
    font-family: var(--font-sans);
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
  }

  .journal-page__year-group {
    margin-bottom: 2rem;
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
  }

  .journal-page__year {
    margin: 0;
    padding-top: 2.5rem;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.25rem;
    letter-spacing: -0.015em;
    color: var(--text);
  }

  .journal-page__list {
    margin: 0;
    padding: 0.5rem 0 0;
    list-style: none;
  }

  .journal-page__item {
    margin: 0;
    padding: 0;
  }

  .journal-page__row {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
    transition:
      opacity 0.2s,
      border-color 0.2s;
  }

  .journal-page__row:hover {
    opacity: 0.7;
    border-bottom-color: color-mix(in srgb, var(--border) 85%, transparent);
  }

  .journal-page__date {
    font-size: var(--font-size-xs);
    font-family: var(--font-sans);
    color: color-mix(in srgb, var(--muted) 92%, var(--text));
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .journal-page__post-title {
    margin: 0;
    min-width: 0;
    font-family: var(--font-sans);
    font-weight: 400;
    font-size: var(--font-size-sm);
    letter-spacing: -0.005em;
  }

  .journal-page__post-title a {
    text-decoration: none;
    color: var(--text);
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .journal-page__post-title a:hover {
    color: var(--link-hover);
  }

  .journal-page__meta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
    white-space: nowrap;
  }

  .journal-page__tag {
    display: inline-flex;
    align-items: center;
    font-size: 0.6875rem;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    color: color-mix(in srgb, var(--link) 70%, var(--text));
    background: color-mix(in srgb, var(--link) 9%, transparent);
    text-decoration: none;
  }

  .journal-page__tag:hover {
    background: color-mix(in srgb, var(--link-hover) 10%, transparent);
    color: color-mix(in srgb, var(--link-hover) 72%, var(--text));
  }

  @media (max-width: 860px) {
    .journal-page__row {
      grid-template-columns: 1fr;
      gap: 0.45rem;
    }

    .journal-page__post-title a {
      white-space: normal;
      overflow: visible;
      text-overflow: initial;
    }

    .journal-page__meta {
      justify-content: space-between;
    }
  }
</style>
