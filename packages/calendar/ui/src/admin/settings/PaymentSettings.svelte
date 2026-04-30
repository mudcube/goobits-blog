<script lang="ts">
  import { onDestroy } from "svelte";
  import { CreditCard, HandCoins, Wallet } from "@lucide/svelte";
  import PaymentMethodTile from "./PaymentMethodTile.svelte";
  import {
    createPaymentSettingsController,
    paymentMethodUsesPayPalCheckout,
    type PaymentMethodKey,
  } from "./payment-settings-controller.svelte";
  import type { AdminPaymentIntegrationsResponse } from "../../api/admin";

  type PaymentSettingsDashboard = {
    paymentDefaults: {
      provider: string;
      handle: string;
      primaryProvider?: string;
      handles?: Partial<Record<PaymentMethodKey, string | null | undefined>>;
    };
    paymentIntegrations: AdminPaymentIntegrationsResponse["payments"];
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

  const { dashboard, authed, mockMode, mockDefaults, showToast } = $props<{
    dashboard: PaymentSettingsDashboard;
    authed: boolean;
    mockMode: boolean;
    mockDefaults: {
      provider: string | null;
      handle: string | null;
      primaryProvider?: string | null | undefined;
      handles?:
        | Partial<Record<PaymentMethodKey, string | null | undefined>>
        | undefined;
    };
    showToast: (message: string, isError?: boolean) => void;
  }>();

  const payment = createPaymentSettingsController({
    dashboard: () => dashboard,
    mockMode: () => mockMode,
    mockDefaults: () => mockDefaults,
    showToast: (message, isError) => showToast(message, isError),
  });

  type PaymentProviderMeta = {
    value: PaymentMethodKey;
    label: string;
    icon: typeof HandCoins;
    color: string;
    placeholder: string;
    handleLabel: string;
    helper: (handle: string) => string;
    checkoutBlurb: string;
    checkoutCta: string;
  };

  const paymentProviders: PaymentProviderMeta[] = [
    {
      value: "venmo",
      label: "Venmo",
      icon: HandCoins,
      color: "#3D95CE",
      placeholder: "@yourname",
      handleLabel: "Your Venmo handle",
      helper: (handle) =>
        handle.trim()
          ? `Buyers see venmo.com/u/${handle.trim().replace(/^@/, "")}`
          : "Buyers tap a link that opens the Venmo app.",
      checkoutBlurb: "Adds a Venmo button to bookings (uses your PayPal account).",
      checkoutCta: "Connect PayPal",
    },
    {
      value: "paypal",
      label: "PayPal",
      icon: CreditCard,
      color: "#0070BA",
      placeholder: "Email or merchant ID",
      handleLabel: "Your PayPal handle",
      helper: (handle) =>
        handle.trim()
          ? `Buyers see paypal.me/${handle.trim()}`
          : "Buyers tap a link that opens PayPal.",
      checkoutBlurb: "Adds a PayPal button to bookings.",
      checkoutCta: "Connect PayPal",
    },
    {
      value: "cashapp",
      label: "Cash App",
      icon: Wallet,
      color: "#00C244",
      placeholder: "$yourname",
      handleLabel: "Your Cash App handle",
      helper: (handle) =>
        handle.trim()
          ? `Buyers see cash.app/${handle.trim().replace(/^\$/, "$")}`
          : "Buyers tap a link that opens Cash App.",
      checkoutBlurb: "Adds a Cash App Pay button to bookings.",
      checkoutCta: "Connect Cash App Pay",
    },
  ];

  $effect(() => {
    if (!authed) return;
    void payment.load();
  });

  onDestroy(() => payment.dispose());

  const editingMeta = $derived(
    payment.editing
      ? paymentProviders.find((p) => p.value === payment.editing) ?? null
      : null,
  );

  function checkoutEnabledFor(method: PaymentMethodKey) {
    return paymentMethodUsesPayPalCheckout(method)
      ? dashboard.paymentIntegrations.paypal.enabled
      : dashboard.paymentIntegrations.square.enabled;
  }

  function checkoutSourceFor(method: PaymentMethodKey) {
    return paymentMethodUsesPayPalCheckout(method)
      ? dashboard.paymentIntegrations.paypal.source
      : dashboard.paymentIntegrations.square.source;
  }
</script>

<section class="payment-settings admin-settings__section">
  <div class="admin-settings__section-head">
    <div>
      <h4>PAYMENT</h4>
      <p class="admin-settings__section-sub">
        How buyers pay you. Add as many methods as you want — pick one as primary.
      </p>
    </div>
  </div>

  <div class="payment-settings__tiles">
    {#each paymentProviders as provider}
      <PaymentMethodTile
        label={provider.label}
        icon={provider.icon}
        color={provider.color}
        configured={payment.isConfigured(provider.value)}
        editing={payment.editing === provider.value}
        primary={payment.primary === provider.value}
        onclick={() => payment.startEditing(provider.value)}
      />
    {/each}
  </div>

  {#if payment.editing && editingMeta}
    {@const editingKey = payment.editing}
    {@const handle = payment.handles[editingKey]}
    {@const isConfigured = payment.isConfigured(editingKey)}
    {@const isPrimary = payment.primary === editingKey}
    {@const usesPayPal = paymentMethodUsesPayPalCheckout(editingKey)}
    {@const checkoutOn = checkoutEnabledFor(editingKey)}
    {@const checkoutSource = checkoutSourceFor(editingKey)}
    <div class="payment-detail" style="--method-color: {editingMeta.color}">
      <div class="payment-detail__head">
        <h5 class="payment-detail__title">
          <span
            class="payment-detail__title-dot"
            style="background: {editingMeta.color}"
            aria-hidden="true"
          ></span>
          {editingMeta.label}
        </h5>
        {#if isPrimary && isConfigured}
          <span class="payment-detail__primary-pill">Primary</span>
        {:else if isConfigured}
          <button
            type="button"
            class="payment-detail__make-primary"
            onclick={() => payment.makePrimary(editingKey)}
          >
            Make primary
          </button>
        {/if}
      </div>

      <div class="payment-detail__field">
        <label for={`payment-handle-${editingKey}`}>{editingMeta.handleLabel}</label>
        <input
          id={`payment-handle-${editingKey}`}
          class="ui-form-control payment-detail__input"
          type="text"
          value={handle}
          placeholder={editingMeta.placeholder}
          oninput={(event) =>
            payment.updateHandle(
              editingKey,
              (event.currentTarget as HTMLInputElement).value,
            )}
        />
        <p class="payment-detail__hint">{editingMeta.helper(handle)}</p>
      </div>

      <div class="payment-detail__divider" aria-hidden="true"></div>

      <div class="payment-detail__checkout">
        <div class="payment-detail__checkout-head">
          <div>
            <h5 class="payment-detail__checkout-title">Online checkout</h5>
            <p class="payment-detail__checkout-blurb">{editingMeta.checkoutBlurb}</p>
          </div>
          {#if checkoutOn}
            <span class="payment-detail__pill payment-detail__pill--on">
              ✓ {payment.integrationSourceLabel(checkoutSource)}
            </span>
          {/if}
        </div>

        {#if usesPayPal}
          {#if checkoutOn && !payment.payPalFormExpanded}
            <div class="payment-detail__actions">
              <button
                type="button"
                class="payment-detail__link"
                disabled={payment.paymentIntegrationBusy}
                onclick={() => void payment.disconnectCheckout("paypal_checkout")}
              >
                Disconnect
              </button>
              <button
                type="button"
                class="payment-detail__primary"
                disabled={payment.paymentIntegrationBusy}
                onclick={payment.openPayPalSetup}
              >
                Edit setup
              </button>
            </div>
          {:else if payment.payPalFormExpanded}
            <div class="payment-detail__form">
              <label>
                <span>Environment</span>
                <select class="ui-form-control" bind:value={payment.payPalEnvironment}>
                  <option value="sandbox">Sandbox</option>
                  <option value="live">Live</option>
                </select>
              </label>
              <label>
                <span>Client ID</span>
                <input class="ui-form-control" type="text" autocomplete="off" bind:value={payment.payPalClientId} />
              </label>
              <label>
                <span>Client secret</span>
                <input class="ui-form-control" type="password" autocomplete="new-password" bind:value={payment.payPalClientSecret} />
              </label>
              <div class="payment-detail__actions">
                <button type="button" class="payment-detail__link" onclick={() => (payment.payPalFormExpanded = false)}>Cancel</button>
                <button
                  type="button"
                  class="payment-detail__primary"
                  disabled={payment.paymentIntegrationBusy}
                  onclick={() => void payment.savePayPalSetup()}
                >
                  {payment.paymentIntegrationBusy ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          {:else}
            <div class="payment-detail__actions payment-detail__actions--start">
              <button
                type="button"
                class="payment-detail__primary"
                disabled={payment.paymentIntegrationBusy}
                onclick={payment.openPayPalSetup}
              >
                {editingMeta.checkoutCta} →
              </button>
            </div>
          {/if}
        {:else}
          {#if checkoutOn && !payment.cashAppPayFormExpanded}
            <div class="payment-detail__actions">
              <button
                type="button"
                class="payment-detail__link"
                disabled={payment.paymentIntegrationBusy}
                onclick={() => void payment.disconnectCheckout("cash_app_pay")}
              >
                Disconnect
              </button>
              <button
                type="button"
                class="payment-detail__primary"
                disabled={payment.paymentIntegrationBusy}
                onclick={payment.openCashAppPaySetup}
              >
                Edit setup
              </button>
            </div>
          {:else if payment.cashAppPayFormExpanded}
            <div class="payment-detail__form">
              <label>
                <span>Environment</span>
                <select class="ui-form-control" bind:value={payment.cashAppPayEnvironment}>
                  <option value="sandbox">Sandbox</option>
                  <option value="live">Live</option>
                </select>
              </label>
              <label>
                <span>Application ID</span>
                <input class="ui-form-control" type="text" autocomplete="off" bind:value={payment.cashAppPayApplicationId} />
              </label>
              <label>
                <span>Location ID</span>
                <input class="ui-form-control" type="text" autocomplete="off" bind:value={payment.cashAppPayLocationId} />
              </label>
              <label>
                <span>Access token</span>
                <input class="ui-form-control" type="password" autocomplete="new-password" bind:value={payment.cashAppPayAccessToken} />
              </label>
              <div class="payment-detail__actions">
                <button type="button" class="payment-detail__link" onclick={() => (payment.cashAppPayFormExpanded = false)}>Cancel</button>
                <button
                  type="button"
                  class="payment-detail__primary"
                  disabled={payment.paymentIntegrationBusy}
                  onclick={() => void payment.saveCashAppPaySetup()}
                >
                  {payment.paymentIntegrationBusy ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          {:else}
            <div class="payment-detail__actions payment-detail__actions--start">
              <button
                type="button"
                class="payment-detail__primary"
                disabled={payment.paymentIntegrationBusy}
                onclick={payment.openCashAppPaySetup}
              >
                {editingMeta.checkoutCta} →
              </button>
            </div>
          {/if}
        {/if}
      </div>

      {#if isConfigured}
        <div class="payment-detail__footer">
          <button
            type="button"
            class="payment-detail__remove"
            onclick={() => payment.removeHandle(editingKey)}
          >
            Remove {editingMeta.label} handle
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <p class="payment-settings__empty">
      Pick a method above to add your handle.
    </p>
  {/if}
</section>

<style>
  .payment-settings__tiles {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
    margin-top: 0.55rem;
  }

  .payment-settings__empty {
    margin: 0.6rem 0 0;
    padding: 1.1rem;
    border: 1px dashed color-mix(in srgb, var(--admin-card-border) 70%, transparent);
    border-radius: 0.95rem;
    text-align: center;
    font-size: 0.78rem;
    font-weight: 540;
    color: color-mix(in srgb, var(--text) 52%, transparent);
  }

  .payment-detail {
    margin-top: -0.3rem;
    padding: 1rem 1.15rem 1.1rem;
    border: 1px solid var(--admin-card-border);
    border-radius: 0.95rem;
    background: var(--admin-card-bg);
    border-top: 3px solid var(--method-color);
    display: grid;
    gap: 0.95rem;
  }

  .payment-detail__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
    padding-bottom: 0.2rem;
  }

  .payment-detail__title {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.92rem;
    font-weight: 680;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .payment-detail__title-dot {
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 999px;
  }

  .payment-detail__primary-pill {
    border: 1px solid var(--method-color);
    border-radius: 0.5rem;
    padding: 0.32rem 0.7rem;
    background: var(--method-color);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1;
  }

  .payment-detail__make-primary {
    border: 1px solid color-mix(in srgb, var(--method-color) 50%, transparent);
    border-radius: 0.5rem;
    background: transparent;
    color: var(--method-color);
    padding: 0.32rem 0.7rem;
    font: inherit;
    font-size: 0.7rem;
    font-weight: 660;
    line-height: 1;
    cursor: pointer;
    transition: background 120ms ease;
  }

  .payment-detail__make-primary:hover {
    background: color-mix(in srgb, var(--method-color) 14%, transparent);
  }

  .payment-detail__field {
    display: grid;
    gap: 0.4rem;
  }

  .payment-detail__field label {
    font-size: 0.74rem;
    font-weight: 660;
    color: color-mix(in srgb, var(--text) 64%, transparent);
  }

  .payment-detail__input {
    font-size: 0.92rem;
  }

  .payment-detail__input:focus {
    border-color: var(--method-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--method-color) 22%, transparent);
  }

  .payment-detail__hint {
    margin: 0.15rem 0 0;
    font-size: 0.74rem;
    font-weight: 520;
    color: color-mix(in srgb, var(--text) 56%, transparent);
  }

  .payment-detail__divider {
    height: 1px;
    background: color-mix(in srgb, var(--admin-card-border) 80%, transparent);
  }

  .payment-detail__checkout {
    display: grid;
    gap: 0.7rem;
  }

  .payment-detail__checkout-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.85rem;
  }

  .payment-detail__checkout-title {
    margin: 0;
    font-size: 0.84rem;
    font-weight: 660;
    letter-spacing: -0.005em;
    color: var(--text);
  }

  .payment-detail__checkout-blurb {
    margin: 0.2rem 0 0;
    font-size: 0.74rem;
    font-weight: 520;
    color: color-mix(in srgb, var(--text) 58%, transparent);
  }

  .payment-detail__pill {
    font-size: 0.66rem;
    font-weight: 660;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border-radius: 0.45rem;
    line-height: 1;
    white-space: nowrap;
  }

  .payment-detail__pill--on {
    background: color-mix(in srgb, var(--method-color) 18%, transparent);
    color: color-mix(in srgb, var(--method-color) 80%, var(--text) 20%);
  }

  .payment-detail__form {
    display: grid;
    gap: 0.6rem;
  }

  .payment-detail__form :global(label) {
    display: grid;
    gap: 0.3rem;
    font-size: 0.74rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
  }

  .payment-detail__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.7rem;
  }

  .payment-detail__actions--start {
    justify-content: flex-start;
  }

  .payment-detail__link {
    border: none;
    background: none;
    color: color-mix(in srgb, var(--text) 58%, transparent);
    font: inherit;
    font-size: 0.74rem;
    font-weight: 580;
    cursor: pointer;
    padding: 0;
  }

  .payment-detail__link:hover {
    color: var(--method-color);
  }

  .payment-detail__primary {
    border: none;
    border-radius: 0.6rem;
    background: var(--method-color);
    color: #fff;
    padding: 0.55rem 0.95rem;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 680;
    letter-spacing: -0.005em;
    cursor: pointer;
    transition: filter 120ms ease;
  }

  .payment-detail__primary:hover {
    filter: brightness(1.08);
  }

  .payment-detail__primary:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .payment-detail__footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid color-mix(in srgb, var(--admin-card-border) 60%, transparent);
    padding-top: 0.75rem;
  }

  .payment-detail__remove {
    border: none;
    background: none;
    font: inherit;
    font-size: 0.7rem;
    font-weight: 580;
    color: color-mix(in srgb, var(--text) 50%, transparent);
    cursor: pointer;
    padding: 0;
  }

  .payment-detail__remove:hover {
    color: #f87171;
  }

  @media (max-width: 720px) {
    .payment-settings__tiles {
      gap: 0.5rem;
    }

    .payment-detail {
      padding: 0.95rem 0.95rem 1rem;
    }
  }
</style>
