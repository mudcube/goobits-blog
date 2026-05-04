<script lang="ts">
	import { tick } from 'svelte'
	import { ArrowRight, Check } from '@lucide/svelte'
	import { fade, fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import ProviderIcon from './ProviderIcon.svelte'
	import { providerOptions } from './data'
	import { providerLabel } from './helpers'
	import type { SyncProvider } from './types'

	let {
		current,
		currentSyncedAt,
		onCancel,
		onContinue
	}: {
		current: SyncProvider | null
		currentSyncedAt: string | null
		onCancel: () => void
		onContinue: (target: SyncProvider, disconnectOld: boolean) => void
	} = $props()

	let target = $state<SyncProvider | null>(initialTarget())
	let disconnectOld = $state(true)
	let panelEl: HTMLDivElement | undefined = $state()

	function initialTarget(): SyncProvider | null {
		return providerOptions.find((p) => p.value !== current)?.value ?? null
	}

	$effect(() => {
		void tick().then(() => {
			panelEl?.querySelector<HTMLElement>('button, [tabindex="0"], input')?.focus()
		})
	})

	function handleKey(e: KeyboardEvent) {
		e.stopPropagation()
		if (e.key === 'Escape') onCancel()
	}

	function handleContinue() {
		if (!target) return
		onContinue(target, disconnectOld)
	}
</script>

<div
	class="connect-sheet"
	role="presentation"
	onclick={onCancel}
	onkeydown={handleKey}
	transition:fade={{ duration: 160 }}
>
	<div
		bind:this={panelEl}
		class="connect-sheet__panel"
		role="dialog"
		aria-modal="true"
		aria-label="Switch provider"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={handleKey}
		transition:fly={{ y: 12, duration: 200, easing: quintOut }}
	>
		<header class="connect-sheet__head">
			<h3 class="connect-sheet__title">
				{current ? 'Switch calendar provider' : 'Connect a calendar'}
			</h3>
		</header>

		<div class="connect-sheet__body">
			{#if current}
				<p class="connect-sheet__current">
					Currently: <strong>{providerLabel(current)}</strong> · synced {currentSyncedAt}
				</p>
			{/if}

			<div class="connect-sheet__list" role="radiogroup">
				{#each providerOptions.filter((p) => p.value !== current) as opt}
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
					<span>Disconnect {providerLabel(current)} after the new one connects.</span>
				</label>
			{/if}
		</div>

		<footer class="connect-sheet__foot">
			<button type="button" class="admin-btn admin-btn--muted" onclick={onCancel}>Cancel</button>
			<button
				type="button"
				class="admin-btn admin-btn--solid"
				disabled={!target}
				onclick={handleContinue}
			>
				Continue <ArrowRight size={14} strokeWidth={2.2} />
			</button>
		</footer>
	</div>
</div>

<style>
	.connect-sheet {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--text) 30%, transparent);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 100;
	}
	.connect-sheet__panel {
		width: min(26rem, 100%);
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 14px;
		box-shadow: 0 24px 60px -18px color-mix(in srgb, black 36%, transparent);
		display: grid;
		max-height: 90vh;
		overflow: hidden;
	}
	.connect-sheet__head {
		padding: 1.05rem 1.15rem 0.55rem;
	}
	.connect-sheet__title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 580;
		letter-spacing: -0.005em;
		color: var(--text);
	}
	.connect-sheet__body {
		padding: 0.4rem 1.15rem 0.95rem;
		display: grid;
		gap: 0.7rem;
		overflow-y: auto;
	}
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
	.connect-sheet__foot {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1.15rem 1rem;
		border-top: 1px solid color-mix(in srgb, var(--admin-card-border) 80%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
	}
</style>
