<script lang="ts">
  import { Send, Copy } from "@lucide/svelte";
  import { onMount } from "svelte";

  const {
    open = false,
    step = 1,
    inviteName = "",
    inviteUrl = "",
    anchorRect = null,
    onClose,
    onNameChange,
    onCreate,
    onCopy,
    onText,
    onCancelInvite,
  } = $props<{
    open?: boolean;
    step?: 1 | 2;
    inviteName?: string;
    inviteUrl?: string;
    anchorRect?: {
      left: number;
      top: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
    } | null;
    onClose: () => void;
    onNameChange: (value: string) => void;
    onCreate: () => void;
    onCopy: () => void;
    onText: () => void;
    onCancelInvite: () => void;
  }>();

  let viewportWidth = $state(0);
  let viewportHeight = $state(0);
  const popoverWidth = 352;

  function updateViewport() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  }

  onMount(() => {
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  });

  const placement = $derived.by(() => {
    const width = Math.min(popoverWidth, Math.max(288, viewportWidth - 16));
    const estimatedHeight = step === 1 ? 198 : 286;
    if (!anchorRect) {
      return {
        width,
        left: viewportWidth > 0 ? viewportWidth / 2 : 180,
        top: 92,
        arrowLeft: width / 2,
        above: false,
      };
    }
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const minLeft = width / 2 + 8;
    const maxLeft = Math.max(minLeft, viewportWidth - width / 2 - 8);
    const left = Math.min(maxLeft, Math.max(minLeft, anchorX));
    const showAbove =
      anchorRect.bottom + estimatedHeight + 16 > viewportHeight &&
      anchorRect.top - estimatedHeight - 16 > 40;
    const top = showAbove ? anchorRect.top - 8 : anchorRect.bottom + 8;
    const arrowLeft = Math.min(
      width - 18,
      Math.max(18, anchorX - (left - width / 2)),
    );
    return { width, left, top, arrowLeft, above: showAbove };
  });

  const popoverStyle = $derived(
    `width:${placement.width}px;left:${placement.left}px;top:${placement.top}px;--invite-arrow-left:${placement.arrowLeft}px;`,
  );
</script>

<svelte:window
  onkeydown={(event) => open && event.key === "Escape" && onClose()}
/>

{#if open}
  <div
    class="admin-crew-modal__overlay"
    role="presentation"
    tabindex="-1"
    onpointerdown={onClose}
    onkeydown={(event) => event.key === "Escape" && onClose()}
  >
    <div
      class="admin-crew-modal"
      class:admin-crew-modal--above={placement.above}
      role="dialog"
      tabindex="0"
      aria-modal="true"
      aria-label="Invite friend"
      style={popoverStyle}
      onpointerdown={(event) => event.stopPropagation()}
    >
      <div class="admin-crew-modal__arrow" aria-hidden="true"></div>
      {#if step === 1}
        <div class="admin-crew-modal__body">
          <div class="admin-crew-modal__title">Create invite link</div>
          <div class="admin-crew-modal__field">
            <label for="crew-invite-name">Who's this for?</label>
            <input
              id="crew-invite-name"
              class="ui-form-control"
              type="text"
              placeholder="e.g. Sarah"
              value={inviteName}
              oninput={(event) =>
                onNameChange((event.currentTarget as HTMLInputElement).value)}
            />
          </div>
          <div class="admin-crew-modal__actions">
            <button type="button" class="admin-ui-btn" onclick={onClose}
              >Cancel</button
            >
            <button
              type="button"
              class="admin-ui-btn admin-ui-btn--primary"
              onclick={onCreate}>Create Invite</button
            >
          </div>
        </div>
      {:else}
        <div class="admin-crew-modal__body">
          <div class="admin-crew-modal__icon">🎉</div>
          <div class="admin-crew-modal__title admin-crew-modal__title--center">
            Invite link ready for {inviteName || "friend"}
          </div>
          <div class="admin-crew-modal__url-box">
            <span class="admin-crew-modal__url-text">{inviteUrl}</span>
            <button
              type="button"
              class="admin-ui-btn admin-crew-modal__url-copy"
              aria-label="Copy invite link"
              title="Copy invite link"
              onclick={onCopy}
            >
              <Copy size={14} strokeWidth={2} />
            </button>
          </div>
          <div class="admin-crew-modal__share-row">
            <button type="button" class="admin-ui-btn" onclick={onText}>
              <Send size={14} strokeWidth={2} />
              <span>Text it</span>
            </button>
          </div>
          <p class="admin-crew-modal__hint">
            Share this by text or copy it below. Uses and expiry follow your current invite settings.
          </p>
          <div class="admin-crew-modal__actions">
            <button
              type="button"
              class="admin-ui-btn admin-ui-btn--danger"
              onclick={onCancelInvite}>Cancel invite</button
            >
            <button
              type="button"
              class="admin-ui-btn admin-ui-btn--primary"
              onclick={onClose}>Done</button
            >
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .admin-crew-modal__overlay {
    position: fixed;
    inset: 0;
    background: transparent;
    z-index: 180;
  }

  .admin-crew-modal {
    position: fixed;
    width: min(22rem, calc(100vw - 16px));
    border-radius: 1.1rem;
    border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
    background: var(--bg);
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.18),
      0 8px 24px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transform: translateX(-50%);
    z-index: 181;
  }

  .admin-crew-modal__arrow {
    position: absolute;
    top: -6px;
    left: var(--invite-arrow-left, 50%);
    width: 10px;
    height: 10px;
    border-left: 1px solid
      color-mix(in srgb, var(--admin-accent) 18%, transparent);
    border-top: 1px solid
      color-mix(in srgb, var(--admin-accent) 18%, transparent);
    background: var(--bg);
    transform: translateX(-50%) rotate(45deg);
  }

  .admin-crew-modal--above .admin-crew-modal__arrow {
    top: auto;
    bottom: -6px;
    transform: translateX(-50%) rotate(225deg);
  }

  .admin-crew-modal__body {
    padding: 1.5rem 1.25rem 1.25rem;
    display: grid;
    gap: 0.8rem;
  }

  .admin-crew-modal__title {
    font-size: 1.0625rem;
    font-weight: 650;
    letter-spacing: -0.01em;
  }

  .admin-crew-modal__title--center {
    text-align: center;
  }

  .admin-crew-modal__icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 1.25rem;
    margin: 0 auto;
    background: color-mix(in srgb, var(--admin-accent) 12%, transparent);
  }

  .admin-crew-modal__field {
    display: grid;
    gap: 0.32rem;
  }

  .admin-crew-modal__field label {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .admin-crew-modal__hint {
    margin: 0;
    font-size: 0.69rem;
    color: color-mix(in srgb, var(--text) 44%, transparent);
  }

  .admin-crew-modal__url-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    padding: 0.55rem 0.7rem;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
    background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
  }

  .admin-crew-modal__url-text {
    display: block;
    flex: 1;
    min-width: 0;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.78rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
  }

  .admin-crew-modal__url-copy {
    min-width: 32px;
    width: 32px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .admin-crew-modal__share-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
  }

  .admin-crew-modal__share-row :global(.admin-ui-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
  }

  .admin-crew-modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.4rem;
  }

  @media (max-width: 820px) {
    .admin-crew-modal {
      width: min(22rem, calc(100vw - 12px));
    }
  }
</style>
