<script lang="ts">
	import { goto } from '$app/navigation'
	import {
		ArrowLeft,
		CalendarDays,
		CalendarPlus,
		Eye,
		Pencil,
		Settings,
		Trash2,
		UserPlus
	} from '@lucide/svelte'
	import { getCalendarUiConfig } from '../../../config'
	import AdminActionButton from '../../shared/AdminActionButton.svelte'
	import type { AdminRouteActionId } from '../route'
	import { adminActionHandlers } from '../state'

	const { actions, hrefWithMock, programSlug } = $props<{
		actions: AdminRouteActionId[]
		hrefWithMock: (path: string) => string
		programSlug: string | undefined
	}>()
	const calendarConfig = getCalendarUiConfig()
	const calendarBase = calendarConfig.routes.calendarBase
	const adminBase = calendarConfig.routes.adminBase

	function anchorRectFromEvent(event?: MouseEvent) {
		const target = event?.currentTarget as HTMLElement | null
		const rect = target?.getBoundingClientRect()
		if (!rect) return undefined
		return {
			left: rect.left,
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
			width: rect.width,
			height: rect.height
		}
	}

	function crewInvitePayload(event?: MouseEvent) {
		const anchorRect = anchorRectFromEvent(event)
		return anchorRect ? { anchorRect } : {}
	}
</script>

<div
	class="social-admin__breadcrumbs-actions"
	class:social-admin__breadcrumbs-actions--empty={actions.length === 0}
>
	{#if actions.includes('view-program') && programSlug}
		<AdminActionButton variant="subtle" icon={Eye} href={hrefWithMock(`${calendarBase}/${programSlug}/`)}>View Program</AdminActionButton>
	{/if}

	{#if actions.includes('program-settings')}
		<AdminActionButton
			variant="subtle"
			icon={Settings}
			onclick={() => $adminActionHandlers.onProgramEditorToggleSettings?.()}
		>
			Program Settings
		</AdminActionButton>
	{/if}

	{#if actions.includes('new-program')}
		<AdminActionButton variant="primary" icon={CalendarPlus} href={hrefWithMock(`${adminBase}/events/program/new/`)}>
			New Program
		</AdminActionButton>
	{/if}

	{#if actions.includes('back-to-events')}
		<AdminActionButton
			variant="subtle"
			icon={ArrowLeft}
			onclick={() => void goto(hrefWithMock(`${adminBase}/events/`))}
		>
			Back to Events
		</AdminActionButton>
	{/if}

	{#if actions.includes('crew-invite')}
		<AdminActionButton
			variant="primary"
			icon={UserPlus}
			onclick={(event) => $adminActionHandlers.onCrewCreateInvite?.(crewInvitePayload(event))}
		>
			Create Invite
		</AdminActionButton>
	{/if}

	{#if actions.includes('view-calendar')}
		<AdminActionButton variant="subtle" icon={CalendarDays} href={hrefWithMock(`${calendarBase}/`)}>Open Calendar</AdminActionButton>
	{/if}

	{#if actions.includes('event-edit')}
		<AdminActionButton
			variant="primary"
			icon={Pencil}
			onclick={() => $adminActionHandlers.onEventDetailEdit?.()}
		>
			Edit Event
		</AdminActionButton>
	{/if}

	{#if actions.includes('event-cancel')}
		<AdminActionButton
			variant="danger"
			icon={Trash2}
			onclick={() => $adminActionHandlers.onEventDetailCancel?.()}
		>
			Cancel Event
		</AdminActionButton>
	{/if}

	{#if actions.length === 0}
		<span aria-hidden="true"></span>
	{/if}
</div>
