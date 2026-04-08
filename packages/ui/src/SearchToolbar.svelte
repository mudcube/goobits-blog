<script lang="ts">
  import type { Snippet } from "svelte";
  import SearchField from "./forms/SearchField.svelte";

  type SearchToolbarProps = {
    query?: string;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
    children?: Snippet;
  };

  let {
    query = $bindable(""),
    placeholder = "Search...",
    ariaLabel = "Search",
    className = "",
    children,
  }: SearchToolbarProps = $props();
</script>

<div class={`ui-search-toolbar ${className}`.trim()}>
  <SearchField bind:query {placeholder} {ariaLabel} />
  <div class="ui-search-toolbar__controls">
    {@render children?.()}
  </div>
</div>
