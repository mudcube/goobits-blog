<script lang="ts">
	import { untrack } from 'svelte'
	import { StepIndicator } from '@calendar/ui'
	import DevHero from '../DevHero.svelte'
	import ResourceCard from './ResourceCard.svelte'
	import type { ResourceGroup } from './+page.server'

	const { data } = $props<{ data: { groups: ResourceGroup[] } }>()

	const groups = untrack(() => data.groups)

	let selections = $state<Record<string, Set<string>>>(
		Object.fromEntries(groups.map((g: ResourceGroup) => [g.id, new Set<string>()]))
	)

	function toggle(group: ResourceGroup, resourceId: string) {
		const current = selections[group.id]
		const next = new Set(current)
		if (next.has(resourceId)) {
			next.delete(resourceId)
		} else {
			if (!group.multiple) next.clear()
			next.add(resourceId)
		}
		selections = { ...selections, [group.id]: next }
	}

	const summary = $derived.by(() => {
		const lines: string[] = []
		for (const g of groups as ResourceGroup[]) {
			const ids = selections[g.id]
			if (!ids || ids.size === 0) continue
			const names = g.resources.filter((r: { id: string }) => ids.has(r.id)).map((r: { name: string }) => r.name)
			lines.push(`${g.label}: ${names.join(', ')}`)
		}
		return lines
	})

	const ready = $derived(
		(groups as ResourceGroup[])
			.filter((g) => g.required)
			.every((g) => (selections[g.id]?.size ?? 0) > 0)
	)
</script>

<svelte:head>
	<title>Multi-Resource Booking · Playground</title>
</svelte:head>

<div class="playground-page">
	<DevHero
		title="Multi-Resource Booking"
		subtitle="Pick room + crew + equipment at the same time — for studios, salons, coworking."
		breadcrumbItems={[{ label: 'Playground', href: '/playground/' }, { label: 'Multi-Resource' }]}
	/>

	<div class="playground-page__shell">
		<StepIndicator current={0} maxReached={0} labels={['Resources', 'Time', 'Confirm']} />

		<header class="playground-page__head">
			<h2 class="playground-page__title">Build your booking</h2>
			<p class="playground-page__subtitle">Required groups must have at least one selection.</p>
		</header>

		<div class="groups">
			{#each groups as group (group.id)}
				<section class="groups__section">
					<header class="groups__header">
						<h3 class="groups__label">
							{group.label}
							{#if group.required}<span class="groups__req">Required</span>{/if}
							{#if group.multiple}<span class="groups__hint">Pick any</span>{:else}<span class="groups__hint">Pick one</span>{/if}
						</h3>
					</header>
					<ResourceCard
						resources={group.resources}
						selected={selections[group.id] ?? new Set()}
						multiple={group.multiple}
						onToggle={(id) => toggle(group, id)}
					/>
				</section>
			{/each}
		</div>

		<footer class="summary" class:summary--ready={ready}>
			<h4 class="summary__title">Selection summary</h4>
			{#if summary.length === 0}
				<p class="summary__empty">Nothing picked yet.</p>
			{:else}
				<ul class="summary__list">
					{#each summary as line}<li>{line}</li>{/each}
				</ul>
			{/if}
			<p class="summary__cta">{ready ? 'Ready to pick a time.' : 'Fill required groups to continue.'}</p>
		</footer>
	</div>
</div>

<style>
	.playground-page {
		max-width: 56rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}
	.playground-page__shell {
		margin-top: 1.5rem;
	}
	.playground-page__head {
		margin: 1.5rem 0 1rem;
	}
	.playground-page__title {
		margin: 0 0 0.25rem;
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.playground-page__subtitle {
		margin: 0;
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}
	.groups {
		display: grid;
		gap: 1.25rem;
	}
	.groups__header {
		margin-bottom: 0.45rem;
	}
	.groups__label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-size: 0.78rem;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 65%, transparent);
	}
	.groups__req,
	.groups__hint {
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		padding: 0.1rem 0.4rem;
		border-radius: 0.25rem;
	}
	.groups__req {
		background: var(--playground-required-bg);
		color: var(--playground-required);
	}
	.groups__hint {
		background: color-mix(in srgb, var(--text) 6%, transparent);
		color: color-mix(in srgb, var(--text) 56%, transparent);
		text-transform: none;
	}
	.summary {
		margin-top: 1.5rem;
		padding: 0.85rem 1rem;
		border: 1px dashed color-mix(in srgb, var(--text) 18%, transparent);
		border-radius: 0.625rem;
	}
	.summary--ready {
		border-style: solid;
		border-color: color-mix(in srgb, var(--book-accent) 40%, transparent);
		background: color-mix(in srgb, var(--book-accent) 5%, transparent);
	}
	.summary__title {
		margin: 0 0 0.35rem;
		font-size: 0.7rem;
		font-weight: 650;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}
	.summary__empty {
		margin: 0;
		font-size: 0.82rem;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}
	.summary__list {
		margin: 0;
		padding-left: 1rem;
		font-size: 0.85rem;
		color: var(--text);
		display: grid;
		gap: 0.15rem;
	}
	.summary__cta {
		margin: 0.5rem 0 0;
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}
</style>
