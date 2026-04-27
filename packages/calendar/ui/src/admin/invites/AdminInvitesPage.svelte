<script lang="ts">
	import { Copy, Plus, Trash2, Check, Ticket } from '@lucide/svelte'
	import AdminPageHero from '../shared/AdminPageHero.svelte'
	import {
		getCalendarAdminInvites,
		createCalendarInvite,
		deleteCalendarInvite,
	} from '../../api/calendar'
	import { buildInviteLink, formatAdminDate, DEFAULT_INVITE_DRAFT } from '../shared/admin'
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
	let selected = $state<Set<string | number>>(new Set())
	let confirmDeleteId = $state<string | number | null>(null)
	let confirmBulkDelete = $state(false)

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

	async function remove(id: string | number) {
		try {
			await deleteCalendarInvite(String(id))
			invites = invites.filter(i => i.id !== id)
			selected.delete(id)
			selected = new Set(selected)
		} catch { error = `Failed to delete invite` }
		confirmDeleteId = null
	}

	async function removeSelected() {
		confirmBulkDelete = false
		for (const id of [...selected]) {
			try {
				await deleteCalendarInvite(String(id))
				invites = invites.filter(i => i.id !== id)
			} catch { error = 'Failed to delete some invites' }
		}
		selected = new Set()
	}

	function toggleSelect(id: string | number) {
		if (selected.has(id)) selected.delete(id)
		else selected.add(id)
		selected = new Set(selected)
	}

	function toggleAll() {
		if (selected.size === invites.length) selected = new Set()
		else selected = new Set(invites.map(i => i.id))
	}

	function copyLink(code: string, id: string | number) {
		const link = buildInviteLink(window.location.origin, code)
		navigator.clipboard.writeText(link)
		copiedId = id
		setTimeout(() => { if (copiedId === id) copiedId = null }, 2000)
	}

	$effect(() => { loadInvites() })
</script>

<AdminPageHero
	eyebrow="Sharing"
	title="Invites"
	subtitle="Create invite codes to share with friends. They can join instantly without creating an account."
