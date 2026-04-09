<script>
  import PillButton from "../../primitives/CalendarPillButton.svelte";
  import AdminNewEventModal from "./AdminNewEventModal.svelte";
  import AdminEventDetailSheet from "./AdminEventDetailSheet.svelte";
  const { dashboard } = $props();
  let memoryDrafts = $state({});
  let showNewEventModal = $state(false);

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
</script>

<h1 class="admin-page__title">Events</h1>
<p class="admin-page__subtitle">
  Create recurring sessions, monitor attendance pressure, and override capacity.
</p>

{#if dashboard.error}
  <div class="admin-page__section admin-page__section--error">
    <p class="admin-page__calendar-error">{dashboard.error}</p>
  </div>
{/if}

<div class="admin-page__section">
  <div class="admin-page__section-head">
    <h3 class="admin-page__section-title">New event</h3>
    <PillButton
      className="admin-page__button-secondary admin-page__button-secondary--compact"
      variant="secondary"
      size="sm"
      onClick={() => (showNewEventModal = true)}
    >
      + New
    </PillButton>
  </div>
  <p class="admin-page__section-description">
    Open modal to create one event or a weekly series.
  </p>
  {#if dashboard.enabledPrograms.length === 0}
    <p class="admin-page__section-description">
      Enable at least one program before creating events.
    </p>
  {/if}
</div>

{#if showNewEventModal}
  <AdminNewEventModal {dashboard} onClose={() => (showNewEventModal = false)} />
{/if}

<div class="admin-page__divider" aria-hidden="true"></div>

<div class="admin-page__section">
  <div class="admin-page__section-head">
    <h3 class="admin-page__section-title">Memory feed (recent events)</h3>
    <span class="admin-page__section-count"
      >{dashboard.recentEvents.length} total</span
    >
  </div>
  {#if dashboard.recentEvents.length === 0}
    <p class="admin-page__section-description">
      No recent events to annotate yet.
    </p>
  {:else}
    <div class="admin-page__members-list">
      {#each dashboard.recentEvents as session, i}
        <div class="admin-page__members-row">
          <div class="admin-page__members-main admin-page__members-main--full">
            <div class="admin-page__members-code-row">
              <strong>{session.title}</strong>
              <span class="admin-page__members-meta">
                · {session.activityLabel} · {formatDateTime(
                  session.startsAt,
                )}</span
              >
            </div>
            <div class="admin-page__members-meta">
              {session.seatsTaken}/{session.capacity} attended
            </div>
            <div
              class="admin-page__fields-grid admin-page__fields-grid--memory"
            >
              <div class="admin-page__field">
                <label
                  class="admin-page__field-label"
                  for={`memory-recap-${session.id}`}>Recap text</label
                >
                <textarea
                  id={`memory-recap-${session.id}`}
                  class="ui-form-control ui-form-control--textarea"
                  rows="2"
                  value={memoryDrafts[session.id]?.recapText ??
                    session.recapText ??
                    ""}
                  oninput={(event) =>
                    (memoryDrafts[session.id] = {
                      recapText: event.currentTarget.value,
                      heroImageUrl:
                        memoryDrafts[session.id]?.heroImageUrl ??
                        session.heroImageUrl ??
                        "",
                    })}
                ></textarea>
              </div>
              <div class="admin-page__field">
                <label
                  class="admin-page__field-label"
                  for={`memory-image-${session.id}`}>Hero image URL</label
                >
                <input
                  id={`memory-image-${session.id}`}
                  class="ui-form-control"
                  type="text"
                  value={memoryDrafts[session.id]?.heroImageUrl ??
                    session.heroImageUrl ??
                    ""}
                  oninput={(event) =>
                    (memoryDrafts[session.id] = {
                      heroImageUrl: event.currentTarget.value,
                      recapText:
                        memoryDrafts[session.id]?.recapText ??
                        session.recapText ??
                        "",
                    })}
                />
              </div>
            </div>
          </div>
          <div class="admin-page__members-actions">
            <PillButton
              className="admin-page__button-secondary admin-page__button-secondary--compact"
              variant="secondary"
              size="sm"
              onClick={() =>
                dashboard.updateEventMemory(
                  session.id,
                  memoryDrafts[session.id]?.recapText ??
                    session.recapText ??
                    "",
                  memoryDrafts[session.id]?.heroImageUrl ??
                    session.heroImageUrl ??
                    "",
                )}
              disabled={dashboard.eventUpdatingId === session.id}
            >
              {dashboard.eventUpdatingId === session.id
                ? "Saving..."
                : "Save memory"}
            </PillButton>
          </div>
        </div>
        {#if i < dashboard.recentEvents.length - 1}<div
            class="admin-page__booking-divider"
          ></div>{/if}
      {/each}
    </div>
  {/if}
</div>

<div class="admin-page__divider" aria-hidden="true"></div>

<div class="admin-page__section">
  <div class="admin-page__section-head">
    <h3 class="admin-page__section-title">Upcoming sessions</h3>
    <span class="admin-page__section-count"
      >{dashboard.events.length} total</span
    >
  </div>
  {#if dashboard.eventsLoading}
    <p class="admin-page__section-description">Loading events...</p>
  {:else if dashboard.events.length === 0}
    <p class="admin-page__section-description">
      No sessions yet. Create your first one above.
    </p>
  {:else}
    <div class="admin-page__members-list">
      {#each dashboard.events as session, i}
        <div class="admin-page__members-row">
          <div class="admin-page__members-main">
            <div class="admin-page__members-code-row">
              <strong>{session.title}</strong>
              <span class="admin-page__members-meta">
                · {session.activityLabel} · {formatDateTime(
                  session.startsAt,
                )}</span
              >
            </div>
            <div class="admin-page__members-meta">
              {session.seatsTaken}/{session.capacity} seats
              {#if session.waitlistCount > 0}
                · waitlist {session.waitlistCount}{/if}
              {#if session.costCents > 0}
                · ${(session.costCents / 100).toFixed(2)}
                {session.currency}{/if}
            </div>
          </div>
          <div class="admin-page__members-actions">
            <PillButton
              className="admin-page__button-secondary admin-page__button-secondary--compact"
              variant="secondary"
              size="sm"
              onClick={() => dashboard.openEventDetail(session.id)}
            >
              Details
            </PillButton>
            <input
              class="ui-form-control ui-form-control--number ui-form-control--capacity"
              type="number"
              min="1"
              max="50"
              value={session.capacity}
              onchange={(event) =>
                dashboard.updateEventCapacity(
                  session.id,
                  Number(event.currentTarget.value) || session.capacity,
                )}
              disabled={dashboard.eventUpdatingId === session.id}
            />
          </div>
        </div>
        {#if i < dashboard.events.length - 1}<div
            class="admin-page__booking-divider"
          ></div>{/if}
      {/each}
    </div>
  {/if}
</div>

{#if dashboard.selectedEventDetail}
  <div class="admin-page__divider" aria-hidden="true"></div>
  <AdminEventDetailSheet {dashboard} detail={dashboard.selectedEventDetail} />
{/if}
