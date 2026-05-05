import { DEFAULT_INVITE_DRAFT } from '../shared/admin'
import {
	createInviteShareLink,
	createMemberInvite,
	cleanupDevE2EData,
	deleteMemberInvite,
	loadMembersData
} from '../dashboard/admin-dashboard'
import { getCalendarAdminUserAccess, saveCalendarAdminUserAccess } from '../../api/calendar'
import type { CalendarAdminInvite, CalendarAdminUser } from '../../api/calendar'

export function createAdminMembersController(
	options: { onUnauthorized?: (error: unknown) => boolean } = {}
) {
	const { onUnauthorized } = options

	let invites = $state<CalendarAdminInvite[]>([])
	let users = $state<CalendarAdminUser[]>([])
	let loading = $state(false)
	let error = $state('')
	let inviteEmail = $state('')
	let inviteUses = $state(DEFAULT_INVITE_DRAFT.uses)
	let inviteExpires = $state(DEFAULT_INVITE_DRAFT.expiresInDays)
	let creating = $state(false)
	let cleaning = $state(false)
	let notice = $state('')
	let selectedUserId = $state<string | null>(null)
	let accessRows = $state<Array<{ programSlug: string; allowed: boolean }>>([])
	let accessLoading = $state(false)
	let accessSaving = $state(false)

	async function load() {
		loading = true
		error = ''
		notice = ''
		try {
			const membersData = await loadMembersData()
			invites = membersData.invites
			users = membersData.users
			error = membersData.error
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to load members data'
		} finally {
			loading = false
		}
	}

	async function createInvite() {
		creating = true
		error = ''
		try {
			const inviteResult = await createMemberInvite({
				email: inviteEmail || null,
				uses: inviteUses,
				expiresInDays: inviteExpires
			})
			if (inviteResult.ok) {
				inviteEmail = ''
				inviteUses = DEFAULT_INVITE_DRAFT.uses
				inviteExpires = DEFAULT_INVITE_DRAFT.expiresInDays
				await load()
			} else {
				error = inviteResult.error
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to create invite'
		} finally {
			creating = false
		}
	}

	async function deleteInvite(id: string, options: { reload?: boolean } = {}) {
		try {
			const inviteDeletion = await deleteMemberInvite(id)
			if (!inviteDeletion.ok) {
				error = inviteDeletion.error
				return false
			}
			if (options.reload !== false) await load()
			return true
		} catch (err) {
			if (onUnauthorized?.(err)) return false
			error = err instanceof Error ? err.message : 'Failed to delete invite'
			return false
		}
	}

	async function copyInvite(code: string): Promise<boolean> {
		const url = createInviteShareLink(window.location.origin, code)
		try {
			await navigator.clipboard.writeText(url)
			return true
		} catch {
			return false
		}
	}

	async function cleanupE2E() {
		cleaning = true
		error = ''
		notice = ''
		try {
			const result = await cleanupDevE2EData()
			if (result.ok) {
				const removedEvents = result.events.before - result.events.after
				const removedUsers = result.users.before - result.users.after
				notice = `Removed ${removedEvents} E2E event${removedEvents === 1 ? '' : 's'} and ${removedUsers} user${removedUsers === 1 ? '' : 's'}.`
				await load()
			} else {
				error = 'Cleanup failed'
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Cleanup failed'
		} finally {
			cleaning = false
		}
	}

	async function openAccess(userId: string) {
		selectedUserId = userId
		accessLoading = true
		error = ''
		try {
			const result = await getCalendarAdminUserAccess(userId)
			accessRows = result.access.map((row) => ({ ...row }))
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to load access rules'
		} finally {
			accessLoading = false
		}
	}

	function closeAccess() {
		selectedUserId = null
		accessRows = []
	}

	function toggleAccess(programSlug: string) {
		accessRows = accessRows.map((row) =>
			row.programSlug === programSlug ? { ...row, allowed: !row.allowed } : row
		)
	}

	async function saveAccess(closeAfterSave = true) {
		if (!selectedUserId) return
		accessSaving = true
		error = ''
		try {
			await saveCalendarAdminUserAccess(selectedUserId, accessRows)
			notice = 'Updated member access.'
			if (closeAfterSave) closeAccess()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to save access rules'
		} finally {
			accessSaving = false
		}
	}

	return {
		get invites() { return invites },
		get users() { return users },
		get loading() { return loading },
		get error() { return error },
		get notice() { return notice },
		get inviteEmail() { return inviteEmail },
		set inviteEmail(value) { inviteEmail = value },
		get inviteUses() { return inviteUses },
		set inviteUses(value) { inviteUses = value },
		get inviteExpires() { return inviteExpires },
		set inviteExpires(value) { inviteExpires = value },
		get creating() { return creating },
		get cleaning() { return cleaning },
		get selectedUserId() { return selectedUserId },
		get accessRows() { return accessRows },
		get accessLoading() { return accessLoading },
		get accessSaving() { return accessSaving },
		load,
		createInvite,
		deleteInvite,
		copyInvite,
		cleanupE2E,
		openAccess,
		closeAccess,
		toggleAccess,
		saveAccess
	}
}
