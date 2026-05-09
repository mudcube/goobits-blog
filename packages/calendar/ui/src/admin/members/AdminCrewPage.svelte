<script lang="ts">
	import { goto } from '$app/navigation'
	import { onMount, untrack } from 'svelte'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminMembersController } from '@calendar/ui/admin/members/admin-members.svelte'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import { createInviteShareLink } from '@calendar/ui/admin/dashboard/admin-dashboard'
	import AdminLoadingText from '@calendar/ui/admin/shared/AdminLoadingText.svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import AdminToast from '@calendar/ui/admin/shared/AdminToast.svelte'
	import AdminCrewMemberCard from '@calendar/ui/admin/members/AdminCrewMemberCard.svelte'
	import AdminCrewInviteModal from '@calendar/ui/admin/members/AdminCrewInviteModal.svelte'
	import CrewInvitesSection from '@calendar/ui/admin/members/CrewInvitesSection.svelte'
	import { getActivityEmoji } from '@calendar/ui/shared'
	import { getAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import { withAdminRoute } from '@calendar/ui/config'
	import type { CalendarAdminUser } from '@calendar/ui/api/calendar'
	import { adminActionHandlers, type AdminInviteAnchorRect } from '../shell/state'
	import {
		normalizeName,
		fallbackNameFromEmail,
		safeInviteNameFromEmail,
		initials,
		categoryBadgeText,
		type InviteStatus
	} from './crew-helpers'

	type CrewBootstrap = {
		programs?: unknown[]
		upcoming?: unknown[]
		recent?: unknown[]
		paymentDefaults?: unknown
		paymentIntegrations?: unknown
		invites?: unknown[]
		users?: unknown[]
	}
	const { data } = $props<{ data: { user: unknown | null; bootstrap?: CrewBootstrap | null } }>()
	const members = createAdminMembersController({ onUnauthorized: handleUnauthorizedSessionError })
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	untrack(() => {
		if (data.bootstrap) {
			dashboard.bootstrap(data.bootstrap)
			members.bootstrap(data.bootstrap)
		}
	})
	const authed = $derived(!!data.user)
	const mockMode = $derived(isAdminMockMode($page.url))
	const adminMockCatalog = getAdminMockCatalog()
	type MemberUser = CalendarAdminUser & { role?: string; isSelf?: boolean }
	type InviteRow = {
		id: string | number
		code: string
		email: string | null
		label?: string | null
		target_activity_slug?: string | null
		redirect_path?: string | null
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
	let inviteActivitySlug = $state('gym')
	let inviteType = $state<'person' | 'group'>('person')
	let inviteMaxUses = $state(10)
	let createdInviteId = $state('')
	let createdInviteCode = $state('')
	let inviteAnchorRect = $state<AdminInviteAnchorRect | null>(null)

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
		if (data.bootstrap) return
		members.load()
		dashboard.loadEvents()
		dashboard.loadPrograms()
	})

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
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
			const inviteName =
				normalizeName(invite['label']) || (email ? safeInviteNameFromEmail(email) : '') || email
			const targetSlug = normalizeName(invite['target_activity_slug'])
			const targetProgram = dashboard.programs.find((program) => program.slug === targetSlug)
			const targetLabel = targetProgram?.activityName || targetProgram?.label || targetSlug
			const timesUsed = Number(invite['times_used'] || 0)
			const usesRemaining = typeof invite['uses_remaining'] === 'number' ? invite['uses_remaining'] : null
			const totalUses = usesRemaining === null ? null : usesRemaining + timesUsed
			const createdAtRaw = Number(invite['created_at'] || invite['createdAt'] || 0)
			const createdAt = createdAtRaw > 10_000_000_000 ? createdAtRaw : createdAtRaw * 1000
			const daysAgo = createdAt ? Math.max(0, Math.floor((Date.now() - createdAt) / (24 * 60 * 60 * 1000))) : 0
			const expiresInDays = Number(invite['expires_in_days'] || members.inviteExpires || 7)
			const status = inviteStatus(invite)
			const sentLabel = `Sent ${daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`}`
			const detailParts: string[] = []
			if (targetLabel) detailParts.push(`${targetLabel} only`)
			if (totalUses && totalUses > 1) {
				detailParts.push(`${timesUsed} used · ${Math.max(0, usesRemaining ?? 0)} left`)
			}
			if (status === 'expired') {
				detailParts.push(`Expired · ${sentLabel.toLowerCase()}`)
			} else if (status === 'exhausted') {
				detailParts.push(`Used up · ${sentLabel.toLowerCase()}`)
			} else {
				detailParts.push(`${sentLabel} · expires in ${expiresInDays} day${expiresInDays === 1 ? '' : 's'}`)
			}
			return {
				id,
				code,
				label: inviteName || 'Unnamed invite',
				detail: detailParts.join(' · '),
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
		inviteActivitySlug = dashboard.programs.find((program) => program.slug === 'gym' && program.enabled !== false)?.slug
			|| dashboard.programs.find((program) => program.enabled !== false)?.slug
			|| 'gym'
		inviteType = 'person'
		inviteMaxUses = 10
		createdInviteId = ''
		createdInviteCode = ''
		inviteModalOpen = true
		inviteModalStep = 1
	}

	async function createInviteFromModal() {
		const inviteName = inviteNameDraft.trim() || 'friend'
		const uses = inviteType === 'group'
			? Math.min(100, Math.max(2, Math.trunc(inviteMaxUses || 10)))
			: 1
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
					email: null,
					label: inviteName,
					target_activity_slug: inviteActivitySlug,
					redirect_path: `/schedule/${inviteActivitySlug}/`,
					created_at: Math.floor(Date.now() / 1000),
					uses_remaining: uses,
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
		members.inviteLabel = inviteNameDraft.trim()
		members.inviteActivitySlug = inviteActivitySlug
		members.inviteUses = uses
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

		<h4>MEMBERS{#if mockMode || members.loaded} ({users.length}){/if}</h4>
		{#if !mockMode && !members.loaded}
			<AdminLoadingText text="Loading crew…" />
		{:else}
			<div class="social-crew__list calendar-ui-card">
				{#each sortedUsers as user (String(user['id'] || user['email'] || user['name']))}
					<AdminCrewMemberCard
						name={displayName(user)}
						detail={memberDetail(user)}
						badge={deriveBadge(user)}
						initials={initials(displayName(user))}
						avatarUrl={normalizeName(user['avatar_url']) || null}
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
		{/if}

		<CrewInvitesSection
			bind:filter={inviteFilter}
			counts={inviteCounts}
			visibleItems={visibleInviteItems}
			loaded={members.loaded}
			{mockMode}
			bind:confirmBulkOpen={confirmBulkDelete}
			bind:pendingDeleteId={pendingDeleteInviteId}
			pendingDeleteLabel={pendingInviteLabel(pendingDeleteInviteId)}
			onDeleteAllExpired={() => void deleteAllExpired()}
			onConfirmDelete={() => void confirmDeleteInvite()}
			onCopy={(code) => void copyInviteWithToast(code)}
		/>

	</div>

	<AdminCrewInviteModal
		open={inviteModalOpen}
		step={inviteModalStep}
		inviteName={inviteNameDraft}
		inviteUrl={createdInviteUrl()}
		activitySlug={inviteActivitySlug}
		activities={dashboard.programs}
		inviteType={inviteType}
		maxUses={inviteMaxUses}
		anchorRect={inviteAnchorRect}
		onClose={() => (inviteModalOpen = false)}
		onNameChange={(value: string) => (inviteNameDraft = value)}
		onActivityChange={(value: string) => (inviteActivitySlug = value)}
		onInviteTypeChange={(value: 'person' | 'group') => {
			inviteType = value
			inviteMaxUses = value === 'group' ? Math.max(2, inviteMaxUses || 10) : 1
		}}
		onMaxUsesChange={(value: number) => {
			inviteMaxUses = Math.min(100, Math.max(2, Math.trunc(value || 10)))
		}}
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

</style>
