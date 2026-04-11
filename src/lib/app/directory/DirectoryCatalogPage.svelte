<script lang="ts">
  import { PageShell, ResultsEmpty, SearchField, ShowcaseHero } from "@miko/ui";
  import { formatDateMmDdYyyy } from "$lib/utils/date";
  import {
    filterAndSortDirectoryItems,
    type DirectoryItem,
    type DirectorySort,
  } from "$lib/app/directory/viewmodel";

  let {
    eyebrow,
    title,
    subtitle,
    icon,
    iconAlt,
    items,
    emptyMessage = "No entries match your filters.",
    itemLabel = "item",
  }: {
    eyebrow: string;
    title: string;
    subtitle: string;
    icon: string;
    iconAlt: string;
    items: DirectoryItem[];
    emptyMessage?: string;
    itemLabel?: string;
  } = $props();

  let searchQuery = $state("");
  let sortBy = $state<DirectorySort>("title");

  const sortOptions = [
    { value: "title" as const, label: "Name" },
    { value: "path" as const, label: "Path" },
  ];

  const accentColors = [
    "#ec4899",
    "#f59e0b",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#3b82f6",
    "#8b5cf6",
    "#f43f5e",
    "#f97316",
  ];

  function hashString(input: string) {
    let h = 0;
    for (let i = 0; i < input.length; i++)
      h = (h * 31 + input.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function getAccentColor(item: DirectoryItem) {
    const idx = hashString(item.href || item.title || "") % accentColors.length;
    return accentColors[idx];
  }

  const filteredItems = $derived(
    filterAndSortDirectoryItems(items, searchQuery, sortBy),
  );
</script>

<PageShell className="directory-page showcase-page">
  <div class="showcase-page__inner directory-page__inner">
    <ShowcaseHero
      {eyebrow}
      {title}
      intro={subtitle}
      {icon}
      {iconAlt}
      signalLabel={`${items.length} ${itemLabel}${items.length === 1 ? "" : "s"} indexed`}
    />

    <section class="directory-page__toolbar" aria-label={`${title} filters`}>
      <SearchField
        className="directory-page__search"
        inputClassName="directory-page__search-input"
        placeholder={`Search ${itemLabel}s...`}
        ariaLabel={`Search ${itemLabel}s`}
        bind:query={searchQuery}
      />

      <div
        class="directory-page__chip-group"
        role="tablist"
        aria-label={`Sort ${title}`}
      >
        {#each sortOptions as option}
          <button
            type="button"
            role="tab"
            class={`directory-page__chip ${sortBy === option.value ? "directory-page__chip--active" : ""}`}
            aria-selected={sortBy === option.value}
            onclick={() => (sortBy = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </section>

    {#if filteredItems.length === 0}
      <ResultsEmpty
        message={emptyMessage}
        onAction={() => {
          searchQuery = "";
          sortBy = "title";
        }}
      />
    {:else}
      <p class="directory-page__count">
        {filteredItems.length}
        {itemLabel}{filteredItems.length === 1 ? "" : "s"}
      </p>

      <ul class="directory-page__grid" aria-label={title}>
        {#each filteredItems as item}
          <li class="directory-page__item">
            <a
              href={item.href}
              class="directory-page__card"
              style={`--accent:${getAccentColor(item)};`}
            >
              <div class="directory-page__bar" aria-hidden="true"></div>

              <div class="directory-page__card-body">
                <div class="directory-page__card-head">
                  <h2 class="directory-page__card-title">{item.title}</h2>
                  {#if item.date}
                    {@const parsed = new Date(item.date)}
                    <span
                      class="directory-page__date"
                      title={formatDateMmDdYyyy(parsed)}
                    >
                      {parsed.getFullYear()}
                    </span>
                  {/if}
                </div>
                <p class="directory-page__vibe">{item.vibe}</p>
                <p class="directory-page__path">{item.href}</p>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</PageShell>

<style>
  .directory-page {
    --showcase-surface: color-mix(in srgb, var(--bg) 95%, #7a8ca5 5%);
    --showcase-surface-low: color-mix(in srgb, var(--bg) 91%, #7a8ca5 9%);
    --showcase-surface-high: color-mix(in srgb, var(--card-bg) 82%, #7a8ca5 18%);
    --showcase-surface-highest: color-mix(in srgb, var(--card-bg) 72%, #e7d7b1 28%);
    --showcase-surface-bright: color-mix(in srgb, var(--card-bg) 68%, #e7d7b1 32%);
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

  .directory-page__toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
  }

  :global(.directory-page__search) {
    flex: 1 1 220px;
    min-width: 160px;
  }

  :global(.directory-page__search-input) {
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);
  }

  .directory-page__chip-group {
    display: inline-flex;
    align-items: center;
    border: 1.5px solid color-mix(in srgb, var(--border) 70%, transparent);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }

  .directory-page__chip {
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

  .directory-page__chip--active {
    background: var(--text);
    color: var(--bg);
  }

  .directory-page__count {
    margin: 1rem 0 0.5rem;
    font-size: var(--font-size-xs);
    color: color-mix(in srgb, var(--muted) 92%, var(--text));
    font-family: var(--font-sans);
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
  }

  .directory-page__grid {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
  }

  .directory-page__item {
    margin: 0;
    padding: 0;
  }

  .directory-page__card {
    --card-border: color-mix(in srgb, var(--border) 60%, transparent);
    display: flex;
    flex-direction: column;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid var(--card-border);
    text-decoration: none;
    color: var(--text);
    background: color-mix(in srgb, var(--card-bg) 76%, transparent);
    height: 100%;
    transition:
      transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .directory-page__card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px color-mix(in srgb, var(--text) 10%, transparent);
    border-color: color-mix(in srgb, var(--border) 86%, transparent);
  }

  .directory-page__bar {
    height: 6px;
    background: linear-gradient(
      135deg,
      var(--accent),
      color-mix(in srgb, var(--accent) 55%, transparent)
    );
    opacity: 0.72;
  }

  .directory-page__card-body {
    padding: 1.25rem 1.375rem 1.375rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 10.75rem;
  }

  .directory-page__card-head {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    justify-content: space-between;
  }

  .directory-page__card-title {
    margin: 0 0 0.35rem;
    font-size: clamp(1.05rem, 1.5vw, 1.22rem);
    line-height: 1.15;
    letter-spacing: -0.03em;
    font-family: var(--font-display);
  }

  .directory-page__date {
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--muted) 88%, var(--text));
    white-space: nowrap;
    font-family: var(--font-sans);
  }

  .directory-page__vibe {
    margin: 0.2rem 0 1rem;
    font-size: 0.95rem;
    line-height: 1.55;
    color: color-mix(in srgb, var(--muted) 90%, var(--text));
  }

  .directory-page__path {
    margin: auto 0 0;
    font-size: 0.72rem;
    line-height: 1.45;
    color: color-mix(in srgb, var(--muted) 84%, var(--text));
    font-family: var(--font-mono, monospace);
    word-break: break-all;
  }
</style>
