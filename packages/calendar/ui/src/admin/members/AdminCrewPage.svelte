<script lang="ts">
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminMembersController } from '@calendar/ui/admin/members/admin-members.svelte'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import { createInviteShareLink } from '@calendar/ui/admin/dashboard/admin-dashboard'
	import { Copy, Trash2, Ticket, Hourglass, CircleDashed } from '@lucide/svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import AdminToast from '@calendar/ui/admin/shared/AdminToast.svelte'
	import AdminCrewMemberCard from '@calendar/ui/admin/members/AdminCrewMemberCard.svelte'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import AdminCrewInviteModal from '@calendar/ui/admin/members/AdminCrewInviteModal.svelte'
	import AdminInlineConfirm from '@calendar/ui/admin/shared/AdminInlineConfirm.svelte'
	import { getActivityEmoji } from '@calendar/ui/shared'
	import { getAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import { withAdminRoute } from '@calendar/ui/config'
	import type { CalendarAdminUser } from '@calendar/ui/api/calendar'
	import { adminActionHandlers, type AdminInviteAnchorRect } from '../shell/state'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const members = createAdminMembersController({ onUnauthorized: handleUnauthorizedSessionError })
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const mockMode = $derived(isAdminMockMode($page.url))
	const adminMockCatalog = getAdminMockCatalog()
	type MemberUser = CalendarAdminUser & { role?: string; isSelf?: boolean }
	type InviteRow = {
		id: string | number
		code: string
		email: string | null
		created_at: number
		uses_remaining?: number | null
		expires_at?: number | null
		createdAt?: number
		expires_in_days?: number
		times_used?: string | number
	}
	let mockInvitesState = $state<InviteRow[]>([...adminMockCatalog.crewInvites])
	const users = $derived.by(() => (mockMode ? (adminMockCatalog.crewUsers as MemberUser[]) : (members.users as MemberUser[])))
	const invites = $derived.by(() => (mockMode ? mockInvitesState : (members.invites as InviteRow[])))
	const eventsSource = $derived((mockMode ? adminMockCatalog.dashboardEvents : dashboard.events))
	const recentEventsSource = $derived((mockMode ? adminMockCatalog.dashboardRecentEvents : dashboard.recentEvents))

	let toastMessage = $state('')
	let toastVisible = $state(false)
	let undoAction = $state<null | (() => Promise<void>)>(null)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	let inviteModalOpen = $state(false)
	let inviteModalStep = $state<1 | 2>(1)
	let inviteNameDraft = $state('')
	let createdInviteId = $state('')
	let createdInviteCode = $state('')
	let inviteAnchorRect = $state<AdminInviteAnchorRect | null>(null)

	type InviteStatus = 'pending' | 'expired' | 'exhausted'
	type InviteFilter = 'all' | InviteStatus
	let inviteFilter = $state<InviteFilter>('all')
	let confirmBulkDelete = $state(false)
	let pendingDeleteInviteId = $state<string | number | null>(null)

	function inviteStatus(invite: InviteRow): InviteStatus {
		const expiresAt = invite.expires_at
		if (typeof expiresAt === 'number' && expiresAt * 1000 < Date.now()) return 'expired'
		if (invite.uses_remaining === 0) return 'exhausted'
		return 'pending'
	}

	$effect(() => {
		if (!authed) return
		if (mockMode) return
		members.load()
		dashboard.loadEvents()
		dashboard.loadPrograms()
	})

	function normalizeName(value: unknown) {
		return String(value || '').trim()
	}

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	function fallbackNameFromEmail(email: string) {
		const local = email.split('@')[0] || email
		const clean = local.replace(/[._-]+/g, ' ').trim()
		if (!clean) return 'Member'
		return clean
			.split(/\s+/)
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ')
	}

	function isTokenLikeName(value: string) {
		const compact = value.replace(/\s+/g, '').toLowerCase()
		if (!compact) return true
		if (compact.length >= 10 && /^[a-f0-9]+$/.test(compact)) return true
		if (compact.length >= 10 && /^[a-z0-9]+$/.test(compact) && /\d/.test(compact)) return true
		return false
	}

	function safeInviteNameFromEmail(email: string) {
		const name = fallbackNameFromEmail(email)
		return isTokenLikeName(name) ? '' : name
	}

	function initials(name: string) {
		const parts = name.split(/\s+/).filter(Boolean)
		const a = parts[0]?.[0] ?? ''
		let b = parts[1]?.[0] ?? ''
		if (!b) {
			const first = (parts[0] || name || '').trim()
			b = first.length > 1 ? (first[1] || 'X') : 'X'
		}
		return `${a}${b}`.toUpperCase()
	}

	function isYou(user: MemberUser) {
		return !!user['isSelf'] || String(user['role'] || '').toLowerCase() === 'owner'
	}

	function displayName(user: MemberUser) {
		const byName = normalizeName(user['name'])
		if (byName) return byName
		const byEmail = normalizeName(user['email'])
		if (byEmail) return fallbackNameFromEmail(byEmail)
		return String(user['id'] || 'Member')
	}

	const sortedUsers = $derived.by(() => {
		return [...users].sort((a, b) => {
			const aYou = isYou(a) ? 1 : 0
			const bYou = isYou(b) ? 1 : 0
			if (aYou !== bYou) return bYou - aYou
			return displayName(a).localeCompare(displayName(b))
		})
	})

	function categoryBadgeText(label: string) {
		const key = label.toLowerCase()
		if (key.includes('gym')) return 'Gym Regular'
		if (key.includes('movie')) return 'Movie Buff'
		if (key.includes('adventure') || key.includes('hike')) return 'Explorer'
		if (key.includes('circus')) return 'Acrobat'
		if (key.includes('social')) return 'Social Butterfly'
		return `${label} Regular`
	}

	function calculateStreak(userId: string) {
		const userEvents = recentEventsSource
			.filter((event) => event.participants.some((participant) => participant.userId === userId))
			.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
		if (userEvents.length === 0) return 0

		const weeks = new Set<number>()
		for (const event of userEvents) {
			const date = new Date(event.startsAt)
			const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
			const dayMs = 24 * 60 * 60 * 1000
			const week = Math.floor((date.getTime() - start.getTime()) / (7 * dayMs))
			const year = date.getUTCFullYear()
			weeks.add(year * 100 + week)
		}
		const sorted = [...weeks].sort((a, b) => b - a)
		if (sorted.length < 2) return 0
		let streak = 1
		for (let i = 1; i < sorted.length; i += 1) {
			const current = sorted[i]
			const previous = sorted[i - 1]
			if (current === undefined || previous === undefined) break
			if (current === previous - 1) streak += 1
			else break
		}
		return streak
	}

	function deriveBadge(user: MemberUser) {
		const userId = String(user['id'] || '')
		const streak = calculateStreak(userId)
		if (streak >= 2) return `🔥 ${streak} wk streak`

		const now = Date.now()
		const days30 = 30 * 24 * 60 * 60 * 1000
		const activityCount = new Map<string, number>()
		for (const event of recentEventsSource) {
			const startsAt = new Date(event.startsAt).getTime()
			if (now - startsAt > days30) continue
			if (!event.participants.some((participant) => participant.userId === userId)) continue
			const key = event.activityLabel || 'Activity'
			activityCount.set(key, (activityCount.get(key) || 0) + 1)
		}
		let topActivity = ''
		let topCount = 0
		for (const [label, count] of activityCount.entries()) {
			if (count > topCount) {
				topCount = count
				topActivity = label
			}
		}
		if (topActivity) return `${getActivityEmoji(topActivity)} ${categoryBadgeText(topActivity)}`
		return ''
	}

	function memberDetail(user: MemberUser) {
		const userId = String(user['id'] || '')
		const upcoming = eventsSource
			.filter((event) => event.participants.some((participant) => participant.userId === userId))
			.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]
		if (upcoming) {
			const start = new Date(upcoming.startsAt)
			const now = new Date()
			const sameDay = start.toDateString() === now.toDateString()
			if (sameDay) {
				const label = start.getHours() >= 17 ? 'tonight' : 'today'
				return `Signed up for ${upcoming.title} · ${label}`
			}
			return `Signed up for ${upcoming.title} · ${start.toLocaleDateString(undefined, { weekday: 'short' })}`
		}
		const recent = recentEventsSource
			.filter((event) => event.participants.some((participant) => participant.userId === userId))
			.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())[0]
		if (recent) {
			const start = new Date(recent.startsAt)
			const sameDay = start.toDateString() === new Date().toDateString()
			return `Last went to ${recent.title} · ${sameDay ? 'today' : start.toLocaleDateString(undefined, { weekday: 'short' })}`
		}
		return "Hasn't been in a while"
	}

	type InviteAugmented = {
		id: string
		code: string
		label: string
		detail: string
		status: InviteStatus
	}

	const inviteItems = $derived.by<InviteAugmented[]>(() => {
		return invites.map((invite) => {
			const id = String(invite['id'] || invite['code'] || crypto.randomUUID())
			const code = String(invite['code'] || '')
			const email = normalizeName(invite['email'])
			const inviteName = email ? safeInviteNameFromEmail(email) : ''
			const createdAtRaw = Number(invite['created_at'] || invite['createdAt'] || 0)
			const createdAt = createdAtRaw > 10_000_000_000 ? createdAtRaw : createdAtRaw * 1000
			const daysAgo = createdAt ? Math.max(0, Math.floor((Date.now() - createdAt) / (24 * 60 * 60 * 1000))) : 0
			const expiresInDays = Number(invite['expires_in_days'] || members.inviteExpires || 7)
			const possessive = inviteName.endsWith('s') ? `${inviteName}' invite` : `${inviteName}'s invite`
			const status = inviteStatus(invite)
			const sentLabel = `Sent ${daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`}`
			let detail: string
			if (status === 'expired') {
				detail = `Expired · ${sentLabel.toLowerCase()}`
			} else if (status === 'exhausted') {
				detail = `Used up · ${sentLabel.toLowerCase()}`
			} else {
				detail = `${sentLabel} · expires in ${expiresInDays} day${expiresInDays === 1 ? '' : 's'}`
			}
			return {
				id,
				code,
				label: inviteName ? possessive : code || 'Pending invite',
				detail,
				status
			}
		})
	})

	const inviteCounts = $derived.by(() => {
		const c = { all: inviteItems.length, pending: 0, expired: 0, exhausted: 0 }
		for (const it of inviteItems) c[it.status]++
		return c
	})

	const visibleInviteItems = $derived.by(() => {
		const filtered = inviteFilter === 'all'
			? inviteItems
			: inviteItems.filter((it) => it.status === inviteFilter)
		// Sort: pending first, then expired, then exhausted
		const order: Record<InviteStatus, number> = { pending: 0, expired: 1, exhausted: 2 }
		return [...filtered].sort((a, b) => order[a.status] - order[b.status])
	})

	function statusIcon(status: InviteStatus) {
		if (status === 'expired') return Hourglass
		if (status === 'exhausted') return CircleDashed
		return Ticket
	}

	function statusDotColor(status: InviteStatus) {
		if (status === 'expired') return '#9ca3af'
		if (status === 'exhausted') return '#d97706'
		return '#a78bfa'
	}

	async function deleteAllExpired() {
		const expired = inviteItems.filter((it) => it.status === 'expired')
		if (expired.length === 0) return
		if (mockMode) {
			const ids = new Set(expired.map((it) => it.id))
			mockInvitesState = mockInvitesState.filter((inv) => !ids.has(String(inv.id ?? inv.code ?? '')))
			confirmBulkDelete = false
			showToast(`Deleted ${expired.length} expired invite${expired.length === 1 ? '' : 's'}`)
			return
		}
		const results = await Promise.all(
			expired.map((it) => members.deleteInvite(it.id, { reload: false }))
		)
		await members.load()
		confirmBulkDelete = false
		const failed = results.filter((ok) => !ok).length
		if (failed) {
			showToast(`Deleted ${expired.length - failed}; ${failed} failed`)
			return
		}
		showToast(`Deleted ${expired.length} expired invite${expired.length === 1 ? '' : 's'}`)
	}

	function showToast(message: string, undo: null | (() => Promise<void>) = null) {
		toastMessage = message
		undoAction = undo
		toastVisible = true
		if (toastTimer) clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toastVisible = false
			undoAction = null
		}, 5000)
	}

	function handleUndoClick() {
		if (!undoAction) return
		void undoAction().finally(() => {
			toastVisible = false
		})
	}

	async function openInviteModal() {
		inviteNameDraft = ''
		createdInviteId = ''
		createdInviteCode = ''
		inviteModalOpen = true
		inviteModalStep = 1
	}

	async function createInviteFromModal() {
		const inviteName = inviteNameDraft.trim() || 'friend'
		if (mockMode) {
			const words = ['sunny','cozy','happy','brave','merry','lucky','golden','gentle','sparkly','cheery']
			const animals = ['fox','owl','bear','swan','bunny','otter','panda','robin','kitten','dolphin']
			const w = words[Math.floor(Math.random() * words.length)]
			const a = animals[Math.floor(Math.random() * animals.length)]
			const n = Math.floor(Math.random() * 9000) + 1000
			const code = `${w}-${a}-${n}`
			const id = `inv-${Date.now()}`
			mockInvitesState = [
				{
					id,
					code,
					email: `${inviteName}@example.com`,
					created_at: Math.floor(Date.now() / 1000),
					expires_in_days: 7
				},
				...mockInvitesState
			]
			createdInviteId = id
			createdInviteCode = code
			inviteModalStep = 2
			return
		}
		const beforeIds = new Set(invites.map((invite) => String(invite['id'] || invite['code'] || '')))
		members.inviteEmail = ''
		await members.createInvite()
		if (members.error) {
			showToast(members.error)
			return
		}
		const created = (members.invites as InviteRow[]).find((invite) => {
			const key = String(invite['id'] || invite['code'] || '')
			return key && !beforeIds.has(key)
		})
		if (!created) {
			inviteModalOpen = false
			showToast('Invite created')
			return
		}
		createdInviteId = String(created['id'] || '')
		createdInviteCode = String(created['code'] || '')
		inviteModalStep = 2
	}

	function createdInviteUrl() {
		if (!createdInviteCode) return ''
		return createInviteShareLink(window.location.origin, createdInviteCode)
	}

	async function textCreatedInvite() {
		const url = createdInviteUrl()
		if (!url) {
			showToast("Couldn't create invite link")
			return
		}
		if (navigator.share) {
			try {
				await navigator.share({
					text: `Join me here: ${url}`,
					url
				})
				return
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') return
			}
		}
		showToast('Opening Messages…')
		window.location.href = `sms:?body=${encodeURIComponent(url)}`
	}

	async function copyInviteWithToast(code: string) {
		if (!code) {
			showToast("Couldn't copy link")
			return
		}
		try {
			const ok = await members.copyInvite(code)
			if (!ok) {
				showToast("Couldn't copy link. Check clipboard permissions.")
				return
			}
			if (members.error) {
				showToast(members.error)
				return
			}
			showToast('Invite link copied')
		} catch {
			showToast("Couldn't copy link")
		}
	}

	function requestDeleteInvite(id: string | number) {
		pendingDeleteInviteId = id
	}

	async function confirmDeleteInvite() {
		const id = pendingDeleteInviteId
		pendingDeleteInviteId = null
		if (id == null) return
		if (mockMode) {
			mockInvitesState = mockInvitesState.filter((invite) => invite.id !== id)
			showToast('Invite deleted')
			return
		}
		await members.deleteInvite(String(id))
		if (members.error) {
			showToast(members.error)
			return
		}
		showToast('Invite deleted')
	}

	function pendingInviteLabel(id: string | number | null) {
		if (id == null) return ''
		const invite = inviteItems.find((it) => it.id === id)
		return invite?.label ? ` for ${invite.label}` : ''
	}

	function onTopbarCreateInvite(event: { detail?: { anchorRect?: AdminInviteAnchorRect } }) {
		inviteAnchorRect = event.detail?.anchorRect ?? null
		void openInviteModal()
	}

	async function cancelCreatedInvite() {
		if (!createdInviteCode) {
			inviteModalOpen = false
			return
		}
		if (mockMode) {
			if (createdInviteId) {
				mockInvitesState = mockInvitesState.filter((invite) => invite.id !== createdInviteId)
			}
			inviteModalOpen = false
			showToast('Invite canceled')
			return
		}

		let inviteId = createdInviteId
		if (!inviteId) {
			const found = members.invites.find((invite) => String(invite.code || '') === createdInviteCode)
			inviteId = found ? String(found['id'] || '') : ''
		}
		if (inviteId) {
			await members.deleteInvite(inviteId)
			if (members.error) {
				showToast(members.error)
				return
			}
		}
		inviteModalOpen = false
		showToast('Invite canceled')
	}

	onMount(() => {
		adminActionHandlers.update((handlers) => ({
			...handlers,
			onCrewCreateInvite: (detail) => onTopbarCreateInvite(detail ? { detail } : {})
		}))

		return () => {
			adminActionHandlers.update((handlers) => {
				const next = { ...handlers }
				delete next.onCrewCreateInvite
				return next
			})
		}
	})
</script>

{#if authed}
	<div class="social-crew admin-content">
		<AdminPageHero eyebrow="Members" title="The Crew" subtitle="Everyone with access, and everyone who could have it." />

		<h4>MEMBERS ({users.length})</h4>
		<div class="social-crew__list calendar-ui-card">
			{#each sortedUsers as user (String(user['id'] || user['email'] || user['name']))}
				<AdminCrewMemberCard
					name={displayName(user)}
					detail={memberDetail(user)}
					badge={deriveBadge(user)}
					initials={initials(displayName(user))}
					isYou={isYou(user)}
					href={hrefWithMock(withAdminRoute(`crew/${String(user['id'] || '').trim()}/`))}
					onclick={() => {
						const id = String(user['id'] || '').trim()
						if (!id) return
						void goto(hrefWithMock(withAdminRoute(`crew/${id}/`)))
					}}
				/>
			{/each}
		</div>

		<h4>INVITE LINKS ({inviteCounts.all})</h4>

		{#if inviteCounts.all > 0}
			<div class="social-crew__filters">
				<button type="button" class="social-crew__chip" class:social-crew__chip--active={inviteFilter === 'all'} onclick={() => { inviteFilter = 'all' }}>All ({inviteCounts.all})</button>
				<button type="button" class="social-crew__chip" class:social-crew__chip--active={inviteFilter === 'pending'} onclick={() => { inviteFilter = 'pending' }}>Pending ({inviteCounts.pending})</button>
				<button type="button" class="social-crew__chip" class:social-crew__chip--active={inviteFilter === 'expired'} onclick={() => { inviteFilter = 'expired' }}>Expired ({inviteCounts.expired})</button>
				<button type="button" class="social-crew__chip" class:social-crew__chip--active={inviteFilter === 'exhausted'} onclick={() => { inviteFilter = 'exhausted' }}>Exhausted ({inviteCounts.exhausted})</button>
				{#if inviteCounts.expired > 0}
					<button type="button" class="social-crew__bulk" onclick={() => { confirmBulkDelete = true }}>Delete {inviteCounts.expired} expired</button>
				{/if}
			</div>
		{/if}

		{#if confirmBulkDelete}
			<div class="social-crew__notice">
				<AdminInlineConfirm
					question={`Delete all ${inviteCounts.expired} expired invite${inviteCounts.expired === 1 ? '' : 's'}?`}
					confirmLabel="Yes, delete all"
					onCancel={() => (confirmBulkDelete = false)}
					onConfirm={() => void deleteAllExpired()}
				/>
			</div>
		{/if}

		{#if pendingDeleteInviteId !== null}
			<div class="social-crew__notice">
				<AdminInlineConfirm
					question={`Delete invite${pendingInviteLabel(pendingDeleteInviteId)}?`}
					confirmLabel="Yes, delete"
					onCancel={() => (pendingDeleteInviteId = null)}
					onConfirm={() => void confirmDeleteInvite()}
				/>
			</div>
		{/if}

		<AdminMetaCards
			items={visibleInviteItems.map((invite) => ({
				id: invite.id,
				label: invite.label,
				detail: invite.detail,
				dotIcon: statusIcon(invite.status),
				dotColor: statusDotColor(invite.status),
				dimmed: invite.status === 'expired' || invite.status === 'exhausted',
				actions: invite.status === 'pending' ? [
					{
						variant: 'subtle' as const,
						icon: Copy,
						ariaLabel: 'Copy invite link',
						onclick: (): void => void copyInviteWithToast(invite.code)
					},
					{
						variant: 'danger' as const,
						icon: Trash2,
						ariaLabel: 'Delete invite',
						onclick: (): void => requestDeleteInvite(invite.id)
					}
				] : [
					{
						variant: 'danger' as const,
						icon: Trash2,
						ariaLabel: 'Delete invite',
						onclick: (): void => requestDeleteInvite(invite.id)
					}
				]
			}))}
			emptyText={inviteFilter === 'all' ? 'No invites yet.' : `No ${inviteFilter} invites.`}
		/>

	</div>

	<AdminCrewInviteModal
		open={inviteModalOpen}
		step={inviteModalStep}
		inviteName={inviteNameDraft}
		inviteUrl={createdInviteUrl()}
		anchorRect={inviteAnchorRect}
		onClose={() => (inviteModalOpen = false)}
		onNameChange={(value: string) => (inviteNameDraft = value)}
		onCreate={() => void createInviteFromModal()}
		onCopy={() => void copyInviteWithToast(createdInviteCode)}
		onText={textCreatedInvite}
		onCancelInvite={() => void cancelCreatedInvite()}
	/>

	{#if toastVisible}
		{#if undoAction}
			<AdminToast
				message={toastMessage}
				variant="undo"
				actionLabel="Undo"
				onAction={handleUndoClick}
			/>
		{:else}
			<AdminToast message={toastMessage} variant="status" />
		{/if}
	{/if}
{/if}

<style>
	/* Layout handled by parent .admin-content grid */

	.social-crew__list {
		display: grid;
		gap: 0;
		overflow: hidden;
	}

	.social-crew__list :global(.calendar-ui-card) {
		border: none;
		border-radius: 0;
		box-shadow: none;
		background: transparent;
	}

	.social-crew__list :global(.calendar-ui-card + .calendar-ui-card) {
		border-top: 1px solid color-mix(in srgb, var(--admin-card-border) 60%, transparent);
	}

	.social-crew__filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0 0 0.85rem;
		align-items: center;
	}

	.social-crew__chip {
		appearance: none;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: transparent;
		color: color-mix(in srgb, var(--text) 65%, transparent);
		font-size: 0.74rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 140ms, color 140ms, border-color 140ms;
	}

	.social-crew__chip:hover {
		background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
		color: var(--text);
	}

	.social-crew__chip--active {
		background: color-mix(in srgb, var(--admin-accent) 14%, transparent);
		border-color: color-mix(in srgb, var(--admin-accent) 36%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
	}

	.social-crew__bulk {
		appearance: none;
		margin-left: auto;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--admin-danger-strong) 32%, transparent);
		background: color-mix(in srgb, var(--admin-danger-strong) 8%, transparent);
		color: color-mix(in srgb, var(--admin-danger-strong) 90%, var(--text) 10%);
		font-size: 0.72rem;
		font-weight: 600;
		cursor: pointer;
	}

	.social-crew__bulk:hover {
		background: color-mix(in srgb, var(--admin-danger-strong) 14%, transparent);
	}

	.social-crew__notice {
		margin: 0 0 1rem;
		padding: 0.65rem 0.85rem;
		border-radius: 0.875rem;
		background: color-mix(in srgb, var(--admin-danger-soft) 4%, transparent);
		border: 1px solid color-mix(in srgb, var(--admin-danger-soft) 14%, transparent);
		font-size: 0.82rem;
	}

</style>
