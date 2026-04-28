<script lang="ts">
	import { untrack } from 'svelte'
	import { Bell, BellOff, MessageSquare, Mail } from '@lucide/svelte'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import DevHero from '../DevHero.svelte'
	import type { WaitlistEntry } from './+page.server'

	const { data } = $props<{ data: { entries: WaitlistEntry[] } }>()

	let entries = $state<WaitlistEntry[]>(untrack(() => [...data.entries]))

	function removeEntry(id: string) {
		entries = entries.filter((e) => e.id !== id)
	}

	function notifyEntry(id: string) {
		const e = entries.find((x) => x.id === id)
		if (e) alert(`Pretend-notified ${e.name} via ${e.notifyChannel}`)
	}

	const metaItems = $derived(
		entries.map((e) => ({
			id: e.id,
			label: e.name,
			detail: `${e.eventTitle} · requested ${e.requestedAt}`,
			icon: e.notifyChannel === 'sms' ? MessageSquare : Mail,
			actions: [
				{
					variant: 'subtle' as const,
					icon: Bell,
					ariaLabel: `Notify ${e.name}`,
					onclick: () => notifyEntry(e.id)
				},
				{
					variant: 'danger' as const,
					icon: BellOff,
					ariaLabel: `Remove ${e.name}`,
					onclick: () => removeEntry(e.id)
				}
			]
		}))
	)
</script>

<svelte:head>
	<title>Waitlist Prototype · Playground</title>
</svelte:head>

<div class="playground-page">
	<DevHero
		title="Waitlist"
		subtitle="Standby list for full events — notify or remove."
		breadcrumbItems={[{ label: 'Playground', href: '/playground/' }, { label: 'Waitlist' }]}
	/>

	<div class="playground-page__shell">
		<AdminPageHero
			eyebrow="Prototype"
			title="Waitlist"
			subtitle="People watching for an opening on full events."
		/>
		<AdminMetaCards items={metaItems} emptyText="Waitlist is empty." />
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
</style>
