<script>
  import { Save, Loader } from "@lucide/svelte";
  import PillButton from "../../primitives/CalendarPillButton.svelte";
  const { dashboard } = $props();
</script>

<h1 class="admin-page__title">Availability</h1>
<p class="admin-page__subtitle">Configure booking rules and slot behavior.</p>

<div class="admin-page__section">
  <div class="admin-page__section-head">
    <h3 class="admin-page__section-title">Booking rules</h3>
  </div>
  <p class="admin-page__section-description">
    Define when friends can book, and how much runway you need between events.
  </p>
  <div class="admin-page__fields-grid">
    <div class="admin-page__fields-row">
      <div class="admin-page__field">
        <span class="admin-page__field-label">Operating hours</span>
        <div class="admin-page__time-row">
          <input
            class="ui-form-control ui-form-control--time"
            type="time"
            bind:value={dashboard.hours.from}
            aria-label="Opening time"
          />
          <span class="admin-page__time-separator">to</span>
          <input
            class="ui-form-control ui-form-control--time"
            type="time"
            bind:value={dashboard.hours.to}
            aria-label="Closing time"
          />
        </div>
      </div>
    </div>
    <div class="admin-page__fields-row">
      <div class="admin-page__field">
        <label class="admin-page__field-label">
          Buffer between slots
          <div class="ui-form-affix">
            <input
              class="ui-form-control ui-form-control--number"
              type="number"
              min="0"
              bind:value={dashboard.buffer}
            />
            <span class="ui-form-affix__suffix">min</span>
          </div>
        </label>
      </div>
      <div class="admin-page__field">
        <label class="admin-page__field-label">
          Minimum notice
          <div class="ui-form-affix">
            <input
              class="ui-form-control ui-form-control--number"
              type="number"
              min="1"
              bind:value={dashboard.notice}
            />
            <span class="ui-form-affix__suffix">hrs</span>
          </div>
        </label>
      </div>
      <div class="admin-page__field">
        <label class="admin-page__field-label">
          Capacity per slot
          <div class="ui-form-affix">
            <input
              class="ui-form-control ui-form-control--number"
              type="number"
              min="1"
              bind:value={dashboard.capacity}
            />
            <span class="ui-form-affix__suffix">people</span>
          </div>
        </label>
      </div>
    </div>
  </div>
  <PillButton
    className="admin-page__button-secondary"
    variant="secondary"
    onClick={dashboard.save}
    disabled={dashboard.saving}
  >
    {#if dashboard.saving}
      <Loader size={12} class="admin-page__spin" />
      Saving...
    {:else}
      <Save size={12} />
      Save rules
    {/if}
  </PillButton>
</div>
