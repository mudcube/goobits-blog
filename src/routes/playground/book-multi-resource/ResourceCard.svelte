<script lang="ts">
	import { Check } from '@lucide/svelte'
	import type { Resource } from './+page.server'

	let {
		resources,
		selected,
		multiple,
		onToggle
	}: {
		resources: Resource[]
		selected: Set<string>
		multiple: boolean
		onToggle: (id: string) => void
	} = $props()

	function isSelected(id: string) {
		return selected.has(id)
	}
</script>

<fieldset class="rc">
	{#each resources as r (r.id)}
		<button
			type="button"
			class="rc__row"
			class:rc__row--on={isSelected(r.id)}
			class:rc__row--disabled={!r.available}
			disabled={!r.available}
			aria-pressed={isSelected(r.id)}
			data-tip={multiple ? 'Toggle' : 'Select'}
			onclick={() => onToggle(r.id)}
		>
			<span class="rc__check" aria-hidden="true">
				{#if isSelected(r.id)}<Check size={12} strokeWidth={3} />{/if}
			</span>
			<span class="rc__body">
				<span class="rc__name">{r.name}</span>
				<span class="rc__detail">{r.detail}</span>
			</span>
			{#if !r.available}<span class="rc__tag">Unavailable</span>{/if}
		</button>
	{/each}
</fieldset>

<style>
	.rc {
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		border-radius: 0.5rem;
		margin: 0;
		padding: 0;
		display: grid;
	}
	.rc__row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.55rem 0.75rem;
		width: 100%;
		background: none;
		border: none;
		color: var(--text);
		font: inherit;
		cursor: pointer;
		text-align: left;
		transition: background 180ms;
	}
	.rc__row + .rc__row {
		border-top: 1px solid color-mix(in srgb, var(--text) 6%, transparent);
	}
	.rc__row:hover:not(:disabled) {
		background: color-mix(in srgb, var(--text) 4%, transparent);
	}
	.rc__row--on {
		background: color-mix(in srgb, var(--book-accent) 8%, transparent);
	}
	.rc__row--on:hover {
		background: color-mix(in srgb, var(--book-accent) 14%, transparent);
	}
	.rc__row--disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.rc__check {
		width: 1.1rem;
		height: 1.1rem;
		border-radius: 0.3rem;
		border: 1.5px solid color-mix(in srgb, var(--text) 22%, transparent);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: #fff;
		background: transparent;
		transition: all 180ms;
	}
	.rc__row--on .rc__check {
		background: var(--book-accent);
		border-color: var(--book-accent);
	}
	.rc__body {
		flex: 1;
		min-width: 0;
		display: grid;
		gap: 0.05rem;
	}
	.rc__name {
		font-size: 0.85rem;
		font-weight: 650;
		line-height: 1.25;
	}
	.rc__detail {
		font-size: 0.72rem;
		color: color-mix(in srgb, var(--text) 48%, transparent);
	}
	.rc__tag {
		font-size: 0.6rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 50%, transparent);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
