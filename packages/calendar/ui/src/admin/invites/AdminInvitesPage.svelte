<script lang="ts">
	import { Copy, Plus, Trash2, Check } from '@lucide/svelte'
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
			await createCalendarInvite({
				email: email.trim() || null,
				uses,
				expiresInDays,
			})
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
		} catch { error = `Failed to delete invite ${id}` }
		confirmDeleteId = null
	}

	async function removeSelected() {
		confirmBulkDelete = false
		const ids = [...selected]
		for (const id of ids) {
			try {
				await deleteCalendarInvite(String(id))
				invites = invites.filter(i => i.id !== id)
			} catch { error = `Failed to delete some invites` }
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

<div class="ai">
	<div class="ai__header">
		<h2 class="ai__title">Invites</h2>
		<div class="ai__header-actions">
			{#if selected.size > 0}
				<button type="button" class="ai__bulk-btn" onclick={() => { confirmBulkDelete = true }}>
					<Trash2 size={13} strokeWidth={2} />
					<span>Delete {selected.size}</span>
				</button>
			{/if}
			<button type="button" class="ai__create-btn" onclick={() => { showForm = !showForm }}>
				<Plus size={14} strokeWidth={2.2} />
				<span>Create</span>
			</button>
		</div>
	</div>

	{#if error}
		<p class="ai__error">{error}</p>
	{/if}

	{#if confirmBulkDelete}
		<div class="ai__confirm">
			<p>Delete {selected.size} invite{selected.size > 1 ? 's' : ''}?</p>
			<div class="ai__confirm-actions">
				<button type="button" class="ai__confirm-cancel" onclick={() => { confirmBulkDelete = false }}>Cancel</button>
				<button type="button" class="ai__confirm-delete" onclick={removeSelected}>Delete</button>
			</div>
		</div>
	{/if}

	{#if confirmDeleteId !== null}
		<div class="ai__confirm">
			<p>Delete this invite?</p>
			<div class="ai__confirm-actions">
				<button type="button" class="ai__confirm-cancel" onclick={() => { confirmDeleteId = null }}>Cancel</button>
				<button type="button" class="ai__confirm-delete" onclick={() => remove(confirmDeleteId!)}>Delete</button>
			</div>
		</div>
	{/if}

	{#if showForm}
		<form class="ai__form" onsubmit={(e) => { e.preventDefault(); create() }}>
			<label class="ai__field">
				<span>Email (optional — leave blank for anyone)</span>
				<input type="email" class="ai__input" placeholder="friend@example.com" bind:value={email} />
			</label>
			<div class="ai__row">
				<label class="ai__field ai__field--half">
					<span>Uses</span>
					<input type="number" class="ai__input" min="1" max="100" bind:value={uses} />
				</label>
				<label class="ai__field ai__field--half">
					<span>Expires in (days)</span>
					<input type="number" class="ai__input" min="1" max="365" bind:value={expiresInDays} />
				</label>
			</div>
			<button type="submit" class="ai__submit" disabled={creating}>
				{creating ? 'Creating...' : 'Create invite'}
			</button>
		</form>
	{/if}

	{#if loading}
		<p class="ai__loading">Loading invites...</p>
	{:else if invites.length === 0}
		<p class="ai__empty">No invites yet. Create one to share with friends.</p>
	{:else}
		<div class="ai__list">
			<div class="ai__list-header">
				<label class="ai__checkbox-wrap">
					<input type="checkbox" checked={selected.size === invites.length} onchange={toggleAll} />
				</label>
				<span class="ai__list-count">{invites.length} invite{invites.length !== 1 ? 's' : ''}</span>
			</div>
			{#each invites as invite}
				<div class="ai__invite" class:ai__invite--selected={selected.has(invite.id)}>
					<label class="ai__checkbox-wrap">
						<input type="checkbox" checked={selected.has(invite.id)} onchange={() => toggleSelect(invite.id)} />
					</label>
					<div class="ai__invite-main">
						<code class="ai__code">{invite.code}</code>
						{#if invite.email}
							<span class="ai__email">{invite.email}</span>
						{/if}
						<span class="ai__meta">
							{invite.uses_remaining ?? '∞'} uses left · {typeof invite.times_used === 'number' ? invite.times_used : 0} used · expires {formatAdminDate(invite.expires_at)}
						</span>
					</div>
					<div class="ai__invite-actions">
						<button type="button" class="ai__icon-btn" onclick={() => copyLink(invite.code, invite.id)} title="Copy invite link">
							{#if copiedId === invite.id}
								<Check size={14} strokeWidth={2} />
							{:else}
								<Copy size={14} strokeWidth={2} />
							{/if}
						</button>
						<button type="button" class="ai__icon-btn ai__icon-btn--danger" onclick={() => { confirmDeleteId = invite.id }} title="Delete invite">
							<Trash2 size={14} strokeWidth={2} />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.ai__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
	.ai__title { margin: 0; font-family: var(--font-display, var(--font-serif)); font-size: 1.3rem; font-weight: 500; }
	.ai__header-actions { display: flex; gap: 0.4rem; }
	.ai__create-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.45rem 0.85rem; border: 1px solid color-mix(in srgb, var(--text) 15%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 150ms; }
	.ai__create-btn:hover { background: color-mix(in srgb, var(--text) 5%, transparent); }
	.ai__bulk-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.45rem 0.85rem; border: 1px solid color-mix(in srgb, #f87171 25%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, #f87171 8%, transparent); color: #f87171; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 150ms; }
	.ai__bulk-btn:hover { background: color-mix(in srgb, #f87171 15%, transparent); }

	.ai__error { margin: 0 0 1rem; padding: 0.5rem; border-radius: 0.5rem; background: color-mix(in srgb, #f87171 10%, transparent); border: 1px solid color-mix(in srgb, #f87171 25%, transparent); color: #f87171; font-size: 0.78rem; }
	.ai__loading, .ai__empty { color: color-mix(in srgb, var(--text) 50%, transparent); font-size: 0.78rem; }

	.ai__confirm { margin: 0 0 1rem; padding: 0.75rem 1rem; border-radius: 0.5rem; border: 1px solid color-mix(in srgb, #f87171 20%, transparent); background: color-mix(in srgb, #f87171 5%, transparent); }
	.ai__confirm p { margin: 0 0 0.5rem; font-size: 0.78rem; font-weight: 600; }
	.ai__confirm-actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
	.ai__confirm-cancel { padding: 0.35rem 0.75rem; border: 1px solid color-mix(in srgb, var(--text) 15%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.72rem; font-weight: 600; cursor: pointer; }
	.ai__confirm-delete { padding: 0.35rem 0.75rem; border: none; border-radius: 0.5rem; background: #f87171; color: #fff; font: inherit; font-size: 0.72rem; font-weight: 600; cursor: pointer; }

	.ai__form { display: grid; gap: 0.75rem; padding: 1rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; margin-bottom: 1.25rem; }
	.ai__field { display: grid; gap: 0.25rem; }
	.ai__field > span { font-size: 0.68rem; font-weight: 600; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.ai__field--half { flex: 1; }
	.ai__row { display: flex; gap: 0.75rem; }
	.ai__input { padding: 0.45rem 0.65rem; border: 1px solid color-mix(in srgb, var(--text) 15%, transparent); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; font-size: 0.78rem; }
	.ai__input:focus { outline: none; border-color: color-mix(in srgb, var(--text) 35%, transparent); }
	.ai__submit { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; background: var(--gradient-action, #7a5af8); color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
	.ai__submit:disabled { opacity: 0.5; }

	.ai__list { display: grid; gap: 0; }
	.ai__list-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; }
	.ai__list-count { font-size: 0.62rem; font-weight: 600; color: color-mix(in srgb, var(--text) 40%, transparent); text-transform: uppercase; letter-spacing: 0.04em; }
	.ai__checkbox-wrap { display: flex; align-items: center; flex-shrink: 0; }
	.ai__invite { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 0.75rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.5rem; margin-top: -1px; transition: background 150ms; }
	.ai__invite--selected { background: color-mix(in srgb, var(--text) 4%, transparent); }
	.ai__invite-main { display: grid; gap: 0.1rem; flex: 1; min-width: 0; }
	.ai__code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em; }
	.ai__email { font-size: 0.68rem; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.ai__meta { font-size: 0.58rem; color: color-mix(in srgb, var(--text) 40%, transparent); }
	.ai__invite-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
	.ai__icon-btn { padding: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; background: transparent; color: color-mix(in srgb, var(--text) 45%, transparent); cursor: pointer; display: flex; transition: all 150ms; font: inherit; }
	.ai__icon-btn:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 22%, transparent); }
	.ai__icon-btn--danger:hover { color: #f87171; border-color: color-mix(in srgb, #f87171 25%, transparent); }
</style>
