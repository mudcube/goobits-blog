<script lang="ts">
  type FormTextareaProps = {
    className?: string;
    value?: string;
    id?: string;
    name?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    required?: boolean;
  };

  let {
    className = "",
    value = $bindable(""),
    rows = 4,
    ...rest
  }: FormTextareaProps = $props();
</script>

<textarea
  class={`ui-form-control ui-form-control--textarea ${className}`.trim()}
  bind:value
  {rows}
  {...rest}
></textarea>
