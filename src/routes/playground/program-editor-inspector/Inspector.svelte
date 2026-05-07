<script lang="ts">
	import { tick } from 'svelte'
	import { fade } from 'svelte/transition'
	import { AdminActionButton } from '@calendar/ui/admin'
	import HeroEdit from './HeroEdit.svelte'
	import UrlPill from './UrlPill.svelte'
	import TimeChip from './TimeChip.svelte'
	import SpotsStepper from './SpotsStepper.svelte'

	type Program = {
		enabled: boolean
		slug: string
		eyebrow: string
		titleLine1: string
		titleLine2: string
		subtitle: string
		defaultTime: string
		defaultCapacity: number
	}

	type DayDraft = {
		time: string
		capacity: number
		repeat: boolean
	}

	let {
		program,
		draft,
		open = $bindable(false),
		view,
		selectedDate,
		selectedLabel,
		hasEventOnSelected,
		pendingDay,
		previewHref,
		onBackToProgram,
		onDismissDay,
		onSaveEvent,
		onRemoveEvent,
		onCancelDiscard,
		onConfirmDiscard
	} = $props<{
		program: Program
		draft: DayDraft
		open: boolean
		view: 'program' | 'day'
		selectedDate: Date | null
		selectedLabel: string
		hasEventOnSelected: boolean
		pendingDay: number | null
		previewHref: string
		onBackToProgram: () => void
		onDismissDay: () => void
		onSaveEvent: () => void
		onRemoveEvent: () => void
		onCancelDiscard: () => void
		onConfirmDiscard: () => void
	}>()

	let deleteConfirmOpen = $state(false)
	let programHeadingEl: HTMLElement | undefined = $state()
	let dayHeadingEl: HTMLElement | undefined = $state()

	$effect(() => {
		if (!open && view === 'program') return
		tick().then(() => {
			if (view === 'day') dayHeadingEl?.focus()
			else if (open) programHeadingEl?.focus()
		})
	})

	function deleteProgram() {
		// mockup: nothing destructive
		deleteConfirmOpen = false
	}

	const repeatLabel = $derived(
		selectedDate
			? `Repeat every ${selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}`
			: 'Repeat weekly'
	)
</script>

<aside
	class="inspector"
	class:inspector--open={open}
	class:inspector--day={view === 'day'}
	role="region"
	aria-label="Settings panel"
