<script lang="ts">
	import { Copy, Trash2 } from '@lucide/svelte'
	import AdminActionButton from '@components/Admin/AdminActionButton.svelte'

	type InviteItem = {
		id: string
		label: string
		detail: string
		code: string
	}

	const { invites, onCopy, onDelete } = $props<{
		invites: InviteItem[]
		onCopy: (code: string) => void
		onDelete: (id: string) => void
	}>()
</script>

<div class="admin-crew-invites">
	{#if invites.length === 0}
		<div class="admin-crew-invites__empty admin-ui-card">No pending invites.</div>
	{:else}
		{#each invites as invite (invite.id)}
			<div class="admin-crew-invites__card">
				<div class="admin-crew-invites__icon">✉️</div>
				<div class="admin-crew-invites__body">
					<div class="admin-crew-invites__label">{invite.label}</div>
					<div class="admin-crew-invites__detail">{invite.detail}</div>
				</div>
				<div class="admin-crew-invites__actions">
					<AdminActionButton variant="subtle" icon={Copy} onclick={() => onCopy(invite.code)}>Copy</AdminActionButton>
					<AdminActionButton variant="danger" icon={Trash2} onclick={() => onDelete(invite.id)}>Delete</AdminActionButton>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.admin-crew-invites {
		display: grid;
		gap: 0.5rem;
	}

	.admin-crew-invites__empty {
		padding: 0.8rem 0.95rem;
		font-size: 0.8rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	.admin-crew-invites__card {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 0.875rem;
		border-radius: 0.875rem;
		border: 1px dashed var(--admin-card-border);
		background: var(--admin-card-bg);
	}

	.admin-crew-invites__icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		font-size: 1.1rem;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
	}

	.admin-crew-invites__body {
		flex: 1;
		min-width: 0;
	}

	.admin-crew-invites__label {
		font-size: 0.8125rem;
		font-weight: 620;
	}

	.admin-crew-invites__detail {
		margin-top: 0.05rem;
		font-size: 0.6875rem;
		color: color-mix(in srgb, var(--text) 42%, transparent);
	}

	.admin-crew-invites__actions {
		display: inline-flex;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	@media (max-width: 720px) {
		.admin-crew-invites__card {
			align-items: flex-start;
		}

		.admin-crew-invites__actions {
			flex-direction: column;
		}
	}
</style>
