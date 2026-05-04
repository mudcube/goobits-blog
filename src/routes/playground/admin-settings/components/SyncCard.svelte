<script lang="ts">
	import { Loader2, Plus, RefreshCw, Unplug } from '@lucide/svelte'
	import ProviderIcon from './ProviderIcon.svelte'
	import { providerLabel } from './helpers'
	import type { SyncProvider } from './types'

	let {
		active,
		syncedAtLabel,
		connecting,
		onConnectStart,
		onSwitch,
		onDisconnect
	}: {
		active: SyncProvider | null
		syncedAtLabel: string | null
		connecting: SyncProvider | null
		onConnectStart: () => void
		onSwitch: () => void
		onDisconnect: () => void
	} = $props()
</script>

{#if active}
	<div class="sync-card">
		<span class="sync-card__icon" aria-hidden="true">
			<ProviderIcon provider={active} />
		</span>
		<div class="sync-card__body">
			<div class="sync-card__name">{providerLabel(active)}</div>
			<div
				class="sync-card__status"
				title={`Last successful sync ${syncedAtLabel}. Next attempt in 8m.`}
			>
				<span class="sync-card__dot" aria-hidden="true"></span>
				Connected · synced {syncedAtLabel}
			</div>
		</div>
		<div class="sync-card__actions">
			<button type="button" class="admin-btn" onclick={onSwitch}>
				<RefreshCw size={13} strokeWidth={2} /> Switch
			</button>
			<button type="button" class="admin-btn admin-btn--danger" onclick={onDisconnect}>
				<Unplug size={13} strokeWidth={2} /> Disconnect
			</button>
		</div>
	</div>
{:else if connecting}
	<div class="sync-card sync-card--busy">
		<span class="sync-card__icon sync-card__icon--spinning" aria-hidden="true">
			<Loader2 size={16} strokeWidth={2} />
		</span>
		<div class="sync-card__body">
			<div class="sync-card__name">{providerLabel(connecting)}</div>
			<div class="sync-card__status">Connecting…</div>
		</div>
	</div>
{:else}
	<button type="button" class="admin-btn admin-btn--dashed" onclick={onConnectStart}>
		<Plus size={14} /> Connect a calendar
	</button>
{/if}

<style>
	.sync-card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1rem;
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		background: var(--admin-card-bg);
	}
	.sync-card--busy {
		opacity: 0.75;
	}
	.sync-card__icon {
		display: inline-flex;
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 0.5rem;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--text) 6%, transparent);
	}
	.sync-card__icon--spinning {
		color: var(--admin-accent);
	}
	.sync-card__icon--spinning :global(svg) {
		animation: sync-card-spin 0.9s linear infinite;
	}
	@keyframes sync-card-spin {
		to {
			transform: rotate(360deg);
		}
	}
	.sync-card__body {
		display: grid;
		gap: 0.15rem;
		min-width: 0;
	}
	.sync-card__name {
		font-size: 0.92rem;
		font-weight: 580;
		letter-spacing: -0.005em;
	}
	.sync-card__status {
		display: inline-flex;
		align-items: center;
		gap: 0.42rem;
		font-size: 0.76rem;
		font-weight: 420;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
		line-height: 1.4;
	}
	.sync-card__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--admin-status-success-dot, #22c55e);
		flex-shrink: 0;
	}
	.sync-card__actions {
		display: inline-flex;
		gap: 0.45rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.sync-card__icon--spinning :global(svg) {
			animation: none;
		}
	}

	@media (max-width: 48em) {
		.sync-card {
			grid-template-columns: auto 1fr;
			grid-template-rows: auto auto;
			row-gap: 0.7rem;
		}
		.sync-card__actions {
			grid-column: 1 / -1;
			grid-row: 2;
			justify-content: flex-end;
		}
	}
</style>
