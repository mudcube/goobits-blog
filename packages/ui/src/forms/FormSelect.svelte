<script lang="ts">
  import type { Snippet } from "svelte";

  type FormSelectProps = {
    className?: string;
    value?: string;
    id?: string;
    name?: string;
    disabled?: boolean;
    ariaLabel?: string;
    onchange?: ((event: Event) => void) | undefined;
    children?: Snippet;
  };

  let {
    className = "",
    value = $bindable(""),
    ariaLabel,
    children,
    ...rest
  }: FormSelectProps = $props();
</script>

<div class="ui-form-select">
  <select
    class={`ui-form-control ui-form-control--select ${className}`.trim()}
    bind:value
    aria-label={ariaLabel}
    {...rest}
  >
    {@render children?.()}
  </select>
  <span class="ui-form-select__chevron" aria-hidden="true">▾</span>
</div>
