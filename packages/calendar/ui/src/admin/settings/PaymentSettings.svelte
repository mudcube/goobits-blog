<script lang="ts">
  import { onDestroy } from "svelte";
  import { CreditCard, HandCoins, Wallet } from "@lucide/svelte";
  import AdminGroupedCard from "@calendar/ui/admin/shared/AdminGroupedCard.svelte";
  import AdminPaymentMethodCard from "./AdminPaymentMethodCard.svelte";
  import {
    createPaymentSettingsController,
    paymentMethodUsesPayPalCheckout,
    type PaymentMethodKey,
  } from "./payment-settings-controller.svelte";
  import type { AdminPaymentIntegrationsResponse } from "../../api/admin";

  type PaymentSettingsDashboard = {
    paymentDefaults: { provider: string; handle: string };
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
    mockDefaults: { provider: string | null; handle: string | null };
    showToast: (message: string, isError?: boolean) => void;
  }>();

  const payment = createPaymentSettingsController({
    dashboard: () => dashboard,
    mockMode: () => mockMode,
    mockDefaults: () => mockDefaults,
    showToast: (message, isError) => showToast(message, isError),
  });

  const paymentProviders = [
    {
      value: "venmo" as const,
      label: "Venmo",
      icon: HandCoins,
      placeholder: "e.g. @yourname",
      helper: "Used as your Venmo handle when this is the default method.",
    },
    {
      value: "paypal" as const,
      label: "PayPal",
      icon: CreditCard,
      placeholder: "Email or merchant ID",
      helper: "Used as your PayPal handle when this is the default method.",
    },
    {
      value: "cashapp" as const,
      label: "Cash App",
      icon: Wallet,
      placeholder: "e.g. $yourname",
      helper: "Used as your Cash App handle when this is the default method.",
    },
  ];

  $effect(() => {
    if (!authed) return;
    void payment.load();
  });

  onDestroy(() => payment.dispose());

  function checkoutEnabled(method: PaymentMethodKey) {
    return paymentMethodUsesPayPalCheckout(method)
      ? dashboard.paymentIntegrations.paypal.enabled
      : dashboard.paymentIntegrations.square.enabled;
  }

  function checkoutSource(method: PaymentMethodKey) {
    return paymentMethodUsesPayPalCheckout(method)
      ? dashboard.paymentIntegrations.paypal.source
      : dashboard.paymentIntegrations.square.source;
  }

  function checkoutBlurb(method: PaymentMethodKey) {
    if (method === "cashapp") return "Adds a Cash App Pay button to the booking flow.";
    if (method === "venmo") return "Adds Venmo checkout through your PayPal account.";
    return "Adds PayPal checkout to the booking flow.";
  }
</script>

<section class="payment-settings admin-settings__section">
  <div class="admin-settings__section-head">
    <div>
      <h4>PAYMENT</h4>
      <p class="admin-settings__section-sub">How buyers pay you. Pick one method.</p>
    </div>
  </div>

  <AdminGroupedCard>
    {#each paymentProviders as provider}
      {@const badge = payment.paymentBadge(provider.value)}
      {@const usesPayPal = paymentMethodUsesPayPalCheckout(provider.value)}
      {@const enabled = checkoutEnabled(provider.value)}
      <AdminPaymentMethodCard
        id={provider.value}
        label={provider.label}
        icon={provider.icon}
        enabled={payment.paymentMethods[provider.value].enabled}
        badgeLabel={badge.label}
        badgeTone={badge.tone}
        handle={payment.paymentMethods[provider.value].handle}
        placeholder={provider.placeholder}
        helper={provider.helper}
        toggle={() => payment.togglePaymentMethod(provider.value)}
        updateHandle={(value) => payment.updatePaymentHandle(provider.value, value)}
      >
        <div class="payment-method-card__checkout-head">
          <div class="payment-method-card__checkout-title">
            <strong>Online checkout</strong>
            <small>{checkoutBlurb(provider.value)}</small>
          </div>
          <span
            class="payment-method-card__checkout-status"
            class:payment-method-card__checkout-status--on={enabled}
          >
            {enabled ? payment.integrationSourceLabel(checkoutSource(provider.value)) : "Optional"}
          </span>
        </div>

        {#if usesPayPal}
          {#if enabled && !payment.payPalFormExpanded}
            <div class="payment-method-card__actions">
              <button
                type="button"
                class="payment-method-card__link"
                disabled={payment.paymentIntegrationBusy}
                onclick={() => void payment.disconnectCheckout("paypal_checkout")}
              >
                Disconnect
              </button>
              <button
                type="button"
                class="payment-method-card__submit"
                disabled={payment.paymentIntegrationBusy}
                onclick={payment.openPayPalSetup}
              >
                Edit
              </button>
            </div>
          {:else if payment.payPalFormExpanded}
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
            <div class="payment-method-card__actions">
              <button type="button" class="payment-method-card__link" onclick={() => (payment.payPalFormExpanded = false)}>Cancel</button>
              <button
                type="button"
                class="payment-method-card__submit"
                disabled={payment.paymentIntegrationBusy}
                onclick={() => void payment.savePayPalSetup()}
              >
                {payment.paymentIntegrationBusy ? "Saving..." : "Connect PayPal"}
              </button>
            </div>
          {:else}
            <div class="payment-method-card__actions">
              <button
                type="button"
                class="payment-method-card__submit"
                disabled={payment.paymentIntegrationBusy}
                onclick={payment.openPayPalSetup}
              >
                Connect PayPal
              </button>
            </div>
          {/if}
        {:else}
          {#if enabled && !payment.cashAppPayFormExpanded}
            <div class="payment-method-card__actions">
              <button
                type="button"
                class="payment-method-card__link"
                disabled={payment.paymentIntegrationBusy}
                onclick={() => void payment.disconnectCheckout("cash_app_pay")}
              >
                Disconnect
              </button>
              <button
                type="button"
                class="payment-method-card__submit"
                disabled={payment.paymentIntegrationBusy}
                onclick={payment.openCashAppPaySetup}
              >
                Edit
              </button>
            </div>
          {:else if payment.cashAppPayFormExpanded}
            <label>
              <span>Environment</span>
              <select class="ui-form-control" bind:value={payment.cashAppPayEnvironment}>
                <option value="sandbox">Sandbox</option>
                <option value="live">Live</option>
              </select>
            </label>
            <label>
              <span>Cash App Pay application ID</span>
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
            <div class="payment-method-card__actions">
              <button type="button" class="payment-method-card__link" onclick={() => (payment.cashAppPayFormExpanded = false)}>Cancel</button>
              <button
                type="button"
                class="payment-method-card__submit"
                disabled={payment.paymentIntegrationBusy}
                onclick={() => void payment.saveCashAppPaySetup()}
              >
                {payment.paymentIntegrationBusy ? "Saving..." : "Connect Cash App Pay"}
              </button>
            </div>
          {:else}
            <div class="payment-method-card__actions">
              <button
                type="button"
                class="payment-method-card__submit"
                disabled={payment.paymentIntegrationBusy}
                onclick={payment.openCashAppPaySetup}
              >
                Connect Cash App Pay
              </button>
            </div>
          {/if}
        {/if}
      </AdminPaymentMethodCard>
    {/each}
  </AdminGroupedCard>
</section>
