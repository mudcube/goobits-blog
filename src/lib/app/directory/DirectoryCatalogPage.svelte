<script lang="ts">
  import { PageShell, ResultsEmpty, SearchField, ShowcaseHero } from "@miko/ui";
  import { formatDateMmDdYyyy } from "$lib/utils/date";
  import {
    filterAndSortDirectoryItems,
    type DirectoryItem,
    type DirectorySort,
  } from "$lib/app/directory/viewmodel";

  let {
    pageClass = "",
    eyebrow,
    title,
    titleAccent = "",
    subtitle,
    icon,
    iconAlt,
    items,
    emptyMessage = "No entries match your filters.",
    itemLabel = "item",
    signalLabel = "",
    sectionTitle = "Directory",
    sectionKicker = "",
    showPoster = false,
  }: {
    pageClass?: string;
    eyebrow: string;
    title: string;
    titleAccent?: string;
    subtitle: string;
    icon: string;
    iconAlt: string;
    items: DirectoryItem[];
    emptyMessage?: string;
    itemLabel?: string;
    signalLabel?: string;
    sectionTitle?: string;
    sectionKicker?: string;
    showPoster?: boolean;
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

  function getPosterCode(item: DirectoryItem) {
    const words = item.title
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) return "LAB";
    if (words.length === 1) return words[0]!.slice(0, 4).toUpperCase();
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  function getPosterStatus(item: DirectoryItem) {
    return item.date ? "Archive" : "Live";
  }

  const filteredItems = $derived(
    filterAndSortDirectoryItems(items, searchQuery, sortBy),
  );
</script>

<PageShell className={`directory-page showcase-page ${pageClass}`.trim()}>
  <div class="showcase-page__inner directory-page__inner">
    <ShowcaseHero
      {eyebrow}
      {title}
      {titleAccent}
      intro={subtitle}
      {icon}
      {iconAlt}
      signalLabel={signalLabel || `${items.length} ${itemLabel}${items.length === 1 ? "" : "s"} indexed`}
    />

    <section class="directory-page__catalog" aria-label={`${title} catalog`}>
      <div class="directory-page__catalog-head">
        <div>
          <h2 class="directory-page__catalog-title">{sectionTitle}</h2>
          {#if sectionKicker}
            <p class="directory-page__catalog-kicker">{sectionKicker}</p>
          {/if}
        </div>
        <span class="directory-page__catalog-filter">
          {filteredItems.length} {itemLabel}{filteredItems.length === 1 ? "" : "s"}
        </span>
      </div>

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
          role="group"
          aria-label={`Sort ${title}`}
        >
          {#each sortOptions as option}
            <button
              type="button"
              class={`directory-page__chip ${sortBy === option.value ? "directory-page__chip--active" : ""}`}
              aria-pressed={sortBy === option.value}
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
        <ul class="directory-page__grid" aria-label={title}>
          {#each filteredItems as item}
            <li class="directory-page__item">
              <a
                href={item.href}
                class="directory-page__card"
                style={`--accent:${getAccentColor(item)};`}
              >
                {#if showPoster}
                  <div class="directory-page__card-art" aria-hidden="true">
                    <div class="directory-page__card-orbit directory-page__card-orbit--one"></div>
                    <div class="directory-page__card-orbit directory-page__card-orbit--two"></div>
                    <div class="directory-page__card-art-meta">
                      <span>{getPosterStatus(item)}</span>
                      <span>{item.date ? new Date(item.date).getFullYear() : "Now"}</span>
                    </div>
                    <div class="directory-page__card-glyph">{getPosterCode(item)}</div>
                    <div class="directory-page__card-path-mark">{item.href.replace(/^\/labs\//, "").replace(/\/$/, "")}</div>
                  </div>
                {:else}
                  <div class="directory-page__bar" aria-hidden="true"></div>
                {/if}

                <div class="directory-page__card-body">
                  <div class="directory-page__card-head">
                    <span class="directory-page__eyebrow">
                      {item.date ? 'Archived Experiment' : 'Open Experiment'}
                    </span>
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
                  <h2 class="directory-page__card-title">{item.title}</h2>
                  <p class="directory-page__vibe">{item.vibe}</p>
                  <p class="directory-page__path">{item.href}</p>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
</PageShell>

<style>
  .directory-page {
    --showcase-surface: color-mix(in srgb, var(--bg) 94%, #4f46e5 6%);
    --showcase-surface-low: color-mix(in srgb, var(--bg) 88%, #4f46e5 12%);
    --showcase-surface-high: color-mix(in srgb, var(--card-bg) 76%, #3b82f6 24%);
    --showcase-surface-highest: color-mix(in srgb, var(--card-bg) 66%, #8b5cf6 34%);
    --showcase-surface-bright: color-mix(in srgb, var(--card-bg) 58%, #22d3ee 42%);
    --showcase-text: var(--text);
    --showcase-muted: color-mix(in srgb, var(--muted) 92%, var(--text));
    --showcase-primary: #8b5cf6;
    --showcase-primary-dim: #4f46e5;
    --showcase-secondary: #22d3ee;
    --showcase-outline-variant: color-mix(in srgb, var(--border) 72%, transparent);
    --showcase-glow-primary: rgba(139, 92, 246, 0.12);
    --showcase-glow-secondary: rgba(34, 211, 238, 0.08);
    --showcase-hero-shadow: rgba(11, 16, 34, 0.16);
  }

  .directory-page__catalog {
    position: relative;
    isolation: isolate;
    display: grid;
    gap: 0;
    padding: var(--space-10) 0 var(--space-12);
  }

  .directory-page__catalog::before {
    position: absolute;
    inset: 0 auto 0 50%;
    z-index: -1;
    width: 100vw;
    transform: translateX(-50%);
    content: "";
    background:
      radial-gradient(circle at 12% 0, rgba(34, 211, 238, 0.06) 0%, rgba(34, 211, 238, 0) 24rem),
      radial-gradient(circle at 88% 12%, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0) 30rem),
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--showcase-surface-low) 92%, transparent) 0%,
        color-mix(in srgb, var(--showcase-surface) 72%, transparent) 100%
      );
    pointer-events: none;
  }

  .directory-page__catalog-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: var(--space-6);
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
    margin-bottom: var(--space-8);
  }

  .directory-page__catalog-title {
    margin: 0 0 var(--space-2);
    color: var(--showcase-text);
    font-family: var(--font-serif);
    font-size: clamp(1.45rem, 2.8vw, 1.75rem);
    font-weight: 400;
    letter-spacing: -0.015em;
    line-height: 1.18;
  }

  .directory-page__catalog-kicker,
  .directory-page__catalog-filter {
    margin: 0;
    color: var(--showcase-muted);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .directory-page__catalog-filter {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0 var(--space-4);
    border: var(--border-width) solid color-mix(in srgb, var(--showcase-secondary) 22%, transparent);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--showcase-surface-high) 92%, transparent);
    color: var(--showcase-text);
    white-space: nowrap;
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
    border: 1px solid color-mix(in srgb, var(--showcase-secondary) 22%, transparent);
    border-radius: var(--radius-pill);
    overflow: hidden;
    background: color-mix(in srgb, var(--showcase-surface-high) 76%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--showcase-text) 4%, transparent);
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
    background: linear-gradient(90deg, var(--showcase-primary), var(--showcase-primary-dim));
    color: #fff;
  }

  .directory-page__grid {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-7);
    width: 100%;
    max-width: var(--max-width);
    justify-self: center;
  }

  .directory-page__item {
    margin: 0;
    padding: 0;
  }

  .directory-page__card {
    --card-border: color-mix(in srgb, var(--showcase-secondary) 12%, var(--border));
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 1.125rem;
    overflow: hidden;
    border: 1px solid var(--card-border);
    text-decoration: none;
    color: var(--showcase-text);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--showcase-surface-bright) 8%, transparent) 0%, transparent 42%),
      linear-gradient(180deg, var(--showcase-surface-high) 0%, var(--showcase-surface-highest) 100%);
    box-shadow: 0 24px 60px -28px rgba(0, 0, 0, 0.45);
    height: 100%;
    transition:
      transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .directory-page__card:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 70px -28px color-mix(in srgb, var(--accent) 28%, rgba(0, 0, 0, 0.62));
    border-color: color-mix(in srgb, var(--accent) 44%, transparent);
  }

  .directory-page__card-art {
    position: relative;
    min-height: 9.5rem;
    overflow: hidden;
    padding: 1rem 1.1rem;
    border-bottom: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    background:
      radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 34%),
      radial-gradient(circle at 82% 78%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 28%),
      linear-gradient(160deg, color-mix(in srgb, var(--showcase-surface-highest) 88%, #020617) 0%, color-mix(in srgb, var(--showcase-surface-high) 94%, #020617) 100%);
  }

  .directory-page__card-art-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    color: color-mix(in srgb, var(--showcase-secondary) 78%, var(--showcase-text));
    font-size: 0.66rem;
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .directory-page__card-glyph {
    position: relative;
    z-index: 1;
    margin-top: 1.1rem;
    color: color-mix(in srgb, white 82%, var(--accent));
    font-family: var(--font-mono, monospace);
    font-size: clamp(2rem, 4vw, 2.8rem);
    line-height: 0.95;
    letter-spacing: -0.08em;
    text-transform: uppercase;
  }

  .directory-page__card-path-mark {
    position: absolute;
    right: 1rem;
    bottom: 0.9rem;
    max-width: 60%;
    color: color-mix(in srgb, var(--showcase-text) 48%, transparent);
    font-family: var(--font-mono, monospace);
    font-size: 0.68rem;
    line-height: 1.35;
    text-align: right;
    word-break: break-word;
  }

  .directory-page__card-orbit {
    position: absolute;
    border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
    border-radius: 999px;
    opacity: 0.9;
  }

  .directory-page__card-orbit--one {
    inset: auto auto 1.3rem -1.3rem;
    width: 6.5rem;
    height: 6.5rem;
  }

  .directory-page__card-orbit--two {
    inset: 1rem -1.1rem auto auto;
    width: 4.25rem;
    height: 4.25rem;
  }

  .directory-page__bar {
    height: 7px;
    background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 45%, #fff));
    opacity: 0.95;
  }

  .directory-page__card-body {
    padding: 1.1rem 1.25rem 1.3rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 12rem;
  }

  .directory-page__card-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-content: space-between;
    margin-bottom: 0.8rem;
  }

  .directory-page__eyebrow {
    color: color-mix(in srgb, var(--showcase-secondary) 84%, var(--showcase-text));
    font-size: 0.68rem;
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .directory-page__card-title {
    margin: 0 0 0.45rem;
    font-size: clamp(1.12rem, 1.5vw, 1.3rem);
    line-height: 1.1;
    letter-spacing: -0.028em;
    font-family: var(--font-serif);
    font-weight: 400;
  }

  .directory-page__date {
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--showcase-muted) 80%, var(--showcase-text));
    white-space: nowrap;
    font-family: var(--font-sans);
  }

  .directory-page__vibe {
    margin: 0.2rem 0 1rem;
    font-size: 0.95rem;
    line-height: 1.55;
    color: color-mix(in srgb, var(--showcase-muted) 90%, var(--showcase-text));
  }

  .directory-page__path {
    margin: auto 0 0;
    font-size: 0.72rem;
    line-height: 1.45;
    color: color-mix(in srgb, var(--showcase-muted) 82%, var(--showcase-text));
    font-family: var(--font-mono, monospace);
    word-break: break-all;
  }

  :global(.directory-page--labs .directory-page__grid) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  :global(.directory-page--labs .showcase-hero) {
    padding-top: var(--space-9);
    padding-bottom: var(--space-9);
  }

  :global(.directory-page--labs .showcase-hero::before) {
    background:
      radial-gradient(circle at 76% 18%, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0) 34%),
      radial-gradient(circle at 18% 2%, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0) 28%),
      linear-gradient(
        180deg,
        rgba(10, 18, 40, 0.34) 0%,
        color-mix(in srgb, var(--showcase-surface-low) 84%, transparent) 42%,
        color-mix(in srgb, var(--showcase-surface-low) 92%, transparent) 100%
      ),
      transparent;
  }

  :global(.directory-page--labs .showcase-hero__copy) {
    max-width: 40rem;
  }

  :global(.directory-page--labs .showcase-hero__title) {
    max-width: 13ch;
    font-size: clamp(2.35rem, 5vw, 3.8rem);
    line-height: 1.06;
    letter-spacing: -0.032em;
  }

  :global(.directory-page--labs .showcase-hero__intro) {
    max-width: 42rem;
    font-size: clamp(1rem, 1.45vw, 1.12rem);
    color: color-mix(in srgb, var(--showcase-muted) 84%, var(--showcase-text));
  }

  :global(.directory-page--labs .showcase-hero__signal) {
    margin-top: var(--space-10);
    color: color-mix(in srgb, var(--showcase-secondary) 78%, var(--showcase-text));
  }

  :global(.directory-page--labs .showcase-hero__title-icon) {
    width: clamp(2.15rem, 4.5vw, 2.9rem);
    height: clamp(2.15rem, 4.5vw, 2.9rem);
    filter: drop-shadow(0 0 24px rgba(139, 92, 246, 0.22));
  }

  :global(.directory-page--labs .directory-page__card) {
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--showcase-surface-bright) 10%, transparent) 0%, transparent 30%),
      linear-gradient(180deg, var(--showcase-surface-high) 0%, var(--showcase-surface-highest) 100%);
  }

  :global(.directory-page--labs .directory-page__card:hover .directory-page__card-glyph) {
    transform: translateY(-2px);
  }

  :global(.directory-page--labs .directory-page__card-glyph) {
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    .directory-page__catalog {
      padding-top: var(--space-9);
    }

    .directory-page__catalog-head {
      align-items: stretch;
      flex-direction: column;
    }

    :global(.directory-page--labs .directory-page__grid) {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
