<script lang="ts">
  import type { AdminCalendarWeekStart } from "@calendar/ui/admin/shared/calendar-preferences";

  let { calendarWeekStart = $bindable() }: {
    calendarWeekStart: AdminCalendarWeekStart;
  } = $props();

  const weekStartOptions: Array<{
    value: AdminCalendarWeekStart;
    label: string;
  }> = [
    { value: "monday", label: "Monday" },
    { value: "sunday", label: "Sunday" },
  ];
</script>

<section class="calendar-view-settings admin-settings__section">
  <div class="admin-settings__section-head">
    <div>
      <h4>WEEK START</h4>
    </div>
  </div>

  <fieldset class="calendar-view-settings__field">
    <legend>Week starts on</legend>
    <div
      class="calendar-view-settings__options"
      role="radiogroup"
      aria-label="Week starts on"
    >
      {#each weekStartOptions as option}
        <label
          class="ui-form-radio calendar-view-settings__option"
          class:calendar-view-settings__option--active={calendarWeekStart ===
            option.value}
        >
          <input
            class="ui-form-radio__control"
            type="radio"
            name="calendar-week-start"
            value={option.value}
            bind:group={calendarWeekStart}
          />
          <span class="ui-form-radio__label calendar-view-settings__label"
            >{option.label}</span
          >
        </label>
      {/each}
    </div>
  </fieldset>
</section>

<style>
  .calendar-view-settings__field {
    border: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.4rem;
  }

  .calendar-view-settings__field legend {
    font-size: 0.74rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
    margin-bottom: 0.05rem;
  }

  .calendar-view-settings__options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .calendar-view-settings__option {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.4rem;
    padding: 0 0.875rem;
    border-radius: 0.625rem;
    border: 1px solid var(--admin-card-border);
    background: var(--admin-card-bg);
    color: color-mix(in srgb, var(--text) 70%, transparent);
    cursor: pointer;
    transition:
      border-color 120ms ease,
      background 120ms ease,
      color 120ms ease;
  }

  .calendar-view-settings__option:hover {
    background: color-mix(in srgb, var(--admin-accent) 7%, var(--bg) 93%);
    border-color: color-mix(in srgb, var(--admin-accent) 28%, transparent);
  }

  .calendar-view-settings__option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .calendar-view-settings__option--active {
    border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
    background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
    color: var(--text);
  }

  .calendar-view-settings__label {
    font-size: 0.82rem;
    font-weight: 520;
    letter-spacing: -0.005em;
  }

  @media (max-width: 720px) {
    .calendar-view-settings__options {
      grid-template-columns: 1fr;
    }
  }
</style>
