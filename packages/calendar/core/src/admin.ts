// Admin sub-entry for @calendar/core.
//
// Re-exports admin-only domain logic: permissions, bootstrap data, preferences,
// view settings, program management, event-detail lookup, payment defaults.
// Prefer this sub-entry over the flat root barrel when importing from admin
// route handlers — it makes the dependency intent explicit.

export {
	canBootstrapCalendarAdmin,
	getCalendarAdminCount,
	getCalendarUserByEmail,
	grantCalendarAdmin,
	grantCalendarAdminByEmail,
	isCalendarAdmin
} from './admin/permissions.ts'

export {
	isAdminBootstrap,
	type AdminBootstrap,
	type AdminBootstrapUser,
	type AdminBootstrapInvite,
	type AdminBootstrapPaymentIntegrations
} from './admin/bootstrap-types.ts'

export {
	getAdminPreference,
	getAdminPreferences,
	setAdminPreference
} from './services/admin/preferences.ts'

export {
	getAdminViewSettings,
	setAdminViewSettings,
	getDefaultAdminViewSettings,
	type AdminViewSettings,
	type WeekStart
} from './services/admin/view-settings.ts'

export {
	getCalendarPrograms,
	getEnabledCalendarPrograms,
	isCalendarProgramEnabled,
	setCalendarProgramEnabled,
	getCalendarProgramBySlug,
	getEnabledCalendarProgramByActivityName,
	upsertCalendarProgram,
	deleteCalendarProgram,
	reorderCalendarPrograms,
	type CalendarProgramState,
	type CalendarProgramInput
} from './services/admin/programs.ts'

export { getAdminEventDetail, type AdminEventDetail } from './services/admin/event-detail.ts'

export {
	getAdminPaymentDefaults,
	setAdminPaymentDefaults,
	type AdminPaymentDefaults
} from './services/payments/admin-payment-defaults.ts'
