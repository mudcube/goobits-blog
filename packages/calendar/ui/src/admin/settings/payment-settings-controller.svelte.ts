import type { AdminPaymentIntegrationsResponse } from "../../api/admin";

export type PaymentMethodKey = "venmo" | "paypal" | "cashapp";
export const PAYMENT_METHOD_KEYS: PaymentMethodKey[] = [
  "venmo",
  "paypal",
  "cashapp",
];

type PaymentIntegrations = AdminPaymentIntegrationsResponse["payments"];
type PaymentHandles = Record<PaymentMethodKey, string>;
type PaymentHandlesInput = Partial<
  Record<PaymentMethodKey, string | null | undefined>
>;

type PaymentDefaultsShape = {
  provider: string;
  handle: string;
  primaryProvider?: string;
  handles?: PaymentHandlesInput;
};

type PaymentSettingsDashboard = {
  paymentDefaults: PaymentDefaultsShape;
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
  disconnectPaymentIntegration: (
    provider: "paypal" | "square",
  ) => Promise<void>;
};

type PaymentSettingsOptions = {
  dashboard: () => PaymentSettingsDashboard;
  mockMode: () => boolean;
  mockDefaults: () => {
    provider: string | null;
    handle: string | null;
    primaryProvider?: string | null;
    handles?: PaymentHandlesInput;
  };
  showToast: (message: string, isError?: boolean) => void;
};

function blankHandles(): PaymentHandles {
  return { venmo: "", paypal: "", cashapp: "" };
}

function normalizeMethod(
  value: string | null | undefined,
): PaymentMethodKey | "" {
  if (value === "venmo" || value === "paypal" || value === "cashapp")
    return value;
  return "";
}

function readHandles(
  input: PaymentHandlesInput | undefined,
  fallbackProvider: string,
  fallbackHandle: string,
): PaymentHandles {
  const result = blankHandles();
  if (input) {
    for (const key of PAYMENT_METHOD_KEYS) {
      const value = input[key];
      if (typeof value === "string") result[key] = value;
    }
  }
  const provider = normalizeMethod(fallbackProvider);
  if (provider && !result[provider] && fallbackHandle) {
    result[provider] = fallbackHandle;
  }
  return result;
}

function snapshot(handles: PaymentHandles, primary: PaymentMethodKey | "") {
  return JSON.stringify({ handles, primary });
}

export function paymentRailForMethod(method: PaymentMethodKey) {
  return method === "cashapp" ? "cash_app_pay" : "paypal_checkout";
}

export function paymentMethodUsesPayPalCheckout(method: PaymentMethodKey) {
  return paymentRailForMethod(method) === "paypal_checkout";
}

