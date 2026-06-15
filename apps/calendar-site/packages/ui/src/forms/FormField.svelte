<script lang="ts">
  import type { Snippet } from "svelte";

  type FormFieldProps = {
    label?: string;
    forId?: string;
    error?: string | undefined;
    hint?: string | undefined;
    required?: boolean;
    className?: string;
    children?: Snippet;
  };

  let {
    label = "",
    forId,
    error = "",
    hint = "",
    required = false,
    className = "",
    children,
  }: FormFieldProps = $props();
</script>

<div
  class={`ui-form-field ${error ? "ui-form-field--error" : ""} ${className}`.trim()}
>
  {#if label}
    <label class="ui-form-label" for={forId}>
      <span>{label}</span>
      {#if required}
        <span class="ui-form-label__required" aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}
  {@render children?.()}
  {#if error}
    <p class="ui-form-message ui-form-message--error">{error}</p>
  {:else if hint}
    <p class="ui-form-message">{hint}</p>
  {/if}
</div>
