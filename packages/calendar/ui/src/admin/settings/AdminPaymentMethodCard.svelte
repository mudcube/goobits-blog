<script lang="ts">
  import type { Component, Snippet } from "svelte";

  const {
    id,
    label,
    icon: Icon,
    enabled,
    stateLabel,
    stateTone,
    handle,
    placeholder,
    toggle,
    updateHandle,
    children,
  }: {
    id: string;
    label: string;
    icon: Component;
    enabled: boolean;
    stateLabel: string;
    stateTone: "on" | "warn" | "off";
    handle: string;
    placeholder: string;
    toggle: () => void;
    updateHandle: (value: string) => void;
    children?: Snippet;
  } = $props();

  const handleInputId = $derived(`admin-settings-payment-${id}`);
</script>

<div
  class="payment-method-card"
  class:payment-method-card--active={enabled}
>
  <button
    type="button"
    class="payment-method-card__toggle"
    onclick={toggle}
    aria-pressed={enabled}
  >
    <span class="payment-method-card__icon" aria-hidden="true">
      <Icon size={16} strokeWidth={2} />
    </span>
    <span class="payment-method-card__label">{label}</span>
    <span
      class="payment-method-card__state"
      class:payment-method-card__state--on={stateTone === "on"}
      class:payment-method-card__state--warn={stateTone === "warn"}
      class:payment-method-card__state--off={stateTone === "off"}
    >
      {stateLabel}
    </span>
  </button>

  {#if enabled}
    <div class="payment-method-card__input-wrap">
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
    </div>
    {#if children}
      <div class="payment-method-card__setup">
        {@render children()}
      </div>
    {/if}
  {/if}
</div>

<style>
  .payment-method-card {
    overflow: clip;
  }

  .payment-method-card--active {
    border-color: color-mix(in srgb, var(--admin-accent) 34%, transparent);
    background: color-mix(in srgb, var(--admin-accent) 10%, var(--bg) 90%);
  }

  .payment-method-card__toggle {
    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.875rem;
    padding: 0.75rem 0.875rem;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
    font: inherit;
  }

  .payment-method-card__icon {
    width: 1.35rem;
    height: 1.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .payment-method-card__icon :global(svg) {
    width: 1rem;
    height: 1rem;
    display: block;
  }

  .payment-method-card__label {
    font-size: 0.76rem;
    font-weight: 620;
    letter-spacing: -0.005em;
    min-width: 0;
  }

  .payment-method-card__state {
    font-size: 0.66rem;
    font-weight: 650;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.16rem 0.44rem;
    border-radius: 0.42rem;
    line-height: 1;
    white-space: nowrap;
  }

  .payment-method-card__state--on {
    background: var(--admin-status-success-bg);
    color: var(--admin-status-success-fg);
  }

  .payment-method-card__state--warn,
  .payment-method-card__state--off {
    background: var(--admin-status-warn-bg);
    color: var(--admin-status-warn-fg);
  }

  .payment-method-card__input-wrap {
    display: grid;
    gap: 0.3rem;
    padding: 0 0.7rem 0.7rem;
  }

  .payment-method-card__input-wrap label {
    font-size: 0.72rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
  }

  .payment-method-card__setup {
    display: grid;
    gap: 0.6rem;
    padding: 0 0.7rem 0.7rem;
    border-top: 1px solid color-mix(in srgb, var(--admin-card-border) 70%, transparent);
    margin-top: -0.1rem;
    padding-top: 0.7rem;
  }

  .payment-method-card__setup :global(label) {
    display: grid;
    gap: 0.35rem;
    font-size: 0.72rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
  }

  .payment-method-card__setup :global(.payment-method-card__setup-title) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.68rem;
    font-weight: 720;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--text) 48%, transparent);
  }

  .payment-method-card__setup :global(.payment-method-card__setup-badge) {
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

  .payment-method-card__setup :global(.payment-method-card__setup-badge--on) {
    background: var(--admin-status-success-bg);
    color: var(--admin-status-success-fg);
  }

  .payment-method-card__setup :global(.payment-method-card__actions) {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
  }

  .payment-method-card__setup :global(.payment-method-card__link) {
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

  .payment-method-card__setup :global(.payment-method-card__link:hover) {
    color: color-mix(in srgb, var(--admin-accent) 82%, var(--text) 18%);
  }

  .payment-method-card__setup :global(.payment-method-card__submit) {
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

  .payment-method-card__setup :global(button:disabled) {
    opacity: 0.55;
    cursor: not-allowed;
  }
</style>
