import { writable } from 'svelte/store'

export const adminEventDetailBreadcrumb = writable<string | null>(null)

export type AdminInviteAnchorRect = {
	left: number
	top: number
	right: number
	bottom: number
	width: number
	height: number
}

export type AdminActionHandlers = {
	onProgramEditorToggleSettings?: () => void
	onCrewCreateInvite?: (detail?: { anchorRect?: AdminInviteAnchorRect }) => void
	onEventDetailEdit?: () => void
	onEventDetailCancel?: () => void
}

export const adminActionHandlers = writable<AdminActionHandlers>({})
