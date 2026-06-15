<script lang="ts">
  type NumberStepperProps = {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    ariaLabel?: string;
    className?: string;
  };

  let {
    value = $bindable(1),
    min = 1,
    max = 50,
    step = 1,
    ariaLabel = "Number stepper",
    className = "",
  }: NumberStepperProps = $props();

  function clamp(next: number) {
    return Math.max(min, Math.min(max, next));
  }

  function setValue(next: number) {
    value = clamp(Number.isFinite(next) ? next : min);
  }

  function nudge(delta: number) {
    setValue(value + delta);
  }
</script>

<div
  class={`ui-stepper ${className}`.trim()}
  role="group"
  aria-label={ariaLabel}
>
  <button
    type="button"
    class="ui-stepper__button"
    aria-label="Decrease value"
    onclick={() => nudge(-step)}>−</button
  >
  <input
    class="ui-form-control ui-stepper__input"
    type="number"
    {min}
    {max}
    {step}
    bind:value
  />
  <button
    type="button"
    class="ui-stepper__button"
    aria-label="Increase value"
    onclick={() => nudge(step)}>+</button
  >
</div>
