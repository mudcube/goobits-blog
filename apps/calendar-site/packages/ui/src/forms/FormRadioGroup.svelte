<script lang="ts">
  export type FormRadioOption = {
    value: string;
    label: string;
  };

  type FormRadioGroupProps = {
    options: FormRadioOption[];
    value?: string;
    name: string;
    className?: string;
    ariaLabel?: string;
  };

  let {
    options,
    value = $bindable(""),
    name,
    className = "",
    ariaLabel = "Options",
  }: FormRadioGroupProps = $props();
</script>

<div
  class={`ui-form-radio-group ${className}`.trim()}
  role="radiogroup"
  aria-label={ariaLabel}
>
  {#each options as option}
    <label
      class={`ui-form-radio ${value === option.value ? "ui-form-radio--active" : ""}`}
    >
      <input
        class="ui-form-radio__control"
        type="radio"
        {name}
        value={option.value}
        bind:group={value}
      />
      <span class="ui-form-radio__label">{option.label}</span>
    </label>
  {/each}
</div>
