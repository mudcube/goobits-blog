<script lang="ts">
	import AdminActionButton from '../../shared/AdminActionButton.svelte'
	import AdminSheet from '../../shared/AdminSheet.svelte'
	import type { createAdminDashboardController } from '../../dashboard/admin-dashboard-controller.svelte'

	type DashboardController = ReturnType<typeof createAdminDashboardController>
	type ProgramDraft = DashboardController['programDraft']

	const {
		open,
		draft,
		programSaving,
		programDeleting,
		onClose,
		onPatch,
		onFieldInput,
		onFieldCommit,
		onDelete,
		onSave
	} = $props<{
		open: boolean
		draft: ProgramDraft
		programSaving: boolean
		programDeleting: boolean
		onClose: () => void
		onPatch: (patch: Partial<ProgramDraft>, scope: string) => void
		onFieldInput: <K extends keyof ProgramDraft>(field: K, value: ProgramDraft[K]) => void
		onFieldCommit: (field: keyof ProgramDraft) => void
		onDelete: () => void
		onSave: () => void
	}>()
</script>

{#if open}
	<AdminSheet
		variant="drawer"
		ariaLabel="Program settings"
		topOffset="calc(2.5rem + 1px)"
		{onClose}
	>
		{#snippet body()}
			<section class="program-editor__settings-section">
				<h3>Publishing</h3>
				<div class="program-editor__toggle-row">
					<span>Accepting bookings</span>
					<button
						type="button"
						aria-label={draft.enabled ? 'Disable bookings' : 'Enable bookings'}
						class="program-editor__switch"
						class:program-editor__switch--on={draft.enabled}
						onclick={() => onPatch({ enabled: !draft.enabled }, 'enabled')}
					>
						<span></span>
					</button>
				</div>
				<label
					><span>URL path</span><input
						class="ui-form-control"
						type="text"
						value={draft.slug}
						oninput={(event) => onFieldInput('slug', event.currentTarget.value)}
						onblur={() => onFieldCommit('slug')}
					/></label
				>
			</section>
		{/snippet}

		{#snippet foot()}
			<AdminActionButton
				variant="danger"
				onclick={onDelete}
				disabled={programDeleting}
			>
				{programDeleting ? 'Deleting…' : 'Delete'}
			</AdminActionButton>
			<AdminActionButton
				variant="primary"
				onclick={onSave}
				disabled={programSaving}
			>
				{programSaving ? 'Saving…' : 'Save'}
			</AdminActionButton>
		{/snippet}
	</AdminSheet>
{/if}

<style>
	.program-editor__settings-section {
		display: grid;
		gap: 0.55rem;
	}

	.program-editor__settings-section h3 {
		margin: 0;
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
	}

	.program-editor__settings-section label {
		display: grid;
		gap: 0.2rem;
	}

	.program-editor__settings-section label > span {
		font-size: 0.66rem;
		font-weight: 700;
		color: var(--text-3);
	}

	.program-editor__toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.program-editor__toggle-row span {
		font-size: 0.75rem;
		font-weight: 600;
	}

	.program-editor__switch {
		width: 46px;
		height: 26px;
		border: 1px solid var(--border-s);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 20%, transparent);
		cursor: pointer;
		position: relative;
	}

	.program-editor__switch span {
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 999px;
		top: 3px;
		left: 4px;
		background: var(--bg);
		transition: left 120ms ease;
	}

	.program-editor__switch--on {
		background: color-mix(in srgb, var(--text) 70%, var(--bg) 30%);
	}

	.program-editor__switch--on span {
		left: 23px;
	}
</style>