>
	{#key view}
		<div class="inspector__view" in:fade={{ duration: 140 }}>
			{#if view === 'program'}
				<header class="inspector__head inspector__head--minimal">
					<h2 class="inspector__title sr-only" tabindex="-1" bind:this={programHeadingEl}>Program settings</h2>
					<button
						type="button"
						class="inspector__close"
						aria-label="Close settings panel"
						onclick={() => (open = false)}
					>✕</button>
				</header>

				<div class="inspector__body">
					<div class="status-row">
						<button
							type="button"
							class="switch"
							class:switch--on={program.enabled}
							aria-pressed={program.enabled}
							aria-label={program.enabled ? 'Bookable. Click to hide.' : 'Hidden. Click to make bookable.'}
							onclick={() => (program.enabled = !program.enabled)}
						>
							<span class="switch__thumb">
								<span class="switch__icon" aria-hidden="true">{program.enabled ? '✓' : ''}</span>
							</span>
						</button>
						<span class="status-row__label">
							{program.enabled ? 'Bookable' : 'Hidden'}
						</span>
					</div>

					<hr class="ins-divider" />

					<UrlPill bind:slug={program.slug} />

					<hr class="ins-divider" />

					<HeroEdit
						emoji="🧘"
						bind:eyebrow={program.eyebrow}
						bind:titleLine1={program.titleLine1}
						bind:titleLine2={program.titleLine2}
						bind:subtitle={program.subtitle}
						{previewHref}
					/>

					<hr class="ins-divider" />

					<section class="ins-block">
						<div class="ins-block__head">
							<h3 class="ins-block__title">Defaults for new events</h3>
							<p class="ins-hint">When you click a day to schedule, these are the starting values.</p>
						</div>
						<div class="value-row">
							<TimeChip bind:value={program.defaultTime} label="Default time" />
							<SpotsStepper bind:value={program.defaultCapacity} label="Default capacity" />
						</div>
					</section>

					<hr class="ins-divider" />

					<section class="ins-block">
						<div class="ins-block__head">
							<h3 class="ins-block__title">Remove this program</h3>
							<p class="ins-hint">Takes the program and its events offline. Bookings are canceled.</p>
						</div>
						{#if !deleteConfirmOpen}
							<button
								type="button"
								class="ins-remove-btn"
								onclick={() => (deleteConfirmOpen = true)}
							>
								Remove program
							</button>
						{:else}
							<div class="ins-confirm">
								<p class="ins-confirm__msg">Are you sure? This can't be undone.</p>
								<div class="ins-confirm-row">
									<AdminActionButton variant="subtle" onclick={() => (deleteConfirmOpen = false)}>
										Keep program
									</AdminActionButton>
									<AdminActionButton variant="danger" onclick={deleteProgram}>
										Yes, remove
									</AdminActionButton>
								</div>
							</div>
						{/if}
					</section>

					<p class="inspector__footer-meta">Edited 2h ago by Miko</p>
				</div>
			{:else}
				<header class="inspector__head inspector__head--day">
					<button
						type="button"
						class="inspector__back"
						aria-label="Back to program settings"
						onclick={onBackToProgram}
					>← Program</button>
					<div class="inspector__day-title">
						<h2 class="inspector__title" tabindex="-1" bind:this={dayHeadingEl}>{selectedLabel}</h2>
						<span class="inspector__meta">
							{hasEventOnSelected ? 'Editing this class' : 'Schedule a class'}
						</span>
					</div>
				</header>

				{#if pendingDay != null}
					<div class="ins-discard" role="alertdialog" aria-label="Unsaved changes">
						<p class="ins-discard__title">You have unsaved edits</p>
						<p class="ins-hint">Your changes to {selectedLabel} aren't saved yet.</p>
						<div class="ins-confirm-row">
							<AdminActionButton variant="subtle" onclick={onCancelDiscard}>Keep editing</AdminActionButton>
							<AdminActionButton variant="danger" onclick={onConfirmDiscard}>Switch anyway</AdminActionButton>
						</div>
					</div>
				{:else}
					<div class="inspector__body">
						<section class="ins-block">
							<div class="ins-block__head">
								<h3 class="ins-block__title">When and how big</h3>
							</div>
							<div class="value-row">
								<TimeChip bind:value={draft.time} label="Time" />
								<SpotsStepper bind:value={draft.capacity} label="Capacity" />
							</div>
						</section>

						<label class="ins-check">
							<input type="checkbox" bind:checked={draft.repeat} />
							<span>{repeatLabel}</span>
						</label>
					</div>

					<footer class="inspector__foot">
						<AdminActionButton variant="subtle" onclick={onDismissDay}>Cancel</AdminActionButton>
						<div class="inspector__foot-right">
							{#if hasEventOnSelected}
								<AdminActionButton variant="danger" onclick={onRemoveEvent}>Remove</AdminActionButton>
							{/if}
							<AdminActionButton variant="primary" onclick={onSaveEvent}>
								{hasEventOnSelected ? 'Save' : 'Add event'}
							</AdminActionButton>
						</div>
					</footer>
				{/if}
			{/if}
		</div>
	{/key}
</aside>

<style>
	.inspector {
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 1rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		align-self: start;
		position: sticky;
		top: 1rem;
		max-height: calc(100vh - 2rem);
		overflow: auto;
		overscroll-behavior: contain;
	}

	.inspector__view { display: contents; }

	.inspector__head {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.inspector__head--minimal {
		justify-content: flex-end;
		padding-bottom: 0;
		border-bottom: none;
	}

	.inspector__title {
		margin: 0;
		font-size: 0.92rem;
		font-weight: 700;
		flex: 1;
		min-width: 0;
		outline: none;
	}

	.inspector__title:focus-visible {
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--admin-accent) 60%, transparent);
		text-underline-offset: 4px;
	}

	.inspector__meta {
		font-size: 0.7rem;
		color: var(--admin-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.inspector__footer-meta {
		margin: 0.6rem 0 0;
		padding-top: 0.6rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 7%, transparent);
		font-size: 0.7rem;
		color: var(--admin-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.inspector__close {
		display: none;
		appearance: none;
		border: 1px solid var(--admin-button-border, color-mix(in srgb, var(--text) 14%, transparent));
		background: transparent;
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		color: var(--admin-text-soft);
		width: 32px;
		height: 32px;
		border-radius: 999px;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.inspector__close:hover {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: var(--text);
		border-color: color-mix(in srgb, var(--text) 22%, transparent);
	}

	.inspector__body {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.ins-divider {
		border: none;
		border-top: 1px solid color-mix(in srgb, var(--text) 7%, transparent);
		margin: 0.1rem 0;
	}

	.ins-block { display: grid; gap: 0.55rem; }
	.ins-block__head { display: grid; gap: 0.15rem; }

	.ins-block__title {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 650;
		letter-spacing: -0.005em;
		color: var(--text);
	}

	.ins-hint {
		margin: 0;
		font-size: 0.74rem;
		line-height: 1.45;
		color: var(--admin-text-muted);
	}

	.ins-check {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0.35rem 0;
	}

	.ins-check input {
		width: 18px;
		height: 18px;
		accent-color: var(--admin-accent);
		flex: none;
	}

	.value-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	/* Status row */
	.status-row {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}

	.status-row__label {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text);
	}

	/* Switch — proportional to control height (toggle aspect ~1.7:1) */
	.switch {
		appearance: none;
		width: calc(var(--ins-control-h) * 1.65);
		height: calc(var(--ins-control-h) - 0.4rem);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 18%, transparent);
		border: 1px solid var(--ins-control-border);
		position: relative;
		cursor: pointer;
		transition: background 140ms, border-color 140ms;
		flex: none;
		padding: 0;
		box-sizing: border-box;
	}

	.switch__thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: calc(var(--ins-control-h) - 0.8rem);
		height: calc(var(--ins-control-h) - 0.8rem);
		border-radius: 999px;
		background: var(--bg);
		box-shadow: 0 1px 2px color-mix(in srgb, var(--text) 18%, transparent);
		transition: left 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
		display: grid;
		place-items: center;
	}

	.switch__icon {
		font-size: 0.65rem;
		font-weight: 800;
		line-height: 1;
		color: var(--admin-accent);
		opacity: 0;
		transition: opacity 140ms;
	}

	.switch--on { background: color-mix(in srgb, var(--admin-accent) 80%, transparent); }
	.switch--on .switch__thumb { left: calc(var(--ins-control-h) * 1.65 - var(--ins-control-h) + 0.6rem - 2px); }
	.switch--on .switch__icon { opacity: 1; }

	/* Remove section */
	.ins-remove-btn {
		appearance: none;
		justify-self: start;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: var(--ins-control-h);
		border: 1px solid var(--admin-danger-border, color-mix(in srgb, var(--admin-danger) 30%, transparent));
		background: transparent;
		color: var(--admin-danger-fg);
		font: inherit;
		font-size: var(--ins-control-font-size);
		font-weight: var(--ins-control-font-weight);
		padding: 0 var(--ins-control-pad-x);
		border-radius: var(--ins-control-radius);
		cursor: pointer;
		transition: background 140ms, color 140ms, border-color 140ms;
		box-sizing: border-box;
	}

	.ins-remove-btn:hover {
		background: var(--admin-danger-bg-faint, color-mix(in srgb, var(--admin-danger) 8%, var(--bg) 92%));
		border-color: color-mix(in srgb, var(--admin-danger) 50%, transparent);
		color: var(--admin-danger);
	}

	.ins-confirm {
		display: grid;
		gap: 0.55rem;
		padding: 0.7rem 0.8rem;
		border-radius: 0.7rem;
		background: var(--admin-danger-bg-faint, color-mix(in srgb, var(--admin-danger) 8%, var(--bg) 92%));
		border: 1px solid color-mix(in srgb, var(--admin-danger) 24%, transparent);
	}

	.ins-confirm__msg {
		margin: 0;
		font-size: 0.82rem;
		color: var(--text);
	}

	.ins-confirm-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	/* Discard prompt */
	.ins-discard {
		padding: 0.85rem 0.95rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--admin-warn) 8%, var(--bg) 92%);
		border: 1px solid color-mix(in srgb, var(--admin-warn) 28%, transparent);
		display: grid;
		gap: 0.4rem;
	}

	.ins-discard__title {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 700;
	}

	/* Day-view header */
	.inspector__head--day {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
	}

	.inspector__back {
		appearance: none;
		border: 1px solid var(--admin-control-border);
		background: var(--admin-control-bg);
		color: var(--admin-control-fg);
		padding: 0.36rem 0.75rem;
		border-radius: var(--admin-control-radius, 0.55rem);
		font: inherit;
		font-size: 0.76rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		cursor: pointer;
		transition: background 140ms, color 140ms, border-color 140ms, transform 140ms;
		flex: none;
	}

	.inspector__back:hover {
		background: var(--admin-control-bg-hover);
		transform: translateY(-1px);
	}

	.inspector__day-title {
		display: grid;
		gap: 0.05rem;
		min-width: 0;
	}

	.inspector__foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-top: 0.7rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
		margin-top: auto;
	}

	.inspector__foot-right {
		display: flex;
		gap: 0.4rem;
	}

	@media (max-width: 56em) {
		.inspector {
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: min(22rem, 92vw);
			max-height: 100vh;
			border-radius: 0;
			border-left: 1px solid var(--admin-card-border);
			border-top: none;
			border-right: none;
			border-bottom: none;
			box-shadow: -16px 0 40px color-mix(in srgb, var(--text) 14%, transparent);
			transform: translateX(100%);
			transition: transform 220ms ease;
			z-index: 50;
			padding: 1.1rem 1rem;
		}

		.inspector--open { transform: translateX(0); }
		.inspector__close { display: grid; place-items: center; }
		.inspector__back { min-height: 36px; }
	}

	@media (max-width: 24em) {
		.inspector { width: 100vw; max-width: 100vw; }
	}

	@media (prefers-reduced-motion: reduce) {
		.switch__thumb,
		.switch__icon,
		.inspector,
		.inspector__back { transition: none; }
	}
</style>
