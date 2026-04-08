<script lang="ts">
  import FormSelect from "./FormSelect.svelte";

  type TimeSelectorProps = {
    value?: string;
    minuteStep?: number;
    className?: string;
  };

  let {
    value = $bindable("10:30"),
    minuteStep = 5,
    className = "",
  }: TimeSelectorProps = $props();

  let hour = $state("10");
  let minute = $state("30");
  let period = $state<"AM" | "PM">("AM");

  $effect(() => {
    const [hourToken = "", minuteToken = ""] = value.split(":");
    const parsedHours = Number.parseInt(hourToken, 10);
    const parsedMinutes = Number.parseInt(minuteToken, 10);
    const hours24 = Number.isFinite(parsedHours) ? parsedHours : 10;
    const minutes = Number.isFinite(parsedMinutes) ? parsedMinutes : 30;
    period = hours24 >= 12 ? "PM" : "AM";
    hour = String(hours24 % 12 === 0 ? 12 : hours24 % 12);
    minute = String(Math.max(0, Math.min(59, minutes))).padStart(2, "0");
  });

  function apply() {
    const hourNum = Math.max(1, Math.min(12, Number.parseInt(hour, 10) || 10));
    const minuteNum = Math.max(
      0,
      Math.min(59, Number.parseInt(minute, 10) || 0),
    );
    const hours24 = period === "PM" ? (hourNum % 12) + 12 : hourNum % 12;
    value = `${String(hours24).padStart(2, "0")}:${String(minuteNum).padStart(2, "0")}`;
  }

  const minuteOptions = $derived(
    Array.from(
      { length: Math.floor(60 / Math.max(1, minuteStep)) },
      (_, index) => String(index * Math.max(1, minuteStep)).padStart(2, "0"),
    ),
  );
</script>

<div
  class={`ui-time-selector ${className}`.trim()}
  role="group"
  aria-label="Select time"
>
  <FormSelect
    bind:value={hour}
    ariaLabel="Hour"
    className="ui-time-selector__select"
    onchange={apply}
  >
    {#each Array.from({ length: 12 }, (_, i) => String(i + 1)) as option}
      <option value={option}>{option}</option>
    {/each}
  </FormSelect>
  <span class="ui-time-selector__sep">:</span>
  <FormSelect
    bind:value={minute}
    ariaLabel="Minute"
    className="ui-time-selector__select"
    onchange={apply}
  >
    {#each minuteOptions as option}
      <option value={option}>{option}</option>
    {/each}
  </FormSelect>
  <div class="ui-time-selector__period">
    <button
      type="button"
      class={`ui-time-selector__period-button ${period === "AM" ? "ui-time-selector__period-button--active" : ""}`}
      onclick={() => {
        period = "AM";
        apply();
      }}>AM</button
    >
    <button
      type="button"
      class={`ui-time-selector__period-button ${period === "PM" ? "ui-time-selector__period-button--active" : ""}`}
      onclick={() => {
        period = "PM";
        apply();
      }}>PM</button
    >
  </div>
</div>
