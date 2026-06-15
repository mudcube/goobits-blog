// Utils sub-entry for @calendar/core.
//
// Tiny cross-domain helpers that don't fit under any single domain
// sub-entry. Kept focused — if a helper grows domain-specific
// (booking, sync, etc.), it should move to that sub-entry instead.

export { isoDay } from './utils/time.ts'
export { toErrorResponse } from './utils/errors.ts'
