// Invites sub-entry for @calendar/core.
//
// Invite generation/validation/redemption + user-program-access (which is
// closely tied to invites because a redeemed invite typically grants
// program access).

export {
	generateInviteCode,
	createInvite,
	validateInvite,
	consumeInvite,
	listInvites,
	deleteInvite,
	deleteInviteByCode,
	hasUserRedeemedAnyInvite
} from './services/invites/invites.ts'

export {
	listUserProgramAccess,
	setUserProgramAccess,
	replaceUserProgramAccess,
	hasUserProgramAccess,
	type CalendarUserProgramAccess
} from './access/user-program-access.ts'
