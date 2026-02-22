<script lang="ts">
	import { Send, Copy } from '@lucide/svelte'

	const {
		open = false,
		step = 1,
		inviteName = '',
		inviteUrl = '',
		onClose,
		onNameChange,
		onCreate,
		onCopy,
		onText
	} = $props<{
		open?: boolean
		step?: 1 | 2
		inviteName?: string
		inviteUrl?: string
		onClose: () => void
		onNameChange: (value: string) => void
		onCreate: () => void
		onCopy: () => void
		onText: () => void
	}>()
</script>

{#if open}
	<div class="admin-crew-modal__overlay" role="presentation" onclick={(event) => event.target === event.currentTarget && onClose()}>
		<div class="admin-crew-modal" role="dialog" aria-modal="true" aria-label="Invite friend">
			{#if step === 1}
				<div class="admin-crew-modal__body">
					<div class="admin-crew-modal__title">Invite a friend</div>
					<div class="admin-crew-modal__field">
						<label for="crew-invite-name">Who's this for?</label>
						<input id="crew-invite-name" class="admin-ui-input" type="text" placeholder="e.g. Sarah" value={inviteName} oninput={(event) => onNameChange((event.currentTarget as HTMLInputElement).value)} />
						<p>Just a label so you remember who you sent it to.</p>
					</div>
					<div class="admin-crew-modal__actions">
						<button type="button" class="admin-ui-btn" onclick={onClose}>Cancel</button>
						<button type="button" class="admin-ui-btn admin-ui-btn--primary" onclick={onCreate}>Create Link</button>
					</div>
				</div>
			{:else}
				<div class="admin-crew-modal__body">
					<div class="admin-crew-modal__icon">🎉</div>
					<div class="admin-crew-modal__title admin-crew-modal__title--center">Invite for {inviteName || 'friend'}</div>
					<div class="admin-crew-modal__url-box">
						<span class="admin-crew-modal__url-text">{inviteUrl}</span>
						<button type="button" class="admin-ui-btn" onclick={onCopy}>Copy</button>
					</div>
					<div class="admin-crew-modal__share-row">
						<button type="button" class="admin-ui-btn" onclick={onText}>
							<Send size={14} strokeWidth={2} />
							<span>Text it</span>
						</button>
						<button type="button" class="admin-ui-btn" onclick={onCopy}>
							<Copy size={14} strokeWidth={2} />
							<span>Copy</span>
						</button>
					</div>
					<p class="admin-crew-modal__hint">Link expires in 7 days · single use</p>
					<div class="admin-crew-modal__actions admin-crew-modal__actions--center">
						<button type="button" class="admin-ui-btn admin-ui-btn--primary" onclick={onClose}>Done</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.admin-crew-modal__overlay {
		position: fixed;
		top: 2.5rem;
		right: 0;
		bottom: 0;
		left: 13.75rem;
		background: color-mix(in srgb, black 36%, transparent);
		backdrop-filter: blur(4px);
		display: grid;
		place-items: center;
		padding: 1rem;
		z-index: 300;
	}

	.admin-crew-modal {
		width: min(100%, 22rem);
		border-radius: 1.1rem;
		border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
		background: var(--bg);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18), 0 8px 24px rgba(0, 0, 0, 0.1);
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

	.admin-crew-modal__field p,
	.admin-crew-modal__hint {
		margin: 0;
		font-size: 0.69rem;
		color: color-mix(in srgb, var(--text) 44%, transparent);
	}

	.admin-crew-modal__url-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.7rem;
		border-radius: 0.5rem;
		border: 1px solid color-mix(in srgb, var(--admin-accent) 18%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
	}

	.admin-crew-modal__url-text {
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 0.78rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
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

	.admin-crew-modal__actions--center {
		justify-content: center;
	}

	@media (max-width: 820px) {
		.admin-crew-modal__overlay {
			inset: 0;
		}
	}
</style>
