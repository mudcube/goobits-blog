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

  type SyncProviderKey = "google" | "apple" | "outlook";
  type SyncConnections = Record<SyncProviderKey, boolean>;
  type SyncBusy = Record<SyncProviderKey, boolean>;

  let syncConnections = $state<SyncConnections>({
    google: false,
    apple: false,
    outlook: false,
  });
  let syncBusy = $state<SyncBusy>({
    google: false,
    apple: false,
    outlook: false,
  });
  let syncOptionsExpanded = $state(false);
  let calendarWeekStart = $state<AdminCalendarWeekStart>("monday");
  let appleFormExpanded = $state(false);
  let appleUsername = $state("");
  let appleAppPassword = $state("");
  let appleCalendarUrl = $state("");

  const syncProviders: Array<{
    value: SyncProviderKey;
    label: string;
    supported: boolean;
  }> = [
    { value: "google", label: "Google Calendar", supported: true },
    { value: "apple", label: "Apple Calendar", supported: true },
    { value: "outlook", label: "Outlook", supported: true },
  ];

  $effect(() => {
    if (!authed || mockMode) return;
    void dashboard.loadStatus();
  });

  $effect(() => {
    if (!authed || mockMode) return;
    const activeProvider = dashboard.sync.activeProvider;
    const activeStatus = activeProvider ? dashboard.sync.providers[activeProvider] : null;
    if (activeProvider && activeStatus?.connected && !activeStatus.expired) {
      setConnectedProvider(activeProvider);
      syncOptionsExpanded = false;
      return;
    }
    setConnectedProvider(null);
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

  function setConnectedProvider(provider: SyncProviderKey | null) {
    if (!provider) {
      syncConnections = { google: false, apple: false, outlook: false };
      return;
    }
    syncConnections = {
      google: provider === "google",
      apple: provider === "apple",
      outlook: provider === "outlook",
    };
  }

  function providerConnected(provider: SyncProviderKey) {
    return syncConnections[provider];
  }

  function connectedProviders() {
    return syncProviders.filter((provider) =>
      providerConnected(provider.value),
    );
  }

  function primaryConnectedProvider() {
    const connected = connectedProviders();
    return connected[0] || null;
  }

  function visibleSyncProviders() {
    const primary = primaryConnectedProvider();
    if (!primary || syncOptionsExpanded) return syncProviders;
    return [primary];
  }

  async function refreshStatus() {
    await dashboard.loadStatus();
    const activeProvider = dashboard.sync.activeProvider;
    const activeStatus = activeProvider ? dashboard.sync.providers[activeProvider] : null;
    const connected = !!(activeProvider && activeStatus?.connected && !activeStatus.expired);
    setConnectedProvider(connected ? activeProvider : null);
    return connected;
  }

  async function handleConnectedNotice() {
    const connected = await refreshStatus();
    const activeProvider = dashboard.sync.activeProvider;
    const providerLabel = activeProvider
      ? syncProviders.find((provider) => provider.value === activeProvider)?.label || "Calendar"
      : "Calendar";
    showToast(
      connected
        ? `${providerLabel} connected`
        : "Calendar connection was not completed",
      !connected,
    );
  }

  async function disconnectProvider(provider: SyncProviderKey) {
    if (!mockMode) {
      await dashboard.disconnect(provider);
      if (dashboard.error) {
        showToast(dashboard.error, true);
        return false;
      }
    }
    setConnectedProvider(null);
    return true;
  }

  async function connectProvider(provider: SyncProviderKey) {
    if ((provider === "google" || provider === "outlook") && !mockMode) {
      await dashboard.reconnect(provider);
      if (dashboard.error) showToast(dashboard.error, true);
      return false;
    }
    if (provider === "apple" && !mockMode) {
      appleFormExpanded = true;
      return false;
    }
    if (mockMode) {
      setConnectedProvider(provider);
      return true;
    }
    return false;
  }

  async function connectAppleProvider() {
    if (!appleUsername.trim() || !appleAppPassword.trim() || !appleCalendarUrl.trim()) {
      showToast("Apple Calendar credentials are required", true);
      return;
    }
    syncBusy = { google: false, apple: true, outlook: false };
    try {
      await dashboard.connectApple({
        username: appleUsername.trim(),
        appPassword: appleAppPassword.trim(),
        calendarUrl: appleCalendarUrl.trim(),
      });
      if (dashboard.error) {
        showToast(dashboard.error, true);
        return;
      }
      appleAppPassword = "";
      appleFormExpanded = false;
      await refreshStatus();
      showToast("Apple Calendar connected");
    } finally {
      syncBusy = { google: false, apple: false, outlook: false };
    }
  }

  async function toggleSyncProvider(provider: SyncProviderKey) {
    if (syncBusy.google || syncBusy.apple || syncBusy.outlook) return;
    const busyState: SyncBusy = { google: false, apple: false, outlook: false };
    busyState[provider] = true;
    syncBusy = busyState;
    try {
      const currentlyConnected = providerConnected(provider);
      if (currentlyConnected) {
        const ok = await disconnectProvider(provider);
        if (ok) {
          await refreshStatus();
          syncOptionsExpanded = false;
          showToast("Saved");
        }
        return;
      }

      const current = primaryConnectedProvider();
      if (current && current.value !== provider) {
        busyState[current.value] = true;
        syncBusy = { ...busyState };
        const disconnected = await disconnectProvider(current.value);
        if (!disconnected) return;
      }

      const connected = await connectProvider(provider);
      if (!connected) return;
      syncOptionsExpanded = false;
      showToast("Saved");
    } finally {
      syncBusy = { google: false, apple: false, outlook: false };
    }
  }

  function startSwitchProvider() {
    if (syncBusy.google || syncBusy.apple || syncBusy.outlook) return;
    syncOptionsExpanded = true;
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

    <CalendarSyncSettings
      dashboardSync={dashboard.sync}
      disconnecting={dashboard.disconnecting}
      {syncBusy}
      bind:syncOptionsExpanded
      bind:appleFormExpanded
      bind:appleUsername
      bind:appleAppPassword
      bind:appleCalendarUrl
      {visibleSyncProviders}
      {primaryConnectedProvider}
      {providerConnected}
      toggleSyncProvider={(provider) => void toggleSyncProvider(provider)}
      {startSwitchProvider}
      connectAppleProvider={() => void connectAppleProvider()}
    />

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
