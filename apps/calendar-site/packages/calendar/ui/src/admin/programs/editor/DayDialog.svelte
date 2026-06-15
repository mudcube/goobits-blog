<script lang="ts">
	import { tick } from 'svelte'
	import { scale } from 'svelte/transition'
	import { AdminActionButton } from '@calendar/ui/admin'
	import TimeChip from './TimeChip.svelte'
	import SpotsStepper from './SpotsStepper.svelte'
	import type { DayDraft } from './day-dialog.types'

	let {
		draft,
		selectedDate,
		selectedLabel,
		hasEventOnSelected,
		filledOnSelected = 0,
		capacityOnSelected = 0,
		pendingDay,
		onDismiss,
		onSave,
		onRemove,
		onCancelDiscard,
		onConfirmDiscard
	} = $props<{
		draft: DayDraft
		selectedDate: Date | null
		selectedLabel: string
		hasEventOnSelected: boolean
		filledOnSelected?: number
		capacityOnSelected?: number
		pendingDay: boolean
		onDismiss: () => void
		onSave: () => void
		onRemove: () => void
		onCancelDiscard: () => void
		onConfirmDiscard: () => void
	}>()

	let titleEl: HTMLElement | undefined = $state()

	$effect(() => {
		if (!selectedLabel) return
		tick().then(() => titleEl?.focus())
	})

	const repeatLabel = $derived(
		selectedDate
			? `Repeat every ${selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}`
			: 'Repeat weekly'
	)
</script>

<div
	class="day-dialog"
	role="dialog"
	aria-modal="true"
	aria-label={hasEventOnSelected ? 'Edit class' : 'Schedule a class'}
	transition:scale={{ start: 0.96, duration: 160, opacity: 0 }}
