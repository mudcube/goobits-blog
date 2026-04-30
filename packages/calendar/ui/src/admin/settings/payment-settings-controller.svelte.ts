import type { AdminPaymentIntegrationsResponse } from "../../api/admin";

export type PaymentMethodKey = "venmo" | "paypal" | "cashapp";
export type PaymentMethodState = Record<
  PaymentMethodKey,
  { enabled: boolean; handle: string }
>;

type PaymentIntegrations = AdminPaymentIntegrationsResponse["payments"];

type PaymentSettingsDashboard = {
  paymentDefaults: { provider: string; handle: string };
  paymentIntegrations: PaymentIntegrations;
  error: string;
  loadStatus: () => Promise<void>;
  savePaymentDefaults: () => Promise<void>;
  connectPayPal: (input: {
    clientId: string;
    clientSecret: string;
    environment: "sandbox" | "live";
  }) => Promise<void>;
  connectSquare: (input: {
    applicationId: string;
    locationId: string;
    accessToken: string;
    environment: "sandbox" | "live";
  }) => Promise<void>;
  disconnectPaymentIntegration: (provider: "paypal" | "square") => Promise<void>;
};

type PaymentSettingsOptions = {
  dashboard: () => PaymentSettingsDashboard;
  mockMode: () => boolean;
  mockDefaults: () => { provider: string | null; handle: string | null };
  showToast: (message: string, isError?: boolean) => void;
};

export function blankPaymentMethods(): PaymentMethodState {
  return {
    venmo: { enabled: false, handle: "" },
    paypal: { enabled: false, handle: "" },
    cashapp: { enabled: false, handle: "" },
  };
}

function paymentMethodsClone(methods: PaymentMethodState) {
  return {
    venmo: { ...methods.venmo },
    paypal: { ...methods.paypal },
    cashapp: { ...methods.cashapp },
  };
}

function paymentSnapshot(methods: PaymentMethodState) {
  return JSON.stringify(methods);
}