export function createPaymentSettingsController(
  options: PaymentSettingsOptions,
) {
  const { showToast } = options;
  let handles = $state<PaymentHandles>(blankHandles());
  let primary = $state<PaymentMethodKey | "">("");
  let editing = $state<PaymentMethodKey | null>(null);
  let initialSnapshot = $state(snapshot(blankHandles(), ""));
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

  function isConfigured(method: PaymentMethodKey) {
    return handles[method].trim().length > 0;
  }

  function configuredMethods(): PaymentMethodKey[] {
    return PAYMENT_METHOD_KEYS.filter((method) => isConfigured(method));
  }

  function pickFallbackPrimary(): PaymentMethodKey | "" {
    return configuredMethods()[0] ?? "";
  }

  function ensurePrimary() {
    if (primary && isConfigured(primary)) return;
    primary = pickFallbackPrimary();
  }

  async function load() {
    const dashboard = options.dashboard();
    if (options.mockMode()) {
      const mock = options.mockDefaults();
      const nextHandles = readHandles(
        mock.handles,
        (mock.primaryProvider ?? mock.provider ?? "") || "",
        (mock.handle ?? "") || "",
      );
      handles = nextHandles;
      const explicit = normalizeMethod(mock.primaryProvider ?? mock.provider);
      primary =
        explicit && nextHandles[explicit].trim()
          ? explicit
          : pickFallbackPrimary();
      editing = primary || null;
      initialSnapshot = snapshot(handles, primary);
      suspendAutosave = false;
      return;
    }
    await dashboard.loadStatus();
    const defaults = dashboard.paymentDefaults;
    const nextHandles = readHandles(
      defaults.handles,
      defaults.primaryProvider ?? defaults.provider ?? "",
      defaults.handle ?? "",
    );
    handles = nextHandles;
    const explicit = normalizeMethod(
      defaults.primaryProvider ?? defaults.provider,
    );
    primary =
      explicit && nextHandles[explicit].trim()
        ? explicit
        : pickFallbackPrimary();
    editing = primary || null;
    initialSnapshot = snapshot(handles, primary);
    suspendAutosave = false;
  }

  function startEditing(method: PaymentMethodKey) {
    editing = method;
  }

  function updateHandle(method: PaymentMethodKey, value: string) {
    handles = { ...handles, [method]: value };
    if (!isConfigured(method) && primary === method) {
      ensurePrimary();
    }
    if (!primary && isConfigured(method)) {
      primary = method;
    }
  }

  function removeHandle(method: PaymentMethodKey) {
    handles = { ...handles, [method]: "" };
    if (primary === method) ensurePrimary();
    if (editing === method) editing = primary || null;
  }

  function makePrimary(method: PaymentMethodKey) {
    if (!isConfigured(method)) {
      showToast("Add a handle before marking as primary", true);
      return;
    }
    primary = method;
  }

  function integrationSourceLabel(source: "stored" | "env" | null | undefined) {
    if (source === "stored") return "Settings";
    if (source === "env") return "Env";
    return "Not connected";
  }

  function openPayPalSetup() {
    const dashboard = options.dashboard();
    payPalClientId = dashboard.paymentIntegrations.paypal.clientId || "";
    payPalEnvironment =
      dashboard.paymentIntegrations.paypal.environment || "sandbox";
    payPalClientSecret = "";
    payPalFormExpanded = true;
  }

  function openCashAppPaySetup() {
    const dashboard = options.dashboard();
    cashAppPayApplicationId =
      dashboard.paymentIntegrations.square.applicationId || "";
    cashAppPayLocationId =
      dashboard.paymentIntegrations.square.locationId || "";
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
      showToast(
        "Cash App Pay app ID, location ID, and access token are required",
        true,
      );
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

  async function persistPayments(expected: string) {
    if (snapshot(handles, primary) !== expected) return;
    if (options.mockMode()) {
      showToast("Saved");
      initialSnapshot = expected;
      return;
    }
    const dashboard = options.dashboard();
    const trimmed: PaymentHandles = {
      venmo: handles.venmo.trim(),
      paypal: handles.paypal.trim(),
      cashapp: handles.cashapp.trim(),
    };
    const effectivePrimary = primary && trimmed[primary] ? primary : "";
    dashboard.paymentDefaults = {
      ...dashboard.paymentDefaults,
      provider: effectivePrimary,
      handle: effectivePrimary ? trimmed[effectivePrimary] : "",
      primaryProvider: effectivePrimary,
      handles: { ...trimmed },
    };
    await dashboard.savePaymentDefaults();
    if (dashboard.error) {
      showToast(dashboard.error, true);
      return;
    }
    initialSnapshot = expected;
    showToast("Saved");
  }

  $effect(() => {
    if (suspendAutosave) return;
    const current = snapshot(handles, primary);
    if (current === initialSnapshot) return;
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      void persistPayments(current);
    }, 500);
  });

  return {
    get handles() {
      return handles;
    },
    get primary() {
      return primary;
    },
    get editing() {
      return editing;
    },
    isConfigured,
    configuredMethods,
    startEditing,
    updateHandle,
    removeHandle,
    makePrimary,
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
    integrationSourceLabel,
    openPayPalSetup,
    openCashAppPaySetup,
    savePayPalSetup,
    saveCashAppPaySetup,
    disconnectCheckout,
  };
}
