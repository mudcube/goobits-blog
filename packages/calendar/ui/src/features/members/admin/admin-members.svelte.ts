import { DEFAULT_INVITE_DRAFT } from '../../admin/admin'
import {
	createInviteShareLink,
	createMemberInvite,
	cleanupDevE2EData,
	deleteMemberInvite,
	loadMembersData
} from '../../sync-queue/admin/admin-dashboard'

export function createAdminMembersController(
	options: { onUnauthorized?: (error: unknown) => boolean } = {}
) {
	const { onUnauthorized } = options

	let invites = $state<unknown[]>([])
	let users = $state<unknown[]>([])
	let loading = $state(false)
	let error = $state('')
	let inviteEmail = $state('')
	let inviteUses = $state(DEFAULT_INVITE_DRAFT.uses)
	let inviteExpires = $state(DEFAULT_INVITE_DRAFT.expiresInDays)
	let creating = $state(false)
	let cleaning = $state(false)
	let notice = $state('')

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

	async function deleteInvite(id: string) {
		if (!confirm('Delete this invite?')) return
		try {
			const inviteDeletion = await deleteMemberInvite(id)
			if (inviteDeletion.ok) {
				await load()
			} else {
				error = inviteDeletion.error
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to delete invite'
		}
	}

	function copyInvite(code: string) {
		const url = createInviteShareLink(window.location.origin, code)
		navigator.clipboard.writeText(url)
	}

	async function cleanupE2E() {
		if (!confirm('Delete E2E test users and events?')) return
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
		load,
		createInvite,
		deleteInvite,
		copyInvite,
		cleanupE2E
	}
}
