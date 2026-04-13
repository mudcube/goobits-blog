<script>
  import {
    AppWindow,
    ArrowUpRight,
    Palette,
    Pipette,
    Wrench,
  } from "@lucide/svelte";
  import { PageShell, ResultsEmpty, SearchField, ShowcaseHero } from "@miko/ui";
  import { slugify } from "$lib/utils/collections";
  import { Seo, buildWebPageJsonLd } from "$lib/app/seo";
  import {
    filterAndSortJournalPosts,
    formatJournalLabel,
    getFirstCategory,
    getJournalCategories,
    getJournalCoverImage,
  } from "@miko/blog";

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

  function formatJournalDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  function getJournalRowTokens(post) {
    const tokens = [];
    const categories = Array.isArray(post.metadata.fm?.categories)
      ? post.metadata.fm.categories
      : [];
    const tags = Array.isArray(post.metadata.fm?.tags) ? post.metadata.fm.tags : [];

    for (const category of categories.slice(0, 2)) {
      tokens.push({ label: formatJournalLabel(category), tone: "accent" });
    }
    for (const tag of tags.slice(0, Math.max(0, 2 - tokens.length))) {
      tokens.push({ label: formatJournalLabel(tag), tone: "muted" });
    }

    return tokens;
  }
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
      titleAccent="field notes"
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

      <section class="journal-page__archive" aria-label="Journal archive">
        <div class="journal-page__archive-head">
          <p class="journal-page__archive-kicker">Field log archive</p>
          <p class="journal-page__archive-caption">
            A denser journal index for scanning chronology, topics, and entry trails at a glance.
          </p>
        </div>

        <div class="journal-page__table-wrap">
          <table class="journal-page__table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Entry Detail</th>
                <th>Taxonomy</th>
                <th class="journal-page__table-link-head">Link</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredPosts as post}
                <tr class="journal-page__table-row">
                  <td class="journal-page__table-date">
                    <span>{formatJournalDate(post.date)}</span>
                    <span class="journal-page__table-date-year">{post.year}</span>
                  </td>

                  <td class="journal-page__table-entry">
                    <a href={`/${post.urlPath}`} class="journal-page__table-entry-link">
                      <span class="journal-page__table-thumb">
                        {#if getJournalCoverImage(post)}
                          <img
                            src={getJournalCoverImage(post)}
                            alt={post.metadata.fm.title}
                            loading="lazy"
                          />
                        {:else}
                          <span class="journal-page__table-thumb-fallback">
                            {formatJournalLabel(getFirstCategory(post) || "Journal")}
                          </span>
                        {/if}
                      </span>

                      <span class="journal-page__table-entry-copy">
                        <span class="journal-page__table-entry-title">
                          {post.metadata.fm.title}
                        </span>
                        <span class="journal-page__table-entry-meta">
                          {#if getFirstCategory(post)}
                            Filed under {formatJournalLabel(getFirstCategory(post))}
                          {:else}
                            Journal entry
                          {/if}
                        </span>
                      </span>
                    </a>
                  </td>

                  <td class="journal-page__table-taxonomy">
                    <div class="journal-page__table-token-list">
                      {#each getJournalRowTokens(post) as token}
                        <span
                          class={`journal-page__table-token journal-page__table-token--${token.tone}`}
                        >
                          {token.label}
                        </span>
                      {/each}
                    </div>
                  </td>

                  <td class="journal-page__table-link">
                    <a href={`/${post.urlPath}`} aria-label={`Open ${post.metadata.fm.title}`}>
                      <ArrowUpRight size={18} strokeWidth={2.1} />
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
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
    margin: 1.1rem 0 0.1rem;
    font-size: var(--font-size-xs);
    color: color-mix(in srgb, var(--muted) 92%, var(--text));
    font-family: var(--font-sans);
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  .journal-page__archive {
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
    margin-top: 0.5rem;
  }

  .journal-page__archive-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.15rem;
    flex-wrap: wrap;
  }

  .journal-page__archive-kicker,
  .journal-page__archive-caption {
    margin: 0;
  }

  .journal-page__archive-kicker {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--showcase-secondary);
    font-family: var(--font-sans);
  }

  .journal-page__archive-caption {
    color: color-mix(in srgb, var(--muted) 88%, var(--text));
    font-size: var(--font-size-sm);
    max-width: 38rem;
  }

  .journal-page__table-wrap {
    overflow-x: auto;
  }

  .journal-page__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 0.85rem;
  }

  .journal-page__table th {
    padding: 0 1.25rem 0.55rem;
    text-align: left;
    font-family: var(--font-sans);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: color-mix(in srgb, var(--muted) 78%, transparent);
    font-weight: 600;
  }

  .journal-page__table-link-head {
    text-align: right;
  }

  .journal-page__table-row td {
    padding: 1.2rem 1.25rem;
    vertical-align: top;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--showcase-surface-high) 66%, transparent) 0%,
        color-mix(in srgb, var(--showcase-surface) 88%, transparent) 100%
      );
    border-top: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    transition:
      transform 0.18s ease,
      background-color 0.18s ease,
      border-color 0.18s ease;
  }

  .journal-page__table-row:hover td {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--showcase-primary) 30%, var(--border));
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--showcase-surface-bright) 60%, transparent) 0%,
        color-mix(in srgb, var(--showcase-surface-high) 86%, transparent) 100%
      );
  }

  .journal-page__table-row td:first-child {
    border-left: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    border-radius: 1.2rem 0 0 1.2rem;
  }

  .journal-page__table-row td:last-child {
    border-right: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
    border-radius: 0 1.2rem 1.2rem 0;
  }

  .journal-page__table-date {
    width: 10rem;
    font-family: var(--font-sans);
    display: grid;
    gap: 0.2rem;
  }

  .journal-page__table-date > span:first-child {
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--muted) 90%, var(--text));
  }

  .journal-page__table-date-year {
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--muted) 70%, transparent);
  }

  .journal-page__table-entry {
    min-width: 0;
  }

  .journal-page__table-entry-link {
    display: grid;
    grid-template-columns: 4.4rem minmax(0, 1fr);
    gap: 1rem;
    align-items: center;
    text-decoration: none;
    color: inherit;
  }

  .journal-page__table-thumb {
    width: 4.4rem;
    height: 4.4rem;
    border-radius: 1rem;
    overflow: hidden;
    background:
      radial-gradient(circle at 18% 14%, rgba(184, 216, 255, 0.3) 0%, transparent 35%),
      linear-gradient(
        160deg,
        color-mix(in srgb, var(--showcase-primary) 24%, var(--showcase-surface-highest)) 0%,
        color-mix(in srgb, var(--showcase-secondary) 18%, var(--showcase-surface-high)) 100%
      );
    border: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
    display: grid;
    place-items: center;
  }

  .journal-page__table-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .journal-page__table-thumb-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem;
    text-align: center;
    font-family: var(--font-sans);
    font-size: 0.58rem;
    line-height: 1.35;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--showcase-text) 78%, var(--showcase-secondary));
  }

  .journal-page__table-entry-copy {
    min-width: 0;
    display: grid;
    gap: 0.35rem;
  }

  .journal-page__table-entry-title {
    font-family: var(--font-serif);
    font-size: clamp(1.02rem, 1.35vw, 1.35rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: var(--showcase-text);
    transition: color 0.18s ease;
    text-wrap: balance;
  }

  .journal-page__table-row:hover .journal-page__table-entry-title {
    color: color-mix(in srgb, var(--showcase-primary) 72%, var(--showcase-text));
  }

  .journal-page__table-entry-meta {
    font-family: var(--font-sans);
    font-size: 0.78rem;
    color: color-mix(in srgb, var(--muted) 88%, var(--text));
    line-height: 1.55;
  }

  .journal-page__table-taxonomy {
    width: 15rem;
  }

  .journal-page__table-token-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .journal-page__table-token {
    display: inline-flex;
    align-items: center;
    padding: 0.42rem 0.72rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
    font-family: var(--font-sans);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    white-space: nowrap;
  }

  .journal-page__table-token--accent {
    background: color-mix(in srgb, var(--showcase-secondary) 16%, transparent);
    color: color-mix(in srgb, var(--showcase-secondary) 74%, var(--showcase-text));
  }

  .journal-page__table-token--muted {
    background: color-mix(in srgb, var(--showcase-surface-highest) 72%, transparent);
    color: color-mix(in srgb, var(--muted) 88%, var(--showcase-text));
  }

  .journal-page__table-link {
    width: 4.5rem;
    text-align: right;
    vertical-align: middle;
  }

  .journal-page__table-link a {
    color: color-mix(in srgb, var(--muted) 84%, var(--showcase-text));
    transition:
      color 0.18s ease,
      transform 0.18s ease;
    display: inline-flex;
  }

  .journal-page__table-row:hover .journal-page__table-link a {
    color: var(--showcase-secondary);
    transform: translate(2px, -2px);
  }

  @media (max-width: 760px) {
    .journal-page__table {
      border-spacing: 0 0.75rem;
    }

    .journal-page__table thead {
      display: none;
    }

    .journal-page__table,
    .journal-page__table tbody,
    .journal-page__table tr,
    .journal-page__table td {
      display: block;
      width: 100%;
    }

    .journal-page__table-row td {
      border-left: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-right: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
      border-radius: 0;
      padding: 0.9rem 1rem;
    }

    .journal-page__table-row td:first-child {
      border-radius: 1rem 1rem 0 0;
    }

    .journal-page__table-row td:last-child {
      border-radius: 0 0 1rem 1rem;
      text-align: left;
    }

    .journal-page__table-entry-link {
      grid-template-columns: 3.5rem minmax(0, 1fr);
      gap: 0.8rem;
    }

    .journal-page__table-thumb {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 0.8rem;
    }

    .journal-page__table-taxonomy,
    .journal-page__table-date,
    .journal-page__table-link {
      width: 100%;
    }
  }
</style>
