<script lang="ts">
  import type { Component } from "svelte";
  import { Check } from "@lucide/svelte";

  const {
    label,
    icon: Icon,
    color,
    configured,
    editing,
    primary,
    onclick,
  }: {
    label: string;
    icon: Component;
    color: string;
    configured: boolean;
    editing: boolean;
    primary: boolean;
    onclick: () => void;
  } = $props();
</script>

<button
  type="button"
  class="payment-tile"
  class:payment-tile--editing={editing}
  class:payment-tile--configured={configured}
  style="--tile-color: {color}"
  aria-pressed={editing}
  {onclick}
>
  {#if configured && !primary}
    <span class="payment-tile__check" aria-hidden="true">
      <Check size={11} strokeWidth={3.5} />
    </span>
  {/if}
  {#if primary && configured}
    <span class="payment-tile__primary">Primary</span>
  {/if}
  <span class="payment-tile__icon" aria-hidden="true">
    <Icon size={26} strokeWidth={1.6} />
  </span>
  <span class="payment-tile__label">{label}</span>
</button>

<style>
  .payment-tile {
    position: relative;
    display: grid;
    place-items: center;
    gap: 0.45rem;
    padding: 1.85rem 0.9rem 0.9rem;
    border: 1.5px solid var(--admin-card-border);
    border-radius: 1rem;
    background: var(--admin-card-bg);
    color: color-mix(in srgb, var(--text) 64%, transparent);
    cursor: pointer;
    text-align: center;
    font: inherit;
    min-height: 6.4rem;
    transition:
      border-color 140ms ease,
      background 140ms ease,
      color 140ms ease,
      transform 140ms ease;
  }

  .payment-tile:hover {
    border-color: color-mix(in srgb, var(--tile-color) 45%, var(--admin-card-border));
    color: var(--text);
    transform: translateY(-1px);
  }

  .payment-tile--configured {
    color: var(--text);
    border-color: color-mix(in srgb, var(--tile-color) 32%, var(--admin-card-border));
  }

  .payment-tile--editing {
    border-color: var(--tile-color);
    background: color-mix(in srgb, var(--tile-color) 14%, var(--bg) 86%);
    color: var(--text);
    box-shadow:
      0 0 0 1px var(--tile-color),
      0 8px 22px -10px color-mix(in srgb, var(--tile-color) 50%, transparent);
  }

  .payment-tile__icon {
    width: 2.25rem;
    height: 2.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--tile-color) 62%, var(--text) 38%);
  }

  .payment-tile--configured .payment-tile__icon,
  .payment-tile--editing .payment-tile__icon {
    color: var(--tile-color);
  }

  .payment-tile__icon :global(svg) {
    width: 1.6rem;
    height: 1.6rem;
  }

  .payment-tile__label {
    font-size: 0.84rem;
    font-weight: 660;
    letter-spacing: -0.01em;
  }

  .payment-tile__check {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 1.15rem;
    height: 1.15rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, #6ee7b7 90%, transparent);
    color: #052e1a;
    border: 1.5px solid color-mix(in srgb, var(--bg) 80%, transparent);
  }

  .payment-tile__primary {
    position: absolute;
    top: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.16rem 0.5rem;
    border-radius: 0.35rem;
    background: var(--tile-color);
    color: #fff;
    font-size: 0.56rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    box-shadow: 0 4px 10px -4px color-mix(in srgb, var(--tile-color) 60%, transparent);
  }

  @media (max-width: 720px) {
    .payment-tile {
      padding: 0.85rem 0.7rem 0.8rem;
      min-height: 5.5rem;
    }

    .payment-tile__icon {
      width: 1.85rem;
      height: 1.85rem;
    }

    .payment-tile__icon :global(svg) {
      width: 1.35rem;
      height: 1.35rem;
    }

    .payment-tile__label {
      font-size: 0.78rem;
    }

    .payment-tile__primary {
      font-size: 0.55rem;
      padding: 0.15rem 0.4rem;
    }
  }
</style>
