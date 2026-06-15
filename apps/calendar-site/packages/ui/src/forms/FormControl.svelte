<script lang="ts">
  type FormControlProps = {
    className?: string;
    type?: string;
    value?: string | number;
    [key: string]: unknown;
  };

  let {
    className = "",
    type = "text",
    value = $bindable(""),
    ...rest
  }: FormControlProps = $props();
</script>

<input
  class={`ui-form-control ${className}`.trim()}
  {type}
  bind:value
  {...rest}
/>
