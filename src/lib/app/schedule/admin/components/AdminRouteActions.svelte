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
	import AdminActionButton from '@calendar/ui/admin/shared/AdminActionButton.svelte'
	import type { AdminRouteActionId } from '$lib/app/schedule/admin/route'
	import { adminActionHandlers } from '$lib/app/schedule/admin/state'

	const { actions, hrefWithMock, programSlug } = $props<{
		actions: AdminRouteActionId[]
		hrefWithMock: (path: string) => string
		programSlug: string | undefined
	}>()

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
		<AdminActionButton variant="subtle" icon={Eye} href={`/schedule/${programSlug}/`}>View</AdminActionButton>
	{/if}

	{#if actions.includes('program-settings')}
		<AdminActionButton
			variant="subtle"
			icon={Settings}
			onclick={() => $adminActionHandlers.onProgramEditorToggleSettings?.()}
		>
			Settings
		</AdminActionButton>
	{/if}

	{#if actions.includes('new-event')}
		<AdminActionButton variant="primary" icon={CalendarPlus} href={hrefWithMock('/schedule/admin/events/new/')}>
			New
		</AdminActionButton>
	{/if}

	{#if actions.includes('back-to-events')}
		<AdminActionButton
			variant="subtle"
			icon={ArrowLeft}
			onclick={() => void goto(hrefWithMock('/schedule/admin/events/'))}
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
			Invite
		</AdminActionButton>
	{/if}

	{#if actions.includes('view-calendar')}
		<AdminActionButton variant="subtle" icon={CalendarDays} href="/schedule/">Calendar</AdminActionButton>
	{/if}

	{#if actions.includes('event-edit')}
		<AdminActionButton
			variant="primary"
			icon={Pencil}
			onclick={() => $adminActionHandlers.onEventDetailEdit?.()}
		>
			Edit
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
