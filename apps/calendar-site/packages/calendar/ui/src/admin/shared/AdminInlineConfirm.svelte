<script lang="ts">
	import { Trash2 } from '@lucide/svelte'

	const {
		question,
		confirmLabel = 'Yes, remove',
		cancelLabel = 'Cancel',
		danger = true,
		onCancel,
		onConfirm
	} = $props<{
		question: string
		confirmLabel?: string
		cancelLabel?: string
		danger?: boolean
		onCancel: () => void
		onConfirm: () => void
	}>()
</script>

<div class="admin-inline-confirm">
	<span class="admin-inline-confirm__text">{question}</span>
	<div class="admin-inline-confirm__actions">
		<button type="button" class="admin-ui-btn admin-ui-btn--muted" onclick={onCancel}>
			{cancelLabel}
		</button>
		<button
			type="button"
			class="admin-ui-btn"
			class:admin-ui-btn--solid-danger={danger}
			class:admin-ui-btn--solid={!danger}
			onclick={onConfirm}
		>
			{#if danger}<Trash2 size={13} strokeWidth={2} />{/if}
			{confirmLabel}
		</button>
	</div>
</div>

<style>
	.admin-inline-confirm {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		width: 100%;
	}
	.admin-inline-confirm__text {
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--text);
	}
	.admin-inline-confirm__actions {
		display: inline-flex;
		gap: 0.45rem;
	}
</style>
