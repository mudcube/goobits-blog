<script lang="ts">
	import { onMount } from 'svelte'
	import { Copy, Trash2, Check, Ticket } from '@lucide/svelte'
	import AdminPageHero from '../shared/AdminPageHero.svelte'
	import AdminMetaCards from '../shared/AdminMetaCards.svelte'
	import AdminLoadingText from '../shared/AdminLoadingText.svelte'
	import {
		getCalendarAdminInvites,
		createCalendarInvite,
		deleteCalendarInvite,
	} from '../../api/calendar'
	import { buildInviteLink, formatAdminDate, DEFAULT_INVITE_DRAFT } from '../shared/admin'
	import { adminActionHandlers } from '../shell/state'
	import type { CalendarAdminInvite } from '../../api/calendar'

	let invites = $state<CalendarAdminInvite[]>([])
	let loading = $state(true)
	let creating = $state(false)
	let showForm = $state(false)
	let uses = $state(DEFAULT_INVITE_DRAFT.uses)
	let expiresInDays = $state(DEFAULT_INVITE_DRAFT.expiresInDays)
	let email = $state('')
	let error = $state('')
	let copiedId = $state<string | number | null>(null)
	let confirmDeleteId = $state<string | number | null>(null)

	async function loadInvites() {
		loading = true
		try {
			const res = await getCalendarAdminInvites()
			invites = res.invites ?? []
		} catch { error = 'Failed to load invites' }
		loading = false
	}

	async function create() {
		creating = true
		error = ''
		try {
			await createCalendarInvite({ email: email.trim() || null, uses, expiresInDays })
			showForm = false
			email = ''
			uses = DEFAULT_INVITE_DRAFT.uses
			expiresInDays = DEFAULT_INVITE_DRAFT.expiresInDays
			await loadInvites()
		} catch { error = 'Failed to create invite' }
		creating = false
	}

	async function remove(idOrCode: string | number) {
		try {
			await deleteCalendarInvite(String(idOrCode))
			invites = invites.filter(i => (i.id ?? i.code) !== idOrCode)
			error = ''
		} catch { error = 'Failed to delete invite' }
		confirmDeleteId = null
	}

	function copyLink(code: string, id: string | number) {
		const link = buildInviteLink(window.location.origin, code)
		navigator.clipboard.writeText(link)
		copiedId = id
		setTimeout(() => { if (copiedId === id) copiedId = null }, 2000)
	}

	const metaItems = $derived(invites.map(invite => ({
		id: String(invite.id ?? invite.code),
		label: invite.code,
		detail: `${typeof invite.times_used === 'number' ? invite.times_used : 0} used · ${invite.uses_remaining ?? '∞'} remaining · expires ${formatAdminDate(invite.expires_at)}${invite.email ? ` · ${invite.email}` : ''}`,
		dotIcon: Ticket,
		dotColor: '#a78bfa',
		actions: [
			{
				variant: 'subtle' as const,
				icon: copiedId === (invite.id ?? invite.code) ? Check : Copy,
				ariaLabel: 'Copy invite link',
				onclick: () => copyLink(invite.code, invite.id ?? invite.code),
			},
			{
				variant: 'danger' as const,
				icon: Trash2,
				ariaLabel: 'Delete invite',
				onclick: () => { confirmDeleteId = invite.id ?? invite.code },
			},
		],
	})))

	$effect(() => { loadInvites() })

	onMount(() => {
		adminActionHandlers.update((handlers) => ({
			...handlers,
			onInvitesCreateInvite: () => { showForm = !showForm }
		}))
		return () => {
			adminActionHandlers.update((handlers) => {
				const next = { ...handlers }
				delete next.onInvitesCreateInvite
				return next
			})
		}
	})
</script>

<div class="admin-content">
	<AdminPageHero
		eyebrow="Sharing"
		title="Invites"
		subtitle="Share invite links so friends can join instantly."
	/>

	{#if error}
		<div class="ai__notice ai__notice--error">{error}</div>
	{/if}

	{#if confirmDeleteId !== null}
		<div class="ai__notice ai__notice--warn">
			<p>Delete this invite?</p>
			<div class="ai__notice-actions">
				<button type="button" class="admin-ui-btn" onclick={() => { confirmDeleteId = null }}>Cancel</button>
				<button type="button" class="admin-ui-btn admin-ui-btn--danger" onclick={() => remove(confirmDeleteId!)}>Delete</button>
			</div>
		</div>
	{/if}

	{#if showForm}
		<div class="ai__form-card calendar-ui-card">
			<h4>New invite</h4>
			<form class="ai__form" onsubmit={(e) => { e.preventDefault(); create() }}>
				<label class="ai__field">
					<span>Email (optional — leave blank for anyone)</span>
					<input type="email" class="ai__input" placeholder="friend@example.com" bind:value={email} />
				</label>
				<div class="ai__form-row">
					<label class="ai__field">
						<span>Uses</span>
						<input type="number" class="ai__input" min="1" max="100" bind:value={uses} />
					</label>
					<label class="ai__field">
						<span>Expires in (days)</span>
						<input type="number" class="ai__input" min="1" max="365" bind:value={expiresInDays} />
					</label>
				</div>
				<button type="submit" class="admin-ui-btn admin-ui-btn--primary" disabled={creating}>
					{creating ? 'Creating...' : 'Create invite'}
				</button>
			</form>
		</div>
	{/if}

	<h4>ACTIVE INVITES</h4>

	{#if loading}
		<AdminLoadingText text="Loading invites…" />
	{:else}
		<AdminMetaCards
			items={metaItems}
			emptyText="No active invites yet."
		/>
	{/if}
</div>

<style>
	.ai__notice { margin: 0 0 1rem; padding: 0.65rem 0.85rem; border-radius: 0.875rem; font-size: 0.82rem; }
	.ai__notice--error { background: color-mix(in srgb, #f87171 8%, transparent); border: 1px solid color-mix(in srgb, #f87171 18%, transparent); color: #f87171; }
	.ai__notice--warn { background: color-mix(in srgb, #f87171 4%, transparent); border: 1px solid color-mix(in srgb, #f87171 14%, transparent); }
	.ai__notice p { margin: 0 0 0.5rem; font-weight: 600; }
	.ai__notice-actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
	.ai__muted { color: color-mix(in srgb, var(--text) 42%, transparent); font-size: 0.82rem; }

	.ai__form-card { padding: 1rem; margin-bottom: 1rem; }
	.ai__form-card h4 { margin: 0 0 0.65rem; }
	.ai__form { display: grid; gap: 0.65rem; }
	.ai__form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
	.ai__field { display: grid; gap: 0.2rem; }
	.ai__field > span { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.ai__input { padding: 0.5rem 0.7rem; border: 1px solid var(--admin-border); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.82rem; }
	.ai__input:focus { outline: none; border-color: var(--admin-card-border); }
</style>
