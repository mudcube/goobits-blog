<script lang="ts">
	import { Copy, Trash2 } from '@lucide/svelte'
	import AdminLoadingText from '@calendar/ui/admin/shared/AdminLoadingText.svelte'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import AdminInlineConfirm from '@calendar/ui/admin/shared/AdminInlineConfirm.svelte'
	import ConfirmModal from '@calendar/ui/admin/shared/ConfirmModal.svelte'
	import { statusIcon, statusDotColor, type InviteStatus } from './crew-helpers'

	export type InviteFilter = 'all' | InviteStatus

	type InviteItem = {
		id: string
		code: string
		label: string
		detail: string
		status: InviteStatus
	}

	type InviteCounts = { all: number; pending: number; expired: number; exhausted: number }

	let {
		filter = $bindable(),
		counts,
		visibleItems,
		loaded,
		mockMode,
		confirmBulkOpen = $bindable(),
		pendingDeleteId = $bindable(),
		pendingDeleteLabel,
		onDeleteAllExpired,
		onConfirmDelete,
		onCopy
	}: {
		filter: InviteFilter
		counts: InviteCounts
		visibleItems: InviteItem[]
		loaded: boolean
		mockMode: boolean
		confirmBulkOpen: boolean
		pendingDeleteId: string | number | null
		pendingDeleteLabel: string
		onDeleteAllExpired: () => void
		onConfirmDelete: () => void
		onCopy: (code: string) => void
	} = $props()
</script>

<h4>INVITE LINKS{#if mockMode || loaded} ({counts.all}){/if}</h4>

{#if counts.all > 0}
	<div class="crew-invites__filters">
		<button type="button" class="crew-invites__chip" class:crew-invites__chip--active={filter === 'all'} onclick={() => { filter = 'all' }}>All ({counts.all})</button>
		<button type="button" class="crew-invites__chip" class:crew-invites__chip--active={filter === 'pending'} onclick={() => { filter = 'pending' }}>Pending ({counts.pending})</button>
		<button type="button" class="crew-invites__chip" class:crew-invites__chip--active={filter === 'expired'} onclick={() => { filter = 'expired' }}>Expired ({counts.expired})</button>
		<button type="button" class="crew-invites__chip" class:crew-invites__chip--active={filter === 'exhausted'} onclick={() => { filter = 'exhausted' }}>Exhausted ({counts.exhausted})</button>
		{#if counts.expired > 0}
			<button type="button" class="crew-invites__bulk" onclick={() => { confirmBulkOpen = true }}>Delete {counts.expired} expired</button>
		{/if}
	</div>
{/if}

<ConfirmModal
	open={confirmBulkOpen}
	title={`Delete ${counts.expired} expired invite${counts.expired === 1 ? '' : 's'}?`}
	body="The links will stop working immediately. This cannot be undone."
	confirmLabel="Yes, delete all"
	danger
	align="content"
	onCancel={() => (confirmBulkOpen = false)}
	onConfirm={onDeleteAllExpired}
/>

{#if pendingDeleteId !== null}
	<div class="crew-invites__notice">
		<AdminInlineConfirm
			question={`Delete invite${pendingDeleteLabel}?`}
			confirmLabel="Yes, delete"
			onCancel={() => (pendingDeleteId = null)}
			onConfirm={onConfirmDelete}
		/>
	</div>
{/if}

{#if !mockMode && !loaded}
	<AdminLoadingText text="Loading invites…" />
{:else}
	<AdminMetaCards
		items={visibleItems.map((invite) => ({
			id: invite.id,
			label: invite.label,
			detail: invite.detail,
			dotIcon: statusIcon(invite.status),
			dotColor: statusDotColor(invite.status),
			dimmed: invite.status === 'expired' || invite.status === 'exhausted',
			actions: invite.status === 'pending' ? [
				{
					variant: 'subtle' as const,
					icon: Copy,
					ariaLabel: 'Copy invite link',
					onclick: (): void => onCopy(invite.code)
				},
				{
					variant: 'danger' as const,
					icon: Trash2,
					ariaLabel: 'Delete invite',
					onclick: (): void => { pendingDeleteId = invite.id }
				}
			] : [
				{
					variant: 'danger' as const,
					icon: Trash2,
					ariaLabel: 'Delete invite',
					onclick: (): void => { pendingDeleteId = invite.id }
				}
			]
		}))}
		emptyText={filter === 'all' ? 'No invites yet.' : `No ${filter} invites.`}
	/>
{/if}

<style>
	.crew-invites__filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0 0 0.85rem;
		align-items: center;
	}

	.crew-invites__chip {
		appearance: none;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: transparent;
		color: color-mix(in srgb, var(--text) 65%, transparent);
		font-size: 0.74rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.crew-invites__chip:hover {
		background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
		color: var(--text);
	}

	.crew-invites__chip--active {
		background: color-mix(in srgb, var(--admin-accent) 14%, transparent);
		border-color: color-mix(in srgb, var(--admin-accent) 36%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
	}

	.crew-invites__bulk {
		appearance: none;
		margin-left: auto;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--admin-danger-strong) 32%, transparent);
		background: color-mix(in srgb, var(--admin-danger-strong) 8%, transparent);
		color: color-mix(in srgb, var(--admin-danger-strong) 90%, var(--text) 10%);
		font-size: 0.72rem;
		font-weight: 600;
		cursor: pointer;
	}

	.crew-invites__bulk:hover {
		background: color-mix(in srgb, var(--admin-danger-strong) 14%, transparent);
	}

	.crew-invites__notice {
		margin: 0 0 1rem;
		padding: 0.65rem 0.85rem;
		border-radius: 0.875rem;
		background: color-mix(in srgb, var(--admin-danger-soft) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--admin-danger-soft) 14%, transparent);
		font-size: 0.82rem;
	}
</style>
