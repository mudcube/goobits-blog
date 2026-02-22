<script lang="ts">
	import { onMount } from 'svelte'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminMembersController } from '@calendar/ui/features/members/admin/admin-members.svelte'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import AdminPageHero from '@components/Admin/AdminPageHero.svelte'
	import { getAdminActivityEmoji } from '$lib/admin/activity-display'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const members = createAdminMembersController({ onUnauthorized: handleUnauthorizedSessionError })
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	type MemberUser = Record<string, unknown>
	type InviteRow = Record<string, unknown>
	const users = $derived((members.users as MemberUser[]))
	const invites = $derived((members.invites as InviteRow[]))
	let expandedUserId = $state<string | null>(null)
	let toastMessage = $state('')
	let toastVisible = $state(false)
	let undoAction = $state<null | (() => Promise<void>)>(null)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	$effect(() => {
		if (!authed) return
		members.load()
		dashboard.loadEvents()
		dashboard.loadPrograms()
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
		const userEvents = dashboard.recentEvents
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
		for (const event of dashboard.recentEvents) {
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
		if (topActivity) {
			return `${emojiForActivity(topActivity)} ${categoryBadgeText(topActivity)}`
		}

		const created = Number(user['created_at'] || user['createdAt'] || 0)
		if (created > 0) {
			const createdMs = created > 10_000_000_000 ? created : created * 1000
			const daysSince = (Date.now() - createdMs) / (24 * 60 * 60 * 1000)
			if (daysSince <= 14) return '🆕 New Member'
		}
		return ''
	}

	function emojiForActivity(label: string) {
		return getAdminActivityEmoji(label)
	}

	async function toggleEdit(userId: string) {
		if (expandedUserId === userId) {
			expandedUserId = null
			return
		}
		expandedUserId = userId
		await members.openAccess(userId)
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

	async function toggleAccessWithSave(programSlug: string) {
		const before = members.accessRows.map((row) => ({ ...row }))
		members.toggleAccess(programSlug)
		await members.saveAccess(false)
		if (members.error) {
			// Revert on failure
			for (const row of before) {
				const current = members.accessRows.find((item) => item.programSlug === row.programSlug)
				if (current && current.allowed !== row.allowed) {
					members.toggleAccess(row.programSlug)
				}
			}
			showToast("Couldn't save — try again")
			return
		}
		showToast(`Updated access`, async () => {
			for (const row of before) {
				const current = members.accessRows.find((item) => item.programSlug === row.programSlug)
				if (current && current.allowed !== row.allowed) {
					members.toggleAccess(row.programSlug)
				}
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

	function onTopbarCreateInvite() {
		void members.createInvite()
	}

	onMount(() => {
		window.addEventListener('admin-crew-create-invite', onTopbarCreateInvite)
		return () => {
			window.removeEventListener('admin-crew-create-invite', onTopbarCreateInvite)
		}
	})
</script>

{#if authed}
	<div class="social-crew admin-content">
		<AdminPageHero
			eyebrow="Members"
			title="The Crew"
			subtitle="Manage member access and invites."
		/>

		<h4>ACTIVE MEMBERS ({users.length})</h4>
		<div class="social-crew__list admin-ui-card">
			{#each users as user, i}
				<div class="social-crew__row">
					<div class="social-crew__row-head">
						<div>
							<span class="social-crew__name">{String(user['name'] || user['email'] || user['id'])}</span>
							{#if deriveBadge(user)}
								<span class="social-crew__badge">{deriveBadge(user)}</span>
							{/if}
						</div>
						<button type="button" class="social-crew__edit admin-ui-btn" onclick={() => toggleEdit(String(user['id']))}>Edit</button>
					</div>

					{#if expandedUserId === String(user['id'])}
						<div class="social-crew__access">
							<div class="social-crew__access-label">Program Access</div>
							<div class="social-crew__tags">
								{#if members.accessLoading}
									<span class="social-crew__meta">Loading access...</span>
								{:else}
									{#each members.accessRows as row}
										<button
											type="button"
											class="social-crew__tag admin-ui-chip"
											class:admin-ui-chip--active={row.allowed}
											class:social-crew__tag--on={row.allowed}
											onclick={() => toggleAccessWithSave(row.programSlug)}
										>
											{emojiForActivity(row.programSlug)} {row.programSlug}
										</button>
									{/each}
								{/if}
							</div>
						</div>
					{/if}
				</div>
				{#if i < members.users.length - 1}<div class="social-crew__divider"></div>{/if}
			{/each}
		</div>

		<h4>PENDING INVITES ({invites.length})</h4>
		<div class="social-crew__pending admin-ui-card">
			{#if invites.length === 0}
				<p class="social-crew__meta">No pending invites.</p>
			{:else}
				{#each invites as invite, i}
					<div class="social-crew__pending-row">
						<div>
							<span class="social-crew__name">{String(invite['email'] || invite['code'])}</span>
							<span class="social-crew__meta">({String(invite['code'] || '')})</span>
						</div>
						<button type="button" class="social-crew__edit admin-ui-btn" onclick={() => members.copyInvite(String(invite['code'] || ''))}>Resend</button>
					</div>
					{#if i < invites.length - 1}<div class="social-crew__divider"></div>{/if}
				{/each}
			{/if}
		</div>
	</div>

	{#if toastVisible}
		<div class="social-crew__toast" role="status">
			<span>{toastMessage}</span>
			{#if undoAction}
				<button type="button" class="admin-ui-btn" onclick={handleUndoClick}>
					Undo
				</button>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.social-crew {
		display: grid;
		gap: 1rem;
	}

	.social-crew__edit,
	.social-crew__toast button {
		font-weight: 600;
	}

	.social-crew__list,
	.social-crew__pending {
		padding: 0.25rem 0.875rem;
	}

	.social-crew__row {
		min-height: 56px;
		padding: 0.75rem 0;
	}

	.social-crew__row-head,
	.social-crew__pending-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.social-crew__name {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text);
	}

	.social-crew__badge,
	.social-crew__meta {
		margin-left: 0.5rem;
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-crew__access {
		margin-top: 0.75rem;
		padding: 0.75rem;
		border-radius: 10px;
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
	}

	.social-crew__access-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 70%, transparent);
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

	.social-crew__tag--on {
		font-weight: 700;
	}

	.social-crew__divider {
		height: 1px;
		background: color-mix(in srgb, var(--text) 10%, transparent);
	}

	.social-crew__toast {
		position: fixed;
		left: 50%;
		bottom: 5.5rem;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.875rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 24%, transparent);
		background: color-mix(in srgb, var(--bg) 88%, var(--text) 12%);
		color: var(--text);
		z-index: 120;
	}
</style>
