<script lang="ts">
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminMembersController } from '@calendar/ui/admin/members/admin-members.svelte'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import { createInviteShareLink } from '@calendar/ui/admin/dashboard/admin-dashboard'
	import { Copy, Trash2, Mail } from '@lucide/svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import AdminCrewMemberCard from '@calendar/ui/admin/members/AdminCrewMemberCard.svelte'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import AdminCrewInviteModal from '@calendar/ui/admin/members/AdminCrewInviteModal.svelte'
	import { getActivityEmoji } from '@calendar/ui/shared'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import {
		mockCrewInvites,
		mockCrewUsers,
		mockDashboardEvents,
		mockDashboardRecentEvents
	} from '@calendar/ui/admin/mock/admin-mock-data'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const members = createAdminMembersController({ onUnauthorized: handleUnauthorizedSessionError })
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const mockMode = $derived(isAdminMockMode($page.url))
	type MemberUser = Record<string, unknown>
	type InviteRow = Record<string, unknown>
	let mockInvitesState = $state([...mockCrewInvites])
	const users = $derived((mockMode ? (mockCrewUsers as unknown as MemberUser[]) : (members.users as MemberUser[])))
	const invites = $derived((mockMode ? (mockInvitesState as unknown as InviteRow[]) : (members.invites as InviteRow[])))
	const eventsSource = $derived((mockMode ? mockDashboardEvents : dashboard.events))
	const recentEventsSource = $derived((mockMode ? mockDashboardRecentEvents : dashboard.recentEvents))

	let expandedUserId = $state<string | null>(null)
	let mockAccessRows = $state<Array<{ programSlug: string; allowed: boolean }>>([])
	const accessRows = $derived((mockMode ? mockAccessRows : members.accessRows))
	const accessLoading = $derived((mockMode ? false : members.accessLoading))
	let toastMessage = $state('')
	let toastVisible = $state(false)
	let undoAction = $state<null | (() => Promise<void>)>(null)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	let inviteModalOpen = $state(false)
	let inviteModalStep = $state<1 | 2>(1)
	let inviteNameDraft = $state('')
	let createdInviteId = $state('')
	let createdInviteCode = $state('')
	let inviteAnchorRect = $state<{ left: number; top: number; right: number; bottom: number; width: number; height: number } | null>(null)

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

	const inviteItems = $derived.by(() => {
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
			return {
				id,
				code,
				label: inviteName ? possessive : 'Pending invite',
				detail: `Sent ${daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`} · expires in ${expiresInDays} days`
			}
		})
	})

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

	async function toggleAccessWithSave(programSlug: string) {
		if (mockMode) {
			mockAccessRows = mockAccessRows.map((row) =>
				row.programSlug === programSlug ? { ...row, allowed: !row.allowed } : row
			)
			showToast('Mock mode: access updated (preview only)')
			return
		}
		const before = members.accessRows.map((row) => ({ ...row }))
		members.toggleAccess(programSlug)
		await members.saveAccess(false)
		if (members.error) {
			for (const row of before) {
				const current = members.accessRows.find((item) => item.programSlug === row.programSlug)
				if (current && current.allowed !== row.allowed) members.toggleAccess(row.programSlug)
			}
			showToast("Couldn't save — try again")
			return
		}
		showToast('Updated access', async () => {
			for (const row of before) {
				const current = members.accessRows.find((item) => item.programSlug === row.programSlug)
				if (current && current.allowed !== row.allowed) members.toggleAccess(row.programSlug)
			}
			await members.saveAccess(false)
		})
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
			const code = Math.random().toString(36).slice(2, 7)
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
		members.inviteEmail = `${inviteName}@invite.local`
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

	function textCreatedInvite() {
		const url = createdInviteUrl()
		if (!url) {
			showToast("Couldn't create invite link")
			return
		}
		showToast('Opening Messages…')
		const smsUrl = `sms:?&body=${encodeURIComponent(url)}`
		window.open(smsUrl, '_self')
	}

	async function copyInviteWithToast(code: string) {
		if (!code) {
			showToast("Couldn't copy link")
			return
		}
		try {
			await Promise.resolve(members.copyInvite(code))
			if (members.error) {
				showToast(members.error)
				return
			}
			showToast('Invite link copied')
		} catch {
			showToast("Couldn't copy link")
		}
	}

	async function deleteInviteWithToast(id: string) {
		if (mockMode) {
			mockInvitesState = mockInvitesState.filter((invite) => invite.id !== id)
			showToast('Invite deleted')
			return
		}
		await members.deleteInvite(id)
		if (members.error) {
			showToast(members.error)
			return
		}
		showToast('Invite deleted')
	}

	function onTopbarCreateInvite(event: Event) {
		const custom = event as CustomEvent<{ anchorRect?: { left: number; top: number; right: number; bottom: number; width: number; height: number } }>
		inviteAnchorRect = custom.detail?.anchorRect ?? null
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
			const found = (members.invites as InviteRow[]).find((invite) => String(invite['code'] || '') === createdInviteCode)
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
		window.addEventListener('admin-crew-create-invite', onTopbarCreateInvite)
		return () => window.removeEventListener('admin-crew-create-invite', onTopbarCreateInvite)
	})
</script>

{#if authed}
	<div class="social-crew admin-content">
		<AdminPageHero eyebrow="Members" title="The Crew" subtitle="Manage member access & invites." />

		<h4>ACTIVE MEMBERS ({users.length})</h4>
		<div class="social-crew__list">
			{#each sortedUsers as user (String(user['id'] || user['email'] || user['name']))}
				<AdminCrewMemberCard
					name={displayName(user)}
					detail={memberDetail(user)}
					badge={deriveBadge(user)}
					initials={initials(displayName(user))}
					isYou={isYou(user)}
					href={hrefWithMock(`/schedule/admin/crew/${String(user['id'] || '').trim()}/`)}
					onclick={() => {
						const id = String(user['id'] || '').trim()
						if (!id) return
						void goto(hrefWithMock(`/schedule/admin/crew/${id}/`))
					}}
				/>
			{/each}
		</div>

		<h4>PENDING INVITES ({inviteItems.length})</h4>
		<AdminMetaCards
			items={inviteItems.map((invite) => ({
				id: invite.id,
				label: invite.label,
				detail: invite.detail,
				icon: Mail,
				actions: [
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
						onclick: (): void => void deleteInviteWithToast(invite.id)
					}
				]
			}))}
			emptyText="No pending invites."
		/>

		{#if expandedUserId}
			<h4>MEMBER ACCESS</h4>
			<div class="social-crew__access calendar-ui-card">
				<div class="social-crew__access-label">Program access</div>
				<div class="social-crew__tags">
					{#if accessLoading}
						<span class="social-crew__meta">Loading access...</span>
					{:else}
						{#each accessRows as row}
							<button
								type="button"
								class="social-crew__tag admin-ui-chip"
								class:admin-ui-chip--active={row.allowed}
								onclick={() => void toggleAccessWithSave(row.programSlug)}
							>
								{getActivityEmoji(row.programSlug)} {row.programSlug}
							</button>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
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
		<div class="social-crew__toast admin-ui-toast" role="status">
			<span>{toastMessage}</span>
			{#if undoAction}
				<button type="button" class="admin-ui-btn" onclick={handleUndoClick}>Undo</button>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.social-crew {
		display: grid;
		gap: 1rem;
	}

	.social-crew__list {
		display: grid;
		gap: 0.5rem;
	}

	.social-crew__access {
		padding: 0.75rem;
		border-radius: 0.875rem;
		background: color-mix(in srgb, var(--bg) 92%, var(--text) 8%);
	}

	.social-crew__access-label {
		font-size: 0.75rem;
		font-weight: 620;
		color: color-mix(in srgb, var(--text) 64%, transparent);
		margin-bottom: 0.5rem;
	}

	.social-crew__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.social-crew__tag {
		min-width: 44px;
		padding: 0 0.625rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.social-crew__meta {
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-crew__toast {
		bottom: 5.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		z-index: 120;
	}
</style>
