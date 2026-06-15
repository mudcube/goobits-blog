// Sync sub-entry for @calendar/core.
//
// Re-exports the sync queue + active-provider settings. Calendar provider
// implementations themselves live in @calendar/core/providers.

export {
	enqueueCalendarSyncJob,
	getCalendarSyncQueueHealth,
	retryCalendarSyncDeadLetters,
	purgeCalendarSyncDeadLetters,
	processCalendarSyncQueue
} from './services/sync/queue.ts'

export {
	getActiveCalendarSyncProvider,
	isCalendarSyncProvider,
	setActiveCalendarSyncProvider,
	type CalendarSyncProvider
} from './sync/settings.ts'
