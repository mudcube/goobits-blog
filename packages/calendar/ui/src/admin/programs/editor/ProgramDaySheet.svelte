<script lang="ts">
	import AdminActionButton from '../../shared/AdminActionButton.svelte'

	type ActiveDay = {
		time: string
		capacity: number
		repeatLabel?: string
		count: number
	}

	let {
		open,
		selectedDayDate,
		activeDay = null,
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
		open: boolean
		selectedDayDate: Date | null
		activeDay?: ActiveDay | null
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
	const dayLabel = $derived.by(() => {
		if (!selectedDayDate) return ''
		return selectedDayDate.toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'short',
			day: 'numeric'
		})
	})
</script>

{#if open}
	<button
		type="button"
		class="program-day-sheet__overlay"
		aria-label="Close session editor"
		onclick={onClose}
	></button>
	<aside class="program-day-sheet" aria-label="Session editor">
		<header class="program-day-sheet__head">
			<div class="program-day-sheet__title">{dayLabel}</div>
			<button type="button" class="program-day-sheet__close" aria-label="Close" onclick={onClose}>✕</button>
		</header>

		<div class="program-day-sheet__body">
			{#if !hasActiveDay}
				<section class="program-day-sheet__section">
					<h3>Repeat</h3>
					<div class="program-day-sheet__opt-row">
						<button
							type="button"
							class="program-day-sheet__opt"
							class:program-day-sheet__opt--on={newMode === 'once'}
							onclick={() => (newMode = 'once')}
						>
							Just this day
						</button>
						<button
							type="button"
							class="program-day-sheet__opt"
							class:program-day-sheet__opt--on={newMode === 'repeat'}
							onclick={() => (newMode = 'repeat')}
						>
							Repeat weekly
						</button>
					</div>

					{#if newMode === 'repeat'}
						<div class="program-day-sheet__until">
							<button
								type="button"
								class="program-day-sheet__opt"
								class:program-day-sheet__opt--on={untilMode === 'ongoing'}
								onclick={() => (untilMode = 'ongoing')}
							>
								Ongoing
							</button>
							<button
								type="button"
								class="program-day-sheet__opt"
								class:program-day-sheet__opt--on={untilMode === 'date'}
								onclick={() => (untilMode = 'date')}
							>
								Until date
							</button>
						</div>
						{#if untilMode === 'date'}
							<input
								class="ui-form-control"
								type="date"
								bind:value={untilDate}
							/>
						{/if}
					{/if}
				</section>
			{/if}

			<section class="program-day-sheet__section">
				<h3>Session</h3>
				<div class="program-day-sheet__fields">
					<label>
						<span>Time</span>
						<input class="ui-form-control" type="time" step="900" bind:value={popTime} />
					</label>
					<label>
						<span>Capacity</span>
						<input class="ui-form-control" type="number" min="1" max="50" bind:value={popCap} />
					</label>
				</div>
			</section>

			{#if hasActiveDay && activeDay?.repeatLabel}
				<div class="program-day-sheet__note">
					<strong>Part of repeating schedule</strong>
					<span>Changes here apply to this day only. Save a new schedule to persist a recurring change.</span>
				</div>
			{/if}
		</div>

		<footer class="program-day-sheet__actions" class:program-day-sheet__actions--split={hasActiveDay}>
			{#if hasActiveDay}
				<AdminActionButton variant="danger" onclick={onRemove}>Remove</AdminActionButton>
				<AdminActionButton variant="primary" onclick={onDone}>Save</AdminActionButton>
			{:else}
				<AdminActionButton variant="subtle" onclick={onClose}>Cancel</AdminActionButton>
				<AdminActionButton variant="primary" onclick={onAdd}>Add session</AdminActionButton>
			{/if}
		</footer>
	</aside>
{/if}

<style>
	.program-day-sheet__overlay {
		position: fixed;
		left: 0;
		right: 0;
		top: calc(2.5rem + 1px);
		bottom: 0;
		border: none;
		padding: 0;
		background: color-mix(in srgb, var(--text) 32%, transparent);
		backdrop-filter: blur(2px);
		z-index: 9993;
		cursor: pointer;
	}

	.program-day-sheet {
		position: fixed;
		top: calc(2.5rem + 1px);
		right: 0;
		bottom: 0;
		width: min(22rem, 92vw);
		height: calc(100vh - 2.5rem - 1px);
		border-left: 1px solid var(--admin-card-border, color-mix(in srgb, var(--text) 14%, transparent));
		background: var(--admin-card-bg, var(--bg));
		z-index: 9994;
		display: flex;
		flex-direction: column;
		color: var(--text);
		font-family: var(--font-ui-sans, var(--font-sans));
		box-shadow: -24px 0 60px color-mix(in srgb, var(--text) 12%, transparent);
	}

	.program-day-sheet__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.95rem 0.95rem 0.5rem;
	}

	.program-day-sheet__title {
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--text);
	}

	.program-day-sheet__close {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: transparent;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		width: 28px;
		height: 28px;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		display: grid;
		place-items: center;
		padding: 0;
	}

	.program-day-sheet__close:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: var(--text);
	}

	.program-day-sheet__body {
		padding: 0.4rem 0.95rem 0.95rem;
		display: grid;
		gap: 1rem;
		overflow: auto;
		flex: 1;
	}

	.program-day-sheet__section {
		display: grid;
		gap: 0.55rem;
	}

	.program-day-sheet__section h3 {
		margin: 0;
		font-size: 0.66rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}

	.program-day-sheet__opt-row,
	.program-day-sheet__until {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.45rem;
	}

	.program-day-sheet__opt {
		appearance: none;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
		border-radius: 999px;
		padding: 0.5rem 0.75rem;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 65%, transparent);
		cursor: pointer;
		transition: background 140ms, border-color 140ms, color 140ms;
	}

	.program-day-sheet__opt:hover {
		border-color: color-mix(in srgb, var(--text) 24%, transparent);
		color: var(--text);
	}

	.program-day-sheet__opt--on {
		background: color-mix(in srgb, var(--admin-accent, #a78bfa) 18%, var(--bg) 82%);
		border-color: color-mix(in srgb, var(--admin-accent, #a78bfa) 50%, transparent);
		color: color-mix(in srgb, var(--admin-accent, #a78bfa) 86%, var(--text) 14%);
	}

	.program-day-sheet__fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.65rem;
	}

	.program-day-sheet__fields label {
		display: grid;
		gap: 0.3rem;
	}

	.program-day-sheet__fields label span {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}

	.program-day-sheet__note {
		padding: 0.7rem 0.8rem;
		border-radius: 0.7rem;
		background: color-mix(in srgb, var(--admin-accent, #a78bfa) 8%, var(--bg) 92%);
		border: 1px solid color-mix(in srgb, var(--admin-accent, #a78bfa) 18%, transparent);
		display: grid;
		gap: 0.2rem;
	}

	.program-day-sheet__note strong {
		font-size: 0.78rem;
		font-weight: 700;
	}

	.program-day-sheet__note span {
		font-size: 0.76rem;
		line-height: 1.4;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.program-day-sheet__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.75rem 0.95rem 0.95rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.program-day-sheet__actions--split {
		justify-content: space-between;
	}

	@media (max-width: 720px) {
		.program-day-sheet {
			top: auto;
			right: 0;
			left: 0;
			bottom: 0;
			width: 100%;
			height: min(80vh, 32rem);
			border-left: none;
			border-top: 1px solid var(--admin-card-border, color-mix(in srgb, var(--text) 14%, transparent));
			border-radius: 1rem 1rem 0 0;
			box-shadow: 0 -24px 60px color-mix(in srgb, var(--text) 12%, transparent);
		}
	}
</style>