>
	{#snippet actions()}
		{#if selected.size > 0}
			<button type="button" class="ai__bulk-btn" onclick={() => { confirmBulkDelete = true }}>
				<Trash2 size={13} strokeWidth={2} />
				Delete {selected.size}
			</button>
		{/if}
		<button type="button" class="ai__create-btn" onclick={() => { showForm = !showForm }}>
			<Plus size={14} strokeWidth={2.2} />
			Create invite
		</button>
	{/snippet}
</AdminPageHero>

{#if error}
	<div class="ai__error">{error}</div>
{/if}

{#if confirmBulkDelete || confirmDeleteId !== null}
	<div class="ai__confirm">
		<p>{confirmBulkDelete ? `Delete ${selected.size} invite${selected.size > 1 ? 's' : ''}?` : 'Delete this invite?'}</p>
		<div class="ai__confirm-actions">
			<button type="button" class="ai__confirm-cancel" onclick={() => { confirmBulkDelete = false; confirmDeleteId = null }}>Cancel</button>
			<button type="button" class="ai__confirm-delete" onclick={() => confirmBulkDelete ? removeSelected() : remove(confirmDeleteId!)}>Delete</button>
		</div>
	</div>
{/if}

{#if showForm}
	<section class="ai__section">
		<h3 class="ai__section-title">New invite</h3>
		<form class="ai__form" onsubmit={(e) => { e.preventDefault(); create() }}>
			<label class="ai__field">
				<span class="ai__field-label">Email (optional — leave blank for anyone)</span>
				<input type="email" class="ai__input" placeholder="friend@example.com" bind:value={email} />
			</label>
			<div class="ai__form-row">
				<label class="ai__field">
					<span class="ai__field-label">Uses</span>
					<input type="number" class="ai__input" min="1" max="100" bind:value={uses} />
				</label>
				<label class="ai__field">
					<span class="ai__field-label">Expires in (days)</span>
					<input type="number" class="ai__input" min="1" max="365" bind:value={expiresInDays} />
				</label>
			</div>
			<button type="submit" class="ai__submit" disabled={creating}>
				{creating ? 'Creating...' : 'Create invite'}
			</button>
		</form>
	</section>
{/if}

<section class="ai__section">
	<h3 class="ai__section-title">Active invites</h3>

	{#if loading}
		<p class="ai__muted">Loading...</p>
	{:else if invites.length === 0}
		<p class="ai__muted">No invites yet. Create one to share with friends.</p>
	{:else}
		<div class="ai__table">
			<div class="ai__table-header">
				<input type="checkbox" checked={selected.size === invites.length} onchange={toggleAll} />
				<span class="ai__col ai__col--code">Code</span>
				<span class="ai__col ai__col--email">Email</span>
				<span class="ai__col ai__col--uses">Uses</span>
				<span class="ai__col ai__col--expires">Expires</span>
				<span class="ai__col ai__col--actions"></span>
			</div>
			{#each invites as invite}
				<div class="ai__table-row" class:ai__table-row--selected={selected.has(invite.id)}>
					<input type="checkbox" checked={selected.has(invite.id)} onchange={() => toggleSelect(invite.id)} />
					<span class="ai__col ai__col--code"><code>{invite.code}</code></span>
					<span class="ai__col ai__col--email">{invite.email ?? '—'}</span>
					<span class="ai__col ai__col--uses">{typeof invite.times_used === 'number' ? invite.times_used : 0} / {invite.uses_remaining != null ? (Number(invite.times_used ?? 0) + invite.uses_remaining) : '∞'}</span>
					<span class="ai__col ai__col--expires">{formatAdminDate(invite.expires_at)}</span>
					<span class="ai__col ai__col--actions">
						<button type="button" class="ai__icon-btn" onclick={() => copyLink(invite.code, invite.id)} title="Copy link">
							{#if copiedId === invite.id}<Check size={13} strokeWidth={2} />{:else}<Copy size={13} strokeWidth={2} />{/if}
						</button>
						<button type="button" class="ai__icon-btn ai__icon-btn--danger" onclick={() => { confirmDeleteId = invite.id }} title="Delete">
							<Trash2 size={13} strokeWidth={2} />
						</button>
					</span>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	/* Buttons */
	.ai__create-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; background: var(--gradient-action, #7a5af8); color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
	.ai__bulk-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.5rem 0.85rem; border: 1px solid color-mix(in srgb, #f87171 25%, transparent); border-radius: 0.5rem; background: transparent; color: #f87171; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }

	/* Error + Confirm */
	.ai__error { margin: 0 0 1rem; padding: 0.6rem 0.85rem; border-radius: 0.5rem; background: color-mix(in srgb, #f87171 8%, transparent); border: 1px solid color-mix(in srgb, #f87171 20%, transparent); color: #f87171; font-size: 0.78rem; }
	.ai__confirm { margin: 0 0 1rem; padding: 0.75rem 1rem; border-radius: 0.5rem; border: 1px solid color-mix(in srgb, #f87171 18%, transparent); background: color-mix(in srgb, #f87171 4%, transparent); }
	.ai__confirm p { margin: 0 0 0.5rem; font-size: 0.82rem; font-weight: 600; }
	.ai__confirm-actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
	.ai__confirm-cancel { padding: 0.4rem 0.85rem; border: 1px solid color-mix(in srgb, var(--text) 15%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.72rem; font-weight: 600; cursor: pointer; }
	.ai__confirm-delete { padding: 0.4rem 0.85rem; border: none; border-radius: 0.5rem; background: #f87171; color: #fff; font: inherit; font-size: 0.72rem; font-weight: 600; cursor: pointer; }

	/* Sections */
	.ai__section { margin-bottom: 1.5rem; }
	.ai__section-title { margin: 0 0 0.65rem; font-family: var(--font-display, var(--font-serif)); font-size: 1.15rem; font-weight: 500; letter-spacing: -0.02em; }
	.ai__muted { color: color-mix(in srgb, var(--text) 45%, transparent); font-size: 0.82rem; }

	/* Create form */
	.ai__form { display: grid; gap: 0.75rem; padding: 1rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, var(--text) 2%, transparent); }
	.ai__form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
	.ai__field { display: grid; gap: 0.25rem; }
	.ai__field-label { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.ai__input { padding: 0.5rem 0.7rem; border: 1px solid color-mix(in srgb, var(--text) 14%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.82rem; }
	.ai__input:focus { outline: none; border-color: color-mix(in srgb, var(--text) 30%, transparent); }
	.ai__submit { padding: 0.55rem 1rem; border: none; border-radius: 0.5rem; background: var(--gradient-action, #7a5af8); color: #fff; font: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
	.ai__submit:disabled { opacity: 0.5; }

	/* Table */
	.ai__table { border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; overflow: hidden; }
	.ai__table-header, .ai__table-row { display: grid; grid-template-columns: 2rem 1fr 1fr 5rem 6rem 4.5rem; gap: 0.5rem; align-items: center; padding: 0.5rem 0.75rem; }
	.ai__table-header { background: color-mix(in srgb, var(--text) 4%, transparent); font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: color-mix(in srgb, var(--text) 45%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent); }
	.ai__table-row { font-size: 0.78rem; border-top: 1px solid color-mix(in srgb, var(--text) 6%, transparent); transition: background 150ms; }
	.ai__table-row:first-child { border-top: none; }
	.ai__table-row--selected { background: color-mix(in srgb, var(--text) 3%, transparent); }
	.ai__col--code code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.03em; }
	.ai__col--email { color: color-mix(in srgb, var(--text) 55%, transparent); font-size: 0.72rem; overflow: hidden; text-overflow: ellipsis; }
	.ai__col--uses { font-size: 0.72rem; color: color-mix(in srgb, var(--text) 60%, transparent); font-variant-numeric: tabular-nums; }
	.ai__col--expires { font-size: 0.72rem; color: color-mix(in srgb, var(--text) 50%, transparent); }
	.ai__col--actions { display: flex; gap: 0.2rem; justify-content: flex-end; }
	.ai__icon-btn { padding: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; background: transparent; color: color-mix(in srgb, var(--text) 40%, transparent); cursor: pointer; display: flex; transition: all 150ms; font: inherit; }
	.ai__icon-btn:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 20%, transparent); }
	.ai__icon-btn--danger:hover { color: #f87171; border-color: color-mix(in srgb, #f87171 25%, transparent); }

	@media (max-width: 720px) {
		.ai__table-header, .ai__table-row { grid-template-columns: 2rem 1fr 4rem 4rem; }
		.ai__col--email, .ai__col--expires { display: none; }
	}
</style>
