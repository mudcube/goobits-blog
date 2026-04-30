<script lang="ts">
  import type { Component, Snippet } from "svelte";

  const {
    id,
    label,
    icon: Icon,
    enabled,
    badgeLabel,
    badgeTone,
    handle,
    placeholder,
    helper,
    toggle,
    updateHandle,
    children,
  }: {
    id: string;
    label: string;
    icon: Component;
    enabled: boolean;
    badgeLabel: string | null;
    badgeTone: "on" | "warn" | null;
    handle: string;
    placeholder: string;
    helper?: string;
    toggle: () => void;
    updateHandle: (value: string) => void;
    children?: Snippet;
  } = $props();

  const handleInputId = $derived(`admin-settings-payment-${id}`);
</script>

<div class="payment-method-card" class:payment-method-card--active={enabled}>
  <button
    type="button"
    class="payment-method-card__toggle"
    onclick={toggle}
    aria-pressed={enabled}
  >
    <span class="payment-method-card__radio" aria-hidden="true">
      {#if enabled}
        <span class="payment-method-card__radio-dot"></span>
      {/if}
    </span>
    <span class="payment-method-card__icon" aria-hidden="true">
      <Icon size={16} strokeWidth={2} />
    </span>
    <span class="payment-method-card__label">{label}</span>
    {#if badgeLabel}
      <span
        class="payment-method-card__badge"
        class:payment-method-card__badge--on={badgeTone === "on"}
        class:payment-method-card__badge--warn={badgeTone === "warn"}
      >
        {badgeLabel}
      </span>
    {/if}
  </button>

  {#if enabled}
    <div class="payment-method-card__body">
      <div class="payment-method-card__field">
        <label for={handleInputId}>Handle</label>
        <input
          id={handleInputId}
          class="ui-form-control"
          type="text"
          value={handle}
          {placeholder}
          oninput={(event) =>
            updateHandle((event.currentTarget as HTMLInputElement).value)}
        />
        {#if helper}
          <p class="payment-method-card__hint">{helper}</p>
        {/if}
      </div>

      {#if children}
        <div class="payment-method-card__checkout">
          {@render children()}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .payment-method-card {
    overflow: clip;
  }

  .payment-method-card--active {
    background: color-mix(in srgb, var(--admin-accent) 8%, var(--bg) 92%);
  }

  .payment-method-card__toggle {
    width: 100%;
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0.875rem;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
    font: inherit;
  }

  .payment-method-card__radio {
    width: 1.05rem;
    height: 1.05rem;
    border-radius: 999px;
    border: 1.5px solid color-mix(in srgb, var(--text) 32%, transparent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 120ms ease;
  }

  .payment-method-card--active .payment-method-card__radio {
    border-color: color-mix(in srgb, var(--admin-accent) 70%, transparent);
  }

  .payment-method-card__radio-dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--admin-accent) 78%, var(--text) 22%);
  }

  .payment-method-card__icon {
    width: 1.35rem;
    height: 1.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--text) 72%, transparent);
  }

  .payment-method-card__icon :global(svg) {
    width: 1rem;
    height: 1rem;
    display: block;
  }

  .payment-method-card__label {
    font-size: 0.78rem;
    font-weight: 620;
    letter-spacing: -0.005em;
    min-width: 0;
  }

  .payment-method-card__badge {
    font-size: 0.66rem;
    font-weight: 650;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.16rem 0.44rem;
    border-radius: 0.42rem;
    line-height: 1;
    white-space: nowrap;
  }

  .payment-method-card__badge--on {
    background: var(--admin-status-success-bg);
    color: var(--admin-status-success-fg);
  }

  .payment-method-card__badge--warn {
    background: var(--admin-status-warn-bg);
    color: var(--admin-status-warn-fg);
  }

  .payment-method-card__body {
    display: grid;
    gap: 0.85rem;
    padding: 0 0.875rem 0.875rem 2.7rem;
  }

  .payment-method-card__field {
    display: grid;
    gap: 0.3rem;
  }

  .payment-method-card__field label {
    font-size: 0.72rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
  }

  .payment-method-card__hint {
    margin: 0.1rem 0 0;
    font-size: 0.7rem;
    font-weight: 520;
    color: color-mix(in srgb, var(--text) 52%, transparent);
  }

  .payment-method-card__checkout {
    display: grid;
    gap: 0.55rem;
    padding: 0.7rem 0.8rem;
    border-radius: 0.7rem;
    border: 1px solid color-mix(in srgb, var(--admin-card-border) 70%, transparent);
    background: color-mix(in srgb, var(--bg) 60%, transparent);
  }

  .payment-method-card__checkout :global(label) {
    display: grid;
    gap: 0.35rem;
    font-size: 0.72rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
  }

  .payment-method-card__checkout :global(.payment-method-card__checkout-head) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .payment-method-card__checkout :global(.payment-method-card__checkout-title) {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
  }

  .payment-method-card__checkout :global(.payment-method-card__checkout-title strong) {
    font-size: 0.74rem;
    font-weight: 640;
    letter-spacing: -0.005em;
    color: var(--text);
  }

  .payment-method-card__checkout :global(.payment-method-card__checkout-title small) {
    font-size: 0.7rem;
    font-weight: 520;
    color: color-mix(in srgb, var(--text) 52%, transparent);
  }

  .payment-method-card__checkout :global(.payment-method-card__checkout-status) {
    font-size: 0.66rem;
    font-weight: 650;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.16rem 0.44rem;
    border-radius: 0.42rem;
    line-height: 1;
    white-space: nowrap;
    background: var(--admin-status-warn-bg);
    color: var(--admin-status-warn-fg);
  }

  .payment-method-card__checkout :global(.payment-method-card__checkout-status--on) {
    background: var(--admin-status-success-bg);
    color: var(--admin-status-success-fg);
  }

  .payment-method-card__checkout :global(.payment-method-card__actions) {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
  }

  .payment-method-card__checkout :global(.payment-method-card__link) {
    border: none;
    background: none;
    color: color-mix(in srgb, var(--text) 58%, transparent);
    font: inherit;
    font-size: 0.72rem;
    font-weight: 560;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  .payment-method-card__checkout :global(.payment-method-card__link:hover) {
    color: color-mix(in srgb, var(--admin-accent) 82%, var(--text) 18%);
  }

  .payment-method-card__checkout :global(.payment-method-card__submit) {
    border: 1px solid color-mix(in srgb, var(--admin-accent) 28%, transparent);
    border-radius: 0.625rem;
    background: color-mix(in srgb, var(--admin-accent) 14%, var(--bg) 86%);
    color: var(--text);
    padding: 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.74rem;
    font-weight: 650;
    cursor: pointer;
  }

  .payment-method-card__checkout :global(button:disabled) {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 720px) {
    .payment-method-card__body {
      padding-left: 0.875rem;
    }
  }
</style>
