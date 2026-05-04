<script lang="ts">
	import { ArrowRight, Check } from '@lucide/svelte'
	import AdminSheet from '../shared/AdminSheet.svelte'
	import ProviderIcon from './ProviderIcon.svelte'
	import type { SyncProvider } from './ProviderIcon.svelte'

	type ProviderOption = { value: SyncProvider; label: string; supported: boolean }

	const {
		current,
		currentStatusLabel,
		providers,
		onCancel,
		onContinue
	}: {
		current: SyncProvider | null
		currentStatusLabel: string | null
		providers: ProviderOption[]
		onCancel: () => void
		onContinue: (target: SyncProvider, disconnectOld: boolean) => void
	} = $props()

	const PROVIDER_LABELS: Record<SyncProvider, string> = {
		google: 'Google Calendar',
		apple: 'Apple Calendar',
		outlook: 'Outlook'
	}

	let target = $state<SyncProvider | null>(initialTarget())
	let disconnectOld = $state(true)

	function initialTarget(): SyncProvider | null {
		return providers.find((p: ProviderOption) => p.value !== current && p.supported)?.value ?? null
	}

	function submit() {
		if (!target) return
		onContinue(target, disconnectOld)
	}
</script>

<AdminSheet
	title={current ? 'Switch calendar provider' : 'Connect a calendar'}
	onClose={onCancel}
>
	{#snippet body()}
		{#if current}
			<p class="connect-sheet__current">
				Currently: <strong>{PROVIDER_LABELS[current]}</strong>{currentStatusLabel ? ' · ' + currentStatusLabel : ''}
			</p>
		{/if}

		<div class="connect-sheet__list" role="radiogroup">
			{#each providers.filter((p: ProviderOption) => p.value !== current && p.supported) as opt}
				<button
					type="button"
					class="connect-sheet__opt"
					class:connect-sheet__opt--active={target === opt.value}
					role="radio"
					aria-checked={target === opt.value}
					onclick={() => (target = opt.value)}
				>
					<span class="connect-sheet__opt-icon" aria-hidden="true">
						<ProviderIcon provider={opt.value} />
					</span>
					<span class="connect-sheet__opt-label">{opt.label}</span>
					{#if target === opt.value}
						<Check size={16} aria-hidden="true" />
					{/if}
				</button>
			{/each}
		</div>

		{#if current}
			<label class="connect-sheet__check">
				<input type="checkbox" bind:checked={disconnectOld} />
				<span>Disconnect {PROVIDER_LABELS[current]} after the new one connects.</span>
			</label>
		{/if}
	{/snippet}

	{#snippet foot()}
		<button type="button" class="admin-ui-btn admin-ui-btn--muted" onclick={onCancel}>Cancel</button>
		<button
			type="button"
			class="admin-ui-btn admin-ui-btn--solid"
			disabled={!target}
			onclick={submit}
		>
			Continue <ArrowRight size={14} strokeWidth={2.2} />
		</button>
	{/snippet}
</AdminSheet>

<style>
	.connect-sheet__current {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 420;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}
	.connect-sheet__list {
		display: grid;
		gap: 0.4rem;
	}
	.connect-sheet__opt {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.7rem;
		min-height: 2.6rem;
		padding: 0.45rem 0.85rem;
		border-radius: 0.625rem;
		border: 1px solid var(--admin-card-border);
		background: color-mix(in srgb, var(--bg) 96%, var(--text) 4%);
		font: inherit;
		text-align: left;
		cursor: pointer;
		color: var(--text);
		transition:
			border-color 120ms ease,
			background 120ms ease;
	}
	.connect-sheet__opt:hover {
		border-color: color-mix(in srgb, var(--admin-accent) 28%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 7%, var(--bg) 93%);
	}
	.connect-sheet__opt--active {
		border-color: color-mix(in srgb, var(--admin-accent) 48%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 12%, var(--bg) 88%);
	}
	.connect-sheet__opt--active :global(svg:last-child) {
		color: var(--admin-accent);
	}
	.connect-sheet__opt-icon {
		display: inline-flex;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--text) 6%, transparent);
		align-items: center;
		justify-content: center;
	}
	.connect-sheet__opt-label {
		font-size: 0.86rem;
		font-weight: 540;
	}
	.connect-sheet__check {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		font-size: 0.78rem;
		font-weight: 420;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		padding: 0.3rem 0;
		line-height: 1.5;
		cursor: pointer;
	}
	.connect-sheet__check input {
		flex-shrink: 0;
		width: 0.95rem;
		height: 0.95rem;
		margin: 0.18rem 0 0;
		accent-color: var(--admin-accent);
	}
</style>
