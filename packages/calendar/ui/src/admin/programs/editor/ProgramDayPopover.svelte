<script lang="ts">
	import AdminActionButton from '../../shared/AdminActionButton.svelte'

	type ActiveDay = {
		time: string
		capacity: number
		repeatLabel?: string
		count: number
	}

	let {
		selectedDayDate,
		activeDay = null,
		popLeft,
		popTop,
		popBottom,
		popAbove,
		newMode = $bindable<'once' | 'repeat'>(),
		untilMode = $bindable<'ongoing' | 'date'>(),
		untilDate = $bindable<string>(),
		popTime = $bindable<string>(),
		popCap = $bindable<number>(),
		onClose,
		onAdd,
		onRemove,
		onDone
	}: {
		selectedDayDate: Date | null
		activeDay?: ActiveDay | null
		popLeft: number
		popTop: number
		popBottom: number
		popAbove: boolean
		newMode: 'once' | 'repeat'
		untilMode: 'ongoing' | 'date'
		untilDate: string
		popTime: string
		popCap: number
		onClose: () => void
		onAdd: () => void
		onRemove: () => void
		onDone: () => void
	} = $props()

	const hasActiveDay = $derived(!!activeDay)
</script>

<div
	class="program-editor__popover"
	style={`left:${popLeft}px; ${popAbove ? `bottom:${popBottom}px` : `top:${popTop}px`}; transform:translateX(-50%);`}
>
	<div
		class="program-editor__popover-arrow"
		class:program-editor__popover-arrow--above={popAbove}
	></div>
	<div class="program-editor__popover-title">
		{#if selectedDayDate}
			{selectedDayDate.toLocaleDateString(undefined, {
				weekday: 'long',
				month: 'short',
				day: 'numeric'
			})}
		{/if}
	</div>

	{#if !hasActiveDay}
		<div class="program-editor__opt-row">
			<button
				type="button"
				class="program-editor__opt"
				class:program-editor__opt--on={newMode === 'once'}
				onclick={() => (newMode = 'once')}
			>
				Just this day
			</button>
			<button
				type="button"
				class="program-editor__opt"
				class:program-editor__opt--on={newMode === 'repeat'}
				onclick={() => (newMode = 'repeat')}
			>
				Repeat weekly
			</button>
		</div>

		{#if newMode === 'repeat'}
			<div class="program-editor__until">
				<button
					type="button"
					class:program-editor__until-btn--on={untilMode === 'ongoing'}
					class="program-editor__until-btn"
					onclick={() => (untilMode = 'ongoing')}
				>
					Ongoing
				</button>
				<button
					type="button"
					class:program-editor__until-btn--on={untilMode === 'date'}
					class="program-editor__until-btn"
					onclick={() => (untilMode = 'date')}
				>
					Pick date
				</button>
			</div>
			{#if untilMode === 'date'}
				<input
					class="ui-form-control program-editor__input"
					type="date"
					bind:value={untilDate}
				/>
			{/if}
		{/if}

		<div class="program-editor__fields">
			<label>
				<span>Time</span>
				<input class="ui-form-control program-editor__input" type="time" step="900" bind:value={popTime} />
			</label>
			<label>
				<span>Capacity</span>
				<input class="ui-form-control program-editor__input" type="number" min="1" max="50" bind:value={popCap} />
			</label>
		</div>
		<div class="program-editor__actions">
			<AdminActionButton variant="subtle" onclick={onClose}>Cancel</AdminActionButton>
			<AdminActionButton variant="primary" onclick={onAdd}>Add</AdminActionButton>
		</div>
	{:else}
		<div class="program-editor__fields">
			<label>
				<span>Time</span>
				<input class="ui-form-control program-editor__input" type="time" step="900" bind:value={popTime} />
			</label>
			<label>
				<span>Capacity</span>
				<input class="ui-form-control program-editor__input" type="number" min="1" max="50" bind:value={popCap} />
			</label>
		</div>
		{#if activeDay?.repeatLabel}
			<div class="program-editor__override">
				<div class="program-editor__override-label">Part of repeating schedule</div>
				<div class="program-editor__override-text">
					Changes here apply to this day preview only. Save a new schedule to persist.
				</div>
			</div>
		{/if}
		<div class="program-editor__actions program-editor__actions--split">
			<AdminActionButton variant="danger" onclick={onRemove}>Remove</AdminActionButton>
			<AdminActionButton variant="primary" onclick={onDone}>Save</AdminActionButton>
		</div>
	{/if}
</div>

<style>
	.program-editor__popover {
		position: absolute;
		z-index: 1000;
		min-width: 250px;
		max-width: min(92vw, 340px);
		border-radius: 1rem;
		border: 1px solid var(--border-s);
		background: var(--popover-surface);
		box-shadow: 0 24px 60px color-mix(in srgb, var(--text) 18%, transparent);
		padding: 0.9rem;
		backdrop-filter: blur(18px) saturate(110%);
	}

	.program-editor__popover :global(.ui-form-control) {
		background: color-mix(in srgb, var(--bg) 82%, var(--text) 18%);
		border-color: color-mix(in srgb, var(--text) 12%, transparent);
		color: var(--text);
	}

	.program-editor__popover :global(.ui-form-control:focus) {
		border-color: color-mix(in srgb, var(--blue) 52%, transparent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 18%, transparent);
	}

	.program-editor__popover-arrow {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: -7px;
		width: 14px;
		height: 14px;
		border-left: 1px solid var(--border-s);
		border-top: 1px solid var(--border-s);
		background: var(--popover-surface);
		rotate: 45deg;
	}

	.program-editor__popover-arrow--above {
		top: auto;
		bottom: -7px;
		border-left: none;
		border-top: none;
		border-right: 1px solid var(--border-s);
		border-bottom: 1px solid var(--border-s);
	}

	.program-editor__popover-title {
		font-size: 0.95rem;
		font-weight: 700;
		margin-bottom: 0.7rem;
		color: var(--text);
	}

	.program-editor__opt-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.45rem;
		margin-bottom: 0.7rem;
	}

	.program-editor__opt,
	.program-editor__until-btn {
		appearance: none;
		border: 1px solid var(--border);
		background: color-mix(in srgb, var(--bg) 88%, var(--text) 12%);
		border-radius: 999px;
		padding: 0.46rem 0.75rem;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-2);
		cursor: pointer;
	}

	.program-editor__opt--on,
	.program-editor__until-btn--on {
		background: color-mix(in srgb, var(--blue) 16%, var(--bg) 84%);
		border-color: color-mix(in srgb, var(--blue) 45%, transparent);
		color: var(--text);
	}

	.program-editor__until {
		display: flex;
		gap: 0.45rem;
		margin-bottom: 0.7rem;
	}

	.program-editor__fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
	}

	.program-editor__fields label {
		display: grid;
		gap: 0.35rem;
	}

	.program-editor__fields label span {
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text-3);
	}

	.program-editor__override {
		margin-top: 0.75rem;
		padding: 0.7rem 0.75rem;
		border-radius: 0.85rem;
		background: color-mix(in srgb, var(--blue) 10%, var(--bg) 90%);
		border: 1px solid color-mix(in srgb, var(--blue) 14%, transparent);
	}

	.program-editor__override-label {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--text);
		margin-bottom: 0.2rem;
	}

	.program-editor__override-text {
		font-size: 0.78rem;
		line-height: 1.35;
		color: var(--text-2);
	}

	.program-editor__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.8rem;
	}

	.program-editor__actions--split {
		justify-content: space-between;
	}
</style>
