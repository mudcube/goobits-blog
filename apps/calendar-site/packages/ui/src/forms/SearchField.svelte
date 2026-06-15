<script lang="ts">
  import { Search } from "@lucide/svelte";

  type SearchFieldProps = {
    query?: string;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
    inputClassName?: string;
  };

  let {
    query = $bindable(""),
    placeholder = "Search...",
    ariaLabel = "Search",
    className = "",
    inputClassName = "",
  }: SearchFieldProps = $props();
</script>

<label class={`ui-search-field ${className}`.trim()}>
  <Search class="ui-search-field__icon" size={15} strokeWidth={2.2} />
  <input
    class={`ui-form-control ui-form-control--pill ui-search-field__input ${inputClassName}`.trim()}
    type="text"
    {placeholder}
    aria-label={ariaLabel}
    bind:value={query}
  />
</label>
