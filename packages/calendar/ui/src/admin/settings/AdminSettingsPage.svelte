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
  let lastSavedAt = $state<number | null>(null);
  let nowTick = $state(Date.now());
  let nowInterval: ReturnType<typeof setInterval> | null = null;

  let calendarWeekStart = $state<AdminCalendarWeekStart>("monday");

  const savedDisplay = $derived.by(() => {
    if (toastMessage) {
      return { label: toastIsError ? toastMessage : `✓ ${toastMessage}`, error: toastIsError };
    }
    if (dashboard.error) {
      return { label: dashboard.error, error: true };
    }
    if (lastSavedAt) {
      return { label: relativeSavedLabel(lastSavedAt, nowTick), error: false };
    }
    return null;
  });

  function relativeSavedLabel(stamp: number, now: number) {
    const seconds = Math.max(0, Math.floor((now - stamp) / 1000));
    if (seconds < 5) return "All saved · just now";
    if (seconds < 60) return `All saved · ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `All saved · ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `All saved · ${hours}h ago`;
  }

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
    nowInterval = setInterval(() => (nowTick = Date.now()), 30000);
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
      if (weekStartAutosaveTimer) clearTimeout(weekStartAutosaveTimer);
      if (nowInterval) clearInterval(nowInterval);
    };
  });

  function showToast(message: string, isError = false) {
    toastMessage = message;
    toastIsError = isError;
    if (!isError) lastSavedAt = Date.now();
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
    {#if savedDisplay}
      <div
        class="admin-settings__save"
        class:admin-settings__save--error={savedDisplay.error}
        class:admin-settings__save--idle={!toastMessage}
        role="status"
        aria-live="polite"
      >
        {savedDisplay.label}
      </div>
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

  .admin-settings__save {
    position: absolute;
    top: 0.4rem;
    right: 0;
    font-size: 0.74rem;
    font-weight: 440;
    font-style: italic;
    color: color-mix(in srgb, var(--text) 56%, transparent);
    z-index: 5;
    pointer-events: none;
    transition: opacity 200ms ease;
  }

  .admin-settings__save--idle {
    opacity: 0.7;
  }

  .admin-settings__save--error {
    font-style: normal;
    font-weight: 540;
    color: #ef4444;
    opacity: 1;
  }

  @media (max-width: 720px) {
    .admin-settings :global(.admin-settings__section-head) {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
