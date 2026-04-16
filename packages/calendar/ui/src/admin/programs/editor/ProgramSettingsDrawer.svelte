<script lang="ts">
	import AdminActionButton from '../../shared/AdminActionButton.svelte'
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
	<button
		type="button"
		class="program-editor__settings-overlay"
		aria-label="Close settings"
		onclick={onClose}
	></button>
	<aside class="program-editor__settings">
		<div class="program-editor__settings-body">
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
			<label
				><span>Sort order</span><input
					class="ui-form-control ui-form-control--number"
					type="number"
					value={draft.sortOrder}
					oninput={(event) =>
						onFieldInput(
							'sortOrder',
							Number.isFinite(event.currentTarget.valueAsNumber)
								? event.currentTarget.valueAsNumber
								: 0
						)}
					onblur={() => onFieldCommit('sortOrder')}
				/></label
			>
			<label
				><span>Status note</span><input
					class="ui-form-control"
					type="text"
					value={draft.serviceStatusNote}
					oninput={(event) => onFieldInput('serviceStatusNote', event.currentTarget.value)}
					onblur={() => onFieldCommit('serviceStatusNote')}
				/></label
			>
			<label
				><span>Page title</span><input
					class="ui-form-control"
					type="text"
					value={draft.pageTitle}
					oninput={(event) => onFieldInput('pageTitle', event.currentTarget.value)}
					onblur={() => onFieldCommit('pageTitle')}
				/></label
			>
			<label
				><span>Activity name</span><input
					class="ui-form-control"
					type="text"
					value={draft.activityName}
					oninput={(event) => onFieldInput('activityName', event.currentTarget.value)}
					onblur={() => onFieldCommit('activityName')}
				/></label
			>
			<label
				><span>Eyebrow class</span><input
					class="ui-form-control"
					type="text"
					value={draft.eyebrowClass}
					oninput={(event) => onFieldInput('eyebrowClass', event.currentTarget.value)}
					onblur={() => onFieldCommit('eyebrowClass')}
				/></label
			>
			<label
				><span>Glow class</span><input
					class="ui-form-control"
					type="text"
					value={draft.glowClass}
					oninput={(event) => onFieldInput('glowClass', event.currentTarget.value)}
					onblur={() => onFieldCommit('glowClass')}
				/></label
			>
			<label
				><span>Form glow class</span><input
					class="ui-form-control"
					type="text"
					value={draft.formGlowClass}
					oninput={(event) => onFieldInput('formGlowClass', event.currentTarget.value)}
					onblur={() => onFieldCommit('formGlowClass')}
				/></label
			>
			<div class="program-editor__settings-actions">
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
			</div>
		</div>
	</aside>
{/if}

<style>
	.program-editor__settings-overlay {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		top: calc(2.5rem + 1px);
		border: none;
		background: color-mix(in srgb, var(--text) 68%, transparent);
		z-index: 9993 !important;
	}

	.program-editor__settings {
		position: fixed;
		top: calc(2.5rem + 1px);
		right: 0;
		bottom: 0;
		width: min(20rem, 90vw);
		height: calc(100vh - 2.5rem - 1px);
		border-left: 1px solid var(--border);
		background-color: var(--surface);
		background-image: none;
		z-index: 9994 !important;
		display: flex;
		flex-direction: column;
		color: var(--text);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.program-editor__settings-body {
		padding: 0.95rem 0.9rem;
		display: grid;
		gap: 0.55rem;
		overflow: auto;
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.program-editor__settings-body label {
		display: grid;
		gap: 0.2rem;
	}

	.program-editor__settings-body label span {
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

	.program-editor__settings-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.5rem;
	}

	@media (max-width: 1080px) {
		.program-editor__settings-overlay {
			top: calc(2.5rem + 1px);
		}

		.program-editor__settings {
			width: min(20rem, 90vw);
			top: calc(2.5rem + 1px);
			height: calc(100vh - 2.5rem - 1px);
		}
	}
</style>
