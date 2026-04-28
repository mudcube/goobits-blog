<script lang="ts">
	import { untrack } from 'svelte'
	import { Check, X, Clock } from '@lucide/svelte'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import DevHero from '../DevHero.svelte'
	import type { ApprovalRequest } from './+page.server'

	const { data } = $props<{ data: { requests: ApprovalRequest[] } }>()

	let pending = $state<ApprovalRequest[]>(untrack(() => [...data.requests]))
	let lastAction = $state<string | null>(null)

	function approve(id: string) {
		const r = pending.find((x) => x.id === id)
		pending = pending.filter((x) => x.id !== id)
		if (r) lastAction = `Approved ${r.requesterName} for ${r.eventTitle}`
	}

	function deny(id: string) {
		const r = pending.find((x) => x.id === id)
		pending = pending.filter((x) => x.id !== id)
		if (r) lastAction = `Declined ${r.requesterName} for ${r.eventTitle}`
	}

	const metaItems = $derived(
		pending.map((r) => ({
			id: r.id,
			label: `${r.requesterName} · ${r.eventTitle}`,
			detail: `${r.eventTime} · requested ${r.requestedAt}${r.note ? ` · "${r.note}"` : ''}`,
			icon: Clock,
			actions: [
				{
					variant: 'primary' as const,
					icon: Check,
					label: 'Approve',
					onclick: () => approve(r.id)
				},
				{
					variant: 'subtle' as const,
					icon: X,
					ariaLabel: `Decline ${r.requesterName}`,
					onclick: () => deny(r.id)
				}
			]
		}))
	)
</script>

<svelte:head>
	<title>Approval Queue Prototype · Playground</title>
</svelte:head>

<div class="playground-page">
	<DevHero
		title="Approval Queue"
		subtitle="Pending booking requests waiting for host approval."
		breadcrumbItems={[{ label: 'Playground', href: '/playground/' }, { label: 'Approval Queue' }]}
	/>

	<div class="playground-page__shell">
		<AdminPageHero
			eyebrow="Prototype"
			title="Pending requests"
			subtitle="{pending.length} {pending.length === 1 ? 'request' : 'requests'} awaiting decision."
		/>
		<AdminMetaCards items={metaItems} emptyText="Inbox zero. Nothing to approve." />

		{#if lastAction}
			<p class="playground-page__last-action">{lastAction}</p>
		{/if}
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
	.playground-page__last-action {
		margin-top: 1rem;
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 55%, transparent);
		font-style: italic;
	}
</style>
