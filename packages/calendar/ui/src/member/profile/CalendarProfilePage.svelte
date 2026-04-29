<script>
  import { saveCalendarProfile } from "../../api/calendar";
  import { getCalendarUiConfig } from "../../config";
  import PillButton from "../../primitives/CalendarPillButton.svelte";
  import Hero from "../../primitives/CalendarHero.svelte";

  let { data } = $props();
  let emergencyContact = $derived(data.profile?.emergencyContact ?? "");
  let dietaryRestrictions = $derived(data.profile?.dietaryRestrictions ?? "");
  let chatHandle = $derived(data.profile?.chatHandle ?? "");
  let safetySaving = $state(false);
  let safetyStatus = $state("");
  let logisticsSaving = $state(false);
  let logisticsStatus = $state("");
  const calendarConfig = getCalendarUiConfig();

  async function saveAll(setSaving, setStatus) {
    setSaving(true);
    setStatus("");
    try {
      await saveCalendarProfile({
        emergencyContact,
        dietaryRestrictions,
        chatHandle,
      });
      setStatus("Saved.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to save profile",
      );
    } finally {
      setSaving(false);
    }
  }

  const saveSafety = () =>
    saveAll(
      (v) => (safetySaving = v),
      (v) => (safetyStatus = v),
    );
  const saveLogistics = () =>
    saveAll(
      (v) => (logisticsSaving = v),
      (v) => (logisticsStatus = v),
    );
</script>

<svelte:head>
  <title
    >Profile | {calendarConfig.brand.calendarName} | {calendarConfig.brand
      .siteName}</title
  >
</svelte:head>

<div class="calendar-page calendar-profile">
  <Hero
    className="calendar-page__hero calendar-profile__hero"
    glowClass="calendar-page__hero-glow calendar-profile__glow"
    eyebrowClass="calendar-page__eyebrow calendar-profile__eyebrow"
    subtitleClass="calendar-page__subtitle calendar-profile__sub"
    eyebrow="Profile"
    title="Your member profile"
    subtitle="Keep your details in one place so sessions run smoother."
  />

  <section class="calendar-page__section calendar-profile__section">
    <div class="calendar-profile__card">
      <header class="calendar-profile__card-head">
        <h3 class="calendar-profile__card-title">Safety</h3>
        <p class="calendar-profile__card-sub">Only admins can see this.</p>
      </header>

      <div class="calendar-profile__field">
        <label class="ui-form-label" for="profile-emergency-contact"
          >Emergency contact</label
        >
        <input
          id="profile-emergency-contact"
          class="ui-form-control"
          type="text"
          bind:value={emergencyContact}
        />
      </div>

      <div class="calendar-profile__actions">
        <PillButton
          className="calendar-page__primary-button"
          variant="primary"
          size="md"
          onClick={saveSafety}
          disabled={safetySaving}
        >
          {safetySaving ? "Saving..." : "Save"}
        </PillButton>
        {#if safetyStatus}
          <span class="calendar-page__status-text--muted">{safetyStatus}</span>
        {/if}
      </div>
    </div>
  </section>

  <section class="calendar-page__section calendar-profile__section">
    <div class="calendar-profile__card">
      <header class="calendar-profile__card-head">
        <h3 class="calendar-profile__card-title">Logistics</h3>
        <p class="calendar-profile__card-sub">
          Helps us plan around dietary needs and reach you in chat.
        </p>
      </header>

      <div class="calendar-profile__field">
        <label class="ui-form-label" for="profile-dietary-restrictions"
          >Dietary restrictions</label
        >
        <input
          id="profile-dietary-restrictions"
          class="ui-form-control"
          type="text"
          bind:value={dietaryRestrictions}
        />
      </div>

      <div class="calendar-profile__field">
        <label class="ui-form-label" for="profile-chat-handle"
          >Discord / chat handle</label
        >
        <input
          id="profile-chat-handle"
          class="ui-form-control"
          type="text"
          bind:value={chatHandle}
        />
      </div>

      <div class="calendar-profile__actions">
        <PillButton
          className="calendar-page__primary-button"
          variant="primary"
          size="md"
          onClick={saveLogistics}
          disabled={logisticsSaving}
        >
          {logisticsSaving ? "Saving..." : "Save"}
        </PillButton>
        {#if logisticsStatus}
          <span class="calendar-page__status-text--muted"
            >{logisticsStatus}</span
          >
        {/if}
      </div>
    </div>
  </section>

  <section class="calendar-page__section calendar-profile__section">
    <div class="calendar-profile__card">
      <header class="calendar-profile__card-head">
        <h3 class="calendar-profile__card-title">Calendar subscription</h3>
        <p class="calendar-profile__card-sub">
          Add your bookings to your own calendar app.
        </p>
      </header>
      <div class="calendar-profile__actions">
        <PillButton
          className="calendar-page__ghost-button"
          variant="ghost"
          size="md"
          href={`${calendarConfig.routes.apiCalendarBase}/ics`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe (.ics)
        </PillButton>
      </div>
    </div>
  </section>
</div>

<style>
  .calendar-profile__card {
    padding: 1rem 1.1rem;
    border-radius: 0.9rem;
    background: color-mix(in srgb, var(--panel-bg, var(--bg)) 60%, transparent);
    border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
    display: grid;
    gap: 0.85rem;
  }

  .calendar-profile__card-head {
    display: grid;
    gap: 0.2rem;
  }

  .calendar-profile__card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 620;
    color: var(--text);
  }

  .calendar-profile__card-sub {
    margin: 0;
    font-size: 0.78rem;
    color: color-mix(in srgb, var(--text) 56%, transparent);
  }

  .calendar-profile__field {
    display: grid;
    gap: 0.3rem;
  }

  .calendar-profile__actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }
</style>