export function hydratePaymentMethods(
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

export function paymentRailForMethod(method: PaymentMethodKey) {
  return method === "cashapp" ? "cash_app_pay" : "paypal_checkout";
}

export function paymentMethodUsesPayPalCheckout(method: PaymentMethodKey) {
  return paymentRailForMethod(method) === "paypal_checkout";
}

export function createPaymentSettingsController(options: PaymentSettingsOptions) {
  const { showToast } = options;
  let paymentMethods = $state<PaymentMethodState>(blankPaymentMethods());
  let initialPaymentMethods = $state<PaymentMethodState>(blankPaymentMethods());
  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let suspendAutosave = $state(true);
  let payPalFormExpanded = $state(false);
  let payPalClientId = $state("");
  let payPalClientSecret = $state("");
  let payPalEnvironment = $state<"sandbox" | "live">("sandbox");
  let cashAppPayFormExpanded = $state(false);
  let cashAppPayApplicationId = $state("");
  let cashAppPayLocationId = $state("");
  let cashAppPayAccessToken = $state("");
  let cashAppPayEnvironment = $state<"sandbox" | "live">("sandbox");
  let paymentIntegrationBusy = $state(false);

  function dispose() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
  }

  function setPaymentMethods(next: PaymentMethodState) {
    paymentMethods = next;
  }

  async function load() {
    const dashboard = options.dashboard();
    if (options.mockMode()) {
      const mockDefaults = options.mockDefaults();
      const next = hydratePaymentMethods(mockDefaults.provider, mockDefaults.handle);
      paymentMethods = next;
      initialPaymentMethods = paymentMethodsClone(next);
      suspendAutosave = false;
      return;
    }
    await dashboard.loadStatus();
    const next = hydratePaymentMethods(
      dashboard.paymentDefaults.provider,
      dashboard.paymentDefaults.handle,
    );
    paymentMethods = next;
    initialPaymentMethods = paymentMethodsClone(next);
    suspendAutosave = false;
  }

  function paymentBadge(method: PaymentMethodKey): {
    label: string | null;
    tone: "on" | "warn" | null;
  } {
    const payment = paymentMethods[method];
    if (!payment.enabled) return { label: null, tone: null };
    if (!payment.handle.trim()) return { label: "Add handle", tone: "warn" };
    return { label: "Default", tone: "on" };
  }

  function integrationSourceLabel(source: "stored" | "env" | null | undefined) {
    if (source === "stored") return "Settings";
    if (source === "env") return "Env";
    return "Not connected";
  }

  function openPayPalSetup() {
    const dashboard = options.dashboard();
    payPalClientId = dashboard.paymentIntegrations.paypal.clientId || "";
    payPalEnvironment = dashboard.paymentIntegrations.paypal.environment || "sandbox";
    payPalClientSecret = "";
    payPalFormExpanded = true;
  }

  function openCashAppPaySetup() {
    const dashboard = options.dashboard();
    cashAppPayApplicationId = dashboard.paymentIntegrations.square.applicationId || "";
    cashAppPayLocationId = dashboard.paymentIntegrations.square.locationId || "";
    cashAppPayEnvironment =
      dashboard.paymentIntegrations.square.environment === "production"
        ? "live"
        : "sandbox";
    cashAppPayAccessToken = "";
    cashAppPayFormExpanded = true;
  }

  async function savePayPalSetup() {
    const dashboard = options.dashboard();
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

  async function saveCashAppPaySetup() {
    const dashboard = options.dashboard();
    if (
      !cashAppPayApplicationId.trim() ||
      !cashAppPayLocationId.trim() ||
      !cashAppPayAccessToken.trim()
    ) {
      showToast("Cash App Pay app ID, location ID, and access token are required", true);
      return;
    }
    paymentIntegrationBusy = true;
    try {
      await dashboard.connectSquare({
        applicationId: cashAppPayApplicationId.trim(),
        locationId: cashAppPayLocationId.trim(),
        accessToken: cashAppPayAccessToken.trim(),
        environment: cashAppPayEnvironment,
      });
      if (dashboard.error) {
        showToast(dashboard.error, true);
        return;
      }
      cashAppPayAccessToken = "";
      cashAppPayFormExpanded = false;
      await dashboard.loadStatus();
      showToast("Cash App Pay connected");
    } finally {
      paymentIntegrationBusy = false;
    }
  }

  async function disconnectCheckout(rail: "paypal_checkout" | "cash_app_pay") {
    const dashboard = options.dashboard();
    paymentIntegrationBusy = true;
    try {
      await dashboard.disconnectPaymentIntegration(
        rail === "paypal_checkout" ? "paypal" : "square",
      );
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

  async function persistPayments(expectedSnapshot: string) {
    if (paymentSnapshot(paymentMethods) !== expectedSnapshot) return;
    const enabledProviders = (["venmo", "paypal", "cashapp"] as const)
      .filter((provider) => paymentMethods[provider].enabled);
    const primary = enabledProviders[0] || "";
    const primaryHandle = primary ? paymentMethods[primary].handle.trim() : "";
    if (primary && !primaryHandle) return;

    if (options.mockMode()) {
      showToast("Saved");
      initialPaymentMethods = paymentMethodsClone(paymentMethods);
      return;
    }
    const dashboard = options.dashboard();
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
    if (suspendAutosave) return;
    if (paymentSnapshot(paymentMethods) === paymentSnapshot(initialPaymentMethods)) return;
    if (autosaveTimer) clearTimeout(autosaveTimer);
    const expectedSnapshot = paymentSnapshot(paymentMethods);
    autosaveTimer = setTimeout(() => {
      void persistPayments(expectedSnapshot);
    }, 450);
  });

  return {
    get paymentMethods() {
      return paymentMethods;
    },
    setPaymentMethods,
    get payPalFormExpanded() {
      return payPalFormExpanded;
    },
    set payPalFormExpanded(value: boolean) {
      payPalFormExpanded = value;
    },
    get payPalClientId() {
      return payPalClientId;
    },
    set payPalClientId(value: string) {
      payPalClientId = value;
    },
    get payPalClientSecret() {
      return payPalClientSecret;
    },
    set payPalClientSecret(value: string) {
      payPalClientSecret = value;
    },
    get payPalEnvironment() {
      return payPalEnvironment;
    },
    set payPalEnvironment(value: "sandbox" | "live") {
      payPalEnvironment = value;
    },
    get cashAppPayFormExpanded() {
      return cashAppPayFormExpanded;
    },
    set cashAppPayFormExpanded(value: boolean) {
      cashAppPayFormExpanded = value;
    },
    get cashAppPayApplicationId() {
      return cashAppPayApplicationId;
    },
    set cashAppPayApplicationId(value: string) {
      cashAppPayApplicationId = value;
    },
    get cashAppPayLocationId() {
      return cashAppPayLocationId;
    },
    set cashAppPayLocationId(value: string) {
      cashAppPayLocationId = value;
    },
    get cashAppPayAccessToken() {
      return cashAppPayAccessToken;
    },
    set cashAppPayAccessToken(value: string) {
      cashAppPayAccessToken = value;
    },
    get cashAppPayEnvironment() {
      return cashAppPayEnvironment;
    },
    set cashAppPayEnvironment(value: "sandbox" | "live") {
      cashAppPayEnvironment = value;
    },
    get paymentIntegrationBusy() {
      return paymentIntegrationBusy;
    },
    load,
    dispose,
    paymentBadge,
    integrationSourceLabel,
    openPayPalSetup,
    openCashAppPaySetup,
    savePayPalSetup,
    saveCashAppPaySetup,
    disconnectCheckout,
    togglePaymentMethod,
    updatePaymentHandle,
  };
}
