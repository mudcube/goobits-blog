<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { CreditCard, HandCoins, Wallet, Plus, X } from "@lucide/svelte";
  import { handleUnauthorizedSessionError } from "@calendar/ui/routing/auth";
  import { createAdminDashboardController } from "@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte";
  import AdminPageHero from "@calendar/ui/admin/shared/AdminPageHero.svelte";
  import AdminGroupedCard from "@calendar/ui/admin/shared/AdminGroupedCard.svelte";
  import AdminMetaCards from "@calendar/ui/admin/shared/AdminMetaCards.svelte";
  import AdminPaymentMethodCard from "./AdminPaymentMethodCard.svelte";
  import {
    getAdminCalendarWeekStart,
    setAdminCalendarWeekStart,
    type AdminCalendarWeekStart,
  } from "@calendar/ui/admin/shared/calendar-preferences";
  import { isAdminMockMode } from "@calendar/ui/admin/mock/mock-mode";
  import { getAdminMockCatalog } from "@calendar/ui/admin/mock/catalog";

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
  let paymentAutosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let weekStartAutosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let suspendPaymentAutosave = $state(true);
  let suspendWeekStartAutosave = $state(true);
  let handledConnectedNotice = $state(false);

  type PaymentMethodKey = "venmo" | "paypal" | "cashapp";
  type PaymentMethodState = Record<
    PaymentMethodKey,
    { enabled: boolean; handle: string }
  >;

  function blankPaymentMethods(): PaymentMethodState {
    return {
      venmo: { enabled: false, handle: "" },
      paypal: { enabled: false, handle: "" },
      cashapp: { enabled: false, handle: "" },
    };
  }

  let paymentMethods = $state<PaymentMethodState>(blankPaymentMethods());
  let initialPaymentMethods = $state<PaymentMethodState>(blankPaymentMethods());
  let payPalFormExpanded = $state(false);
  let payPalClientId = $state("");
  let payPalClientSecret = $state("");
  let payPalEnvironment = $state<"sandbox" | "live">("sandbox");
  let squareFormExpanded = $state(false);
  let squareApplicationId = $state("");
  let squareLocationId = $state("");
  let squareAccessToken = $state("");
  let squareEnvironment = $state<"sandbox" | "live">("sandbox");
  let paymentIntegrationBusy = $state(false);
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
  const syncProviders: Array<{
    value: SyncProviderKey;
    label: string;
    supported: boolean;
  }> = [
    { value: "google", label: "Google Calendar", supported: true },
    { value: "apple", label: "Apple Calendar", supported: true },
    { value: "outlook", label: "Outlook", supported: true },
  ];
  let appleFormExpanded = $state(false);
  let appleUsername = $state("");
  let appleAppPassword = $state("");
  let appleCalendarUrl = $state("");

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

  const paymentProviders = [
    {
      value: "venmo" as const,
      label: "Venmo handle",
      icon: HandCoins,
      placeholder: "e.g. @yourname",
    },
    {
      value: "paypal" as const,
      label: "PayPal handle",
      icon: CreditCard,
      placeholder: "Email or merchant ID",
    },
    {
      value: "cashapp" as const,
      label: "Cash App handle",
      icon: Wallet,
      placeholder: "e.g. $yourname",
    },
  ];
  const weekStartOptions: Array<{
    value: AdminCalendarWeekStart;
    label: string;
  }> = [
    { value: "monday", label: "Monday" },
    { value: "sunday", label: "Sunday" },
  ];

  function paymentSnapshot(methods: PaymentMethodState) {
    return JSON.stringify(methods);
  }

  function hydratePaymentMethods(
    provider: string | null | undefined,
    handle: string | null | undefined,
  ) {
    const next = blankPaymentMethods();
    const key = (provider || "").toLowerCase();
    if (key === "venmo" || key === "paypal" || key === "cashapp") {
      next[key] = {
        enabled: true,
        handle: (handle || "").trim(),
      };
    }
    return next;
  }

  $effect(() => {
    if (!authed) return;
    if (mockMode) {
      const next = hydratePaymentMethods(
        adminMockCatalog.paymentDefaults.provider,
        adminMockCatalog.paymentDefaults.handle,
      );
      paymentMethods = next;
      initialPaymentMethods = paymentMethodsClone(next);
      suspendPaymentAutosave = false;
      return;
    }
    void loadSettingsPane();
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
      if (paymentAutosaveTimer) clearTimeout(paymentAutosaveTimer);
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
      if (dashboard.error) {
        showToast(dashboard.error, true);
      }
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

  function paymentStateLabel(method: PaymentMethodKey) {
    const payment = paymentMethods[method];
    if (!payment.enabled) return "OFF";
    if (method === "venmo" || method === "paypal") {
      if (!dashboard.paymentIntegrations.paypal.enabled) return "NEEDS PAYPAL";
    }
    if (method === "cashapp" && !dashboard.paymentIntegrations.square.enabled) {
      return "NEEDS SQUARE";
    }
    return payment.handle.trim() ? "DEFAULT" : "NEEDS HANDLE";
  }

  function paymentStateTone(method: PaymentMethodKey) {
    const payment = paymentMethods[method];
    if (!payment.enabled) return "off";
    if ((method === "venmo" || method === "paypal") && !dashboard.paymentIntegrations.paypal.enabled) return "warn";
    if (method === "cashapp" && !dashboard.paymentIntegrations.square.enabled) return "warn";
    return payment.handle.trim() ? "on" : "warn";
  }

  function integrationSourceLabel(source: "stored" | "env" | null | undefined) {
    if (source === "stored") return "Settings";
    if (source === "env") return "Env";
    return "Not connected";
  }

  function integrationStatusLabel(enabled: boolean, source: "stored" | "env" | null | undefined) {
    return enabled ? integrationSourceLabel(source) : "Not connected";
  }

  function paymentMethodsClone(methods: PaymentMethodState) {
    return {
      venmo: { ...methods.venmo },
      paypal: { ...methods.paypal },
      cashapp: { ...methods.cashapp },
    };
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

  async function loadSettingsPane() {
    await dashboard.loadStatus();
    const next = hydratePaymentMethods(
      dashboard.paymentDefaults.provider,
      dashboard.paymentDefaults.handle,
    );
    paymentMethods = next;
    initialPaymentMethods = paymentMethodsClone(next);
    suspendPaymentAutosave = false;
  }

  function openPayPalCredentials() {
    payPalClientId = dashboard.paymentIntegrations.paypal.clientId || "";
    payPalEnvironment = dashboard.paymentIntegrations.paypal.environment || "sandbox";
    payPalClientSecret = "";
    payPalFormExpanded = true;
  }

  function openSquareCredentials() {
    squareApplicationId = dashboard.paymentIntegrations.square.applicationId || "";
    squareLocationId = dashboard.paymentIntegrations.square.locationId || "";
    squareEnvironment = dashboard.paymentIntegrations.square.environment === "production" ? "live" : "sandbox";
    squareAccessToken = "";
    squareFormExpanded = true;
  }

  function payPalSummary() {
    return dashboard.paymentIntegrations.paypal.clientId || "";
  }

  function squareSummary() {
    const { applicationId, locationId } = dashboard.paymentIntegrations.square;
    if (!applicationId && !locationId) return "";
    return `${applicationId || ""} / ${locationId || ""}`;
  }

  async function savePayPalCredentials() {
    if (!payPalClientId.trim() || !payPalClientSecret.trim()) {
      showToast("PayPal client ID and secret are required", true);
      return;
    }
    paymentIntegrationBusy = true;
    try {
      await dashboard.connectPayPal({
        clientId: payPalClientId.trim(),
        clientSecret: payPalClientSecret.trim(),
        environment: payPalEnvironment,
      });
      if (dashboard.error) {
        showToast(dashboard.error, true);
        return;
      }
      payPalClientSecret = "";
      payPalFormExpanded = false;
      await dashboard.loadStatus();
      showToast("PayPal and Venmo checkout connected");
    } finally {
      paymentIntegrationBusy = false;
    }
  }

  async function saveSquareCredentials() {
    if (!squareApplicationId.trim() || !squareLocationId.trim() || !squareAccessToken.trim()) {
      showToast("Square app ID, location ID, and access token are required", true);
      return;
    }
    paymentIntegrationBusy = true;
    try {
      await dashboard.connectSquare({
        applicationId: squareApplicationId.trim(),
        locationId: squareLocationId.trim(),
        accessToken: squareAccessToken.trim(),
        environment: squareEnvironment,
      });
      if (dashboard.error) {
        showToast(dashboard.error, true);
        return;
      }
      squareAccessToken = "";
      squareFormExpanded = false;
      await dashboard.loadStatus();
      showToast("Cash App Pay connected");
    } finally {
      paymentIntegrationBusy = false;
    }
  }

  async function disconnectPaymentCredentials(provider: "paypal" | "square") {
    paymentIntegrationBusy = true;
    try {
      await dashboard.disconnectPaymentIntegration(provider);
      if (dashboard.error) {
        showToast(dashboard.error, true);
        return;
      }
      await dashboard.loadStatus();
      showToast("Saved");
    } finally {
      paymentIntegrationBusy = false;
    }
  }

  function selectablePaymentMethods(method: PaymentMethodKey) {
    const current = paymentMethods[method];
    const next = blankPaymentMethods();
    if (!current.enabled) {
      next[method] = {
        enabled: true,
        handle: current.handle,
      };
    }
    return next;
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

  async function startSwitchProvider() {
    if (syncBusy.google || syncBusy.apple || syncBusy.outlook) return;
    syncOptionsExpanded = true;
  }

  async function persistPayments(expectedSnapshot: string) {
    if (paymentSnapshot(paymentMethods) !== expectedSnapshot) return;
    const enabledProviders = paymentProviders
      .filter((provider) => paymentMethods[provider.value].enabled)
      .map((provider) => provider.value);
    const primary = enabledProviders[0] || "";
    const primaryHandle = primary ? paymentMethods[primary].handle.trim() : "";
    if (primary && !primaryHandle) return;

    if (mockMode) {
      showToast("Saved");
      initialPaymentMethods = paymentMethodsClone(paymentMethods);
      return;
    }
    dashboard.paymentDefaults = {
      provider: primary || "",
      handle: primaryHandle,
    };
    await dashboard.savePaymentDefaults();
    if (dashboard.error) {
      showToast(dashboard.error, true);
      return;
    }
    initialPaymentMethods = paymentMethodsClone(paymentMethods);
    showToast("Saved");
  }

  $effect(() => {
    if (!authed || suspendPaymentAutosave) return;
    if (
      paymentSnapshot(paymentMethods) === paymentSnapshot(initialPaymentMethods)
    )
      return;
    if (paymentAutosaveTimer) clearTimeout(paymentAutosaveTimer);
    const expectedSnapshot = paymentSnapshot(paymentMethods);
    paymentAutosaveTimer = setTimeout(() => {
      void persistPayments(expectedSnapshot);
    }, 450);
  });

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

  function togglePaymentMethod(method: PaymentMethodKey) {
    paymentMethods = selectablePaymentMethods(method);
  }

  function updatePaymentHandle(method: PaymentMethodKey, value: string) {
    paymentMethods = {
      ...paymentMethods,
      [method]: {
        ...paymentMethods[method],
        handle: value,
      },
    };
  }
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

    <section class="admin-settings__section">
      <div class="admin-settings__section-head">
        <div>
          <h4>CALENDAR SYNC</h4>
        </div>
      </div>

      {#if primaryConnectedProvider() && !syncOptionsExpanded}
        <div class="admin-settings__sync-top-actions">
          <button
            type="button"
            class="admin-settings__switch-link"
            onclick={() => void startSwitchProvider()}
          >
            Show other providers
          </button>
        </div>
      {/if}
      <AdminMetaCards
        items={visibleSyncProviders().map((provider) => {
          const connected = providerConnected(provider.value)
          const providerStatus = dashboard.sync.providers[provider.value]
          const needsReconnect = !!providerStatus?.connected && !!providerStatus?.expired
          const busy = !!syncBusy[provider.value] || (connected && dashboard.disconnecting)
          const actionLabel = busy
            ? (connected ? `Disconnecting ${provider.label}` : `Connecting ${provider.label}`)
            : (connected ? `Disconnect ${provider.label}` : `${needsReconnect ? 'Reconnect' : 'Connect'} ${provider.label}`)
          const statusBadge = provider.supported
            ? {
                text: connected ? 'Connected' : (needsReconnect ? 'Needs reconnect' : 'Not connected'),
                tone: connected ? 'success' as const : 'warn' as const,
              }
            : { text: 'Unavailable', tone: 'neutral' as const }
          return {
            id: provider.value,
            label: provider.label,
            statusBadge,
            extra: { providerValue: provider.value, busy },
            actions: provider.supported ? [{
              variant: connected ? 'danger' as const : 'subtle' as const,
              icon: busy ? null : (connected ? X : Plus),
              ariaLabel: actionLabel,
              onclick: () => void toggleSyncProvider(provider.value),
            }] : [],
          }
        })}
      >
        {#snippet customIcon(item)}
          <span class="admin-settings__sync-icon" aria-hidden="true">
            {#if (item.extra as { providerValue: string }).providerValue === 'google'}
              <svg viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
            {:else if (item.extra as { providerValue: string }).providerValue === 'apple'}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.37 12.45c.02 2.25 1.97 3 2 3.01-.02.05-.31 1.08-1.02 2.13-.61.91-1.25 1.82-2.25 1.84-.98.02-1.3-.58-2.43-.58-1.13 0-1.49.56-2.41.6-.96.04-1.69-.97-2.31-1.87-1.26-1.82-2.22-5.14-.93-7.38.64-1.11 1.79-1.82 3.04-1.84.95-.02 1.84.64 2.43.64.59 0 1.7-.79 2.86-.67.49.02 1.87.2 2.76 1.5-.07.04-1.65.96-1.64 2.62zM14.81 4.35c.51-.62.86-1.48.77-2.35-.74.03-1.64.49-2.18 1.1-.48.55-.9 1.42-.79 2.26.82.06 1.69-.42 2.2-1.01z" />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13Zm1.8.3v12.4h14.4V5.8H4.8Zm1.7 2.2h10.9v1.8H6.5V8Zm0 3.2h10.9V13H6.5v-1.8Zm0 3.2h7.1v1.8H6.5v-1.8Z" />
              </svg>
            {/if}
          </span>
        {/snippet}
      </AdminMetaCards>
      {#if appleFormExpanded}
        <div class="admin-settings__apple-form">
          <label>
            <span>Apple ID email</span>
            <input class="ui-form-control" type="email" autocomplete="username" bind:value={appleUsername} />
          </label>
          <label>
            <span>App-specific password</span>
            <input class="ui-form-control" type="password" autocomplete="new-password" bind:value={appleAppPassword} />
          </label>
          <label>
            <span>CalDAV calendar URL</span>
            <input class="ui-form-control" type="url" placeholder="https://caldav.icloud.com/..." bind:value={appleCalendarUrl} />
          </label>
          <div class="admin-settings__apple-actions">
            <button type="button" class="admin-settings__switch-link" onclick={() => (appleFormExpanded = false)}>Cancel</button>
            <button type="button" class="admin-settings__apple-submit" disabled={syncBusy.apple} onclick={() => void connectAppleProvider()}>
              {syncBusy.apple ? "Connecting..." : "Connect Apple Calendar"}
            </button>
          </div>
        </div>
      {/if}
      {#if primaryConnectedProvider() && syncOptionsExpanded}
        <div class="admin-settings__sync-top-actions">
          <button
            type="button"
            class="admin-settings__switch-link"
            onclick={() => (syncOptionsExpanded = false)}
          >
            Hide other providers
          </button>
        </div>
      {/if}
    </section>

    <section class="admin-settings__section">
      <div class="admin-settings__section-head">
        <div>
          <h4>CALENDAR VIEW</h4>
        </div>
      </div>

      <fieldset class="admin-settings__platform-field">
        <legend>Week starts on</legend>
        <div
          class="admin-settings__platform-options"
          role="radiogroup"
          aria-label="Week starts on"
        >
          {#each weekStartOptions as option}
            <label
              class="ui-form-radio admin-settings__platform-option"
              class:admin-settings__platform-option--active={calendarWeekStart ===
                option.value}
            >
              <input
                class="ui-form-radio__control"
                type="radio"
                name="calendar-week-start"
                value={option.value}
                bind:group={calendarWeekStart}
              />
              <span class="ui-form-radio__label admin-settings__platform-label"
                >{option.label}</span
              >
            </label>
          {/each}
        </div>
      </fieldset>
    </section>

    <section class="admin-settings__section">
      <div class="admin-settings__section-head">
        <div>
          <h4>PAYMENT INFO</h4>
        </div>
      </div>

      <h5 class="admin-settings__group-title">PAYMENT METHODS</h5>
      <AdminGroupedCard>
        {#each paymentProviders as provider}
          <AdminPaymentMethodCard
            id={provider.value}
            label={provider.label}
            icon={provider.icon}
            enabled={paymentMethods[provider.value].enabled}
            stateLabel={paymentStateLabel(provider.value)}
            stateTone={paymentStateTone(provider.value)}
            handle={paymentMethods[provider.value].handle}
            placeholder={provider.placeholder}
            toggle={() => togglePaymentMethod(provider.value)}
            updateHandle={(value) => updatePaymentHandle(provider.value, value)}
          >
            {#if provider.value === "cashapp"}
              <div class="payment-method-card__setup-title">
                <span>Cash App Pay setup</span>
                <span
                  class="payment-method-card__setup-badge"
                  class:payment-method-card__setup-badge--on={dashboard.paymentIntegrations.square.enabled}
                >
                  {integrationStatusLabel(dashboard.paymentIntegrations.square.enabled, dashboard.paymentIntegrations.square.source)}
                </span>
              </div>
              {#if dashboard.paymentIntegrations.square.enabled && !squareFormExpanded}
                <label for="payment-integration-cash-app-pay-checkout">
                  <span>Application / location</span>
                  <input
                    id="payment-integration-cash-app-pay-checkout"
                    class="ui-form-control"
                    type="text"
                    value={squareSummary()}
                    readonly
                  />
                </label>
                <div class="payment-method-card__actions">
                  <button type="button" class="payment-method-card__link" disabled={paymentIntegrationBusy} onclick={() => void disconnectPaymentCredentials("square")}>Disconnect</button>
                  <button type="button" class="payment-method-card__submit" disabled={paymentIntegrationBusy} onclick={openSquareCredentials}>Edit setup</button>
                </div>
              {:else if squareFormExpanded}
                <label>
                  <span>Environment</span>
                  <select class="ui-form-control" bind:value={squareEnvironment}>
                    <option value="sandbox">Sandbox</option>
                    <option value="live">Live</option>
                  </select>
                </label>
                <label>
                  <span>Application ID</span>
                  <input class="ui-form-control" type="text" autocomplete="off" bind:value={squareApplicationId} />
                </label>
                <label>
                  <span>Location ID</span>
                  <input class="ui-form-control" type="text" autocomplete="off" bind:value={squareLocationId} />
                </label>
                <label>
                  <span>Access token</span>
                  <input class="ui-form-control" type="password" autocomplete="new-password" bind:value={squareAccessToken} />
                </label>
                <div class="payment-method-card__actions">
                  <button type="button" class="payment-method-card__link" onclick={() => (squareFormExpanded = false)}>Cancel</button>
                  <button type="button" class="payment-method-card__submit" disabled={paymentIntegrationBusy} onclick={() => void saveSquareCredentials()}>
                    {paymentIntegrationBusy ? "Saving..." : "Save Cash App Pay setup"}
                  </button>
                </div>
              {:else}
                <div class="payment-method-card__actions">
                  <button type="button" class="payment-method-card__submit" disabled={paymentIntegrationBusy} onclick={openSquareCredentials}>Set up Cash App Pay</button>
                </div>
              {/if}
            {:else}
              <div class="payment-method-card__setup-title">
                <span>{provider.value === "venmo" ? "Venmo checkout setup" : "PayPal checkout setup"}</span>
                <span
                  class="payment-method-card__setup-badge"
                  class:payment-method-card__setup-badge--on={dashboard.paymentIntegrations.paypal.enabled}
                >
                  {integrationStatusLabel(dashboard.paymentIntegrations.paypal.enabled, dashboard.paymentIntegrations.paypal.source)}
                </span>
              </div>
              {#if dashboard.paymentIntegrations.paypal.enabled && !payPalFormExpanded}
                <label for="payment-integration-paypal-venmo-checkout">
                  <span>Client ID</span>
                  <input
                    id="payment-integration-paypal-venmo-checkout"
                    class="ui-form-control"
                    type="text"
                    value={payPalSummary()}
                    readonly
                  />
                </label>
                <div class="payment-method-card__actions">
                  <button type="button" class="payment-method-card__link" disabled={paymentIntegrationBusy} onclick={() => void disconnectPaymentCredentials("paypal")}>Disconnect</button>
                  <button type="button" class="payment-method-card__submit" disabled={paymentIntegrationBusy} onclick={openPayPalCredentials}>Edit setup</button>
                </div>
              {:else if payPalFormExpanded}
                <label>
                  <span>Environment</span>
                  <select class="ui-form-control" bind:value={payPalEnvironment}>
                    <option value="sandbox">Sandbox</option>
                    <option value="live">Live</option>
                  </select>
                </label>
                <label>
                  <span>Client ID</span>
                  <input class="ui-form-control" type="text" autocomplete="off" bind:value={payPalClientId} />
                </label>
                <label>
                  <span>Client secret</span>
                  <input class="ui-form-control" type="password" autocomplete="new-password" bind:value={payPalClientSecret} />
                </label>
                <div class="payment-method-card__actions">
                  <button type="button" class="payment-method-card__link" onclick={() => (payPalFormExpanded = false)}>Cancel</button>
                  <button type="button" class="payment-method-card__submit" disabled={paymentIntegrationBusy} onclick={() => void savePayPalCredentials()}>
                    {paymentIntegrationBusy ? "Saving..." : "Save PayPal setup"}
                  </button>
                </div>
              {:else}
                <div class="payment-method-card__actions">
                  <button type="button" class="payment-method-card__submit" disabled={paymentIntegrationBusy} onclick={openPayPalCredentials}>Set up checkout</button>
                </div>
              {/if}
            {/if}
          </AdminPaymentMethodCard>
        {/each}
      </AdminGroupedCard>
    </section>
  </div>
{/if}

<style>
  .admin-settings {
    font-family: var(--font-ui-sans, var(--font-sans));
    display: grid;
    gap: 0.9rem;
    width: 100%;
  }

  .admin-settings__section {
    display: grid;
    gap: 0.85rem;
    padding: 0;
  }

  .admin-settings__section + .admin-settings__section {
    margin-top: 1rem;
  }

  .admin-settings__section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .admin-settings__sync-top-actions {
    display: flex;
    justify-content: flex-end;
  }

  .admin-settings__group-title {
    margin: 0 0 -0.35rem;
    font-size: 0.68rem;
    font-weight: 720;
    letter-spacing: 0.06em;
    color: color-mix(in srgb, var(--text) 48%, transparent);
  }

  .admin-settings__switch-link {
    border: none;
    background: none;
    color: color-mix(in srgb, var(--text) 58%, transparent);
    font: inherit;
    font-size: 0.72rem;
    font-weight: 560;
    cursor: pointer;
    padding: 0;
  }

  .admin-settings__switch-link:hover {
    color: color-mix(in srgb, var(--admin-accent) 82%, var(--text) 18%);
  }

  .admin-settings__sync-icon {
    width: 1.35rem;
    height: 1.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--text) 72%, transparent);
  }

  .admin-settings__sync-icon svg {
    width: 1rem;
    height: 1rem;
    display: block;
  }

  .admin-settings__apple-form {
    display: grid;
    gap: 0.65rem;
    padding: 0.85rem;
    border: 1px solid var(--admin-card-border);
    border-radius: 0.875rem;
    background: var(--admin-card-bg);
  }

  .admin-settings__apple-form label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.72rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
  }

  .admin-settings__apple-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
  }

  .admin-settings__apple-submit {
    border: 1px solid color-mix(in srgb, var(--admin-accent) 28%, transparent);
    border-radius: 0.625rem;
    background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
    color: var(--text);
    padding: 0.55rem 0.8rem;
    font: inherit;
    font-size: 0.76rem;
    font-weight: 650;
    cursor: pointer;
  }

  .admin-settings__apple-submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .admin-settings__platform-field {
    border: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.4rem;
  }

  .admin-settings__platform-field legend {
    font-size: 0.74rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
    margin-bottom: 0.05rem;
  }

  .admin-settings__platform-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .admin-settings__platform-option {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.875rem;
    border-radius: 0.875rem;
    border: 1px solid var(--admin-card-border);
    background: var(--admin-card-bg);
    color: color-mix(in srgb, var(--text) 70%, transparent);
    cursor: pointer;
    transition:
      border-color 120ms ease,
      background 120ms ease,
      color 120ms ease;
  }

  .admin-settings__platform-option:hover {
    background: var(--admin-card-bg-hover, var(--admin-card-bg));
    border-color: color-mix(in srgb, var(--admin-accent) 24%, transparent);
  }

  .admin-settings__platform-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .admin-settings__platform-option--active {
    border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
    background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
    color: var(--text);
  }

  .admin-settings__platform-label {
    font-size: 0.76rem;
    font-weight: 620;
    letter-spacing: -0.005em;
  }

  .admin-settings__toast {
    bottom: 1rem;
    z-index: 120;
    font-size: 0.78rem;
  }

  @media (max-width: 720px) {
    .admin-settings__section-head {
      flex-direction: column;
      gap: 0.5rem;
    }

    .admin-settings__platform-options {
      grid-template-columns: 1fr;
    }
  }
</style>
