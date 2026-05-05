<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { page } from "$app/stores";
  import { handleUnauthorizedSessionError } from "@calendar/ui/routing/auth";
  import { createAdminDashboardController } from "@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte";
  import AdminPageHero from "@calendar/ui/admin/shared/AdminPageHero.svelte";
  import AdminSavedIndicator from "@calendar/ui/admin/shared/AdminSavedIndicator.svelte";
  import AdminToast from "@calendar/ui/admin/shared/AdminToast.svelte";
  import {
    hydrateAdminCalendarWeekStart,
    setAdminCalendarWeekStart,
    type AdminCalendarWeekStart,
  } from "@calendar/ui/admin/shared/calendar-preferences";
  import { isAdminMockMode } from "@calendar/ui/admin/mock/mock-mode";
  import { getAdminMockCatalog } from "@calendar/ui/admin/mock/catalog";
  import CalendarSyncSettings from "./CalendarSyncSettings.svelte";
  import CalendarViewSettings from "./CalendarViewSettings.svelte";
  import PaymentSettings from "./PaymentSettings.svelte";

  type SaveState = "idle" | "saving" | "saved" | "error";

  const { data } = $props<{
    data: {
      user: unknown | null;
      viewSettings: { weekStart: AdminCalendarWeekStart };
    };
  }>();
  const dashboard = createAdminDashboardController({
    onUnauthorized: handleUnauthorizedSessionError,
  });
  const authed = $derived(!!data.user);
  const mockMode = $derived(isAdminMockMode($page.url));
  const adminMockCatalog = getAdminMockCatalog();

  let toastMessage = $state("");
  let toastIsError = $state(false);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  let weekStartAutosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let suspendWeekStartAutosave = $state(true);
  let handledConnectedNotice = $state(false);
  let lastSavedAt = $state<number | null>(null);
  let saveState = $state<SaveState>("idle");
  let saveError = $state("");

  let calendarWeekStart = $state<AdminCalendarWeekStart>(
    untrack(() => data.viewSettings?.weekStart ?? "monday")
  );

  $effect(() => {
    if (!authed || mockMode) return;
    void dashboard.loadStatus();
  });

  $effect(() => {
    if (!authed || mockMode || handledConnectedNotice) return;
    if ($page.url.searchParams.get("connected") !== "1") return;
    handledConnectedNotice = true;
    void handleConnectedNotice();
    if (typeof window === "undefined") return;
    const next = new URL(window.location.href);
    next.searchParams.delete("connected");
    window.history.replaceState(window.history.state, "", `${next.pathname}${next.search}${next.hash}`);
  });

  onMount(() => {
    hydrateAdminCalendarWeekStart(calendarWeekStart);
    suspendWeekStartAutosave = false;
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
      if (weekStartAutosaveTimer) clearTimeout(weekStartAutosaveTimer);
    };
  });

  function showToast(message: string, isError = false) {
    toastMessage = message;
    toastIsError = isError;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage = "";
      toastIsError = false;
    }, 2200);
  }

  async function handleConnectedNotice() {
    await dashboard.loadStatus();
    const activeProvider = dashboard.sync.activeProvider;
    const activeStatus = activeProvider ? dashboard.sync.providers[activeProvider] : null;
    const connected = !!(activeProvider && activeStatus?.connected && !activeStatus.expired);
    const providerLabels: Record<string, string> = {
      google: "Google Calendar",
      apple: "Apple Calendar",
      outlook: "Outlook",
    };
    const providerLabel = activeProvider ? providerLabels[activeProvider] || "Calendar" : "Calendar";
    showToast(
      connected ? `${providerLabel} connected` : "Calendar connection was not completed",
      !connected,
    );
  }

  async function persistWeekStart(value: AdminCalendarWeekStart) {
    if (mockMode) {
      showToast("Mock mode: preference preview only");
      return;
    }
    saveState = "saving";
    saveError = "";
    try {
      await setAdminCalendarWeekStart(value);
      saveState = "saved";
      lastSavedAt = Date.now();
      setTimeout(() => {
        if (saveState === "saved") saveState = "idle";
      }, 1400);
    } catch (error) {
      saveError = error instanceof Error ? error.message : "Failed to save";
      saveState = "error";
      calendarWeekStart =
        value === "monday" ? "sunday" : "monday";
    }
  }

  $effect(() => {
    if (!authed || suspendWeekStartAutosave) return;
    if (calendarWeekStart === data.viewSettings?.weekStart && saveState === "idle") return;
    if (weekStartAutosaveTimer) clearTimeout(weekStartAutosaveTimer);
    const expected = calendarWeekStart;
    weekStartAutosaveTimer = setTimeout(() => {
      if (calendarWeekStart !== expected) return;
      void persistWeekStart(expected);
    }, 300);
  });
</script>

{#if authed}
  <div class="admin-settings admin-content">
    <AdminSavedIndicator phase={saveState} errorMessage={saveError} {lastSavedAt} />
    {#if toastMessage}
      <AdminToast message={toastMessage} variant={toastIsError ? 'error' : 'status'} />
    {/if}

    <AdminPageHero
      eyebrow="Preferences"
      title="Settings"
      subtitle="Calendar sync, week start, and payouts."
    />

    <CalendarSyncSettings {dashboard} {mockMode} {showToast} />

    <CalendarViewSettings bind:calendarWeekStart />

    <PaymentSettings
      {dashboard}
      {authed}
      {mockMode}
      mockDefaults={adminMockCatalog.paymentDefaults}
      {showToast}
    />
  </div>
{/if}

<style>
  .admin-settings {
    font-family: var(--font-ui-sans, var(--font-sans));
    display: grid;
    gap: 1.6rem;
    width: 100%;
  }

  .admin-settings :global(.admin-settings__section) {
    display: grid;
    gap: 0.85rem;
    padding: 0;
  }

  .admin-settings :global(.admin-settings__section-head) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.55rem;
    border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
  }

  .admin-settings :global(.admin-settings__section-head h4) {
    margin: 0;
    font-size: 0.78rem;
    letter-spacing: 0.09em;
    font-weight: 680;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--text) 70%, transparent);
  }

  .admin-settings :global(.admin-settings__section-sub) {
    margin: 0.15rem 0 0;
    font-size: 0.74rem;
    font-weight: 520;
    color: color-mix(in srgb, var(--text) 56%, transparent);
  }

  .admin-settings {
    position: relative;
  }

  @media (max-width: 720px) {
    .admin-settings :global(.admin-settings__section-head) {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
