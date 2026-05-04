<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { handleUnauthorizedSessionError } from "@calendar/ui/routing/auth";
  import { createAdminDashboardController } from "@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte";
  import AdminPageHero from "@calendar/ui/admin/shared/AdminPageHero.svelte";
  import {
    getAdminCalendarWeekStart,
    setAdminCalendarWeekStart,
    type AdminCalendarWeekStart,
  } from "@calendar/ui/admin/shared/calendar-preferences";
  import { isAdminMockMode } from "@calendar/ui/admin/mock/mock-mode";
  import { getAdminMockCatalog } from "@calendar/ui/admin/mock/catalog";
  import CalendarSyncSettings from "./CalendarSyncSettings.svelte";
  import CalendarViewSettings from "./CalendarViewSettings.svelte";
  import PaymentSettings from "./PaymentSettings.svelte";

  const { data } = $props<{ data: { user: unknown | null } }>();
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

  let calendarWeekStart = $state<AdminCalendarWeekStart>("monday");

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
    calendarWeekStart = getAdminCalendarWeekStart();
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

  $effect(() => {
    if (!authed || suspendWeekStartAutosave) return;
    if (calendarWeekStart === getAdminCalendarWeekStart()) return;
    if (weekStartAutosaveTimer) clearTimeout(weekStartAutosaveTimer);
    const expected = calendarWeekStart;
    weekStartAutosaveTimer = setTimeout(() => {
      if (calendarWeekStart !== expected) return;
      setAdminCalendarWeekStart(expected);
      showToast("Saved");
    }, 300);
  });
</script>

{#if authed}
  <div class="admin-settings admin-content">
    {#if toastMessage}
      <div
        class="admin-settings__toast admin-ui-toast"
        class:admin-ui-toast--error={toastIsError}
        role="status"
      >
        {#if !toastIsError}✓
        {/if}{toastMessage}
      </div>
    {/if}

    <AdminPageHero
      eyebrow="Preferences"
      title="Settings"
      subtitle="Configure sync & payment defaults for your space."
    />

    <CalendarSyncSettings {dashboard} {showToast} />

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
    gap: 0.9rem;
    width: 100%;
  }

  .admin-settings :global(.admin-settings__section) {
    display: grid;
    gap: 0.85rem;
    padding: 0;
  }

  .admin-settings :global(.admin-settings__section + .admin-settings__section) {
    margin-top: 1rem;
  }

  .admin-settings :global(.admin-settings__section-head) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .admin-settings :global(.admin-settings__section-sub) {
    margin: 0.15rem 0 0;
    font-size: 0.74rem;
    font-weight: 520;
    color: color-mix(in srgb, var(--text) 56%, transparent);
  }

  .admin-settings__toast {
    bottom: 1rem;
    z-index: 120;
    font-size: 0.78rem;
  }

  @media (max-width: 720px) {
    .admin-settings :global(.admin-settings__section-head) {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
