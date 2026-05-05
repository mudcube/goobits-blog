<script lang="ts">
	import { untrack } from 'svelte'
	import { page } from '$app/stores'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminMembersController } from '@calendar/ui/admin/members/admin-members.svelte'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import { ChevronRowCard, getActivityEmoji } from '@calendar/ui/shared'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import { getAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
	import { withAdminRoute } from '@calendar/ui/config'
	import type { CalendarAdminUser } from '@calendar/ui/api/calendar'

	const { data } = $props<{ data: { user: unknown | null; userId: string; bootstrap?: unknown } }>()

	const members = createAdminMembersController({ onUnauthorized: handleUnauthorizedSessionError })
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	untrack(() => {
		if (data.bootstrap) {
			dashboard.bootstrap(data.bootstrap as never)
			members.bootstrap(data.bootstrap as never)
		}
	})
	const authed = $derived(!!data.user)
	const userId = $derived(data.userId)
	const mockMode = $derived(isAdminMockMode($page.url))
	const adminMockCatalog = getAdminMockCatalog()
	type CrewMember = CalendarAdminUser & { role?: string; isSelf?: boolean; created_at?: number }
	const users = $derived.by(() => (mockMode ? (adminMockCatalog.crewUsers as CrewMember[]) : (members.users as CrewMember[])))
	const upcomingEvents = $derived((mockMode ? adminMockCatalog.dashboardEvents : dashboard.events))
	const recentEvents = $derived((mockMode ? adminMockCatalog.dashboardRecentEvents : dashboard.recentEvents))

	let mockAccessRows = $state<Array<{ programSlug: string; allowed: boolean }>>([])
	let accessSaveError = $state('')
	const accessRows = $derived(mockMode ? mockAccessRows : members.accessRows)
	const accessLoading = $derived(!mockMode && members.accessLoading)

	async function toggleAccessWithSave(programSlug: string) {
		accessSaveError = ''
		if (mockMode) {
			mockAccessRows = mockAccessRows.map((row) =>
				row.programSlug === programSlug ? { ...row, allowed: !row.allowed } : row
			)
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
			accessSaveError = "Couldn't save. Try again."
		}
	}

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	function normalizeName(value: unknown) {
		return String(value || '').trim()
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

	function displayName(user: CrewMember) {
		const byName = normalizeName(user['name'])
		if (byName) return byName
		const byEmail = normalizeName(user['email'])
		if (byEmail) return fallbackNameFromEmail(byEmail)
		return String(user['id'] || 'Member')
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

	function formatWhen(iso: string) {
		return new Date(iso).toLocaleString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		})
	}

	const member = $derived.by(() => (users.find((u) => String(u['id'] || '') === userId) || null) as CrewMember | null)
	const memberName = $derived(member ? displayName(member) : 'Member')
	const memberEmail = $derived(member ? normalizeName(member.email) : '')
	const memberRole = $derived(member ? normalizeName(member.role) : '')
	const joinedDate = $derived.by(() => {
		const createdAt = Number(member?.created_at || 0)
		if (!createdAt) return '-'
		const ms = createdAt > 10_000_000_000 ? createdAt : createdAt * 1000
		return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
	})
	const memberUpcoming = $derived.by(() =>
		upcomingEvents
			.filter((event) => event.participants.some((participant) => participant.userId === userId))
			.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
	)
	const memberRecent = $derived.by(() =>
		recentEvents
			.filter((event) => event.participants.some((participant) => participant.userId === userId))
			.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
	)

	$effect(() => {
		if (!authed) return
		if (mockMode) {
			mockAccessRows = adminMockCatalog.programs.map((program) => ({
				programSlug: program.slug,
				allowed: true
			}))
			return
		}
		if (!data.bootstrap) {
			void members.load()
			void dashboard.loadEvents()
		}
		void members.openAccess(userId)
	})
</script>

{#if authed}
	<div class="admin-crew-member-page admin-content">
		{#if member}
			<AdminPageHero
				eyebrow="Crew Member"
				title={memberName}
				subtitle={memberEmail || 'Member details'}
			/>

			<section class="admin-crew-member-page__section">
				<h4>PROFILE</h4>
				<div class="admin-crew-member-page__meta-grid">
					<div class="admin-crew-member-page__meta-card">
						<div class="admin-crew-member-page__meta-label">Initials</div>
						<div class="admin-crew-member-page__meta-value">{initials(memberName)}</div>
					</div>
					<div class="admin-crew-member-page__meta-card">
						<div class="admin-crew-member-page__meta-label">Role</div>
						<div class="admin-crew-member-page__meta-value">{memberRole || 'Member'}</div>
					</div>
					<div class="admin-crew-member-page__meta-card">
						<div class="admin-crew-member-page__meta-label">Joined</div>
						<div class="admin-crew-member-page__meta-value">{joinedDate}</div>
					</div>
				</div>
			</section>

			<section class="admin-crew-member-page__section">
				<h4>ACCESS</h4>
				<div class="admin-crew-member-page__access calendar-ui-card">
					{#if accessLoading}
						<span class="admin-crew-member-page__access-meta">Loading access…</span>
					{:else if accessRows.length === 0}
						<span class="admin-crew-member-page__access-meta">No programs configured.</span>
					{:else}
						<div class="admin-crew-member-page__access-chips">
							{#each accessRows as row (row.programSlug)}
								<button
									type="button"
									class="admin-ui-chip"
									class:admin-ui-chip--active={row.allowed}
									onclick={() => void toggleAccessWithSave(row.programSlug)}
								>
									{getActivityEmoji('', row.programSlug)} {row.programSlug}
								</button>
							{/each}
						</div>
					{/if}
					{#if accessSaveError}
						<p class="admin-crew-member-page__access-error">{accessSaveError}</p>
					{/if}
				</div>
			</section>

			<section class="admin-crew-member-page__section">
				<h4>UPCOMING{#if mockMode || dashboard.eventsLoaded} ({memberUpcoming.length}){/if}</h4>
				<div class="admin-crew-member-page__list">
					{#if !mockMode && !dashboard.eventsLoaded}
						<div class="admin-crew-member-page__empty calendar-ui-card">Loading…</div>
					{:else if memberUpcoming.length === 0}
						<div class="admin-crew-member-page__empty calendar-ui-card">No upcoming sessions.</div>
					{:else}
						{#each memberUpcoming as event (event.id)}
							<ChevronRowCard href={hrefWithMock(withAdminRoute(`events/detail/${event.id}/`))}>
								<div class="admin-crew-member-page__event-title">{event.title}</div>
								<div class="admin-crew-member-page__event-detail">{formatWhen(event.startsAt)}</div>
							</ChevronRowCard>
						{/each}
					{/if}
				</div>
			</section>

			<section class="admin-crew-member-page__section">
				<h4>RECENT{#if mockMode || dashboard.eventsLoaded} ({memberRecent.length}){/if}</h4>
				<div class="admin-crew-member-page__list">
					{#if !mockMode && !dashboard.eventsLoaded}
						<div class="admin-crew-member-page__empty calendar-ui-card">Loading…</div>
					{:else if memberRecent.length === 0}
						<div class="admin-crew-member-page__empty calendar-ui-card">No recent sessions.</div>
					{:else}
						{#each memberRecent as event (event.id)}
							<ChevronRowCard href={hrefWithMock(withAdminRoute(`events/detail/${event.id}/`))}>
								<div class="admin-crew-member-page__event-title">{event.title}</div>
								<div class="admin-crew-member-page__event-detail">{formatWhen(event.startsAt)}</div>
							</ChevronRowCard>
						{/each}
					{/if}
				</div>
			</section>
		{:else}
			<div class="admin-crew-member-page__empty calendar-ui-card">Member not found.</div>
		{/if}
	</div>
{/if}

<style>
	.admin-crew-member-page {
		display: grid;
		gap: 1rem;
	}

	.admin-crew-member-page__section {
		display: grid;
		gap: 0.5rem;
	}

	.admin-crew-member-page__meta-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.admin-crew-member-page__meta-card {
		padding: 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		background: var(--bg);
	}

	.admin-crew-member-page__meta-label {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	.admin-crew-member-page__meta-value {
		margin-top: 0.2rem;
		font-size: 0.82rem;
		font-weight: 620;
		color: var(--text);
	}

	.admin-crew-member-page__list {
		display: grid;
		gap: 0.5rem;
	}

	.admin-crew-member-page__access {
		padding: 0.75rem 0.85rem;
		display: grid;
		gap: 0.55rem;
	}

	.admin-crew-member-page__access-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.admin-crew-member-page__access-meta {
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	.admin-crew-member-page__access-error {
		margin: 0;
		font-size: 0.74rem;
		color: var(--admin-danger-soft);
	}

	.admin-crew-member-page__event-title {
		font-size: 0.875rem;
		font-weight: 620;
		color: var(--text);
	}

	.admin-crew-member-page__event-detail {
		margin-top: 0.12rem;
		font-size: 0.72rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	.admin-crew-member-page__empty {
		padding: 0.8rem 0.95rem;
		font-size: 0.8rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	@media (max-width: 720px) {
		.admin-crew-member-page__meta-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
