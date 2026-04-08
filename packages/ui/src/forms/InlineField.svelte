<script lang="ts">
  import type { Snippet } from "svelte";

  type InlineFieldProps = {
    className?: string;
    children?: Snippet;
  };

  let { className = "", children }: InlineFieldProps = $props();
</script>

<div class={`ui-inline-field ${className}`.trim()}>
  {@render children?.()}
</div>
