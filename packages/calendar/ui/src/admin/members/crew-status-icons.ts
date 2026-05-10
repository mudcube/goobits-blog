/**
 * Lucide icon lookup for invite-status display. Lives in its own module
 * so the pure helpers in `./crew-helpers.ts` stay icon-free and testable
 * without a Svelte/lucide loader.
 */
import { CircleDashed, Hourglass, Ticket, type Icon as LucideIcon } from '@lucide/svelte'
import type { InviteStatus } from './crew-helpers'

export function statusIcon(status: InviteStatus): typeof LucideIcon {
	if (status === 'expired') return Hourglass
	if (status === 'exhausted') return CircleDashed
	return Ticket
}
