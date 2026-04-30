<script lang="ts">
  import { Plus, X } from "@lucide/svelte";
  import AdminMetaCards from "@calendar/ui/admin/shared/AdminMetaCards.svelte";

  type SyncProviderKey = "google" | "apple" | "outlook";
  type SyncProvider = {
    value: SyncProviderKey;
    label: string;
    supported: boolean;
  };
  type SyncBusy = Record<SyncProviderKey, boolean>;
  type DashboardSync = {
    providers: Record<
      SyncProviderKey,
      { connected: boolean; expired: boolean; active: boolean }
    >;
  };

  let {
    dashboardSync,
    disconnecting,
    syncBusy,
    syncOptionsExpanded = $bindable(),
    appleFormExpanded = $bindable(),
    appleUsername = $bindable(),
    appleAppPassword = $bindable(),
    appleCalendarUrl = $bindable(),
    visibleSyncProviders,
    primaryConnectedProvider,
    providerConnected,
    toggleSyncProvider,
    startSwitchProvider,
    connectAppleProvider,
  }: {
    dashboardSync: DashboardSync;
    disconnecting: boolean;
    syncBusy: SyncBusy;
    syncOptionsExpanded: boolean;
    appleFormExpanded: boolean;
    appleUsername: string;
    appleAppPassword: string;
    appleCalendarUrl: string;
    visibleSyncProviders: () => SyncProvider[];
    primaryConnectedProvider: () => SyncProvider | null;
    providerConnected: (provider: SyncProviderKey) => boolean;
    toggleSyncProvider: (provider: SyncProviderKey) => void;
    startSwitchProvider: () => void;
    connectAppleProvider: () => void;
  } = $props();
</script>

<section class="calendar-sync-settings admin-settings__section">
  <div class="admin-settings__section-head">
    <div>
      <h4>CALENDAR SYNC</h4>
    </div>
  </div>

  {#if primaryConnectedProvider() && !syncOptionsExpanded}
    <div class="calendar-sync-settings__top-actions">
      <button
        type="button"
        class="calendar-sync-settings__link"
        onclick={() => startSwitchProvider()}
      >
        Show other providers
      </button>
    </div>
  {/if}

  <AdminMetaCards
    items={visibleSyncProviders().map((provider) => {
      const connected = providerConnected(provider.value)
      const providerStatus = dashboardSync.providers[provider.value]
      const needsReconnect = !!providerStatus?.connected && !!providerStatus?.expired
      const busy = !!syncBusy[provider.value] || (connected && disconnecting)
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
          onclick: () => toggleSyncProvider(provider.value),
        }] : [],
      }
    })}
  >
    {#snippet customIcon(item)}
      <span class="calendar-sync-settings__icon" aria-hidden="true">
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
    <div class="calendar-sync-settings__apple-form">
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
      <div class="calendar-sync-settings__apple-actions">
        <button type="button" class="calendar-sync-settings__link" onclick={() => (appleFormExpanded = false)}>Cancel</button>
        <button type="button" class="calendar-sync-settings__submit" disabled={syncBusy.apple} onclick={() => connectAppleProvider()}>
          {syncBusy.apple ? "Connecting..." : "Connect Apple Calendar"}
        </button>
      </div>
    </div>
  {/if}

  {#if primaryConnectedProvider() && syncOptionsExpanded}
    <div class="calendar-sync-settings__top-actions">
      <button
        type="button"
        class="calendar-sync-settings__link"
        onclick={() => (syncOptionsExpanded = false)}
      >
        Hide other providers
      </button>
    </div>
  {/if}
</section>

<style>
  .calendar-sync-settings__top-actions {
    display: flex;
    justify-content: flex-end;
  }

  .calendar-sync-settings__link {
    border: none;
    background: none;
    color: color-mix(in srgb, var(--text) 58%, transparent);
    font: inherit;
    font-size: 0.72rem;
    font-weight: 560;
    cursor: pointer;
    padding: 0;
  }

  .calendar-sync-settings__link:hover {
    color: color-mix(in srgb, var(--admin-accent) 82%, var(--text) 18%);
  }

  .calendar-sync-settings__icon {
    width: 1.35rem;
    height: 1.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--text) 72%, transparent);
  }

  .calendar-sync-settings__icon svg {
    width: 1rem;
    height: 1rem;
    display: block;
  }

  .calendar-sync-settings__apple-form {
    display: grid;
    gap: 0.65rem;
    padding: 0.85rem;
    border: 1px solid var(--admin-card-border);
    border-radius: 0.875rem;
    background: var(--admin-card-bg);
  }

  .calendar-sync-settings__apple-form label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.72rem;
    font-weight: 620;
    color: color-mix(in srgb, var(--text) 60%, transparent);
  }

  .calendar-sync-settings__apple-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
  }

  .calendar-sync-settings__submit {
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

  .calendar-sync-settings__submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
</style>
