<script lang="ts">
  type FormCheckboxProps = {
    label: string;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    name?: string;
    value?: string;
  };

  let {
    label,
    checked = $bindable(false),
    disabled = false,
    className = "",
    name,
    value,
  }: FormCheckboxProps = $props();
</script>

<label class={`ui-form-check ${className}`.trim()}>
  <input
    class="ui-form-check__control"
    type="checkbox"
    bind:checked
    {disabled}
    {name}
    {value}
  />
  <span class="ui-form-check__label">{label}</span>
</label>