>
	<header class="day-dialog__head">
		<div class="day-dialog__title-group">
			<h2 class="day-dialog__title" tabindex="-1" bind:this={titleEl}>
				{hasEventOnSelected ? 'Edit class' : 'Schedule a class'}
			</h2>
			<span class="day-dialog__meta">
				{selectedLabel}{#if hasEventOnSelected} · {filledOnSelected}/{capacityOnSelected} booked{/if}
			</span>
		</div>
		<button
			type="button"
			class="day-dialog__close"
			aria-label="Close"
			onclick={onDismiss}
		>✕</button>
	</header>

	{#if pendingDay}
		<div class="dd-discard" role="alertdialog" aria-label="Unsaved changes">
			<p class="dd-discard__title">You have unsaved edits</p>
			<p class="dd-hint">Your changes to {selectedLabel} aren't saved yet.</p>
			<div class="dd-confirm-row">
				<AdminActionButton variant="subtle" onclick={onCancelDiscard}>Keep editing</AdminActionButton>
				<AdminActionButton variant="danger" onclick={onConfirmDiscard}>Switch anyway</AdminActionButton>
			</div>
		</div>
	{:else}
		<div class="day-dialog__body">
			<div class="value-row">
				<TimeChip bind:value={draft.time} label="Time" />
				<SpotsStepper bind:value={draft.capacity} label="Capacity" />
			</div>

			<div class="repeat-block">
				<label class="dd-check">
					<input type="checkbox" bind:checked={draft.repeat} />
					<span>{repeatLabel}</span>
				</label>

				{#if draft.repeat}
					<div class="repeat-block__until">
						<label class="dd-radio">
							<input type="radio" name="until" value="ongoing" bind:group={draft.untilMode} />
							<span>Ongoing</span>
						</label>
						<label class="dd-radio">
							<input type="radio" name="until" value="date" bind:group={draft.untilMode} />
							<span>Until</span>
						</label>
						{#if draft.untilMode === 'date'}
							<input
								class="dd-until-date"
								type="date"
								bind:value={draft.untilDate}
								aria-label="Repeat until date"
							/>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<footer class="day-dialog__foot">
			{#if hasEventOnSelected}
				<AdminActionButton variant="danger" onclick={onRemove}>Remove</AdminActionButton>
			{:else}
				<span></span>
			{/if}
			<div class="day-dialog__foot-right">
				<AdminActionButton variant="subtle" onclick={onDismiss}>Cancel</AdminActionButton>
				<AdminActionButton variant="primary" onclick={onSave}>
					{hasEventOnSelected ? 'Save' : 'Add event'}
				</AdminActionButton>
			</div>
		</footer>
	{/if}
</div>

<style>
	.day-dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(22rem, calc(100vw - 2rem));
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		/* Card radius — matches editor panel + emoji picker. */
		border-radius: 0.875rem;
		box-shadow: 0 24px 60px color-mix(in srgb, var(--text) 20%, transparent);
		z-index: 50;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		padding: 1rem;
		max-height: calc(100vh - 2rem);
		overflow: auto;
		overscroll-behavior: contain;
	}

	.day-dialog :global(.admin-ui-btn) {
		min-height: var(--ins-control-h);
		padding-inline: var(--ins-control-pad-x);
		font-size: var(--ins-control-font-size);
		border-radius: var(--ins-control-radius);
	}

	.day-dialog__head {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding-bottom: 0.6rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.day-dialog__title-group {
		display: grid;
		gap: 0.1rem;
		flex: 1;
		min-width: 0;
	}

	.day-dialog__title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		outline: none;
	}

	.day-dialog__title:focus-visible {
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--admin-accent) 60%, transparent);
		text-underline-offset: 4px;
	}

	.day-dialog__meta {
		font-size: 0.74rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		font-variant-numeric: tabular-nums;
	}

	.day-dialog__close {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: transparent;
		font: inherit;
		font-size: 0.85rem;
		line-height: 1;
		cursor: pointer;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		width: 30px;
		height: 30px;
		padding: 0;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.day-dialog__close:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: var(--text);
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
	}

	.day-dialog__body {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.value-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.repeat-block {
		display: grid;
		gap: 0.5rem;
	}

	.dd-check {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0.25rem 0;
		justify-self: start;
		/* Match line-height of inner text + checkbox so vertical alignment
		 * is exact rather than at native baseline. */
		line-height: 18px;
	}

	.dd-check > span {
		line-height: 18px;
	}

	.dd-check input {
		width: 18px;
		height: 18px;
		margin: 0;
		accent-color: var(--admin-accent);
		flex: none;
		display: block;
	}

	.repeat-block__until {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		padding-left: 1.6rem;
		padding-bottom: 0.2rem;
	}

	.dd-radio {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		cursor: pointer;
		/* Match line-height to the radio glyph height so flex centering
		 * lines up the native input's optical center with the text. */
		line-height: 16px;
	}

	.dd-radio > span { line-height: 16px; }

	.dd-radio input {
		width: 16px;
		height: 16px;
		margin: 0;
		accent-color: var(--admin-accent);
		flex: none;
		display: block;
	}

	.dd-until-date {
		appearance: none;
		border: 1px solid var(--ins-control-border);
		background: var(--ins-control-bg);
		color: var(--ins-control-fg);
		font: inherit;
		font-size: 0.8rem;
		padding: 0.3rem 0.5rem;
		border-radius: var(--ins-control-radius);
		outline: none;
	}

	.dd-until-date:focus {
		border-color: var(--ins-control-border-focus);
		box-shadow: var(--ins-control-focus-ring);
	}

	.day-dialog__foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-top: 0.7rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.day-dialog__foot-right {
		display: flex;
		gap: 0.4rem;
	}

	/* Discard prompt */
	.dd-discard {
		padding: 0.85rem 0.95rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--admin-warn) 8%, var(--bg) 92%);
		border: 1px solid color-mix(in srgb, var(--admin-warn) 28%, transparent);
		display: grid;
		gap: 0.4rem;
	}

	.dd-discard__title {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 700;
	}

	.dd-hint {
		margin: 0;
		font-size: 0.74rem;
		line-height: 1.45;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.dd-confirm-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.day-dialog { transition: none; }
	}
</style>
