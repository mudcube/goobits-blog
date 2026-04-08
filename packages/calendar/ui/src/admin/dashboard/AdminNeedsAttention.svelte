<script>
	import { AlertTriangle, RefreshCw, RotateCcw, Trash2 } from '@lucide/svelte'
	import PillButton from '../../primitives/PillButton.svelte'
	const { dashboard } = $props()
	const needsCalendarAttention = $derived(dashboard.connectionExpired || !dashboard.connected)
	const needsQueueAttention = $derived(
		dashboard.syncQueue.hasBacklogAlert ||
		dashboard.syncQueue.hasDeadLetterAlert ||
		dashboard.syncQueue.failed > 0 ||
		dashboard.syncQueue.oldestPendingSeconds > 600 ||
		dashboard.syncQueue.deadLetter > 0
	)
</script>

<div class="admin-page__section">
	<div class="admin-page__section-head">
		<h3 class="admin-page__section-title">Needs attention</h3>
	</div>
	{#if needsCalendarAttention}
		<div class="admin-page__attention-card">
			<div class="admin-page__attention-main">
				<AlertTriangle size={14} />
				<span>{dashboard.connectionRefreshFailed ? 'Google Calendar refresh failed' : dashboard.connectionExpired ? 'Google Calendar token expired' : 'Google Calendar is not connected'}</span>
			</div>
			<PillButton className="admin-page__button-secondary admin-page__button-secondary--compact" variant="secondary" size="sm" onClick={dashboard.reconnect}>
				<RefreshCw size={12} />Reconnect
			</PillButton>
		</div>
	{:else if needsQueueAttention}
		<div class="admin-page__attention-card">
			<div class="admin-page__attention-main">
				<AlertTriangle size={14} />
				<span>Sync queue delayed · {dashboard.syncQueue.pending} pending · {dashboard.syncQueue.failed} failed{#if dashboard.syncQueue.deadLetter > 0} · {dashboard.syncQueue.deadLetter} dead-letter{/if}</span>
			</div>
			<div class="admin-page__actions-inline">
				<PillButton className="admin-page__button-secondary admin-page__button-secondary--compact" variant="secondary" size="sm" onClick={dashboard.processSyncQueue} disabled={dashboard.syncQueueBusy}><RefreshCw size={12} />Process</PillButton>
				{#if dashboard.syncQueue.deadLetter > 0}
					<PillButton className="admin-page__button-secondary admin-page__button-secondary--compact" variant="secondary" size="sm" onClick={dashboard.retryDeadLetters} disabled={dashboard.syncQueueBusy}><RotateCcw size={12} />Retry</PillButton>
					<PillButton className="admin-page__button-secondary admin-page__button-secondary--compact" variant="secondary" size="sm" onClick={dashboard.purgeDeadLetters} disabled={dashboard.syncQueueBusy}><Trash2 size={12} />Purge</PillButton>
				{/if}
			</div>
		</div>
	{:else}
		<p class="admin-page__section-description">No urgent issues right now.</p>
	{/if}
</div>
